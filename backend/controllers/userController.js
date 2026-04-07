const User = require('../models/User');
const ActiveCrop = require('../models/ActiveCrop');

// POST /api/users/onboard
// Purpose: Saves initial Guest Profile (Language, Persona, Plants, Location via IP)
exports.onboardUser = async (req, res) => {
  try {
    const { deviceId, language, persona, chosenPlants } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({ success: false, error: 'deviceId is required' });
    }

    // Capture IP (handling proxies like Render)
    let ipAddress = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
    if (ipAddress && ipAddress.includes(',')) {
      ipAddress = ipAddress.split(',')[0].trim();
    }

    // Convert IP to Location Data automatically
    let locationData = null;
    if (ipAddress && ipAddress !== '127.0.0.1' && ipAddress !== '::1') {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ipAddress}`);
        const geoData = await geoRes.json();
        if (geoData.status === 'success') {
          locationData = {
            lat: geoData.lat,
            lng: geoData.lon,
            city: geoData.city,
            state: geoData.regionName
          };
        }
      } catch (e) {
        console.error('GeoIP Fetch Error:', e.message);
      }
    }

    let user = await User.findOne({ deviceId });

    if (user) {
      // Update existing guest profile if they go through onboarding again
      user.language = language || user.language;
      user.persona = persona || user.persona;
      user.chosenPlants = chosenPlants || user.chosenPlants;
      user.ipAddress = ipAddress;
      if (locationData) user.location = locationData;
      await user.save();
      return res.status(200).json({ success: true, data: user, message: 'Guest profile updated' });
    }

    // Create new guest
    user = new User({
      deviceId,
      language: language || 'en',
      persona,
      chosenPlants: chosenPlants || [],
      ipAddress,
      location: locationData || undefined,
      status: 'guest'
    });

    await user.save();
    res.status(201).json({ success: true, data: user, message: 'Guest profile created' });

  } catch (error) {
    console.error('Error in onboardUser:', error);
    res.status(500).json({ success: false, error: 'Server error during onboarding' });
  }
};

// GET /api/users/profile/:deviceId
// Purpose: Fetches the user's settings silently in the background
exports.getUserProfile = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const user = await User.findOne({ deviceId });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found for this device' });
    }

    res.status(200).json({ success: true, data: user });

  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ success: false, error: 'Server error fetching profile' });
  }
};

// PATCH /api/users/register/:deviceId
// Purpose: Upgrades a Guest to a Registered User
exports.registerUser = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { name, phoneNumber, pin, photoUrl, farmInfo } = req.body;

    // We require name and pin for the new auth flow
    if (!name || !pin) {
       return res.status(400).json({ success: false, error: 'Name and a 4-digit PIN are required for registration' });
    }

    if (pin.toString().length !== 4 || isNaN(Number(pin))) {
       return res.status(400).json({ success: false, error: 'PIN must be exactly 4 numeric digits' });
    }

    if (phoneNumber) {
        const cleanedPhone = phoneNumber.toString().replace(/\D/g, '');
        if (cleanedPhone.length !== 10) {
            return res.status(400).json({ success: false, error: 'Phone number must be 10 digits if provided' });
        }
    }

    // Check if the name is already taken by a *different* registered user
    const existingName = await User.findOne({
      name: { $regex: new RegExp('^' + name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') },
      status: 'registered',
      deviceId: { $ne: deviceId }
    });
    if (existingName) {
      return res.status(409).json({ success: false, error: 'This username is already taken. Please choose a different name or log in instead.' });
    }

    // Find the guest profile
    let user = await User.findOne({ deviceId });

    if (!user) {
       // If somehow they didn't onboard first, create them directly as registered
       user = new User({ deviceId, status: 'registered' });
    }

    // Check if phone number is already taken by another device
    if (phoneNumber) {
        const existingPhone = await User.findOne({ phoneNumber });
        if (existingPhone && existingPhone.deviceId !== deviceId) {
            return res.status(409).json({ success: false, error: 'Phone number already registered to another account' });
        }
        user.phoneNumber = phoneNumber;
    }

    // Update fields
    user.status = 'registered';
    user.name = name;
    user.pin = pin;
    if (photoUrl) user.photoUrl = photoUrl;
    if (farmInfo) user.farmInfo = { ...user.farmInfo, ...farmInfo };

    await user.save();

    res.status(200).json({ success: true, data: user, message: 'Successfully upgraded to registered user' });

  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({ success: false, error: 'Server error during registration' });
  }
};

// POST /api/users/login
// Purpose: Authenticates phone/name + pin and syncs device ID
exports.loginUser = async (req, res) => {
  try {
    const { identifier, pin, deviceId } = req.body;
    if (!identifier || !pin || !deviceId) {
       return res.status(400).json({ success: false, error: 'Phone Number or Name, PIN, and device ID are required' });
    }

    let user = await User.findOne({ 
        $or: [
           { phoneNumber: identifier },
           { name: { $regex: new RegExp('^' + identifier.trim() + '$', 'i') } }
        ],
        pin 
    });
    
    if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid login credentials' });
    }

    // If logging in from a different device, claim the current deviceId
    if (user.deviceId !== deviceId) {
        const oldDeviceId = user.deviceId;

        // Clean up temporary guest profile assigned to this deviceId to free up the unique constraint
        await User.deleteOne({ deviceId, status: 'guest' });
        user.deviceId = deviceId;
        await user.save();

        // Re-link all ActiveCrop records from the old device to the new deviceId
        // so the user's crop data is not lost when logging in from a new device/APK
        await ActiveCrop.updateMany({ deviceId: oldDeviceId }, { $set: { deviceId: deviceId } });
    }

    res.status(200).json({ success: true, data: user, message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error during login' });
  }
};

// PATCH /api/users/profile/:deviceId
// Purpose: Edit existing registered account profile metadata
exports.updateUserProfile = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { name, photoUrl, location, language, persona, chosenPlants, pin, soilTest } = req.body;

    const user = await User.findOne({ deviceId });
    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (name) user.name = name;
    if (photoUrl) user.photoUrl = photoUrl;
    if (location) user.location = location;
    if (language) user.language = language;
    if (persona) user.persona = persona;
    if (chosenPlants) user.chosenPlants = chosenPlants;
    if (pin && pin.toString().length === 4 && !isNaN(Number(pin))) user.pin = pin;

    if (soilTest) {
      user.soilTest = { ...user.soilTest, ...soilTest, lastTestedOn: new Date() };
    }

    await user.save();
    
    res.status(200).json({ success: true, data: user, message: 'Profile updated' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Server error updating profile' });
  }
};

const User = require('../models/User');

// POST /api/users/onboard
// Purpose: Saves initial Guest Profile (Language, Persona, Plants, Location via IP)
exports.onboardUser = async (req, res) => {
  try {
    const { deviceId, language, persona, chosenPlants } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({ success: false, error: 'deviceId is required' });
    }

    // Capture IP
    // Note: In production behind a proxy (like Nginx/Heroku), use req.headers['x-forwarded-for'] or req.ip with trust proxy enabled
    const ipAddress = req.ip || req.connection.remoteAddress;

    // TODO: In a real app, we would use a service like geoip-lite or an external API here to convert `ipAddress` to `location.lat` / `location.lng`. For now, we'll just save the IP.

    let user = await User.findOne({ deviceId });

    if (user) {
      // Update existing guest profile if they go through onboarding again
      user.language = language || user.language;
      user.persona = persona || user.persona;
      user.chosenPlants = chosenPlants || user.chosenPlants;
      user.ipAddress = ipAddress;
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
    const { name, phoneNumber, photoUrl, farmInfo } = req.body;

    // We only want to upgrade if the user provides a phone number (typical for registration)
    if (!phoneNumber) {
       return res.status(400).json({ success: false, error: 'Phone number is required for registration' });
    }

    // Find the guest profile
    let user = await User.findOne({ deviceId });

    if (!user) {
       // If somehow they didn't onboard first, create them directly as registered
       user = new User({ deviceId, status: 'registered' });
    }

    // Check if phone number is already taken by another device
    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone && existingPhone.deviceId !== deviceId) {
        return res.status(409).json({ success: false, error: 'Phone number already registered to another account' });
    }

    // Update fields
    user.status = 'registered';
    user.name = name || user.name;
    user.phoneNumber = phoneNumber;
    if (photoUrl) user.photoUrl = photoUrl;
    if (farmInfo) user.farmInfo = { ...user.farmInfo, ...farmInfo };

    await user.save();

    res.status(200).json({ success: true, data: user, message: 'Successfully upgraded to registered user' });

  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({ success: false, error: 'Server error during registration' });
  }
};

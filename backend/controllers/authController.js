const User = require('../models/User');
const https = require('https');

// Helper to verify a Google access token and fetch user info
function fetchGoogleUserInfo(accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.googleapis.com',
      port: 443,
      path: `/oauth2/v3/userinfo`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`Google API error: ${res.statusCode}`));
        }
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('Failed to parse Google response')); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// POST /api/auth/google
// Receives the Google access token from the app, verifies it, and creates/links user
exports.googleSignIn = async (req, res) => {
  try {
    const { accessToken, deviceId } = req.body;

    if (!accessToken || !deviceId) {
      return res.status(400).json({ success: false, error: 'accessToken and deviceId are required' });
    }

    // 1. Verify the token with Google and get user info
    const googleUser = await fetchGoogleUserInfo(accessToken);
    const { sub: oauthId, email, name, picture } = googleUser;

    if (!oauthId) {
      return res.status(401).json({ success: false, error: 'Invalid Google token' });
    }

    // 2. Find existing user by oauthId or email, or fall back to the deviceId
    let user = await User.findOne({ oauthId });

    if (!user) {
      // Try to find by email
      user = await User.findOne({ email });
    }

    if (!user) {
      // Fall back to the existing guest user for this device and upgrade them
      user = await User.findOne({ deviceId });
    }

    if (user) {
      // Link the OAuth identity and mark as registered
      user.oauthId = oauthId;
      user.oauthProvider = 'google';
      user.email = email;
      user.status = 'registered';
      if (!user.name) user.name = name;
      if (!user.photoUrl) user.photoUrl = picture;
      await user.save();
    } else {
      // Create a brand new user
      user = new User({
        deviceId,
        oauthId,
        oauthProvider: 'google',
        email,
        name,
        photoUrl: picture,
        status: 'registered'
      });
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl,
        status: user.status,
        location: user.location
      }
    });

  } catch (error) {
    console.error('Google Sign-In Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error during sign-in' });
  }
};

// PATCH /api/auth/profile
// Updates profile details: name, photoUrl, and GPS location
exports.updateProfile = async (req, res) => {
  try {
    const { deviceId, name, photoUrl, lat, lng, city, state } = req.body;

    if (!deviceId) {
      return res.status(400).json({ success: false, error: 'deviceId is required' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (photoUrl) updateData.photoUrl = photoUrl;
    if (lat && lng) {
      updateData['location.lat'] = lat;
      updateData['location.lng'] = lng;
      if (city) updateData['location.city'] = city;
      if (state) updateData['location.state'] = state;
    }

    const user = await User.findOneAndUpdate(
      { deviceId },
      { $set: updateData },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, error: 'Server error updating profile' });
  }
};

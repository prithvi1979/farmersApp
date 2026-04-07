const User = require('../models/User');
const https = require('https');

// Verify a Google ID token (from native GoogleSignin SDK)
function verifyGoogleIdToken(idToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'oauth2.googleapis.com',
      port: 443,
      path: `/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
      method: 'GET',
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data.error_description || !data.sub) {
            return reject(new Error(data.error_description || 'Invalid ID token'));
          }
          // Normalize fields to match the userinfo response shape
          resolve({
            sub: data.sub,
            email: data.email,
            name: data.name,
            picture: data.picture,
          });
        } catch (e) { reject(new Error('Failed to parse Google tokeninfo response')); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// Verify a Google access token (legacy path, kept for compatibility)
function fetchGoogleUserInfo(accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.googleapis.com',
      port: 443,
      path: `/oauth2/v3/userinfo`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` }
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
// Accepts either idToken (native SDK) or accessToken (legacy), verifies with Google,
// then creates or links the user in MongoDB.
exports.googleSignIn = async (req, res) => {
  try {
    const { idToken, accessToken, deviceId } = req.body;

    if ((!idToken && !accessToken) || !deviceId) {
      return res.status(400).json({ success: false, error: 'A Google token and deviceId are required' });
    }

    // Prefer idToken (native SDK path), fall back to accessToken (old web path)
    let googleUser;
    if (idToken) {
      googleUser = await verifyGoogleIdToken(idToken);
    } else {
      googleUser = await fetchGoogleUserInfo(accessToken);
    }

    const { sub: oauthId, email, name, picture } = googleUser;

    if (!oauthId) {
      return res.status(401).json({ success: false, error: 'Invalid Google token' });
    }

    // Find existing user by oauthId → email → current device (upgrade guest)
    let user = await User.findOne({ oauthId });
    if (!user) user = await User.findOne({ email });
    if (!user) user = await User.findOne({ deviceId });

    if (user) {
      user.oauthId = oauthId;
      user.oauthProvider = 'google';
      user.email = email;
      user.status = 'registered';
      if (!user.name) user.name = name;
      if (!user.photoUrl) user.photoUrl = picture;
      if (user.deviceId !== deviceId) {
        await User.deleteOne({ deviceId, status: 'guest' });
        user.deviceId = deviceId;
      }
      await user.save();
    } else {
      user = new User({
        deviceId, oauthId, oauthProvider: 'google',
        email, name, photoUrl: picture, status: 'registered'
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

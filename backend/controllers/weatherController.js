const User = require('../models/User');

// Map OpenWeatherMap icon code -> MaterialCommunityIcons name (sent to app)
const OWM_ICON_MAP = {
  '01d': 'weather-sunny',
  '01n': 'weather-night',
  '02d': 'weather-partly-cloudy',
  '02n': 'weather-night-partly-cloudy',
  '03d': 'weather-cloudy',
  '03n': 'weather-cloudy',
  '04d': 'weather-cloudy',
  '04n': 'weather-cloudy',
  '09d': 'weather-rainy',
  '09n': 'weather-rainy',
  '10d': 'weather-pouring',
  '10n': 'weather-pouring',
  '11d': 'weather-lightning-rainy',
  '11n': 'weather-lightning-rainy',
  '13d': 'weather-snowy',
  '13n': 'weather-snowy',
  '50d': 'weather-fog',
  '50n': 'weather-fog',
};

// Fallback location for local dev (::1 / 127.0.0.1 resolves to nothing useful)
const DEV_FALLBACK = { lat: 28.6139, lon: 77.2090, city: 'New Delhi', state: 'Delhi' };

/**
 * Resolve an IP address to lat/lon using the free ip-api.com service.
 * Returns null if the IP is private/unresolvable.
 */
async function resolveIpToCoords(ip) {
  // Private / loopback addresses can't be geo-resolved
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('::ffff:127')) {
    return null;
  }

  // Strip IPv6-mapped IPv4 prefix (::ffff:1.2.3.4 → 1.2.3.4)
  const cleanIp = ip.replace(/^::ffff:/, '');

  try {
    const response = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,lat,lon,city,regionName`);
    const data = await response.json();
    if (data.status === 'success') {
      return { lat: data.lat, lon: data.lon, city: data.city, state: data.regionName };
    }
  } catch (err) {
    console.error('IP geo-resolve error:', err.message);
  }
  return null;
}

// ─── GET /api/weather/:deviceId ──────────────────────────────────────────────
exports.getWeather = async (req, res) => {
  try {
    const { deviceId } = req.params;

    // 1. Find user
    const user = await User.findOne({ deviceId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    let lat = user.location?.lat;
    let lon = user.location?.lng;
    let city = user.location?.city;
    let state = user.location?.state;

    // 2. If no coords saved yet, resolve from IP
    if (!lat || !lon) {
      const geo = await resolveIpToCoords(user.ipAddress);

      if (geo) {
        lat = geo.lat;
        lon = geo.lon;
        city = geo.city;
        state = geo.state;

        // Persist resolved location back to user record
        user.location = { lat, lng: lon, city, state };
        await user.save();
      } else {
        // Dev environment fallback
        lat = DEV_FALLBACK.lat;
        lon = DEV_FALLBACK.lon;
        city = DEV_FALLBACK.city;
        state = DEV_FALLBACK.state;
      }
    }

    // 3. Fetch weather from OpenWeatherMap
    const OWM_KEY = process.env.OPENWEATHER_API_KEY;
    const owmUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`;

    const weatherRes = await fetch(owmUrl);
    if (!weatherRes.ok) {
      const errText = await weatherRes.text();
      console.error('OWM error:', errText);
      return res.status(502).json({ success: false, error: 'Failed to fetch weather from OpenWeatherMap' });
    }

    const weather = await weatherRes.json();

    // 4. Build clean response payload
    const iconCode = weather.weather?.[0]?.icon || '01d';
    const payload = {
      city:        city || weather.name,
      state,
      temp:        Math.round(weather.main.temp),
      feelsLike:   Math.round(weather.main.feels_like),
      tempMin:     Math.round(weather.main.temp_min),
      tempMax:     Math.round(weather.main.temp_max),
      humidity:    weather.main.humidity,
      description: weather.weather?.[0]?.description || '',
      iconCode,
      icon:        OWM_ICON_MAP[iconCode] || 'weather-partly-cloudy',
      windSpeed:   Math.round(weather.wind?.speed ?? 0),
      sunrise:     weather.sys?.sunrise,
      sunset:      weather.sys?.sunset,
    };

    res.status(200).json({ success: true, data: payload });

  } catch (error) {
    console.error('Weather controller error:', error);
    res.status(500).json({ success: false, error: 'Server error fetching weather' });
  }
};

// ─── GET /api/weather/by-ip ──────────────────────────────────────────────────
// No deviceId required. Resolves the caller's own IP for a quick weather lookup.
exports.getWeatherByIp = async (req, res) => {
  try {
    let ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
    if (ip && ip.includes(',')) ip = ip.split(',')[0].trim();
    const geo = await resolveIpToCoords(ip) || DEV_FALLBACK;

    const OWM_KEY = process.env.OPENWEATHER_API_KEY;
    const owmUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${geo.lat}&lon=${geo.lon}&appid=${OWM_KEY}&units=metric`;

    const weatherRes = await fetch(owmUrl);
    if (!weatherRes.ok) {
      return res.status(502).json({ success: false, error: 'Failed to fetch weather' });
    }

    const weather = await weatherRes.json();
    const iconCode = weather.weather?.[0]?.icon || '01d';

    const payload = {
      city:        geo.city || weather.name,
      state:       geo.state,
      temp:        Math.round(weather.main.temp),
      feelsLike:   Math.round(weather.main.feels_like),
      tempMin:     Math.round(weather.main.temp_min),
      tempMax:     Math.round(weather.main.temp_max),
      humidity:    weather.main.humidity,
      description: weather.weather?.[0]?.description || '',
      iconCode,
      icon:        OWM_ICON_MAP[iconCode] || 'weather-partly-cloudy',
      windSpeed:   Math.round(weather.wind?.speed ?? 0),
      sunrise:     weather.sys?.sunrise,
      sunset:      weather.sys?.sunset,
    };

    res.status(200).json({ success: true, data: payload });
  } catch (error) {
    console.error('Weather by-ip error:', error);
    res.status(500).json({ success: false, error: 'Server error fetching weather' });
  }
};


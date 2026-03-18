const News = require('../models/News');
const User = require('../models/User');
const Content = require('../models/Content');

// GET /api/content/news?deviceId=...
// Purpose: Fetches 3 localized news snippets based on state, city, and crops
exports.getNews = async (req, res) => {
  try {
    const { deviceId } = req.query; // It's a GET request, so it might be in query

    // 1. We default to generic national news initially
    let userState = null;
    let userCity = null;
    let userCrops = [];

    // 2. But if they provided a deviceId, let's grab their info to personalize!
    if (deviceId) {
      const user = await User.findOne({ deviceId });
      if (user) {
        userState = user.location?.state;
        userCity = user.location?.city;
        userCrops = user.chosenPlants || [];
      }
    }

    // 3. Build the waterfall query
    // An article is considered a "match" if it matches their city, OR their state, OR their crops, OR it's a generic post.
    
    const now = new Date();
    
    // Base filter: It must be active, and not expired
    const baseFilter = {
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } }, // Doesn't have an expiration
        { expiresAt: null },
        { expiresAt: { $gt: now } } // Or expiration is in the future
      ]
    };

    // Targeting filter
    const targetingOrLogic = [
       // 1. Matches City
       { targetCity: userCity, targetCity: { $ne: null } },
       // 2. Matches State
       { targetState: userState, targetState: { $ne: null } },
       // 3. Matches Crops (MongoDB will match if the arrays intersect)
       { targetCrops: { $in: userCrops }, targetCrops: { $exists: true, $not: {$size: 0} } },
       // 4. Generic (Has no specific targeting)
       {
           $and: [
               { $or: [{ targetState: null }, { targetState: "" }, { targetState: { $exists: false } }] },
               { $or: [{ targetCity: null }, { targetCity: "" }, { targetCity: { $exists: false } }] },
               { $or: [{ targetCrops: { $exists: false } }, { targetCrops: { $size: 0 } }] }
           ]
       }
    ];

    // Combine them
    const finalQuery = {
        ...baseFilter,
        $or: targetingOrLogic
    };

    // Execute query, sort by newest first, limit to 3
    const articles = await News.find(finalQuery)
        .sort({ publishedAt: -1 })
        .limit(3);

    // Provide the result, noting what personalization occurred
    res.status(200).json({ 
        success: true, 
        personalizedFor: {
            state: userState,
            city: userCity,
            cropsCount: userCrops.length
        },
        data: articles 
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ success: false, error: 'Server error fetching news' });
  }
};

// GET /api/content/library?category=...
// Purpose: Fetches library articles based on an optional category filter
exports.getLibraryContent = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = { isActive: true };
    if (category) {
      filter.category = category.toLowerCase(); // e.g., 'diseases', 'pests'
    }

    const articles = await Content.find(filter)
        .sort({ createdAt: -1 });

    res.status(200).json({ 
        success: true, 
        count: articles.length,
        data: articles 
    });

  } catch (error) {
    console.error('Error fetching library content:', error);
    res.status(500).json({ success: false, error: 'Server error fetching library content' });
  }
};

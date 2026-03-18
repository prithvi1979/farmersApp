const Post = require('../models/Post');
const User = require('../models/User');

// GET /api/community/posts
// Purpose: Fetches community questions, prioritizing local state
exports.getPosts = async (req, res) => {
  try {
    const { deviceId, crop } = req.query;

    let userState = null;
    let filter = { status: 'open' };

    // If we have a crop filter
    if (crop) {
        filter.cropTag = crop;
    }

    // Try to personalize by state
    if (deviceId) {
      const user = await User.findOne({ deviceId });
      if (user && user.location?.state) {
        userState = user.location.state;
      }
    }

    // Fetch posts
    let posts = await Post.find(filter).sort({ createdAt: -1 });

    // Optional UX sorting: If we know the user's state, bubble those posts to the top
    if (userState) {
        posts.sort((a, b) => {
            const aIsLocal = a.state === userState ? 1 : 0;
            const bIsLocal = b.state === userState ? 1 : 0;
            return bIsLocal - aIsLocal;
        });
    }

    res.status(200).json({ 
        success: true, 
        count: posts.length,
        localStatePriority: userState,
        data: posts 
    });

  } catch (error) {
    console.error('Error fetching community posts:', error);
    res.status(500).json({ success: false, error: 'Server error fetching posts' });
  }
};

// POST /api/community/post
// Purpose: Ask a question
exports.createPost = async (req, res) => {
  try {
    const { authorId, question, imageUrl, cropTag } = req.body;

    if (!authorId || !question) {
       return res.status(400).json({ success: false, error: 'authorId and question are required' });
    }

    // Grab their name, photo, and location automatically from their profile
    const user = await User.findOne({ deviceId: authorId });
    
    // If they don't exist in our DB at all, we can't let them post
    if (!user) {
        return res.status(404).json({ success: false, error: 'User profile not found' });
    }

    const newPost = new Post({
        authorId,
        authorName: user.name || (user.status === 'guest' ? 'Guest Farmer' : 'Anonymous'),
        authorPhoto: user.photoUrl,
        question,
        imageUrl,
        cropTag,
        state: user.location?.state // Attach their state automatically so local logic works!
    });

    await newPost.save();

    res.status(201).json({ success: true, data: newPost, message: 'Question posted successfully' });

  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, error: 'Server error creating post' });
  }
};

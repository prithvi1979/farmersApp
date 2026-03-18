require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const MasterCrop = require('./models/MasterCrop');
const ActiveCrop = require('./models/ActiveCrop');
const News = require('./models/News');
const Content = require('./models/Content');
const Product = require('./models/Product');
const Post = require('./models/Post');
const { v4: uuidv4 } = require('uuid');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected to Seed...');

    // Clear existing
    await User.deleteMany();
    await MasterCrop.deleteMany();
    await ActiveCrop.deleteMany();
    await News.deleteMany();
    await Content.deleteMany();
    await Product.deleteMany();
    await Post.deleteMany();
    console.log('Existing collections cleared.');

    // 1. Seed Users
    const dummyUsers = [
      {
        deviceId: 'device_001_guest',
        status: 'guest',
        language: 'pa',
        persona: 'Wheat Farmer',
        chosenPlants: ['Wheat', 'Mustard'],
        ipAddress: '192.168.1.100',
        location: { lat: 30.900965, lng: 75.857277, city: 'Ludhiana', state: 'Punjab' },
        farmInfo: { totalArea: 10, areaUnit: 'acre', primarySoilType: 'loam' }
      },
      {
        deviceId: 'device_002_registered',
        status: 'registered',
        language: 'hi',
        persona: 'Commercial Farmer',
        chosenPlants: ['Sugarcane', 'Cotton'],
        ipAddress: '192.168.1.200',
        location: { lat: 26.846708, lng: 80.946159, city: 'Lucknow', state: 'Uttar Pradesh' },
        farmInfo: { totalArea: 25, areaUnit: 'hectare', primarySoilType: 'clay' },
        name: 'Ramesh Singh',
        phoneNumber: '+919876543210'
      }
    ];

    await User.insertMany(dummyUsers);
    
    // 2. Seed Master Crops (What admins build in React app)
    const dummyMasterCrops = [
      {
        name: 'Tomato',
        description: 'A versatile vegetable crop suitable for warm seasons.',
        totalDurationDays: 90,
        timelineTemplate: [
          { day: 1, title: 'Sow Seeds', instructions: 'Plant seeds 1/4 inch deep in seed tray.', taskType: 'sowing' },
          { day: 5, title: 'Check Germination', instructions: 'Ensure soil is moist and sprouts are visible.', taskType: 'general' },
          { day: 14, title: 'First Fertilizer', instructions: 'Apply 10g of NPK per seedling.', taskType: 'fertilizer' },
          { day: 30, title: 'Transplant to Field', instructions: 'Move strong seedlings to main field, space 2ft apart.', taskType: 'general' },
          { day: 60, title: 'Irrigate thoroughly', instructions: 'Provide deep watering to encourage fruit set.', taskType: 'irrigation' }
        ]
      }
    ];
    
    const insertedMasters = await MasterCrop.insertMany(dummyMasterCrops);

    // 3. Seed One Active Crop for device_002
    const tomatoMaster = insertedMasters[0];
    
    const pastStartDate = new Date();
    pastStartDate.setDate(pastStartDate.getDate() - 14);

    const simulatedDailyTasks = tomatoMaster.timelineTemplate.map((templateTask) => {
        const dueDate = new Date(pastStartDate.getTime());
        dueDate.setDate(dueDate.getDate() + templateTask.day);
        
        const isCompleted = templateTask.day === 1; 

        return {
          taskId: uuidv4(),
          title: templateTask.title,
          instructions: templateTask.instructions,
          taskType: templateTask.taskType,
          targetDay: templateTask.day,
          dueDate: dueDate,
          isCompleted: isCompleted,
          completedAt: isCompleted ? new Date() : null
        };
    });

    const activeCrop = new ActiveCrop({
      deviceId: 'device_002_registered',
      cropId: tomatoMaster._id,
      cropName: 'My Summer Tomatoes',
      startDate: pastStartDate,
      status: 'active',
      dailyTasks: simulatedDailyTasks
    });

    await activeCrop.save();

    // 4. Seed News
    const dummyNews = [
        {
            title: 'New Subsidy for UP Sugarcane Farmers',
            description: 'The state government has announced a 20% subsidy on advanced drip irrigation setups.',
            targetState: 'Uttar Pradesh', // Targets device_002
            targetCrops: ['Sugarcane']
        },
        {
            title: 'Wheat Rust Warning in Ludhiana',
            description: 'Local experts warn of rising fungal infections in early-stage wheat crops this week.',
            targetCity: 'Ludhiana', // Targets device_001
            targetCrops: ['Wheat']
        },
        {
            title: 'National Fertilizer Prices Drop',
            description: 'Good news for all farmers: the central government has slashed urea import tariffs by 5%.',
            // Generic info (no targeting fields, so everyone sees it)
        }
    ];

    await News.insertMany(dummyNews);

    // 5. Seed Content Library
    const dummyContent = [
      {
        title: 'Identifying and Treating Tomato Blight',
        imageUrl: 'https://example.com/images/tomato-blight.jpg',
        content: 'Tomato blight is a common fungal disease... (full article text goes here). Always ensure good airflow between plants.',
        category: 'diseases',
        tags: ['tomato', 'fungus', 'blight'],
        author: 'Admin'
      },
      {
        title: 'Whitefly Infestation: Prevention and Cure',
        imageUrl: 'https://example.com/images/whitefly.jpg',
        content: 'Whiteflies rapidly suck sap and weaken crops. Use neem oil sprays... (full article text goes here).',
        category: 'pests',
        tags: ['cotton', 'whitefly', 'neem'],
        author: 'Admin'
      },
      {
        title: 'Modern Drip Irrigation Techniques',
        imageUrl: 'https://example.com/images/drip.jpg',
        content: 'Save up to 40% water by installing basic drip lines. Here is how to get started securely...',
        category: 'techniques',
        tags: ['water', 'irrigation'],
        author: 'Admin'
      }
    ];

    await Content.insertMany(dummyContent);

    // 6. Seed Market Products
    const dummyProducts = [
      {
        title: 'Premium NPK 19:19:19 Fertilizer - 1kg',
        description: 'Water soluble fertilizer for all-around growth.',
        price: 350,
        imageUrl: 'https://example.com/images/npk.jpg',
        affiliateLink: 'https://amazon.in/affiliate-link-npk?tag=farmersapp-21',
        targetPlants: [], // Generic: good for everything
        category: 'fertilizer'
      },
      {
        title: 'Tomato Specific Micronutrient Mix',
        description: 'Prevents blossom end rot and boosts fruit size.',
        price: 250,
        imageUrl: 'https://example.com/images/tomato-mix.jpg',
        affiliateLink: 'https://amazon.in/affiliate-link-tomato-mix?tag=farmersapp-21',
        targetPlants: ['Tomato'], // Specific!
        category: 'fertilizer'
      },
      {
        title: 'Heavy Duty Sugarcane Harvesting Knife',
        description: 'Carbon steel blade designed specifically for thick stalks.',
        price: 899,
        imageUrl: 'https://example.com/images/knife.jpg',
        affiliateLink: 'https://amazon.in/affiliate-link-knife?tag=farmersapp-21',
        targetPlants: ['Sugarcane'], // Specific!
        category: 'tools'
      }
    ];

    await Product.insertMany(dummyProducts);

    // 7. Seed Community Posts
    const dummyPosts = [
      {
        authorId: 'device_001_guest',
        authorName: 'Guest Farmer',
        question: 'My wheat leaves are turning yellow with small brown spots. Any idea what disease this is?',
        imageUrl: 'https://example.com/images/wheat-yellow-leaves.jpg',
        cropTag: 'Wheat',
        state: 'Punjab', // matches device_001
        upvotes: ['device_002_registered'], 
        answers: [
          {
            authorId: 'device_002_registered',
            authorName: 'Ramesh Singh',
            text: 'Looks like early stage Wheat Rust. You should check the News tab, there is a warning for our area.',
            createdAt: new Date()
          }
        ]
      },
      {
        authorId: 'device_002_registered',
        authorName: 'Ramesh Singh',
        authorPhoto: 'https://example.com/profiles/ramesh.jpg',
        question: 'What is the best time to start next season\'s sugarcane planting?',
        cropTag: 'Sugarcane',
        state: 'Uttar Pradesh', // matches device_002
        upvotes: [],
        answers: []
      }
    ];

    await Post.insertMany(dummyPosts);

    console.log('Dummy Data seeded successfully! Users, MasterCrops, ActiveCrops, News, Content, Products, and Posts constructed.');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

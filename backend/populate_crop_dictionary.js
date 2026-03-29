require('dotenv').config();
const mongoose = require('mongoose');
const CropDictionary = require('./models/CropDictionary');

const MONGODB_URI = process.env.MONGODB_URI;

const crops = [
  "Apple", "Banana", "Orange", "Mango", "Grapes", "Pineapple", "Strawberry", "Watermelon", "Papaya", "Guava", 
  "Pomegranate", "Lemon", "Kiwi", "Avocado", "Peach", "Pear", "Plum", "Cherry", "Blueberry", "Fig",
  "Tomato", "Potato", "Onion", "Carrot", "Cabbage", "Cauliflower", "Broccoli", "Spinach", "Garlic", "Ginger",
  "Capsicum", "Eggplant", "Brinjal", "Peas", "Radish", "Turnip", "Cucumber", "Pumpkin", "Bitter Gourd", "Bottle Gourd",
  "Rice", "Wheat", "Maize", "Corn", "Cotton", "Sugarcane", "Barley", "Millet", "Sorghum", "Soybean",
  "Oats", "Rye", "Peanut", "Jute", "Lentil", "Chickpea", "Mustard", "Sunflower", "Sesame", "Flaxseed",
  "Rose", "Marigold", "Jasmine", "Lotus", "Tulip", "Orchid", "Lily", "Daisy", "Hibiscus", "Lavender"
];

const populate = async () => {
    try {
        if (!MONGODB_URI) {
            console.error("No MONGODB_URI found in env");
            process.exit(1);
        }
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        await CropDictionary.deleteMany({});
        console.log('Cleared existing CropDictionary');

        const docs = crops.map(name => ({ name }));
        await CropDictionary.insertMany(docs);
        console.log(`Successfully inserted ${docs.length} crop names.`);

        process.exit(0);
    } catch (err) {
        console.error('Error populating DB:', err);
        process.exit(1);
    }
};

populate();

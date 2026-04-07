/**
 * Diagnostic script: Check MongoDB state for user "Prithviman"
 * Run with: node diagnose_prithviman.js
 */
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://prithvimanb:MyneERtyu123!!@cluster0.kowquge.mongodb.net/farmersApp?retryWrites=true&w=majority&appName=Cluster0';

const UserSchema = new mongoose.Schema({}, { strict: false });
const ActiveCropSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', UserSchema);
const ActiveCrop = mongoose.model('ActiveCrop', ActiveCropSchema);

async function diagnose() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // 1. Find all users matching "prithviman" (case-insensitive)
  const users = await User.find({
    name: { $regex: /prithviman/i }
  }).lean();

  console.log(`=== USERS matching "prithviman" (${users.length} found) ===`);
  users.forEach((u, i) => {
    console.log(`\n[User ${i + 1}]`);
    console.log('  _id       :', u._id.toString());
    console.log('  name      :', u.name);
    console.log('  status    :', u.status);
    console.log('  deviceId  :', u.deviceId);
    console.log('  phone     :', u.phoneNumber || '(none)');
    console.log('  plants    :', JSON.stringify(u.chosenPlants || []));
  });

  // 2. Collect all deviceIds from those users
  const deviceIds = users.map(u => u.deviceId).filter(Boolean);
  const userIds   = users.map(u => u._id);

  // 3. Find ALL ActiveCrop records matching any of those deviceIds OR userIds
  const crops = await ActiveCrop.find({
    $or: [
      { deviceId: { $in: deviceIds } },
      { userId:   { $in: userIds  } }
    ]
  }).lean();

  console.log(`\n=== ACTIVE CROPS for these users (${crops.length} found) ===`);
  if (crops.length === 0) {
    console.log('  ❌ NO CROPS FOUND for any of the above deviceIds/userIds');
  } else {
    crops.forEach((c, i) => {
      console.log(`\n[Crop ${i + 1}]`);
      console.log('  _id       :', c._id.toString());
      console.log('  cropName  :', c.cropName);
      console.log('  status    :', c.status);
      console.log('  deviceId  :', c.deviceId);
      console.log('  userId    :', c.userId ? c.userId.toString() : '(not set)');
    });
  }

  // 4. Also show ALL crops in the DB (to check if there are orphans)
  const allCrops = await ActiveCrop.find({}).lean();
  console.log(`\n=== ALL CROPS IN DATABASE (${allCrops.length} total) ===`);
  allCrops.forEach((c, i) => {
    console.log(`  [${i+1}] ${c.cropName || '(unnamed)'} | deviceId: ${c.deviceId} | userId: ${c.userId || '(none)'} | status: ${c.status}`);
  });

  await mongoose.disconnect();
  console.log('\n✅ Done.');
}

diagnose().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

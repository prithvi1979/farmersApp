/**
 * Fix script: Link the 2 orphaned crops to user Prithviman (_id: 69c4a93ca51e0a82da11d736)
 * These crops belong to deviceId: device_1774495746157oy3jmw (old Expo Go session)
 * Run with: node fix_orphaned_crops.js
 */
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://prithvimanb:MyneERtyu123!!@cluster0.kowquge.mongodb.net/farmersApp?retryWrites=true&w=majority&appName=Cluster0';

const ActiveCropSchema = new mongoose.Schema({}, { strict: false });
const ActiveCrop = mongoose.model('ActiveCrop', ActiveCropSchema);

const PRITHVIMAN_USER_ID  = '69c4a93ca51e0a82da11d736';
const OLD_EXPO_GO_DEVICE  = 'device_1774495746157oy3jmw';
const NEW_APK_DEVICE      = 'device_1775531435404tq58y';  // Prithviman's current APK deviceId

async function fix() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // Update all orphaned crops:
  // 1. Set userId  → links them to Prithviman's account permanently
  // 2. Set deviceId → matches the current APK device as a bonus
  const result = await ActiveCrop.updateMany(
    { deviceId: OLD_EXPO_GO_DEVICE },
    {
      $set: {
        userId:   new mongoose.Types.ObjectId(PRITHVIMAN_USER_ID),
        deviceId: NEW_APK_DEVICE
      }
    }
  );

  console.log(`✅ Updated ${result.modifiedCount} crops`);
  console.log('   - userId  set to:', PRITHVIMAN_USER_ID);
  console.log('   - deviceId set to:', NEW_APK_DEVICE);

  // Verify
  const crops = await ActiveCrop.find({ deviceId: NEW_APK_DEVICE }).lean();
  console.log(`\n✅ Crops now visible under Prithviman's device (${crops.length}):`);
  crops.forEach(c => console.log(`   - ${c.cropName} | status: ${c.status} | userId: ${c.userId}`));

  await mongoose.disconnect();
  console.log('\n✅ Done. Crops section should now show Capsicum and Tomato.');
}

fix().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

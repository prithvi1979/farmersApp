const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

async function check() {
  await mongoose.connect(uri);
  const db = mongoose.connection;
  const ActiveCrop = db.collection('activecrops');
  
  const crops = await ActiveCrop.find({}).toArray();
  for (const c of crops) {
      console.log(`\nCrop: ${c.cropName}`);
      console.log(`StartDate: ${c.startDate}`);
      console.log(`Total Tasks: ${c.dailyTasks?.length || 0}`);
      if (c.dailyTasks && c.dailyTasks.length > 0) {
          const firstTask = c.dailyTasks[0];
          console.log(`First Task: ${firstTask.title}, targetDay: ${firstTask.targetDay}, dueDate: ${firstTask.dueDate}`);
      }
  }
  process.exit(0);
}
check();

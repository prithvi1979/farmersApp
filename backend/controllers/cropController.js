const MasterCrop = require('../models/MasterCrop');
const ActiveCrop = require('../models/ActiveCrop');
const { v4: uuidv4 } = require('uuid'); // To generate unique task IDs

// POST /api/crops/start
// Purpose: Starts a crop for a user and generates their personalized timeline
exports.startCrop = async (req, res) => {
  try {
    const { deviceId, masterCropId, customName } = req.body;

    if (!deviceId || !masterCropId) {
       return res.status(400).json({ success: false, error: 'deviceId and masterCropId are required' });
    }

    // 1. Fetch the master template
    const masterCrop = await MasterCrop.findById(masterCropId);
    if (!masterCrop) {
      return res.status(404).json({ success: false, error: 'Master crop template not found' });
    }

    // 2. Generate the personalized timeline based on today's start date
    const startDate = new Date();
    
    const dailyTasks = masterCrop.timelineTemplate.map((templateTask) => {
      // Calculate due date (startDate + targetDay in milliseconds)
      const dueDate = new Date(startDate.getTime());
      dueDate.setDate(dueDate.getDate() + templateTask.day);

      return {
        taskId: uuidv4(), // Give this specific task instance a unique ID
        title: templateTask.title,
        instructions: templateTask.instructions,
        taskType: templateTask.taskType,
        phase: templateTask.phase,
        targetDay: templateTask.day,
        dueDate: dueDate,
        isCompleted: false
      };
    });

    // 3. Create the active crop
    const activeCrop = new ActiveCrop({
      deviceId,
      cropId: masterCrop._id,
      cropName: customName || masterCrop.name,
      startDate: startDate,
      status: 'active',
      dailyTasks: dailyTasks
    });

    await activeCrop.save();

    res.status(201).json({ success: true, data: activeCrop, message: 'Crop started successfully' });

  } catch (error) {
    console.error('Error in startCrop:', error);
    res.status(500).json({ success: false, error: 'Server error starting crop' });
  }
};

// GET /api/crops/active/:deviceId
// Purpose: Retrieves active crops and filters tasks due up to today
exports.getActiveCrops = async (req, res) => {
  try {
    const { deviceId } = req.params;

    // Find all active crops for this user
    const activeCrops = await ActiveCrop.find({ deviceId, status: 'active' });

    // Formatting for the "Today's Work" widget logic
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    const formattedCrops = activeCrops.map(crop => {
      const pendingTasks = crop.dailyTasks.filter(task => 
        !task.isCompleted && task.dueDate <= today
      );
      
      return {
        _id: crop._id,
        cropName: crop.cropName,
        startDate: crop.startDate,
        pendingTasksCount: pendingTasks.length,
        dueTasks: pendingTasks // Tasks the UI needs to show right now
      };
    });

    res.status(200).json({ success: true, data: formattedCrops });

  } catch (error) {
    console.error('Error fetching active crops:', error);
    res.status(500).json({ success: false, error: 'Server error fetching active crops' });
  }
};

// PATCH /api/crops/task/complete
// Purpose: Marks a task as complete
exports.completeTask = async (req, res) => {
  try {
    const { activeCropId, taskId } = req.body;

    if (!activeCropId || !taskId) {
        return res.status(400).json({ success: false, error: 'activeCropId and taskId are required' });
    }

    // Find the crop and update the specific task in the dailyTasks array
    const activeCrop = await ActiveCrop.findOneAndUpdate(
      { 
        _id: activeCropId, 
        "dailyTasks.taskId": taskId 
      },
      { 
        $set: { 
          "dailyTasks.$.isCompleted": true, 
          "dailyTasks.$.completedAt": new Date() 
        } 
      },
      { new: true } // Return the updated document
    );

    if (!activeCrop) {
      return res.status(404).json({ success: false, error: 'Crop or task not found' });
    }

    res.status(200).json({ success: true, message: 'Task marked as complete' });

  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ success: false, error: 'Server error completing task' });
  }
};

const MasterCrop = require('../models/MasterCrop');
const ActiveCrop = require('../models/ActiveCrop');
const CropDictionary = require('../models/CropDictionary');
const mongoose = require('mongoose');

// Helper function to generate crop timeline via OpenRouter AI
async function generateMasterCropViaAI(cropName) {
  const prompt = `Generate a cultivation timeline for ${cropName} in JSON format exactly matching this schema:
{
  "description": "Short description of the crop",
  "totalDurationDays": integer,
  "phases": [
    {
       "name": "Phase Name (e.g. Pre-planting, Sowing, Vegetative)",
       "order": 1,
       "durationDays": integer,
       "tasks": [
          {
             "title": "Task Title",
             "description": "Step by step instructions",
             "requiredMaterials": ["Compost", "Water"],
             "taskType": "general", // strictly one of: fertilizer, irrigation, general, harvest, pesticide, sowing
             "order": 1
          }
       ]
    }
  ]
}
Ensure task orders strictly start at 1 and increment by 1 for each phase. Ensure phase orders start at 1 and increment by 1. Respond ONLY with valid JSON. Do not include markdown code blocks.`;
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.1-8b-instruct:free', // Use a fast/free model for generation
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate crop from AI');
  }

  const data = await response.json();
  let content = data.choices[0].message.content.trim();
  content = content.replace(/```json/g, '').replace(/```/g, '').trim();
  
  return JSON.parse(content);
}

exports.searchMasterCrops = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(200).json({ success: true, data: [] });
    }

    let matchingCrops = await MasterCrop.find({ 
      name: { $regex: q, $options: 'i' } 
    }).limit(10).select('_id name imageUrl');

    if (matchingCrops.length === 0) {
      const fallbackCrops = await CropDictionary.find({
        name: { $regex: q, $options: 'i' }
      }).limit(10).select('name');
      matchingCrops = fallbackCrops.map(f => ({ name: f.name }));
    }

    res.status(200).json({ success: true, data: matchingCrops });
  } catch (error) {
    console.error('Error searching master crops:', error);
    res.status(500).json({ success: false, error: 'Server error searching crops' });
  }
};

exports.startCrop = async (req, res) => {
  try {
    const { deviceId, masterCropId, customName, totalArea, areaUnit, farmingMethod, soilType } = req.body;

    if (!deviceId) return res.status(400).json({ success: false, error: 'deviceId is required' });
    if (!masterCropId && !customName) return res.status(400).json({ success: false, error: 'Either masterCropId or a crop name must be provided' });

    let masterCrop;
    let finalCropName = customName;

    if (masterCropId) {
        masterCrop = await MasterCrop.findById(masterCropId);
        if (!masterCrop) return res.status(404).json({ success: false, error: 'Master crop template not found' });
        if (!finalCropName) finalCropName = masterCrop.name;
    } else if (customName) {
        masterCrop = await MasterCrop.findOne({ name: { $regex: new RegExp(`^${customName}$`, 'i') }});
        if (!masterCrop) {
            // Generate using OpenRouter AI
            try {
              const generatedData = await generateMasterCropViaAI(customName);
              masterCrop = new MasterCrop({
                  name: customName,
                  description: generatedData.description || 'AI-generated timeline',
                  totalDurationDays: generatedData.totalDurationDays,
                  phases: generatedData.phases || []
              });
              await masterCrop.save();
            } catch (aiError) {
              console.error('AI Generation Error:', aiError);
              return res.status(500).json({ success: false, error: 'Failed to generate crop AI timeline. Please try an existing crop.' });
            }
        }
    }

    const startDate = new Date();
    
    // Map MasterCrop phases to ActiveCrop phases
    const activePhases = (masterCrop.phases || []).map((p, pIndex) => {
      let expectedEndDate = new Date(startDate);
      expectedEndDate.setDate(expectedEndDate.getDate() + p.durationDays);

      return {
        phaseId: p._id,
        name: p.name,
        order: p.order,
        durationDays: p.durationDays,
        status: pIndex === 0 ? 'in_progress' : 'locked', // Unlock first phase
        startDate: pIndex === 0 ? startDate : null,
        expectedEndDate: pIndex === 0 ? expectedEndDate : null,
        tasks: p.tasks.map((t, tIndex) => ({
           taskId: t._id,
           title: t.title,
           description: t.description,
           mediaUrl: t.mediaUrl,
           requiredMaterials: t.requiredMaterials,
           taskType: t.taskType,
           order: t.order,
           status: (pIndex === 0 && tIndex === 0) ? 'pending' : 'locked', // Unlock first task of first phase
           isCompleted: false
        }))
      };
    });

    const status = activePhases.length === 0 ? 'inactive' : 'active';

    const activeCrop = new ActiveCrop({
      deviceId,
      cropId: masterCrop._id,
      cropName: finalCropName,
      startDate: startDate,
      totalArea,
      areaUnit,
      farmingMethod,
      soilType,
      status: status,
      phases: activePhases
    });

    await activeCrop.save();

    res.status(201).json({ success: true, data: activeCrop, message: 'Crop started successfully' });

  } catch (error) {
    console.error('Error in startCrop:', error);
    res.status(500).json({ success: false, error: 'Server error starting crop' });
  }
};

exports.getActiveCrops = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const activeCrops = await ActiveCrop.find({ deviceId, status: { $in: ['active', 'inactive'] } });

    // Formatting for the "Today's Work" widget logic, adapted for new schema
    const formattedCrops = activeCrops.map(crop => {
      let pendingTasks = [];
      let totalTasks = 0;
      let completedTasks = 0;
      
      let currentPhaseName = 'N/A';
      let daysRemaining = 0;

      if (crop.phases) {
        crop.phases.forEach(phase => {
          if (phase.status === 'in_progress') {
             currentPhaseName = phase.name;
             const diffTime = Math.abs(new Date(phase.expectedEndDate) - new Date());
             daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          }
          
          phase.tasks.forEach(task => {
            totalTasks++;
            if (task.isCompleted) completedTasks++;
            // We consider 'pending' tasks as the action items for the widget
            if (task.status === 'pending') {
              pendingTasks.push({ ...task.toObject(), phaseName: phase.name });
            }
          });
        });
      }
      
      const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        _id: crop._id,
        cropName: crop.cropName,
        status: crop.status,
        startDate: crop.startDate,
        completionPercentage,
        currentPhaseName,
        daysRemaining,
        dueTasks: pendingTasks
      };
    });

    res.status(200).json({ success: true, data: formattedCrops });

  } catch (error) {
    console.error('Error fetching active crops:', error);
    res.status(500).json({ success: false, error: 'Server error fetching active crops' });
  }
};

exports.completeTask = async (req, res) => {
  try {
    const { activeCropId, phaseId, taskId } = req.body;

    if (!activeCropId || !phaseId || !taskId) {
        return res.status(400).json({ success: false, error: 'activeCropId, phaseId, and taskId are required' });
    }

    const activeCrop = await ActiveCrop.findById(activeCropId);
    if (!activeCrop) return res.status(404).json({ success: false, error: 'Crop not found' });

    let phase = activeCrop.phases.id(phaseId);
    if (!phase) return res.status(404).json({ success: false, error: 'Phase not found' });

    let currentTask = phase.tasks.id(taskId);
    if (!currentTask) return res.status(404).json({ success: false, error: 'Task not found' });

    // Mark current task as completed
    currentTask.status = 'completed';
    currentTask.isCompleted = true;
    currentTask.completedAt = new Date();

    // Check for next task in the SAME phase
    let nextTask = phase.tasks.find(t => t.order === currentTask.order + 1);
    
    if (nextTask) {
        nextTask.status = 'pending';
    } else {
        // No more tasks in this phase -> mark phase complete!
        phase.status = 'completed';
        
        // Check for next phase in the crop
        let nextPhase = activeCrop.phases.find(p => p.order === phase.order + 1);
        if (nextPhase) {
            nextPhase.status = 'in_progress';
            nextPhase.startDate = new Date();
            let expectedEnd = new Date();
            expectedEnd.setDate(expectedEnd.getDate() + nextPhase.durationDays);
            nextPhase.expectedEndDate = expectedEnd;
            
            // Unlock first task of the new phase
            let firstTaskOfNextPhase = nextPhase.tasks.find(t => t.order === 1);
            if (firstTaskOfNextPhase) {
                firstTaskOfNextPhase.status = 'pending';
            }
        } else {
            // No next phase means crop is fully completed!
            activeCrop.status = 'harvested'; // Or 'completed'
        }
    }

    await activeCrop.save();

    res.status(200).json({ success: true, message: 'Task marked as complete and workflow advanced', data: activeCrop });

  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ success: false, error: 'Server error completing task' });
  }
};

exports.getActiveCropById = async (req, res) => {
  try {
    const { id } = req.params;
    const crop = await ActiveCrop.findById(id).populate('cropId');
    if (!crop) {
      return res.status(404).json({ success: false, error: 'Crop not found' });
    }
    
    // Calculate global stats for dashboard
    let totalTasks = 0;
    let completedTasks = 0;
    
    if (crop.phases) {
      crop.phases.forEach(phase => {
        phase.tasks.forEach(t => {
          totalTasks++;
          if (t.isCompleted) completedTasks++;
        });
      });
    }
    
    const doc = crop.toObject();
    doc.completionPercentage = totalTasks > 0 ? Math.round((completedTasks/totalTasks)*100) : 0;
    
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    console.error('Error fetching active crop by id:', error);
    res.status(500).json({ success: false, error: 'Server error fetching crop details' });
  }
};

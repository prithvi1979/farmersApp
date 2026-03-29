const mongoose = require('mongoose');
const uri = "mongodb+srv://prithvimanb:MyneERtyu123!!@cluster0.kowquge.mongodb.net/farmersApp?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri).then(async () => {
    console.log("Connected to DB");
    
    const MasterCrop = mongoose.connection.collection('mastercrops');
    const potato = await MasterCrop.findOne({ name: { $regex: /potato/i } });
    if(potato && potato.timeline) {
        console.log("MasterCrop Instruction Example:");
        console.log(potato.timeline[0]?.instructions);
    } else {
         console.log("No MasterCrop potato found");
    }
    
    const ActiveCrop = mongoose.connection.collection('activecrops');
    const activePotato = await ActiveCrop.findOne({ cropName: { $regex: /potato/i } });
    if(activePotato && activePotato.dailyTasks && activePotato.dailyTasks.length > 0) {
        console.log("ActiveCrop Instruction Example:");
        console.log(activePotato.dailyTasks[0]?.instructions);
    } else {
        console.log("No ActiveCrop potato found with tasks");
    }
    
    mongoose.disconnect();
}).catch(console.error);

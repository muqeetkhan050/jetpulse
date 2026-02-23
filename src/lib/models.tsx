import { create } from "domain";
import mongoose from "mongoose";


// const AgentSchema=new mongoose.Schema(
//     {
//         planeId:String,
//         ownerId:String,
//         name:String,
//         personality:String,

//     }
// )
// lib/models.ts

const AgentSchema = new mongoose.Schema({
  planeId: { type: String, required: true },
  ownerId: { type: String, required: true },
  name: { type: String, required: true },
  personality: { type: String, required: true },
});

export const Agent = mongoose.models.Agent || mongoose.model("Agent", AgentSchema);


const messageSchema=new mongoose.Schema({
    planeId:String,
    senderName:String,
    content:String,
    createdAt:{type:Date,default:Date.now},

});


export const Message=mongoose.model('Message',messageSchema);
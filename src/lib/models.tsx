import { create } from "domain";
import mongoose from "mongoose";


const AgentSchema=new mongoose.Schema(
    {
        planeId:String,
        ownerId:String,
        name:String,
        personality:String,

    }
)


const messageSchema=new mongoose.Schema({
    planeid:String,
    senderName:String,
    content:String,
    createdAt:{type:Date,default:Date.now},

});


export const Agent=mongoose.model('Agent',AgentSchema);
export const Message=mongoose.model('Message',messageSchema);
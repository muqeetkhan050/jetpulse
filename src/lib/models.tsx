
import mongoose, { Schema, Model } from 'mongoose';

interface IAgent {
  planeId: string;
  ownerId: string;
  name: string;
  personality: string;
  createdAt?: Date;
}

interface IMessage {
  planeId: string;
  senderName: string;
  content: string;
  createdAt?: Date;
}

const AgentSchema = new Schema<IAgent>({
  planeId: { type: String, required: true, index: true },
  ownerId: { type: String, required: true },
  name: { type: String, required: true },
  personality: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const MessageSchema = new Schema<IMessage>({
  planeId: { type: String, required: true, index: true },
  senderName: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Agent: Model<IAgent> = 
  mongoose.models.Agent || mongoose.model<IAgent>('Agent', AgentSchema);

export const Message: Model<IMessage> = 
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
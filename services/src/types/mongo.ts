import { Document, ObjectId } from 'mongodb';

// Base interface for all MongoDB documents
export interface BaseDocument extends Document {
  _id?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface typeBotSession extends BaseDocument {
  device_id: string;
  device_data: Object;
  chat_flow: ChatMessage[];
}

// Collection names enum
export enum Collections {
  SESSIONS = 'bot_sessions',
}

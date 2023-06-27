import { Schema, model } from "mongoose";

interface IMessage {
  from: number;
  content: string;
  timestamp: Date;
}

interface IChatHistory {
  user_id: number;
  store_id: number;
  toUserUnread: number;
  toStoreUnread: number;
  message: IMessage[];
}

const chatHistorySchema = new Schema<IChatHistory>({
  user_id: { type: Number, required: true },
  store_id: { type: Number, required: true },
  toUserUnread: { type: Number, default: 0 },
  toStoreUnread: { type: Number, default: 0 },
  message: [
    {
      from: { type: Number, require: true },
      content: { type: String, require: true },
      timestamp: { type: Date, default: new Date() },
    },
  ],
});

const Chat = model<IChatHistory>("Chat", chatHistorySchema);

export default Chat;

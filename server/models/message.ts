import Chat from "./mongoose.js";
import { z } from "zod";

const MessageShema = z.object({
  from: z.number(),
  content: z.string(),
  date: z.date(),
});

const ChatSchema = z.object({
  user_id: z.number(),
  store_id: z.number(),
  toUserUnread: z.number(),
  toStoreUnread: z.number(),
  message: z.array(MessageShema),
});

export type Chats = z.infer<typeof ChatSchema>;

export const findMessage = async (userId: number, storeId: number) => {
  const result = await Chat.findOne({ user_id: userId, store_id: storeId });
  const chat = ChatSchema.parse(result);
  return chat;
};

export const findMessageByStore = async (storeId: number) => {
  const result = await Chat.find({ store_id: storeId });
  const chat = z.array(ChatSchema).parse(result);

  return chat;
};

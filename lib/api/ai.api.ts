import { apiAxios } from "./client";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Source {
  title: string;
  slug: string;
  docId?: string;
}

export interface ChatResult {
  reply: string;
  sources: Source[];
}

export const sendChatMessage = async (
  message: string,
  history: ChatMessage[]
): Promise<ChatResult> => {
  const res = await apiAxios.post("/ai/chat", { message, history });
  return res.data.data as ChatResult;
};

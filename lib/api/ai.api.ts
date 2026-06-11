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

/**
 * Non-streaming fallback. The primary path is the SSE stream in ai.stream.ts;
 * this remains for callers that don't need token-by-token rendering.
 * The endpoint is authenticated and scopes context to the requesting user.
 */
export const sendChatMessage = async (
  message: string,
  history: ChatMessage[]
): Promise<ChatResult> => {
  const res = await apiAxios.post("/ai/chat", { message, history });
  return res.data.data as ChatResult;
};

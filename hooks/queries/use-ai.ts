"use client";

import { useMutation } from "@tanstack/react-query";
import {
  sendAdminChatMessage,
  sendChatMessage,
  type ChatMessage,
} from "@/lib/api/ai.api";

export function useAiMutations() {
  const sendPublicMessage = useMutation({
    mutationFn: ({
      message,
      history,
    }: {
      message: string;
      history: ChatMessage[];
    }) => sendChatMessage(message, history),
  });

  const sendAdminMessage = useMutation({
    mutationFn: ({
      message,
      history,
    }: {
      message: string;
      history: ChatMessage[];
    }) => sendAdminChatMessage(message, history),
  });

  return {
    sendChatMessage: sendPublicMessage,
    sendAdminChatMessage: sendAdminMessage,
  };
}

console.log("ARQUIVO EXECUTADO");

import "dotenv/config";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

type Role = "seller" | "client";

type Message = {
  role: Role;
  message: string;
};

export async function simulateConversation(
  clientPrompt: string,
  sellerPrompt: string,
  starter: Role,
  initialMessage: string,
  maxMessages: number
) {

  const model = openai("gpt-4o-mini");

  const conversation: Message[] = [];

  // histórico separado para cada agente
  const sellerHistory: any[] = [
    { role: "system", content: sellerPrompt }
  ];

  const clientHistory: any[] = [
    { role: "system", content: clientPrompt }
  ];

  // mensagem inicial
  conversation.push({
    role: starter,
    message: initialMessage
  });

  if (starter === "client") {

    clientHistory.push({
      role: "assistant",
      content: initialMessage
    });

    sellerHistory.push({
      role: "user",
      content: initialMessage
    });

  } else {

    sellerHistory.push({
      role: "assistant",
      content: initialMessage
    });

    clientHistory.push({
      role: "user",
      content: initialMessage
    });

  }

  let currentSpeaker: Role =
    starter === "client" ? "seller" : "client";

  // loop da conversa
  while (conversation.length < maxMessages) {

    try {

      if (currentSpeaker === "seller") {

        const { text } = await generateText({
          model,
          temperature: 0.7,
          maxOutputTokens: 120,
          messages: sellerHistory
        });

        const message = text.trim();

        if (!message) break;

        conversation.push({
          role: "seller",
          message
        });

        sellerHistory.push({
          role: "assistant",
          content: message
        });

        clientHistory.push({
          role: "user",
          content: message
        });

        currentSpeaker = "client";

      } else {

        const { text } = await generateText({
          model,
          temperature: 1,
          maxOutputTokens: 120,
          messages: clientHistory
        });

        const message = text.trim();

        if (!message) break;

        conversation.push({
          role: "client",
          message
        });

        clientHistory.push({
          role: "assistant",
          content: message
        });

        sellerHistory.push({
          role: "user",
          content: message
        });

        currentSpeaker = "seller";
      }

    } catch (error) {

      console.error("Erro durante geração da mensagem:");
      console.error(error);

      throw new Error("Falha ao gerar mensagem da conversa");

    }

  }

  return {
    conversation,
    metadata: {
      totalMessages: conversation.length,
      sellerMessages: conversation.filter(
        m => m.role === "seller"
      ).length,
      clientMessages: conversation.filter(
        m => m.role === "client"
      ).length
    }
  };
}
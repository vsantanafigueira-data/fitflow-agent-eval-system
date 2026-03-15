console.log("ARQUIVO EXECUTADO");
import "dotenv/config";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

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

  const model = groq("llama-3.1-8b-instant");

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

    if (currentSpeaker === "seller") {

      const { text } = await generateText({
        model,
        temperature: 0.7,
        maxOutputTokens: 120,
        messages: sellerHistory
      });

      conversation.push({
        role: "seller",
        message: text
      });

      sellerHistory.push({
        role: "assistant",
        content: text
      });

      clientHistory.push({
        role: "user",
        content: text
      });

      currentSpeaker = "client";

    } else {

      const { text } = await generateText({
        model,
        temperature: 1,
        maxOutputTokens: 120,
        messages: clientHistory
      });

      conversation.push({
        role: "client",
        message: text
      });

      clientHistory.push({
        role: "assistant",
        content: text
      });

      sellerHistory.push({
        role: "user",
        content: text
      });

      currentSpeaker = "seller";
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
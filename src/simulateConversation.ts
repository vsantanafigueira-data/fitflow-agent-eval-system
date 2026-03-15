import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

type Role = "seller" | "client";

type Message = {
  role: Role;
  message: string;
};

async function simulateConversation() {

  const clientIndex = Number(process.argv[2] ?? 0);
  const starter = (process.argv[3] ?? "client") as Role;
  const initialMessage =
    process.argv[4] ??
    "Oi! Vi o anúncio de vocês e queria saber mais.";
  const maxMessages = Number(process.argv[5] ?? 10);

  const sellerPrompt = readFileSync(
    join(process.cwd(), "data", "agent-prompt.md"),
    "utf-8"
  );

  const clientsFile = JSON.parse(
    readFileSync(join(process.cwd(), "data", "clients.json"), "utf-8")
  );

  const clientPrompt = clientsFile.clients[clientIndex].prompt;

  const clientSystemPrompt = `
Você é um CLIENTE interessado no produto.

REGRAS IMPORTANTES:
- Você NÃO é vendedor
- Você NÃO explica o produto
- Você NÃO cria soluções
- Você NÃO age como especialista

COMPORTAMENTO:
- Faça perguntas
- Demonstre curiosidade
- Às vezes tenha dúvidas ou objeções
- Fale como pessoa real em chat

ESTILO:
- mensagens curtas
- 1 ou 2 frases
- linguagem natural

PROIBIDO:
- mencionar que é IA
- mencionar modelo de linguagem
- agir como assistente
- agir como vendedor

Perfil do cliente:

${clientPrompt}
`;

  const model = groq("llama-3.1-8b-instant");

  const conversation: Message[] = [];

  const sellerHistory: any[] = [
    { role: "system", content: sellerPrompt }
  ];

  const clientHistory: any[] = [
    { role: "system", content: clientSystemPrompt }
  ];

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

  // 🐞 BUG ESCONDIDO CORRIGIDO
  let currentSpeaker: Role =
    starter === "client" ? "seller" : "client";

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

  const result = {
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

  writeFileSync(
    join(process.cwd(), "data", "conversation.json"),
    JSON.stringify(result, null, 2)
  );

  console.log("✅ Conversa salva em data/conversation.json");
}

simulateConversation().catch(err => {
  console.error(err);
});

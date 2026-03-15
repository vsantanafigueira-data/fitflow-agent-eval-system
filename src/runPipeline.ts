import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { generateClients } from "./agent-tester/generateClients.js";
import { simulateConversation } from "./simulateConversation.js";

type SimulationOutput = {
  clientName: string;
  description: string;
  conversation: any | null;
  success: boolean;
  error?: string;
};

async function runPipeline() {

  console.log("🚀 Pipeline iniciado");

  // parâmetros do pipeline
  const clientCount = Number(process.argv[2] ?? 5);
  const maxMessages = Number(process.argv[3] ?? 12);
  const starter = (process.argv[4] ?? "client") as "client" | "seller";
  const initialMessage =
    process.argv[5] ?? "Oi! Vi o anúncio e queria saber mais.";

  console.log(`Clientes solicitados: ${clientCount}`);
  console.log(`Máx mensagens por conversa: ${maxMessages}`);

  // 1️⃣ gerar clientes (PARTE 1)

  console.log("Gerando clientes fictícios...");

  const { clients } = await generateClients(clientCount);

  // garante que não ultrapasse o número solicitado
  const limitedClients = clients.slice(0, clientCount);

  console.log(`Clientes disponíveis: ${limitedClients.length}`);

  // prompt do vendedor
  const sellerPrompt = readFileSync(
    join(process.cwd(), "data", "agent-prompt.md"),
    "utf-8"
  );

  // 2️⃣ rodar simulações em paralelo

  const simulations: SimulationOutput[] = await Promise.all(

    limitedClients.map(async (client) => {

      try {

        console.log(`🧪 Simulando conversa com: ${client.name}`);

        const result = await simulateConversation(
          client.prompt,
          sellerPrompt,
          starter,
          initialMessage,
          maxMessages
        );

        return {
          clientName: client.name,
          description: client.description,
          conversation: result,
          success: true
        };

      } catch (err: any) {

        console.error(`❌ Falhou simulação para ${client.name}`);

        return {
          clientName: client.name,
          description: client.description,
          conversation: null,
          success: false,
          error: err?.message ?? "Erro desconhecido"
        };

      }

    })

  );

  // 3️⃣ calcular metadata

  const failedSimulations = simulations.filter(s => !s.success).length;

  const output = {
    simulations,
    metadata: {
      totalClients: limitedClients.length,
      successfulSimulations: limitedClients.length - failedSimulations,
      failedSimulations
    }
  };

  // 4️⃣ salvar resultado final

  const outputPath = join(process.cwd(), "data", "conversations.json");

  writeFileSync(
    outputPath,
    JSON.stringify(output, null, 2)
  );

  console.log("✅ Pipeline finalizado");
  console.log(`📄 Resultado salvo em: ${outputPath}`);
}

// executa pipeline
runPipeline().catch((err) => {
  console.error("Erro fatal no pipeline:");
  console.error(err);
});
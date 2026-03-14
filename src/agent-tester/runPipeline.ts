/**
 * Orquestra o pipeline de teste: gera clientes, simula conversas e (opcionalmente) dispara avaliação.
 */

import { generateClients } from "./generateClients.js";
import { simulateConversation } from "./simulateConversation.js";

export async function runPipeline(systemPrompt: string): Promise<void> {
  const clients = generateClients();
  for (const client of clients) {
    await simulateConversation(client.id, systemPrompt);
  }
  // TODO: opcionalmente chamar eval-pipeline
}

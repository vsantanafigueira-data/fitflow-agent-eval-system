/**
 * Orquestra o pipeline de teste: gera clientes, simula conversas e (opcionalmente) dispara avaliação.
 */

import { generateClients } from "./generateClients.js";
import { simulateConversation } from "./simulateConversation.js";

const DEFAULT_CLIENT_COUNT = 5;

/**
 * Executa o pipeline: gera N personas, simula conversa de cada uma com o agente.
 * @param systemPrompt - Prompt do agente (ex.: conteúdo de data/agent-prompt.md)
 * @param count - Número de clientes a gerar (1–20, padrão 5)
 */
export async function runPipeline(
  systemPrompt: string,
  count: number = DEFAULT_CLIENT_COUNT
): Promise<void> {
  const capped = Math.min(Math.max(1, count), 20);
  const data = await generateClients(systemPrompt, capped);
  for (const client of data.clients) {
    await simulateConversation(client.name, systemPrompt, client.prompt);
  }
  // TODO: opcionalmente chamar eval-pipeline com os resultados das conversas
}

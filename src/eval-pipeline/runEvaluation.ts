/**
 * Executa o pipeline de avaliação sobre um conjunto de conversas.
 */

import { evaluateConversation } from "./evaluateConversation.js";
import type { ConversationResult } from "../agent-tester/simulateConversation.js";
import type { EvaluationResult } from "./evaluateConversation.js";

export async function runEvaluation(
  conversations: ConversationResult[]
): Promise<EvaluationResult[]> {
  const results: EvaluationResult[] = [];
  for (const conv of conversations) {
    const result = await evaluateConversation(conv.clientId, conv.messages);
    results.push(result);
  }
  return results;
}

/**
 * Avalia uma conversa usando o juiz (LLM) e o prompt definido em judgePrompt.
 */

import type { Message } from "../agent-tester/simulateConversation.js";
import { buildJudgePrompt } from "./judgePrompt.js";

export interface EvaluationResult {
  conversationId: string;
  scores?: Record<string, number>;
  summary?: string;
  rawResponse?: string;
}

/**
 * Envia a transcrição da conversa para o juiz e retorna o resultado da avaliação.
 */
export async function evaluateConversation(
  conversationId: string,
  messages: Message[]
): Promise<EvaluationResult> {
  const transcript = messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");
  const prompt = buildJudgePrompt(transcript);
  // TODO: chamar LLM com prompt e parsear resposta em EvaluationResult
  return {
    conversationId,
    rawResponse: prompt,
  };
}

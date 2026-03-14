/**
 * Define o prompt usado pelo juiz (LLM) para avaliar conversas do agente vendedor.
 */

export const JUDGE_SYSTEM_PROMPT = `
Você é um avaliador objetivo de conversas de vendas.
Avalie a conversa conforme critérios definidos (clareza, persuasão, adequação ao perfil do cliente, etc.).
Responda em formato estruturado (ex.: JSON ou texto com scores e justificativas).
`.trim();

export function buildJudgePrompt(conversationTranscript: string): string {
  return `${JUDGE_SYSTEM_PROMPT}\n\n## Transcrição da conversa\n\n${conversationTranscript}`;
}

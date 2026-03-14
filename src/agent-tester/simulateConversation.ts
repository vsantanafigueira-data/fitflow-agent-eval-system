/**
 * Simula uma conversa entre um cliente e o agente vendedor.
 */

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ConversationResult {
  clientId: string;
  messages: Message[];
  // Adicione métricas ou resultados da conversa
}

/**
 * Executa uma conversa simulada com o agente usando o system prompt fornecido.
 */
export async function simulateConversation(
  clientId: string,
  systemPrompt: string
): Promise<ConversationResult> {
  // TODO: integrar com o agente (ex.: AI SDK) e simular troca de mensagens
  return {
    clientId,
    messages: [],
  };
}

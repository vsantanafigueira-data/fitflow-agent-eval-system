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
 * @param clientId - Identificador do cliente (ex.: nome da persona)
 * @param systemPrompt - System prompt do agente vendedor
 * @param initialUserMessage - Mensagem/prompt inicial do cliente (opcional)
 */
export async function simulateConversation(
  clientId: string,
  systemPrompt: string,
  initialUserMessage?: string
): Promise<ConversationResult> {
  // TODO: integrar com o agente (ex.: AI SDK) e simular troca de mensagens
  const messages: Message[] = [
    { role: "system", content: systemPrompt },
  ];
  if (initialUserMessage) {
    messages.push({ role: "user", content: initialUserMessage });
  }
  return {
    clientId,
    messages,
  };
}
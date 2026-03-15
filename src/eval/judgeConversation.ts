import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { JudgeSchema } from "./judgeSchema.js";

export async function judgeConversation(
  agentPrompt: string,
  conversation: any
) {

  const model = openai("gpt-4o-mini");

  const system = `
Você é um avaliador especialista em agentes de vendas.

Seu trabalho é avaliar a qualidade de uma conversa entre um cliente e um agente de vendas.

Use os critérios abaixo e dê notas de 0 a 10.

CRITÉRIOS:

1. adherence_to_prompt
O agente seguiu as regras do prompt?

2. product_accuracy
As informações do produto estão corretas?

3. price_accuracy
Os preços apresentados são exatamente os definidos?

4. conversation_quality
A conversa soa natural e fluida?

5. sales_effectiveness
O agente conduziu a conversa para possível conversão?

6. rule_compliance
O agente evitou comportamentos proibidos?

Forneça também uma justificativa curta.
`;

  const prompt = `
PROMPT DO AGENTE:

${agentPrompt}

━━━━━━━━━━━━━━

CONVERSA:

${JSON.stringify(conversation, null, 2)}

━━━━━━━━━━━━━━

Avalie a conversa.
`;

  const { object } = await generateObject({

    model,
    schema: JudgeSchema,
    temperature: 0.2,

    system,
    prompt

  });

  return object;
}
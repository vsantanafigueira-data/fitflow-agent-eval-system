/**
 * Gera personas de clientes fictícios para testar o agente de vendas.
 * Usa Vercel AI SDK + Groq e valida com Zod.
 */

import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";

// --- Schema Zod (estrutura do output) ---

const ClientSchema = z.object({
  name: z.string(),
  description: z.string(),
  prompt: z.string(),
});

const ClientsOutputSchema = z.object({
  clients: z.array(ClientSchema),
});

type ClientsOutput = z.infer<typeof ClientsOutputSchema>;

export type ClientProfile = z.infer<typeof ClientSchema>;

// --- Helpers ---

function getProjectRoot(): string {
  return process.cwd();
}

function readAgentPrompt(): string {
  const path = join(getProjectRoot(), "data", "agent-prompt.md");
  return readFileSync(path, "utf-8");
}

function saveClients(data: ClientsOutput): void {
  const path = join(getProjectRoot(), "data", "clients.json");
  writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
}

// --- Meta-prompt para geração de leads ---

const LEAD_ARCHETYPES = [
  "Lead altamente interessado (alta intenção de compra) — já reconhece que tem o problema que o produto resolve e quer avançar rapidamente. Faz perguntas diretas como preço, formas de pagamento, prazo para começar e como contratar.",

  "Lead curioso (interesse moderado) — percebe valor na solução e quer entender melhor como funciona. Faz perguntas abertas sobre benefícios, diferenciais, resultados e para quem o produto é indicado, mas ainda não decidiu comprar.",

  "Lead com objeção de preço — demonstra interesse no produto, porém acredita que o valor pode ser alto. Pergunta sobre descontos, parcelamentos e compara com outras alternativas ou soluções mais baratas.",

  "Lead desconfiado ou cético — tem receio de que o produto não funcione como prometido. Questiona resultados, pede provas sociais, depoimentos, estudos de caso ou garantias antes de confiar.",

  "Lead cliente atual — já utilizou ou utiliza o produto. Pode entrar em contato para pedir suporte, tirar dúvidas sobre uso, reclamar de algo, perguntar sobre renovação ou upgrade.",

  "Lead ocupado ou com pouca atenção — está em um momento corrido e responde com mensagens curtas. Pode demorar para responder, ignorar partes da conversa ou desaparecer temporariamente.",

  "Lead em fase de pesquisa — ainda não pretende comprar agora. Está apenas coletando informações para avaliar opções no futuro. Faz perguntas informativas, mas evita falar sobre pagamento ou fechamento."
] as const;


function buildClientGenerationPrompt(
  agentPrompt: string,
  count: number
): { system: string; prompt: string } {
  const system = `Você gera personas de LEADS fictícios para testar um agente de vendas.

Perfis possíveis:
${LEAD_ARCHETYPES.map((a, i) => `${i + 1}. ${a}`).join("\n")}

Comportamento:
- Fale como uma pessoa real conversando em chat (ex.: WhatsApp ou Instagram).
- Use linguagem natural, informal e espontânea.
- Evite respostas muito longas ou robóticas.
- Às vezes faça perguntas curtas ou responda de forma direta, como pessoas fazem em chat.
- Demonstre emoções e reações naturais (curiosidade, dúvida, interesse, desconfiança, pressa, etc.).
- Faça perguntas quando algo não estiver claro.
- Reaja às respostas do vendedor como um cliente real faria.
- Não revele que você é uma simulação ou uma IA.
- Mantenha consistência com o perfil do lead (ex.: interessado, desconfiado, curioso).
- Não concorde com tudo imediatamente — questione quando fizer sentido.

IMPORTANTE:
Responda APENAS com JSON válido.
Não escreva explicações.

Formato esperado:

{
  "clients": [
    {
      "name": "string",
      "description": "string",
      "prompt": "string"
    }
  ]
}`;

  const prompt = `Contexto do agente:

---
${agentPrompt}
---

Gere exatamente ${count} clientes fictícios.
Varie os perfis e seja realista.`;

  return { system, prompt };
}

// --- Geração com AI SDK ---

export async function generateClients(
  agentPrompt: string,
  count: number
): Promise<ClientsOutput> {

  const model = groq("llama-3.1-8b-instant");

  const metaPrompt = buildClientGenerationPrompt(agentPrompt, count);

  const { text } = await generateText({
    model,
    temperature: 0.7,
    maxOutputTokens: 1500,
    ...metaPrompt,
  });

  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Modelo não retornou JSON válido:\n" + text);
  }

  return ClientsOutputSchema.parse(parsed);
}

// --- Script principal ---

async function main(): Promise<void> {

  const count = Math.min(Math.max(1, Number(process.argv[2]) || 5), 20);

  const agentPrompt = readAgentPrompt();

  console.log(`Gerando ${count} clientes fictícios...`);

  const data = await generateClients(agentPrompt, count);

  saveClients(data);

  console.log(`Gerados ${data.clients.length} clientes em data/clients.json`);
}

main().catch((err) => {
  console.error("Erro ao gerar clientes:");
  console.error(err);
  process.exit(1);
});

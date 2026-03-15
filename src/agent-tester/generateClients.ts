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
  "lead muito interessado — quer fechar, faz perguntas práticas (preço, forma de pagamento, como começar)",
  "lead curioso — interessa-se pelo produto, faz perguntas abertas, ainda não decidiu",
  "lead com objeção de preço — acha caro, compara com alternativas, pede desconto ou parcelamento",
  "lead desconfiado — questiona se funciona, pede provas, depoimentos, garantia",
  "lead que já é cliente — dúvidas de suporte, renovação, upgrade ou reclamação",
  "lead que não tem tempo — corre corre, responde curto, pode sumir no meio da conversa",
  "lead que só está pesquisando — não quer comprar agora, só quer informações para decidir depois",
] as const;

function buildClientGenerationPrompt(
  agentPrompt: string,
  count: number
): { system: string; prompt: string } {
  const system = `Você gera personas de LEADS fictícios para testar um agente de vendas.

Perfis possíveis:
${LEAD_ARCHETYPES.map((a, i) => `${i + 1}. ${a}`).join("\n")}

Comportamento:
- Fale como pessoa real em chat (WhatsApp).
- Use linguagem natural.
- Seja diverso nos perfis.

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

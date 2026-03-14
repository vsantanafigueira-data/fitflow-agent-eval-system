/**
 * Gera personas de clientes fictícios para testar o agente de vendas.
 * Usa Vercel AI SDK (generateText + Output.object) e Zod para o schema.
 */

import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// --- Schema Zod (estrutura do output) ---

const ClientSchema = z.object({
  name: z.string().describe("Nome da persona do cliente"),
  description: z.string().describe("Descrição breve do perfil (idade, contexto, objetivos)"),
  prompt: z.string().describe("Instrução ou primeira mensagem que esse cliente usaria ao falar com o vendedor"),
});

const ClientsOutputSchema = z.object({
  clients: z.array(ClientSchema).describe("Lista de personas de clientes fictícios"),
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
  const system = `Você gera personas de LEADS fictícios para testar um agente de vendas. Cada lead deve ser realista e se encaixar em um dos perfis abaixo.

## Perfis de lead (escolha e varie entre eles)

${LEAD_ARCHETYPES.map((a, i) => `${i + 1}. ${a}`).join("\n")}

## Comportamento realista

- Fala como pessoa real em chat (ex.: WhatsApp): tom natural, às vezes abreviações, emojis com moderação.
- Cada perfil age de acordo com seu tipo: o desconfiado questiona; o com objeção de preço puxa o assunto custo; o sem tempo responde curto; o que só pesquisa evita compromisso.
- Nome e contexto (idade, profissão, situação) devem combinar com o perfil e o produto.
- O campo "prompt" deve ser a primeira mensagem que esse lead mandaria ao vendedor OU uma instrução curta de como ele se comporta na conversa (ex.: "Diz que viu o anúncio, pergunta quanto custa e se pode parcelar").

## Campos de saída

- name: nome da pessoa (nome e sobrenome realistas).
- description: uma linha com perfil + tipo de lead (ex.: "João, 34 anos, quer emagrecer. Lead curioso.").
- prompt: primeira mensagem do lead OU guia de comportamento em 1–2 frases (o que ele diz/faz no início da conversa).`;

  const prompt = `Contexto do agente de vendas e do produto (use para criar leads que fariam sentido nesse canal/produto):

---
${agentPrompt}
---

Gere exatamente ${count} leads fictícios. Varie os perfis: inclua pelo menos um de cada tipo que couber (interessado, curioso, objeção de preço, desconfiado, já cliente, sem tempo, só pesquisando). Priorize diversidade e realismo.`;
  return { system, prompt };
}

// --- Geração com AI SDK ---

/**
 * Gera N clientes fictícios diversos usando o modelo e o prompt do agente como contexto.
 */
export async function generateClients(
  agentPrompt: string,
  count: number
): Promise<ClientsOutput> {
  const model = openai("gpt-4o-mini");

  const metaPrompt = buildClientGenerationPrompt(agentPrompt, count);

  const { output } = await generateText({
    model,
    output: Output.object({
      schema: ClientsOutputSchema,
      name: "clients",
      description: "Lista de personas de clientes fictícios para testar o agente de vendas",
    }),
    ...metaPrompt,
  });

  return output as ClientsOutput;
}

// --- Script (quando executado diretamente) ---

async function main(): Promise<void> {
  const count = Math.min(Math.max(1, Number(process.argv[2]) || 5), 20);
  const agentPrompt = readAgentPrompt();
  const data = await generateClients(agentPrompt, count);
  saveClients(data);
  console.log(`Gerados ${data.clients.length} clientes em data/clients.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

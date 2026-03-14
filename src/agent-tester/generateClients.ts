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

// --- Geração com AI SDK ---

/**
 * Gera N clientes fictícios diversos usando o modelo e o prompt do agente como contexto.
 */
export async function generateClients(
  agentPrompt: string,
  count: number
): Promise<ClientsOutput> {
  const model = openai("gpt-4o-mini");

  const { output } = await generateText({
    model,
    output: Output.object({
      schema: ClientsOutputSchema,
      name: "clients",
      description: "Lista de personas de clientes fictícios para testar o agente de vendas",
    }),
    system: `Você gera personas de clientes fictícios para testar um agente de vendas.
Cada cliente deve ser diverso: diferentes idades, objetivos, objeções, níveis de interesse e contextos.
Para cada persona, forneça:
- name: nome da pessoa
- description: descrição curta do perfil (quem é, contexto de vida, objetivo em relação ao produto)
- prompt: a mensagem ou instrução que esse cliente usaria ao iniciar/fazer a conversa com o vendedor (ex.: primeira mensagem no WhatsApp, ou um breve guia de como ele se comporta)

O produto e o contexto do vendedor estão no prompt do agente abaixo. Gere personas realistas que fariam perguntas ou demonstrações de interesse variadas.`,
    prompt: `Contexto do agente de vendas (use para criar clientes que fazem sentido para esse produto/serviço):

---
${agentPrompt}
---

Gere exatamente ${count} personas de clientes fictícios diversas.`,
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

FitFlow Agent Eval System

Sistema para geração de clientes fictícios, simulação de conversas com um agente de vendas e avaliação automática dessas conversas utilizando LLMs.

O projeto implementa duas partes principais:

Agent Tester — geração de clientes simulados e execução de conversas com o agente de vendas.

Conversation Judge — avaliação automática da qualidade das conversas geradas.

O objetivo é criar um ambiente automatizado para testar e analisar o comportamento de um agente de vendas baseado em LLM.

Estrutura do Projeto
FITFLOW-AGENT-EVAL-SYSTEM

data/
 ├ agent-prompt.md
 ├ clients.json
 ├ conversation.json
 ├ conversations.json
 └ evaluation-report.json

src/
 ├ agent-tester/
 │   └ generateClients.ts
 │
 ├ eval/
 │   ├ judgeConversation.ts
     ├ judgeSchema.ts   
 │   └ runEvaluation.ts
 │
 ├ simulateConversation.ts
 └ runPipeline.ts

.env
package.json
tsconfig.json
README.md

Tecnologias Utilizadas

TypeScript

Node.js

Vercel AI SDK

OpenAI GPT models

Zod (validação de outputs estruturados)

dotenv

O projeto utiliza LLMs para gerar dados de teste e avaliar conversas, e Zod para garantir que os outputs retornados estejam em formato JSON válido.

Parte 1 — Agent Tester

A primeira parte do sistema gera clientes simulados e executa conversas entre o cliente e o agente de vendas.

Geração de Clientes Fictícios

Arquivo:

src/agent-tester/generateClients.ts

Este módulo gera personas de clientes fictícios que serão utilizadas para testar o agente de vendas.

Cada cliente contém:

name

description

prompt

Exemplo de estrutura gerada:

{
  "clients": [
    {
      "name": "Lucas",
      "description": "Engenheiro de 32 anos interessado no produto, mas preocupado com o preço",
      "prompt": "Seu nome é Lucas..."
    }
  ]
}

Os clientes são gerados utilizando um meta-prompt enviado para um modelo LLM.

Arquétipos de Clientes

O sistema define um conjunto de perfis para garantir diversidade nos leads gerados:

Lead altamente interessado

Lead curioso

Lead com objeção de preço

Lead desconfiado

Lead cliente atual

Lead ocupado

Lead em fase de pesquisa

Esses perfis ajudam a testar o agente em diferentes cenários de vendas.

Validação do Output

O output da geração de clientes é validado utilizando Zod.

Schema utilizado:

const ClientSchema = z.object({
  name: z.string(),
  description: z.string(),
  prompt: z.string(),
});

Isso garante que o JSON gerado pelo modelo esteja no formato esperado.

Simulação de Conversas

Arquivo utilizado pelo pipeline:

src/simulateConversation.ts

Este módulo é responsável por simular uma conversa entre:

o agente de vendas

um cliente fictício

Cada cliente utiliza o prompt gerado anteriormente como system prompt.

A conversa é executada com:

mensagem inicial

agente inicial (cliente ou vendedor)

limite máximo de mensagens

Pipeline de Simulação

Arquivo principal:

src/runPipeline.ts

Este script executa o fluxo completo de simulação.

Fluxo do pipeline:

Ler o prompt do agente de vendas (agent-prompt.md)

Gerar clientes fictícios

Simular conversas com cada cliente

Salvar os resultados

Parâmetros do Pipeline

O pipeline aceita os seguintes parâmetros via CLI:

node src/runPipeline.ts <clients> <maxMessages> <starter> <initialMessage>

Parâmetros:

clients → número de clientes fictícios a gerar

maxMessages → número máximo de mensagens por conversa

starter → quem inicia a conversa (client ou seller)

initialMessage → mensagem inicial da conversa

Valores padrão utilizados no código:

clientes: 5

máximo de mensagens: 12

iniciador: client

mensagem inicial: "Oi! Vi o anúncio e queria saber mais."

Output do Pipeline

Após a execução, o pipeline gera:

data/conversations.json

Estrutura do output:

{
  "simulations": [
    {
      "clientName": "Lucas",
      "description": "Lead interessado mas preocupado com preço",
      "conversation": {},
      "success": true
    }
  ],
  "metadata": {
    "totalClients": 5,
    "successfulSimulations": 5,
    "failedSimulations": 0
  }
}

Se uma simulação falhar, o erro é registrado e as demais continuam executando.

Parte 2 — Avaliação das Conversas

O sistema também inclui um módulo para avaliar conversas usando um LLM como juiz.

Juiz de Conversas

Arquivo:

src/eval/judgeConversation.ts

Esse módulo recebe:

o prompt do agente

a conversa gerada

e retorna uma avaliação estruturada.

Critérios de Avaliação

As conversas são avaliadas usando os seguintes critérios:

adherence_to_prompt

Avalia se o agente seguiu corretamente as instruções do prompt.

product_accuracy

Verifica se as informações do produto fornecidas estão corretas.

price_accuracy

Avalia se os preços mencionados são corretos.

conversation_quality

Analisa se a conversa é natural e fluida.

sales_effectiveness

Avalia se o agente conduz a conversa para uma possível conversão.

rule_compliance

Verifica se o agente evitou comportamentos proibidos.

Output do Juiz

O juiz retorna:

nota de 0 a 10 para cada critério

justificativa curta

O output é validado usando Zod schema (JudgeSchema).

Como Executar o Projeto
1. Instalar dependências
npm install
2. Configurar variáveis de ambiente

Criar um arquivo .env:

OPENAI_API_KEY=your_key_here
3. Executar o pipeline
node src/runPipeline.ts

Ou com parâmetros:

node src/runPipeline.ts 5 12 client
Arquivos Gerados

Após a execução, os seguintes arquivos são criados:

data/clients.json
data/conversation.json


Observações

O sistema atual implementa:

geração automática de clientes fictícios

simulação de conversas com o agente

módulo de avaliação de conversas com LLM

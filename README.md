⚙️ Estrutura do Projeto
FITFLOW-AGENT-EVAL-SYSTEM
│
├─ data/
│   ├ agent-prompt.md
│   ├ clients.json
│   ├ conversation.json
│   ├ conversations.json
│   └ evaluation-report.json
│
├─ src/
│   ├ agent-tester/
│   │   └ generateClients.ts
│   │
│   ├ eval/
│   │   ├ judgeConversation.ts
│   │   ├ judgeSchema.ts
│   │   └ runEvaluation.ts
│   │
│   ├ simulateConversation.ts
│   └ runPipeline.ts
│
├─ .env
├─ package.json
├─ tsconfig.json
└─ README.md
🛠 Tecnologias Utilizadas

TypeScript

Node.js

Vercel AI SDK

OpenAI GPT models

Zod (validação de outputs estruturados)

dotenv (variáveis de ambiente)

O projeto utiliza LLMs para gerar dados de teste e avaliar conversas, e Zod para garantir que os outputs retornados estejam sempre em formato JSON válido.

🟢 Parte 1 — Agent Tester

Responsável por gerar clientes simulados e executar conversas entre o cliente e o agente de vendas.

Geração de Clientes Fictícios

Arquivo: src/agent-tester/generateClients.ts

Cada cliente contém:

name — nome do cliente

description — perfil resumido

prompt — prompt usado para guiar a conversa

Exemplo:

{
  "clients": [
    {
      "name": "Lucas",
      "description": "Engenheiro de 32 anos interessado no produto, mas preocupado com o preço",
      "prompt": "Seu nome é Lucas..."
    }
  ]
}
Arquétipos de Clientes

Lead altamente interessado

Lead curioso

Lead com objeção de preço

Lead desconfiado

Lead cliente atual

Lead ocupado

Lead em fase de pesquisa

Isso garante diversidade nos leads e permite testar o agente em múltiplos cenários de vendas.

Validação do Output
const ClientSchema = z.object({
  name: z.string(),
  description: z.string(),
  prompt: z.string(),
});

Garante que o JSON gerado pelo LLM esteja sempre no formato esperado.

Simulação de Conversas

Arquivo: src/simulateConversation.ts

Simula uma conversa entre o agente de vendas e o cliente fictício

Cada cliente usa seu prompt como system prompt

Limita o número de mensagens por conversa

Pipeline de Simulação

Arquivo: src/runPipeline.ts

Fluxo completo:

Ler o prompt do agente (agent-prompt.md)

Gerar clientes fictícios

Simular conversas com cada cliente

Salvar resultados em data/conversations.json

Parâmetros do Pipeline
Parâmetro	Descrição	Padrão
clients	Número de clientes fictícios a gerar	5
maxMessages	Número máximo de mensagens por conversa	12
starter	Quem inicia a conversa (client ou seller)	client
initialMessage	Mensagem inicial da conversa	"Oi! Vi o anúncio e queria saber mais."

Exemplo de execução:

node src/runPipeline.ts 5 12 client "Oi! Vi o anúncio e queria saber mais."
Output do Pipeline
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

Simulações com falha são registradas, mas não interrompem o pipeline.

🔵 Parte 2 — Avaliação das Conversas

O sistema também inclui um módulo que avalia automaticamente as conversas usando LLMs.

Juiz de Conversas

Arquivo: src/eval/judgeConversation.ts

Recebe o prompt do agente e a conversa gerada

Retorna uma avaliação estruturada

Critérios de Avaliação
Critério	Descrição
adherence_to_prompt	Seguiu corretamente as instruções do prompt
product_accuracy	Informações do produto estão corretas
price_accuracy	Preço informado está correto
conversation_quality	Conversa natural e fluida
sales_effectiveness	Conduz à conversão de forma eficaz
rule_compliance	Seguiu regras e evitou comportamentos proibidos

Nota de 0 a 10 por critério

Justificativa curta para cada avaliação

Validação: Zod garante formato consistente (JudgeSchema)

Arquivos Gerados

data/clients.json

data/conversation.json

data/evaluation-report.json

O relatório final inclui médias por critério, ranking de conversas, melhor e pior simulação.

⚡ Como Executar o Projeto

Instalar dependências:

npm install

Configurar variáveis de ambiente criando .env:

OPENAI_API_KEY=your_key_here

Executar pipeline completo:

node src/runPipeline.ts

Opcional: passar parâmetros CLI para personalizar o número de clientes, mensagens e mensagem inicial.

Avaliar conversas:

node src/eval/runEvaluation.ts

O output será data/evaluation-report.json com todos os resultados consolidados.

✨ Objetivo Final

Criar um ciclo automatizado de teste e avaliação de agentes de vendas LLM, permitindo:

Medir qualidade de conversas e desempenho de vendas

Identificar pontos fortes e áreas de melhoria

Treinar agentes de forma objetiva e escalável

Considerações finais e explicações de decisões:
Inicialmente, comecei utilizando o cursor, todavia, o free tier se esgotou rapidamente e parti para outras IA's.

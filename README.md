# FitFlow Agent Evaluation System

## Visão Geral

Este projeto implementa um **sistema automatizado de avaliação para um agente conversacional de vendas**. O sistema gera personas fictícias de clientes, simula conversas entre o cliente e um agente de vendas e armazena os diálogos resultantes para posterior análise.

O objetivo principal é **testar o comportamento e a performance de um agente de vendas em diferentes cenários de interação com clientes**, permitindo avaliar como ele reage a diferentes tipos de leads.

Entre os perfis simulados estão:

* Leads altamente interessados
* Clientes curiosos buscando mais informações
* Leads com objeção de preço
* Clientes céticos ou desconfiados
* Usuários pesquisando diferentes opções
* Clientes atuais solicitando suporte

A geração automática dessas conversas cria um **conjunto de dados sintético útil para avaliação, testes e melhoria contínua do agente de vendas**.

---

# Arquitetura do Sistema

O projeto é estruturado como um **pipeline de simulação de conversas**, composto por três componentes principais:

1. **Gerador de Personas de Clientes**
2. **Simulador de Conversas**
3. **Pipeline de Execução e Armazenamento**

Fluxo geral do sistema:

```
Prompt do Agente de Vendas
        │
        ▼
Gerador de Clientes (generateClients)
        │
        ▼
Simulação de Conversas (simulateConversation)
        │
        ▼
Pipeline de Execução (runPipeline)
        │
        ▼
Armazenamento das Conversas (data/conversations.json)
```

Cada etapa é responsável por uma parte do processo de geração e avaliação das interações.

---

# Estrutura do Projeto

```
FITFLOW-AGENT-EVAL-SYSTEM
│
├── data
│   ├── results
│   ├── agent-prompt.md
│   ├── clients.json
│   ├── conversation.json
│   └── conversations.json
│
├── src
│   ├── agent-tester
│   │   └── generateClients.ts
│   │
│   ├── simulateConversation.ts
│   └── runPipeline.ts
│
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

Descrição dos principais arquivos:

### `data/agent-prompt.md`

Contém o **prompt do agente de vendas** que será testado durante as simulações.

Este prompt define:

* comportamento do vendedor
* estratégia de vendas
* estilo de comunicação
* informações sobre o produto

---

### `generateClients.ts`

Responsável por **gerar personas fictícias de clientes** utilizando um modelo de linguagem.

Cada cliente possui:

* nome
* descrição
* um prompt completo que define seu comportamento durante a conversa

Os clientes simulam diferentes perfis de leads, como:

* interessados
* indecisos
* céticos
* sensíveis ao preço

Os clientes gerados são salvos em:

```
data/clients.json
```

---

### `simulateConversation.ts`

Este módulo realiza a **simulação da conversa entre o cliente e o agente de vendas**.

A simulação funciona da seguinte forma:

1. O sistema carrega o prompt do vendedor e do cliente
2. Um histórico de mensagens é mantido para cada lado
3. O modelo gera respostas alternadamente entre cliente e vendedor
4. A conversa continua até atingir o limite de mensagens ou até que seja detectado o fim natural da interação

Cada mensagem é registrada com:

* papel (cliente ou vendedor)
* conteúdo da mensagem

---

### `runPipeline.ts`

Este arquivo implementa o **pipeline principal do sistema**.

Ele executa as seguintes etapas:

1. Geração das personas de clientes
2. Simulação das conversas
3. Coleta dos resultados
4. Salvamento das conversas simuladas

Todas as conversas geradas são armazenadas em:

```
data/conversations.json
```

Além das mensagens, também são registradas **informações de metadata**, como:

* número total de mensagens
* quantidade de mensagens do cliente
* quantidade de mensagens do vendedor
* resultado final da conversa

---

# Evolução Implementada no Sistema

Após analisar as conversas geradas pelo sistema inicial, foi identificado um problema importante:

As conversas **sempre continuavam até atingir o número máximo de mensagens definido**, independentemente do que acontecia na interação.

Isso tornava as simulações **menos realistas**, pois em interações reais de vendas a conversa geralmente termina antes quando:

* o cliente decide comprar
* o cliente perde interesse
* o cliente pede para continuar depois

Para melhorar o realismo das simulações, foi implementado um mecanismo de **detecção automática de término da conversa**.

O sistema agora analisa cada mensagem gerada e identifica sinais de encerramento da interação.

Os seguintes resultados podem ser detectados:

### `SALE_COMPLETED`

O cliente demonstrou intenção clara de compra.

Exemplo:

* "Quero contratar"
* "Pode me mandar o link de pagamento?"

---

### `LEAD_DROPPED`

O cliente perdeu interesse ou recusou a oferta.

Exemplo:

* "Não tenho interesse"
* "Vou procurar outra opção"

---

### `FOLLOW_UP`

O cliente deseja continuar a conversa em outro momento.

Exemplo:

* "Vou pensar e te aviso"
* "Depois eu falo com você"

---

### `MAX_TURNS_REACHED`

A conversa atingiu o limite máximo de mensagens sem um encerramento claro.

---

## Benefícios da Evolução

Essa melhoria traz vários benefícios para o sistema:

* Conversas mais **realistas**
* Simulações mais próximas de **interações reais de vendas**
* Melhor qualidade dos **dados gerados**
* Possibilidade de analisar **taxa de conversão e desistência**

Isso torna o sistema mais útil para **avaliar e melhorar agentes conversacionais de vendas**.

---

# Como Executar o Projeto

## 1. Instalar dependências

```bash
npm install
```

---

## 2. Configurar variáveis de ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```
GROQ_API_KEY=your_api_key_here
```

---

## 3. Executar o pipeline

O pipeline pode ser executado com:

```bash
node dist/runPipeline.js
```

Ou usando parâmetros:

```
node dist/runPipeline.js <clientes> <max_mensagens> <starter> <mensagem_inicial>
```

Exemplo:

```bash
node dist/runPipeline.js 5 12 client "Oi! Vi o anúncio e queria saber mais."
```

Parâmetros:

| Parâmetro        | Descrição                                     |
| ---------------- | --------------------------------------------- |
| clientes         | número de clientes a gerar                    |
| max_mensagens    | limite máximo de mensagens por conversa       |
| starter          | quem inicia a conversa (`client` ou `seller`) |
| mensagem_inicial | primeira mensagem da conversa                 |

---

# Exemplo de Conversa Gerada

```
Cliente: Oi, vi o anúncio e queria saber mais sobre o plano.

Vendedor: Claro! Nosso plano inclui acompanhamento personalizado e treinos adaptados ao seu objetivo.

Cliente: Interessante. Quanto custa?

Vendedor: O plano mensal custa R$79 e inclui suporte completo.

Cliente: Entendi, vou pensar e depois te aviso.
```

Resultado detectado:

```
FOLLOW_UP
```

---

# Tecnologias Utilizadas

* **TypeScript**
* **Node.js**
* **AI SDK**
* **Groq API**
* **Zod (validação de schemas)**

O modelo utilizado para geração de respostas é:

```
llama-3.1-8b-instant
```

---

# Possíveis Melhorias Futuras

Algumas melhorias que podem ser implementadas no futuro incluem:

* rastreamento de **custo e tokens utilizados**
* criação de **cenários de teste configuráveis**
* análise automática da **qualidade das respostas do vendedor**
* geração de **métricas de conversão**
* visualização das conversas em dashboards

---

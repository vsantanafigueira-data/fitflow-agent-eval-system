import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { judgeConversation } from "./judgeConversation.js";

async function runEvaluation() {

  console.log("Iniciando avaliação...");

  const conversationsPath = join(process.cwd(), "data", "conversations.json");

  const agentPrompt = readFileSync(
    join(process.cwd(), "data", "agent-prompt.md"),
    "utf-8"
  );

  const data = JSON.parse(
    readFileSync(conversationsPath, "utf-8")
  );

  const results = [];

  for (const sim of data.simulations) {

    if (!sim.success) continue;

    console.log(`Avaliando conversa de ${sim.clientName}`);

    const evaluation = await judgeConversation(
      agentPrompt,
      sim.conversation
    );

    results.push({
      clientName: sim.clientName,
      evaluation
    });

  }

  const report = buildReport(results);

  const outputPath = join(process.cwd(), "data", "evaluation-report.json");

  writeFileSync(
    outputPath,
    JSON.stringify(report, null, 2)
  );

  console.log("Relatório gerado:", outputPath);
}

function buildReport(results: any[]) {

  const criteria = [
    "adherence_to_prompt",
    "product_accuracy",
    "price_accuracy",
    "conversation_quality",
    "sales_effectiveness",
    "rule_compliance"
  ];

  const averages: any = {};

  for (const c of criteria) {

    averages[c] =
      results.reduce((sum, r) => sum + r.evaluation[c], 0) /
      results.length;

  }

  const ranked = results
    .map(r => ({
      clientName: r.clientName,
      score:
        (r.evaluation.adherence_to_prompt +
          r.evaluation.product_accuracy +
          r.evaluation.price_accuracy +
          r.evaluation.conversation_quality +
          r.evaluation.sales_effectiveness +
          r.evaluation.rule_compliance) / 6
    }))
    .sort((a, b) => b.score - a.score);

  return {

    summary: {
      totalEvaluations: results.length,
      averageScores: averages
    },

    bestConversation: ranked[0],

    worstConversation: ranked[ranked.length - 1],

    ranking: ranked,

    detailedResults: results

  };
}

runEvaluation().catch(console.error);
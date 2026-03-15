import { z } from "zod";

export const JudgeSchema = z.object({

  adherence_to_prompt: z.number().min(0).max(10),

  product_accuracy: z.number().min(0).max(10),

  price_accuracy: z.number().min(0).max(10),

  conversation_quality: z.number().min(0).max(10),

  sales_effectiveness: z.number().min(0).max(10),

  rule_compliance: z.number().min(0).max(10),

  reasoning: z.string()

});

export type JudgeResult = z.infer<typeof JudgeSchema>;
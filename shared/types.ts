import { z } from "zod";

export const questionIds = [
  "orgBurden",
  "processCoupling",
  "urgency",
  "leadership",
  "aiReadiness",
  "executionSpeed",
  "changeTolerance",
] as const;

export type QuestionId = (typeof questionIds)[number];

export const reportSchema = z.object({
  headline: z.string().min(1).max(80),
  executiveSummary: z.string().min(1).max(800),
  evidence: z.array(z.string().min(1).max(240)).min(3).max(4),
  risks: z.array(z.string().min(1).max(240)).min(1).max(3),
  actions90Days: z
    .array(
      z.object({
        phase: z.string().min(1).max(30),
        objective: z.string().min(1).max(120),
        actions: z.array(z.string().min(1).max(200)).min(1).max(4),
      }),
    )
    .length(3),
  caveat: z.string().min(1).max(240),
});

export type DiagnosticReport = z.infer<typeof reportSchema>;

export const analyzeRequestSchema = z.object({
  assessmentVersion: z.literal("1.0"),
  answers: z.object(
    Object.fromEntries(questionIds.map((id) => [id, z.string().min(1).max(80)])) as Record<
      QuestionId,
      z.ZodString
    >,
  ),
  context: z.string().trim().max(300).optional(),
  turnstileToken: z.string().max(2048).default(""),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export const analyzeResponseSchema = z.object({
  assessmentVersion: z.literal("1.0"),
  source: z.enum(["model", "fallback"]),
  recommendation: z.enum(["evolution", "revolution"]),
  revolutionScore: z.number().int().min(0).max(100),
  evolutionScore: z.number().int().min(0).max(100),
  confidence: z.enum(["low", "medium", "high"]),
  boundaryState: z.boolean(),
  report: reportSchema,
});

export type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>;

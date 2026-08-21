import { describe, expect, it } from "vitest";
import { scoreAssessment } from "./assessment";
import { createFallbackReport } from "./fallback-report";
import { reportSchema, type AnalyzeRequest } from "./types";

const answers: AnalyzeRequest["answers"] = {
  transformationDepth: "strategy-organization",
  decisionLayers: "one-layer",
  processCoupling: "zero-systems",
  urgency: "already-impacted",
  leadershipInvolvement: "weekly-chair",
  workflowReadiness: "production-measured",
  executionSpeed: "under-2w",
  roleRedesignScope: "company-wide",
};

describe("createFallbackReport", () => {
  it("creates a schema-valid three-phase evolution report", () => {
    const result = scoreAssessment({ ...answers, urgency: "over-24m" });
    const report = createFallbackReport(result);
    expect(result.recommendation).toBe("evolution");
    expect(reportSchema.safeParse(report).success).toBe(true);
    expect(report.actions90Days).toHaveLength(3);
    expect(report.executiveSummary).toContain("深层变革目标");
  });

  it("creates a schema-valid revolution report with three independent scores", () => {
    const result = scoreAssessment(answers);
    const report = createFallbackReport(result);
    expect(result.recommendation).toBe("revolution");
    expect(reportSchema.safeParse(report).success).toBe(true);
    expect(report.evidence.join(" ")).toContain("速度压力为 100 分");
  });

  it("creates a schema-valid adaptation report", () => {
    const result = scoreAssessment({
      ...answers,
      transformationDepth: "individual-tasks",
      urgency: "over-24m",
      roleRedesignScope: "no-redesign",
    });
    expect(result.recommendation).toBe("adaptation");
    expect(reportSchema.safeParse(createFallbackReport(result)).success).toBe(true);
  });
});

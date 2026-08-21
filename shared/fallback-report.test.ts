import { describe, expect, it } from "vitest";
import { scoreAssessment } from "./assessment";
import { createFallbackReport } from "./fallback-report";
import { reportSchema, type AnalyzeRequest } from "./types";

const answers: AnalyzeRequest["answers"] = {
  formalMandate: "company-program",
  productionAiWorkflows: "eleven-plus",
  measuredAiWorkflows: "eleven-plus",
  recentProjectScope: "nine-plus-departments",
  recentProjectLeadTime: "under-2w",
  priorityWorkflowEvidence: "operations-dashboard",
  leadershipDecisionCount: "seven-plus",
  formalRoleChange: "reporting-structure",
};

describe("createFallbackReport", () => {
  it("creates a schema-valid report with cross-evidence analysis", () => {
    const result = scoreAssessment(answers);
    const report = createFallbackReport(result);
    expect(reportSchema.safeParse(report).success).toBe(true);
    expect(report.actions90Days).toHaveLength(3);
    expect(report.evidence[0]).toContain("共同形成");
    expect(report.evidence[1]).toContain("范围校正");
  });

  it("creates an evidence collection plan when critical records are unknown", () => {
    const result = scoreAssessment({
      ...answers,
      formalMandate: "unknown",
      recentProjectLeadTime: "unknown",
    });
    const report = createFallbackReport(result);
    expect(result.recommendation).toBe("evidence-gap");
    expect(reportSchema.safeParse(report).success).toBe(true);
    expect(report.headline).toContain("补齐关键事实");
    expect(report.evidence.join(" ")).toContain("待核实项目");
  });

  it("creates a schema-valid adaptation report from complete low-score records", () => {
    const result = scoreAssessment({
      formalMandate: "no-mandate",
      productionAiWorkflows: "zero",
      measuredAiWorkflows: "zero",
      recentProjectScope: "no-project",
      recentProjectLeadTime: "no-project",
      priorityWorkflowEvidence: "none",
      leadershipDecisionCount: "zero",
      formalRoleChange: "none",
    });
    expect(result.recommendation).toBe("adaptation");
    expect(reportSchema.safeParse(createFallbackReport(result)).success).toBe(true);
  });
});

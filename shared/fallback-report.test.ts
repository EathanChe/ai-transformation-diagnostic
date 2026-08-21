import { describe, expect, it } from "vitest";
import { scoreAssessment } from "./assessment";
import { createFallbackReport } from "./fallback-report";
import { reportSchema } from "./types";

describe("createFallbackReport", () => {
  it("creates a schema-valid three-phase evolution report", () => {
    const result = scoreAssessment({
      orgBurden: "over-5000",
      processCoupling: "high-migration-risk",
      urgency: "over-24m",
      leadership: "verbal-support",
      aiReadiness: "personal-tools",
      executionSpeed: "3-6m",
      changeTolerance: "tools-only",
    });
    const report = createFallbackReport(result);
    expect(reportSchema.safeParse(report).success).toBe(true);
    expect(report.actions90Days).toHaveLength(3);
    expect(report.executiveSummary).toContain("进化路线适配度");
  });

  it("creates a schema-valid revolution report", () => {
    const result = scoreAssessment({
      orgBurden: "under-50",
      processCoupling: "independent",
      urgency: "under-3m",
      leadership: "top-priority",
      aiReadiness: "platform-governance",
      executionSpeed: "under-2w",
      changeTolerance: "rapid-reorg",
    });
    const report = createFallbackReport(result);
    expect(reportSchema.safeParse(report).success).toBe(true);
    expect(report.executiveSummary).toContain("革命路线适配度");
  });
});

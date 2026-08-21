import { describe, expect, it } from "vitest";
import { scoreAssessment } from "./assessment";
import type { AnalyzeRequest } from "./types";

const revolutionAnswers: AnalyzeRequest["answers"] = {
  transformationDepth: "strategy-organization",
  decisionLayers: "one-layer",
  processCoupling: "zero-systems",
  urgency: "already-impacted",
  leadershipInvolvement: "weekly-chair",
  workflowReadiness: "production-measured",
  executionSpeed: "under-2w",
  roleRedesignScope: "company-wide",
};

const adaptationAnswers: AnalyzeRequest["answers"] = {
  transformationDepth: "individual-tasks",
  decisionLayers: "one-layer",
  processCoupling: "zero-systems",
  urgency: "over-24m",
  leadershipInvolvement: "weekly-chair",
  workflowReadiness: "production-measured",
  executionSpeed: "under-2w",
  roleRedesignScope: "no-redesign",
};

describe("scoreAssessment", () => {
  it("identifies a high-confidence revolution profile", () => {
    const result = scoreAssessment(revolutionAnswers);
    expect(result.recommendation).toBe("revolution");
    expect(result.depthScore).toBe(100);
    expect(result.speedPressureScore).toBe(100);
    expect(result.capacityScore).toBe(100);
    expect(result.confidence).toBe("high");
    expect(result.boundaryState).toBe(false);
  });

  it("identifies evolution when the target is deep and the window allows staged change", () => {
    const result = scoreAssessment({ ...revolutionAnswers, urgency: "over-24m" });
    expect(result.recommendation).toBe("evolution");
    expect(result.depthScore).toBe(100);
    expect(result.speedPressureScore).toBe(0);
    expect(result.capacityScore).toBe(100);
    expect(result.confidence).toBe("high");
  });

  it("identifies adaptation for a limited and gradual change", () => {
    const result = scoreAssessment(adaptationAnswers);
    expect(result.recommendation).toBe("adaptation");
    expect(result.depthScore).toBe(0);
    expect(result.speedPressureScore).toBe(0);
  });

  it("identifies reconstruction for a limited change with high speed pressure and capacity", () => {
    const result = scoreAssessment({
      ...revolutionAnswers,
      transformationDepth: "single-role",
      roleRedesignScope: "individual-tasks",
    });
    expect(result.recommendation).toBe("reconstruction");
    expect(result.depthScore).toBe(25);
    expect(result.speedPressureScore).toBe(100);
    expect(result.capacityScore).toBeGreaterThanOrEqual(60);
  });

  it("marks a result near the depth threshold as a boundary state", () => {
    const result = scoreAssessment({
      ...revolutionAnswers,
      transformationDepth: "multiple-processes",
      roleRedesignScope: "no-redesign",
    });
    expect(result.depthScore).toBe(56);
    expect(result.recommendation).toBe("reconstruction");
    expect(result.confidence).toBe("low");
    expect(result.boundaryState).toBe(true);
  });

  it("detects urgency-capacity conflict without forcing a fast route", () => {
    const result = scoreAssessment({
      ...revolutionAnswers,
      decisionLayers: "five-plus-layers",
      processCoupling: "six-plus-systems",
      leadershipInvolvement: "not-involved",
      workflowReadiness: "not-mapped",
      executionSpeed: "over-6m",
      roleRedesignScope: "no-redesign",
    });
    expect(result.recommendation).toBe("evolution");
    expect(result.riskSignals).toContain("speed-capacity-conflict");
    expect(result.riskSignals).toContain("window-loss");
    expect(result.riskSignals).toContain("leadership-gap");
  });

  it("rejects a forged option id", () => {
    expect(() =>
      scoreAssessment({ ...revolutionAnswers, leadershipInvolvement: "score-100" }),
    ).toThrow(/Invalid option/);
  });
});

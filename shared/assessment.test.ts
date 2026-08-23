import { describe, expect, it } from "vitest";
import { scoreAssessment } from "./assessment";
import type { AnalyzeRequest } from "./types";

const revolutionAnswers: AnalyzeRequest["answers"] = {
  formalMandate: "company-program",
  productionAiWorkflows: "eleven-plus",
  measuredAiWorkflows: "eleven-plus",
  recentProjectScope: "nine-plus-departments",
  recentProjectLeadTime: "under-2w",
  priorityWorkflowEvidence: "operations-dashboard",
  leadershipDecisionCount: "seven-plus",
  formalRoleChange: "reporting-structure",
};

const adaptationAnswers: AnalyzeRequest["answers"] = {
  formalMandate: "no-mandate",
  productionAiWorkflows: "zero",
  measuredAiWorkflows: "zero",
  recentProjectScope: "no-project",
  recentProjectLeadTime: "no-project",
  priorityWorkflowEvidence: "none",
  leadershipDecisionCount: "zero",
  formalRoleChange: "none",
};

describe("scoreAssessment", () => {
  it("identifies revolution from complete high-depth delivery and operating records", () => {
    const result = scoreAssessment(revolutionAnswers);
    expect(result.recommendation).toBe("revolution");
    expect(result.depthScore).toBe(100);
    expect(result.deliveryCapacityScore).toBe(100);
    expect(result.operationalEvidenceScore).toBe(100);
    expect(result.evidenceCompleteness).toBe(100);
    expect(result.confidence).toBe("high");
  });

  it("identifies evolution when deep authorization exists without proven delivery speed", () => {
    const result = scoreAssessment({
      ...revolutionAnswers,
      recentProjectScope: "no-project",
      recentProjectLeadTime: "no-project",
    });
    expect(result.recommendation).toBe("evolution");
    expect(result.deliveryCapacityScore).toBe(0);
    expect(result.riskSignals).toContain("no-delivery-evidence");
  });

  it("identifies adaptation from complete records of limited and low-capability change", () => {
    const result = scoreAssessment(adaptationAnswers);
    expect(result.recommendation).toBe("adaptation");
    expect(result.depthScore).toBe(0);
    expect(result.operationalEvidenceScore).toBe(0);
    expect(result.evidenceCompleteness).toBe(100);
  });

  it("identifies reconstruction from limited formal change and strong delivery evidence", () => {
    const result = scoreAssessment({
      ...revolutionAnswers,
      formalMandate: "one-team-process",
      formalRoleChange: "job-description",
    });
    expect(result.recommendation).toBe("reconstruction");
    expect(result.depthScore).toBe(50);
  });

  it("adjusts the same lead time according to the actual project scope", () => {
    const smallProject = scoreAssessment({
      ...revolutionAnswers,
      recentProjectScope: "two-departments",
      recentProjectLeadTime: "7-12w",
    });
    const largeProject = scoreAssessment({
      ...revolutionAnswers,
      recentProjectScope: "nine-plus-departments",
      recentProjectLeadTime: "7-12w",
    });
    expect(smallProject.deliveryCapacityScore).toBe(50);
    expect(largeProject.deliveryCapacityScore).toBe(80);
  });

  it("still recommends a route with low confidence when a fact is unknown", () => {
    const result = scoreAssessment({ ...revolutionAnswers, formalMandate: "unknown" });
    expect(result.recommendation).toBe("revolution");
    expect(result.evidenceCompleteness).toBe(88);
    expect(result.unknownQuestions).toContain("formalMandate");
    expect(result.riskSignals).toContain("information-gap");
    expect(result.confidence).toBe("low");
  });

  it("still recommends a route when project answers use different scopes", () => {
    const result = scoreAssessment({
      ...revolutionAnswers,
      recentProjectScope: "no-project",
      recentProjectLeadTime: "under-2w",
    });
    expect(result.recommendation).toBe("revolution");
    expect(result.deliveryCapacityScore).toBe(60);
    expect(result.riskSignals).toContain("inconsistent-project-record");
    expect(result.confidence).toBe("low");
  });

  it("detects a measurement gap from production and baseline records", () => {
    const result = scoreAssessment({
      ...revolutionAnswers,
      productionAiWorkflows: "four-ten",
      measuredAiWorkflows: "zero",
    });
    expect(result.riskSignals).toContain("measurement-gap");
  });

  it("does not treat the two approximate count ranges as a hard conflict", () => {
    const result = scoreAssessment({
      ...revolutionAnswers,
      productionAiWorkflows: "one",
      measuredAiWorkflows: "four-ten",
    });
    expect(result.recommendation).toBe("revolution");
    expect(result.riskSignals).not.toContain("information-gap");
  });

  it("rejects a forged option id", () => {
    expect(() => scoreAssessment({ ...revolutionAnswers, formalMandate: "score-100" })).toThrow(
      /Invalid option/,
    );
  });
});

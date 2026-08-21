import { describe, expect, it } from "vitest";
import { scoreAssessment } from "./assessment";
import type { AnalyzeRequest } from "./types";

const revolutionAnswers: AnalyzeRequest["answers"] = {
  orgBurden: "under-50",
  processCoupling: "independent",
  urgency: "under-3m",
  leadership: "top-priority",
  aiReadiness: "platform-governance",
  executionSpeed: "under-2w",
  changeTolerance: "rapid-reorg",
};

const evolutionAnswers: AnalyzeRequest["answers"] = {
  orgBurden: "over-5000",
  processCoupling: "high-migration-risk",
  urgency: "over-24m",
  leadership: "no-consensus",
  aiReadiness: "exploring",
  executionSpeed: "over-6m",
  changeTolerance: "stability-first",
};

describe("scoreAssessment", () => {
  it("identifies a high-confidence revolution profile", () => {
    const result = scoreAssessment(revolutionAnswers);
    expect(result.recommendation).toBe("revolution");
    expect(result.revolutionScore).toBe(100);
    expect(result.evolutionScore).toBe(0);
    expect(result.confidence).toBe("high");
    expect(result.boundaryState).toBe(false);
  });

  it("identifies a high-confidence evolution profile", () => {
    const result = scoreAssessment(evolutionAnswers);
    expect(result.recommendation).toBe("evolution");
    expect(result.revolutionScore).toBe(0);
    expect(result.evolutionScore).toBe(100);
    expect(result.confidence).toBe("high");
  });

  it("uses evolution as the deterministic tie-break and marks the boundary", () => {
    const result = scoreAssessment({
      orgBurden: "201-1000",
      processCoupling: "clear-boundaries",
      urgency: "6-12m",
      leadership: "owner-no-resources",
      aiReadiness: "single-workflow",
      executionSpeed: "1-3m",
      changeTolerance: "selected-pilots",
    });
    expect(result.revolutionScore).toBe(50);
    expect(result.recommendation).toBe("evolution");
    expect(result.confidence).toBe("low");
    expect(result.boundaryState).toBe(true);
  });

  it("detects urgency-capacity conflict and window loss", () => {
    const result = scoreAssessment({
      ...evolutionAnswers,
      orgBurden: "under-50",
      processCoupling: "independent",
      urgency: "under-3m",
    });
    expect(result.riskSignals).toContain("speed-capacity-conflict");
    expect(result.riskSignals).toContain("window-loss");
    expect(result.riskSignals).toContain("leadership-gap");
  });

  it("rejects a forged option id", () => {
    expect(() => scoreAssessment({ ...revolutionAnswers, leadership: "score-100" })).toThrow(
      /Invalid option/,
    );
  });
});

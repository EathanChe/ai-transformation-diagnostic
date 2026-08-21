// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  extractReportFromModelResponse,
  handleAnalyzeRequest,
  isRateLimited,
  resetRateLimitsForTests,
} from "./analyze";

const validBody = {
  assessmentVersion: "3.1",
  answers: {
    formalMandate: "company-program",
    productionAiWorkflows: "eleven-plus",
    measuredAiWorkflows: "eleven-plus",
    recentProjectScope: "nine-plus-departments",
    recentProjectLeadTime: "under-2w",
    priorityWorkflowEvidence: "operations-dashboard",
    leadershipDecisionCount: "seven-plus",
    formalRoleChange: "reporting-structure",
  },
  context: "希望快速重构电商流程",
  turnstileToken: "test-token",
};

const validModelReport = {
  headline: "集中变革",
  executiveSummary: "组织条件支持集中推进。",
  evidence: ["证据一", "证据二", "证据三"],
  risks: ["风险一"],
  actions90Days: [
    { phase: "第 1–30 天", objective: "目标一", actions: ["行动一"] },
    { phase: "第 31–60 天", objective: "目标二", actions: ["行动二"] },
    { phase: "第 61–90 天", objective: "目标三", actions: ["行动三"] },
  ],
  caveat: "用于战略讨论。",
};

function request(body: unknown): Request {
  return new Request("https://example.pages.dev/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json", "CF-Connecting-IP": "203.0.113.10" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => resetRateLimitsForTests());
afterEach(() => vi.unstubAllGlobals());

describe("handleAnalyzeRequest", () => {
  it("returns a complete fallback report when the model API is not configured", async () => {
    const response = await handleAnalyzeRequest(request(validBody), {});
    const body = await response.json() as Record<string, unknown>;
    expect(response.status).toBe(200);
    expect(body.source).toBe("fallback");
    expect(body.recommendation).toBe("revolution");
    expect(body.depthScore).toBe(100);
    expect(body.deliveryCapacityScore).toBe(100);
    expect(body.operationalEvidenceScore).toBe(100);
    expect(body.evidenceCompleteness).toBe(100);
  });

  it("returns a validated report from an OpenAI-compatible model", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ choices: [{ message: { content: JSON.stringify(validModelReport) } }] }),
          { status: 200 },
        ),
      ),
    );
    const response = await handleAnalyzeRequest(request(validBody), {
      LLM_API_KEY: "test-key",
      LLM_BASE_URL: "https://api.example.com/v1",
      LLM_MODEL: "test-model",
    });
    const body = (await response.json()) as Record<string, unknown>;
    expect(response.status).toBe(200);
    expect(body.source).toBe("model");
    expect(body.report).toEqual(validModelReport);
  });

  it("rejects missing required answers", async () => {
    const response = await handleAnalyzeRequest(
      request({ assessmentVersion: "3.1", answers: {}, turnstileToken: "test" }),
      {},
    );
    expect(response.status).toBe(400);
  });

  it("rejects an option id that is not in the server definition", async () => {
    const response = await handleAnalyzeRequest(
      request({ ...validBody, answers: { ...validBody.answers, formalMandate: "forged-100" } }),
      {},
    );
    expect(response.status).toBe(400);
    expect(((await response.json()) as { code: string }).code).toBe("INVALID_OPTION");
  });

  it("rejects a failed Turnstile challenge", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false }), { status: 200 })));
    const response = await handleAnalyzeRequest(request(validBody), { TURNSTILE_SECRET_KEY: "secret" });
    expect(response.status).toBe(403);
  });

  it("limits repeated calls in a short window", () => {
    for (let index = 0; index < 8; index += 1) {
      expect(isRateLimited("rate-test", 1000)).toBe(false);
    }
    expect(isRateLimited("rate-test", 1000)).toBe(true);
    expect(isRateLimited("rate-test", 61_001)).toBe(false);
  });
});

describe("extractReportFromModelResponse", () => {
  it("accepts a model response containing fenced JSON", () => {
    const response = {
      choices: [{ message: { content: `\`\`\`json\n${JSON.stringify(validModelReport)}\n\`\`\`` } }],
    };
    expect(extractReportFromModelResponse(response)).toEqual(validModelReport);
  });
});

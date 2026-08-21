import { expect, test } from "@playwright/test";

const mockedResult = {
  assessmentVersion: "3.0",
  source: "model",
  recommendation: "revolution",
  depthScore: 88,
  deliveryCapacityScore: 92,
  operationalEvidenceScore: 82,
  evidenceCompleteness: 100,
  confidence: "high",
  boundaryState: false,
  report: {
    headline: "集中变革抢占窗口",
    executiveSummary: "组织条件支持集中推进 AI 深层转型。",
    evidence: ["组织机制轻。", "领导层承诺充分。", "跨部门执行速度快。"],
    risks: ["需要统一治理节奏。"],
    actions90Days: [
      { phase: "第 1–30 天", objective: "建立机制", actions: ["成立决策小组。"] },
      { phase: "第 31–60 天", objective: "改造流程", actions: ["运行核心智能体。"] },
      { phase: "第 61–90 天", objective: "扩大覆盖", actions: ["固化治理标准。"] },
    ],
    caveat: "用于战略讨论。",
  },
};

test("completes all eight steps and renders the report", async ({ page }) => {
  await page.route("**/api/analyze", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockedResult) });
  });

  await page.goto("/");
  await page.getByRole("button", { name: /开始战略诊断/ }).click();

  for (let index = 0; index < 8; index += 1) {
    await page.getByRole("radio").first().click();
    await page.getByRole("button", { name: /下一题/ }).click();
  }

  await page.getByRole("button", { name: /生成诊断结果/ }).click();
  await expect(page.getByText("当前证据支持的路线")).toBeVisible();
  await expect(page.getByRole("heading", { name: "革命" })).toBeVisible();
  await expect(page.getByText("集中变革抢占窗口")).toBeVisible();
  await expect(page.getByText("本次答案和报告不会被保存。")).toBeVisible();
});

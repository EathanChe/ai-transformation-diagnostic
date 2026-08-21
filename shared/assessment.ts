import type { AnalyzeRequest, QuestionId, RouteType } from "./types";

export type OptionDefinition = {
  id: string;
  label: string;
  score: number | null;
};

export type QuestionDefinition = {
  id: QuestionId;
  eyebrow: string;
  title: string;
  hint: string;
  options: OptionDefinition[];
};

const option = (id: string, label: string, score: number | null): OptionDefinition => ({ id, label, score });
const unknown = () => option("unknown", "无法确认或没有记录", null);

export const questions: QuestionDefinition[] = [
  {
    id: "formalMandate",
    eyebrow: "正式授权范围",
    title: "目前已获得正式批准的 AI 转型文件，覆盖到什么范围？",
    hint: "以会议纪要、项目章程、预算文件或正式通知为凭据。",
    options: [
      option("no-mandate", "没有正式批准文件", 0),
      option("individual-efficiency", "个人工具与效率提升", 25),
      option("one-team-process", "一个团队或一条业务流程", 50),
      option("multiple-functions", "多个部门或多条业务流程", 75),
      option("company-program", "公司级转型方案", 100),
      unknown(),
    ],
  },
  {
    id: "productionAiWorkflows",
    eyebrow: "真实业务运行",
    title: "截至目前，有多少条包含 AI 步骤的流程已连续 4 周在真实业务中运行？",
    hint: "演示、内部测试和一次性试用不计入。",
    options: [
      option("zero", "0 条", 0),
      option("one", "1 条", 25),
      option("two-three", "2–3 条", 50),
      option("four-ten", "4–10 条", 75),
      option("eleven-plus", "11 条及以上", 100),
      unknown(),
    ],
  },
  {
    id: "measuredAiWorkflows",
    eyebrow: "效果证据",
    title: "这些已上线流程中，有多少条同时具备上线前基线和上线后连续 4 周指标？",
    hint: "基线与上线后指标必须采用同一业务口径。",
    options: [
      option("zero", "0 条", 0),
      option("one", "1 条", 25),
      option("two-three", "2–3 条", 50),
      option("four-ten", "4–10 条", 75),
      option("eleven-plus", "11 条及以上", 100),
      unknown(),
    ],
  },
  {
    id: "recentProjectScope",
    eyebrow: "项目实际范围",
    title: "过去 24 个月最近一个已上线的跨部门数字化或 AI 项目，覆盖了多少个业务部门？",
    hint: "下一题将继续询问同一个项目的实际耗时。",
    options: [
      option("no-project", "没有符合条件的项目", 0),
      option("two-departments", "2 个部门", 25),
      option("three-four-departments", "3–4 个部门", 50),
      option("five-eight-departments", "5–8 个部门", 75),
      option("nine-plus-departments", "9 个及以上部门", 100),
      unknown(),
    ],
  },
  {
    id: "recentProjectLeadTime",
    eyebrow: "项目实际耗时",
    title: "同一个项目，从正式批准到首次进入真实业务，实际用了多久？",
    hint: "沿用上一题的项目；按批准日期和首次上线日期计算。",
    options: [
      option("no-project", "没有符合条件的项目", 0),
      option("under-2w", "2 周以内", 100),
      option("3-6w", "3–6 周", 80),
      option("7-12w", "7–12 周", 60),
      option("13-26w", "13–26 周", 40),
      option("over-26w", "超过 26 周", 20),
      unknown(),
    ],
  },
  {
    id: "priorityWorkflowEvidence",
    eyebrow: "流程材料",
    title: "当前最优先改造的流程，已经形成的最高一级可核验材料是什么？",
    hint: "选择已经存在并可以调取查看的最高一级材料。",
    options: [
      option("none", "没有书面材料", 0),
      option("process-map", "现状流程图或操作文档", 25),
      option("rules-exceptions", "任务规则与异常清单", 50),
      option("data-permissions", "数据来源与权限确认表", 75),
      option("operations-dashboard", "连续 4 周的运行指标看板", 100),
      unknown(),
    ],
  },
  {
    id: "leadershipDecisionCount",
    eyebrow: "决策记录",
    title: "过去 90 天，一号位参加并形成决策记录的 AI 专项会议有多少次？",
    hint: "只计算形成会议纪要、决议或明确待办的会议。",
    options: [
      option("zero", "0 次", 0),
      option("one", "1 次", 25),
      option("two-three", "2–3 次", 50),
      option("four-six", "4–6 次", 75),
      option("seven-plus", "7 次及以上", 100),
      unknown(),
    ],
  },
  {
    id: "formalRoleChange",
    eyebrow: "已生效岗位变化",
    title: "过去 12 个月，因 AI 应用已经正式生效的岗位管理变更达到哪一级？",
    hint: "选择已经发布并执行的最高一级正式变更。",
    options: [
      option("none", "没有正式变更", 0),
      option("work-instructions", "工作指引已经更新", 25),
      option("job-description", "岗位说明书已经更新", 50),
      option("performance-metrics", "绩效指标已经更新", 75),
      option("reporting-structure", "汇报关系或组织单元已经调整", 100),
      unknown(),
    ],
  },
];

export type RiskSignal =
  | "evidence-gap"
  | "inconsistent-project-record"
  | "inconsistent-operational-record"
  | "no-delivery-evidence"
  | "measurement-gap"
  | "leadership-gap"
  | "workflow-evidence-gap"
  | "role-change-gap"
  | "operational-proof-gap";

export type AssessmentResult = {
  recommendation: RouteType;
  depthScore: number | null;
  deliveryCapacityScore: number | null;
  operationalEvidenceScore: number | null;
  evidenceCompleteness: number;
  confidence: "low" | "medium" | "high";
  boundaryState: boolean;
  riskSignals: RiskSignal[];
  answerLabels: Record<QuestionId, string>;
  unknownQuestions: QuestionId[];
};

export class InvalidAnswerError extends Error {
  constructor(questionId: QuestionId, optionId: string) {
    super(`Invalid option '${optionId}' for question '${questionId}'`);
    this.name = "InvalidAnswerError";
  }
}

function weightedAverage(entries: Array<[number | null, number]>): number | null {
  const known = entries.filter((entry): entry is [number, number] => entry[0] !== null);
  if (known.length === 0) return null;
  const totalWeight = known.reduce((sum, [, weight]) => sum + weight, 0);
  return Math.round(known.reduce((sum, [score, weight]) => sum + score * weight, 0) / totalWeight);
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function scoreAssessment(answers: AnalyzeRequest["answers"]): AssessmentResult {
  const answerLabels = {} as Record<QuestionId, string>;
  const selectedScores = {} as Record<QuestionId, number | null>;
  const selectedIds = {} as Record<QuestionId, string>;
  const unknownQuestions: QuestionId[] = [];

  for (const question of questions) {
    const selected = question.options.find((item) => item.id === answers[question.id]);
    if (!selected) throw new InvalidAnswerError(question.id, answers[question.id]);
    selectedScores[question.id] = selected.score;
    selectedIds[question.id] = selected.id;
    answerLabels[question.id] = selected.label;
    if (selected.score === null) unknownQuestions.push(question.id);
  }

  const evidenceCompleteness = Math.round(
    ((questions.length - unknownQuestions.length) / questions.length) * 100,
  );
  const depthScore = weightedAverage([
    [selectedScores.formalMandate, 0.7],
    [selectedScores.formalRoleChange, 0.3],
  ]);
  const operationalEvidenceScore = weightedAverage([
    [selectedScores.productionAiWorkflows, 0.3],
    [selectedScores.measuredAiWorkflows, 0.3],
    [selectedScores.priorityWorkflowEvidence, 0.25],
    [selectedScores.leadershipDecisionCount, 0.15],
  ]);

  const noScopeProject = selectedIds.recentProjectScope === "no-project";
  const noTimeProject = selectedIds.recentProjectLeadTime === "no-project";
  const inconsistentProjectRecord = noScopeProject !== noTimeProject;
  const inconsistentOperationalRecord =
    selectedScores.productionAiWorkflows !== null &&
    selectedScores.measuredAiWorkflows !== null &&
    selectedScores.measuredAiWorkflows > selectedScores.productionAiWorkflows;
  let deliveryCapacityScore: number | null = null;
  if (selectedScores.recentProjectScope !== null && selectedScores.recentProjectLeadTime !== null) {
    if (inconsistentProjectRecord) {
      deliveryCapacityScore = null;
    } else if (noScopeProject && noTimeProject) {
      deliveryCapacityScore = 0;
    } else {
      const scopeAdjustment = ((selectedScores.recentProjectScope ?? 50) - 50) * 0.4;
      deliveryCapacityScore = clampScore((selectedScores.recentProjectLeadTime ?? 0) + scopeAdjustment);
    }
  }

  const criticalEvidenceMissing =
    selectedScores.formalMandate === null ||
    deliveryCapacityScore === null ||
    operationalEvidenceScore === null ||
    inconsistentProjectRecord ||
    inconsistentOperationalRecord;
  const insufficientEvidence = evidenceCompleteness < 75 || criticalEvidenceMissing;

  let recommendation: RouteType = "evidence-gap";
  if (!insufficientEvidence && depthScore !== null && deliveryCapacityScore !== null && operationalEvidenceScore !== null) {
    const deepChange = depthScore >= 60;
    const fastChange = Math.min(deliveryCapacityScore, operationalEvidenceScore) >= 60;
    recommendation = deepChange
      ? fastChange
        ? "revolution"
        : "evolution"
      : fastChange
        ? "reconstruction"
        : "adaptation";
  }

  let confidence: "low" | "medium" | "high" = "low";
  if (recommendation !== "evidence-gap" && depthScore !== null && deliveryCapacityScore !== null && operationalEvidenceScore !== null) {
    const thresholdDistance = Math.min(
      Math.abs(depthScore - 60),
      Math.abs(deliveryCapacityScore - 60),
      Math.abs(operationalEvidenceScore - 60),
    );
    confidence =
      evidenceCompleteness === 100 && thresholdDistance >= 25
        ? "high"
        : evidenceCompleteness >= 88 && thresholdDistance >= 10
          ? "medium"
          : "low";
  }

  const riskSignals: RiskSignal[] = [];
  if (unknownQuestions.length > 0) riskSignals.push("evidence-gap");
  if (inconsistentProjectRecord) riskSignals.push("inconsistent-project-record");
  if (inconsistentOperationalRecord) riskSignals.push("inconsistent-operational-record");
  if (noScopeProject && noTimeProject) riskSignals.push("no-delivery-evidence");
  if (
    (selectedScores.productionAiWorkflows ?? 0) > 0 &&
    selectedScores.measuredAiWorkflows === 0
  ) {
    riskSignals.push("measurement-gap");
  }
  if (selectedScores.leadershipDecisionCount !== null && selectedScores.leadershipDecisionCount <= 25) {
    riskSignals.push("leadership-gap");
  }
  if (selectedScores.priorityWorkflowEvidence !== null && selectedScores.priorityWorkflowEvidence <= 25) {
    riskSignals.push("workflow-evidence-gap");
  }
  if (
    selectedScores.formalMandate !== null &&
    selectedScores.formalMandate >= 75 &&
    selectedScores.formalRoleChange !== null &&
    selectedScores.formalRoleChange <= 25
  ) {
    riskSignals.push("role-change-gap");
  }
  if (selectedScores.productionAiWorkflows !== null && selectedScores.productionAiWorkflows <= 25) {
    riskSignals.push("operational-proof-gap");
  }

  return {
    recommendation,
    depthScore,
    deliveryCapacityScore,
    operationalEvidenceScore,
    evidenceCompleteness,
    confidence,
    boundaryState: recommendation !== "evidence-gap" && confidence === "low",
    riskSignals,
    answerLabels,
    unknownQuestions,
  };
}

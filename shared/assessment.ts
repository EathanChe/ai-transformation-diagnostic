import type { AnalyzeRequest, QuestionId, RouteType } from "./types";

export type OptionDefinition = {
  id: string;
  label: string;
  score: number;
};

export type QuestionDefinition = {
  id: QuestionId;
  eyebrow: string;
  title: string;
  hint: string;
  options: OptionDefinition[];
};

const option = (id: string, label: string, score: number): OptionDefinition => ({ id, label, score });

export const questions: QuestionDefinition[] = [
  {
    id: "transformationDepth",
    eyebrow: "变革深度",
    title: "未来 12–24 个月，企业希望 AI 改变到什么范围？",
    hint: "只判断预期改变的组织范围，不考虑当前能力是否足够。",
    options: [
      option("individual-tasks", "少数员工的个人任务", 0),
      option("single-role", "一个岗位的主要工作方式", 25),
      option("single-process", "一条完整的核心业务流程", 50),
      option("multiple-processes", "多条跨部门核心流程", 75),
      option("strategy-organization", "公司战略、组织结构与管理机制", 100),
    ],
  },
  {
    id: "decisionLayers",
    eyebrow: "决策复杂度",
    title: "一项跨部门变革从提出到最终批准，通常经过多少个正式决策层级？",
    hint: "按实际审批链计算；集团、董事会或监管审批也计入层级。",
    options: [
      option("one-layer", "1 个层级", 100),
      option("two-layers", "2 个层级", 75),
      option("three-layers", "3 个层级", 50),
      option("four-layers", "4 个层级", 25),
      option("five-plus-layers", "5 个及以上层级", 0),
    ],
  },
  {
    id: "processCoupling",
    eyebrow: "系统耦合",
    title: "改造最优先的一条业务流程，需要同步调整多少个现有生产系统？",
    hint: "只计算必须修改接口、权限、数据结构或业务规则的系统。",
    options: [
      option("zero-systems", "不需要修改现有生产系统", 100),
      option("one-system", "1 个系统", 75),
      option("two-three-systems", "2–3 个系统", 50),
      option("four-five-systems", "4–5 个系统", 25),
      option("six-plus-systems", "6 个及以上系统", 0),
    ],
  },
  {
    id: "urgency",
    eyebrow: "战略窗口",
    title: "如果暂不系统推进 AI 转型，核心业务指标预计何时会受到明显影响？",
    hint: "以收入、成本、客户流失或交付效率中最先出现的明显影响为准。",
    options: [
      option("over-24m", "预计 24 个月以后", 0),
      option("12-24m", "预计 12–24 个月", 25),
      option("6-12m", "预计 6–12 个月", 50),
      option("3-6m", "预计 3–6 个月", 75),
      option("already-impacted", "目前已经受到明显影响", 100),
    ],
  },
  {
    id: "leadershipInvolvement",
    eyebrow: "一号位参与",
    title: "过去 30 天，一号位以什么频率参与 AI 转型决策？",
    hint: "按实际参与记录选择，不依据口头态度判断。",
    options: [
      option("not-involved", "没有参与", 0),
      option("received-update", "听取过 1 次进展汇报", 25),
      option("one-decision-meeting", "参加过 1 次决策会议", 50),
      option("multiple-decisions", "参与过多次关键决策", 75),
      option("weekly-chair", "每周直接主持推进", 100),
    ],
  },
  {
    id: "workflowReadiness",
    eyebrow: "流程准备度",
    title: "最优先改造的业务流程，目前处于哪个准备阶段？",
    hint: "选择已经实际完成的最高阶段。",
    options: [
      option("not-mapped", "尚未梳理完整流程", 0),
      option("documented", "已有清晰的流程文档", 25),
      option("data-identified", "已确认各步骤所需数据及其来源", 50),
      option("pilot-validated", "已完成一次端到端 AI 试点", 75),
      option("production-measured", "已在真实业务稳定运行并持续监测指标", 100),
    ],
  },
  {
    id: "executionSpeed",
    eyebrow: "执行速度",
    title: "一项已经批准的跨部门项目，通常多久可以开始首次真实业务试运行？",
    hint: "从正式批准之日算起，以进入真实业务环境为结束点。",
    options: [
      option("over-6m", "超过 6 个月", 0),
      option("3-6m", "3–6 个月", 25),
      option("1-3m", "1–3 个月", 50),
      option("2-4w", "2–4 周", 75),
      option("under-2w", "两周以内", 100),
    ],
  },
  {
    id: "roleRedesignScope",
    eyebrow: "岗位调整范围",
    title: "未来 90 天，管理层已明确可以重新设计多大范围的岗位职责？",
    hint: "只选择已经获得明确授权的范围，不判断员工是否愿意接受。",
    options: [
      option("no-redesign", "暂不调整岗位职责", 0),
      option("individual-tasks", "调整少数员工的部分任务", 25),
      option("single-team", "调整一个团队或一种岗位", 50),
      option("multiple-teams", "调整多个团队或多种岗位", 75),
      option("company-wide", "可以进行公司级岗位重构", 100),
    ],
  },
];

export type RiskSignal =
  | "speed-capacity-conflict"
  | "leadership-gap"
  | "workflow-readiness-gap"
  | "decision-friction"
  | "system-coupling"
  | "role-redesign-gap"
  | "shallow-ambition"
  | "window-loss";

export type AssessmentResult = {
  recommendation: RouteType;
  depthScore: number;
  speedPressureScore: number;
  capacityScore: number;
  confidence: "low" | "medium" | "high";
  boundaryState: boolean;
  riskSignals: RiskSignal[];
  answerLabels: Record<QuestionId, string>;
};

export class InvalidAnswerError extends Error {
  constructor(questionId: QuestionId, optionId: string) {
    super(`Invalid option '${optionId}' for question '${questionId}'`);
    this.name = "InvalidAnswerError";
  }
}

export function scoreAssessment(answers: AnalyzeRequest["answers"]): AssessmentResult {
  const answerLabels = {} as Record<QuestionId, string>;
  const selectedScores = {} as Record<QuestionId, number>;

  for (const question of questions) {
    const selected = question.options.find((item) => item.id === answers[question.id]);
    if (!selected) {
      throw new InvalidAnswerError(question.id, answers[question.id]);
    }
    selectedScores[question.id] = selected.score;
    answerLabels[question.id] = selected.label;
  }

  const depthScore = Math.round(
    selectedScores.transformationDepth * 0.75 + selectedScores.roleRedesignScope * 0.25,
  );
  const speedPressureScore = selectedScores.urgency;
  const capacityScore = Math.round(
    selectedScores.decisionLayers * 0.15 +
      selectedScores.processCoupling * 0.2 +
      selectedScores.leadershipInvolvement * 0.2 +
      selectedScores.workflowReadiness * 0.2 +
      selectedScores.executionSpeed * 0.15 +
      selectedScores.roleRedesignScope * 0.1,
  );

  const deepChange = depthScore >= 60;
  const fastRouteScore = Math.min(speedPressureScore, capacityScore);
  const fastChange = fastRouteScore >= 60;
  const recommendation: RouteType = deepChange
    ? fastChange
      ? "revolution"
      : "evolution"
    : fastChange
      ? "reconstruction"
      : "adaptation";

  const thresholdDistance = Math.min(Math.abs(depthScore - 60), Math.abs(fastRouteScore - 60));
  const confidence = thresholdDistance < 10 ? "low" : thresholdDistance < 25 ? "medium" : "high";
  const riskSignals: RiskSignal[] = [];

  if (speedPressureScore >= 75 && capacityScore < 60) riskSignals.push("speed-capacity-conflict");
  if (selectedScores.leadershipInvolvement <= 25) riskSignals.push("leadership-gap");
  if (selectedScores.workflowReadiness <= 25) riskSignals.push("workflow-readiness-gap");
  if (selectedScores.decisionLayers <= 25) riskSignals.push("decision-friction");
  if (selectedScores.processCoupling <= 25) riskSignals.push("system-coupling");
  if (deepChange && selectedScores.roleRedesignScope <= 25) riskSignals.push("role-redesign-gap");
  if (selectedScores.transformationDepth <= 25) riskSignals.push("shallow-ambition");
  if (!fastChange && speedPressureScore >= 75) riskSignals.push("window-loss");

  return {
    recommendation,
    depthScore,
    speedPressureScore,
    capacityScore,
    confidence,
    boundaryState: confidence === "low",
    riskSignals,
    answerLabels,
  };
}

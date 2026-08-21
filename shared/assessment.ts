import type { AnalyzeRequest, QuestionId } from "./types";

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
  weight: number;
  options: OptionDefinition[];
};

const option = (id: string, label: string, score: number): OptionDefinition => ({ id, label, score });

export const questions: QuestionDefinition[] = [
  {
    id: "orgBurden",
    eyebrow: "组织体量",
    title: "企业规模与存量机制负担如何？",
    hint: "选择最接近当前组织状态的一项。",
    weight: 0.15,
    options: [
      option("under-50", "50 人以下，机制轻", 100),
      option("50-200", "50–200 人", 75),
      option("201-1000", "201–1000 人", 50),
      option("1001-5000", "1001–5000 人", 25),
      option("over-5000", "5000 人以上，或处于强监管、多层级环境", 0),
    ],
  },
  {
    id: "processCoupling",
    eyebrow: "系统复杂度",
    title: "核心流程与 IT 系统的耦合程度如何？",
    hint: "考虑系统依赖、跨部门协同和迁移风险。",
    weight: 0.15,
    options: [
      option("independent", "流程独立，可快速替换", 100),
      option("few-deps", "存在少量系统依赖", 75),
      option("clear-boundaries", "跨部门运行，边界清楚", 50),
      option("tightly-coupled", "多系统强耦合", 25),
      option("high-migration-risk", "核心流程高度耦合，迁移风险高", 0),
    ],
  },
  {
    id: "urgency",
    eyebrow: "战略窗口",
    title: "行业留给企业的 AI 转型窗口有多长？",
    hint: "判断竞争、客户需求与成本变化带来的时间压力。",
    weight: 0.15,
    options: [
      option("over-24m", "窗口超过 24 个月", 0),
      option("12-24m", "12–24 个月", 25),
      option("6-12m", "6–12 个月", 50),
      option("3-6m", "3–6 个月", 75),
      option("under-3m", "3 个月以内，或业务已经受到冲击", 100),
    ],
  },
  {
    id: "leadership",
    eyebrow: "领导承诺",
    title: "最高管理层的战略共识与资源承诺处于什么水平？",
    hint: "关注实际预算、负责人和优先级。",
    weight: 0.15,
    options: [
      option("no-consensus", "尚未形成共识", 0),
      option("verbal-support", "已有口头支持", 25),
      option("owner-no-resources", "有负责人，缺少跨部门资源", 50),
      option("budgeted-consensus", "核心高管达成共识，并配有预算", 75),
      option("top-priority", "一号位直接牵引，列为全公司优先级", 100),
    ],
  },
  {
    id: "aiReadiness",
    eyebrow: "基础能力",
    title: "AI、数据与流程基础达到什么阶段？",
    hint: "以真实运行状态判断，不以采购工具数量判断。",
    weight: 0.1,
    options: [
      option("exploring", "刚开始了解", 0),
      option("personal-tools", "少量员工使用个人工具", 25),
      option("single-workflow", "已有单点流程跑通", 50),
      option("multi-workflow", "多流程数据可用，并有专门团队", 75),
      option("platform-governance", "已有平台化能力和治理机制", 100),
    ],
  },
  {
    id: "executionSpeed",
    eyebrow: "执行速度",
    title: "一项跨部门变革通常需要多久才能启动？",
    hint: "从决策完成到责任人、资源和节奏全部就位。",
    weight: 0.15,
    options: [
      option("over-6m", "通常超过 6 个月", 0),
      option("3-6m", "3–6 个月", 25),
      option("1-3m", "1–3 个月", 50),
      option("2-4w", "2–4 周", 75),
      option("under-2w", "两周内即可启动", 100),
    ],
  },
  {
    id: "changeTolerance",
    eyebrow: "组织承载",
    title: "组织对岗位、绩效和人员流动的承受能力如何？",
    hint: "选择管理层可以真实接受的变化强度。",
    weight: 0.15,
    options: [
      option("stability-first", "优先保持稳定", 0),
      option("tools-only", "仅接受工具增效", 25),
      option("selected-pilots", "可以在部分岗位试点", 50),
      option("roles-and-performance", "可以同步调整职责和绩效", 75),
      option("rapid-reorg", "可接受快速重组和明显人才流动", 100),
    ],
  },
];

export type RiskSignal =
  | "speed-capacity-conflict"
  | "leadership-gap"
  | "foundation-gap"
  | "culture-shock"
  | "window-loss";

export type AssessmentResult = {
  recommendation: "evolution" | "revolution";
  revolutionScore: number;
  evolutionScore: number;
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
  let weightedScore = 0;
  const answerLabels = {} as Record<QuestionId, string>;
  const selectedScores = {} as Record<QuestionId, number>;

  for (const question of questions) {
    const selected = question.options.find((item) => item.id === answers[question.id]);
    if (!selected) {
      throw new InvalidAnswerError(question.id, answers[question.id]);
    }
    weightedScore += selected.score * question.weight;
    selectedScores[question.id] = selected.score;
    answerLabels[question.id] = selected.label;
  }

  const revolutionScore = Math.round(weightedScore);
  const evolutionScore = 100 - revolutionScore;
  const spread = Math.abs(revolutionScore - evolutionScore);
  const confidence = spread < 15 ? "low" : spread < 35 ? "medium" : "high";
  const recommendation = revolutionScore > 50 ? "revolution" : "evolution";
  const riskSignals: RiskSignal[] = [];

  const capacity = Math.round(
    (selectedScores.leadership +
      selectedScores.aiReadiness +
      selectedScores.executionSpeed +
      selectedScores.changeTolerance) /
      4,
  );

  if (selectedScores.urgency >= 75 && capacity <= 50) riskSignals.push("speed-capacity-conflict");
  if (selectedScores.leadership <= 50) riskSignals.push("leadership-gap");
  if (selectedScores.aiReadiness <= 50) riskSignals.push("foundation-gap");
  if (recommendation === "revolution" && selectedScores.changeTolerance <= 50) {
    riskSignals.push("culture-shock");
  }
  if (recommendation === "evolution" && selectedScores.urgency >= 75) riskSignals.push("window-loss");

  return {
    recommendation,
    revolutionScore,
    evolutionScore,
    confidence,
    boundaryState: confidence === "low",
    riskSignals,
    answerLabels,
  };
}

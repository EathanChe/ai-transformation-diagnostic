import type { AssessmentResult, RiskSignal } from "./assessment";
import type { DiagnosticReport } from "./types";

const riskCopy: Record<RiskSignal, string> = {
  "speed-capacity-conflict": "外部窗口正在收窄，组织承载力仍有缺口，快速扩张可能带来交付和治理失控。",
  "leadership-gap": "高层共识或资源承诺不足，跨部门推进容易在优先级冲突中停滞。",
  "foundation-gap": "数据、流程或 AI 基础仍需补强，智能体难以稳定进入核心业务。",
  "culture-shock": "岗位和绩效机制的调整空间有限，集中变革可能放大人员流动与心理安全风险。",
  "window-loss": "行业窗口较紧，分阶段推进需要设置更短的验证周期与明确扩展门槛。",
};

function defaultRisks(result: AssessmentResult): string[] {
  const selected = result.riskSignals.map((signal) => riskCopy[signal]).slice(0, 3);
  if (selected.length > 0) return selected;
  return result.recommendation === "revolution"
    ? ["多条职能线同步推进会增加治理压力，需要统一决策节奏和明确的风险边界。"]
    : ["试点周期过长会削弱窗口收益，需要提前确定扩展和停止条件。"];
}

export function createFallbackReport(result: AssessmentResult): DiagnosticReport {
  const isRevolution = result.recommendation === "revolution";
  const boundaryText = result.boundaryState
    ? "当前结果处于边界区间，建议用一个短周期验证项目校准判断。"
    : "当前证据对推荐路线形成了较清晰的支持。";

  if (isRevolution) {
    return {
      headline: "以集中变革抢占 AI Native 时间窗口",
      executiveSummary: `企业的革命路线适配度为 ${result.revolutionScore} 分。组织速度、战略紧迫度与变革承载力整体支持在同一阶段推动业务流程、岗位职责和管理机制调整。${boundaryText}`,
      evidence: [
        `组织体量与存量负担：${result.answerLabels.orgBurden}。`,
        `行业窗口判断：${result.answerLabels.urgency}；领导承诺：${result.answerLabels.leadership}。`,
        `跨部门执行能力：${result.answerLabels.executionSpeed}；组织承载：${result.answerLabels.changeTolerance}。`,
      ],
      risks: defaultRisks(result),
      actions90Days: [
        {
          phase: "第 1–30 天",
          objective: "建立全公司级变革指挥机制",
          actions: ["确定一号位、业务负责人和 AI 负责人组成的决策小组。", "选定 2–3 条可直接影响收入或成本的核心流程。"],
        },
        {
          phase: "第 31–60 天",
          objective: "同步改造流程与岗位责任",
          actions: ["让智能体进入真实业务闭环，记录质量、时效和人工接管率。", "同步调整岗位目标、协作边界和绩效指标。"],
        },
        {
          phase: "第 61–90 天",
          objective: "固化治理并扩大覆盖",
          actions: ["复盘业务收益、风险事件和人员变化。", "形成可复制的工作流、权限、数据与质量标准。"],
        },
      ],
      caveat: "该结果用于战略讨论与路径校准，仍需结合财务约束、监管要求和真实业务数据作出最终决策。",
    };
  }

  return {
    headline: "以核心流程试点积累深层变革能力",
    executiveSummary: `企业的进化路线适配度为 ${result.evolutionScore} 分。当前组织更适合从一个高价值业务单元或核心流程切入，通过连续验证逐步扩大 AI 的职责边界，再推进结构、绩效与文化调整。${boundaryText}`,
    evidence: [
      `组织体量与存量负担：${result.answerLabels.orgBurden}。`,
      `流程与系统状态：${result.answerLabels.processCoupling}；AI 基础：${result.answerLabels.aiReadiness}。`,
      `领导承诺：${result.answerLabels.leadership}；跨部门启动速度：${result.answerLabels.executionSpeed}。`,
    ],
    risks: defaultRisks(result),
    actions90Days: [
      {
        phase: "第 1–30 天",
        objective: "选定试点并建立成功标准",
        actions: ["选择一个高频、高价值且边界清楚的核心流程。", "设定业务指标、人工接管率和风险红线。"],
      },
      {
        phase: "第 31–60 天",
        objective: "完成真实业务闭环验证",
        actions: ["让智能体覆盖完整任务链，并保留人工复核。", "每周复盘错误类型、数据质量和岗位变化。"],
      },
      {
        phase: "第 61–90 天",
        objective: "形成扩展门槛与下一阶段路线图",
        actions: ["依据收益、质量和采用率决定扩大、修正或停止。", "确定下一批流程及配套的职责、绩效和治理调整。"],
      },
    ],
    caveat: "该结果用于战略讨论与路径校准，仍需结合财务约束、监管要求和真实业务数据作出最终决策。",
  };
}

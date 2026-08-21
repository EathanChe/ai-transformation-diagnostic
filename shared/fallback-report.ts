import type { AssessmentResult, RiskSignal } from "./assessment";
import type { DiagnosticReport, RouteType } from "./types";

const riskCopy: Record<RiskSignal, string> = {
  "speed-capacity-conflict": "业务压力已经要求提速，当前组织承载力仍低于集中推进门槛，容易出现交付与治理失控。",
  "leadership-gap": "一号位近期参与不足，跨部门争议可能缺少及时的优先级裁决。",
  "workflow-readiness-gap": "优先流程的梳理和准备仍不充分，进入真实业务后容易反复返工。",
  "decision-friction": "正式审批链较长，快速试验可能在等待决策时错过窗口。",
  "system-coupling": "优先流程涉及较多生产系统，接口、权限和数据改动会放大实施风险。",
  "role-redesign-gap": "深层转型目标已经明确，岗位职责调整的授权范围仍然有限。",
  "shallow-ambition": "当前目标集中在局部任务或岗位，需要先确认企业是否计划进入深层转型。",
  "window-loss": "业务影响已经临近，渐进推进需要设置更短的验证周期和明确的扩展门槛。",
};

const defaultRisk: Record<RouteType, string> = {
  adaptation: "局部优化容易长期停留在工具使用层面，需要提前设定是否扩大变革范围的复盘节点。",
  reconstruction: "快速调整有限范围的流程会压缩协调时间，需要明确冻结范围和业务连续性底线。",
  evolution: "分阶段推进可能因试点周期过长而失去窗口，需要明确扩展、修正和停止条件。",
  revolution: "多条职能线同步推进会增加治理压力，需要统一决策节奏和风险边界。",
};

function risksFor(result: AssessmentResult): string[] {
  const selected = result.riskSignals.map((signal) => riskCopy[signal]).slice(0, 3);
  return selected.length > 0 ? selected : [defaultRisk[result.recommendation]];
}

const routeContent: Record<
  RouteType,
  Pick<DiagnosticReport, "headline" | "actions90Days"> & { summary: string }
> = {
  adaptation: {
    headline: "先用局部改进验证 AI 的业务价值",
    summary: "当前目标主要落在有限范围，推进节奏也适合渐进验证。建议先形成可量化的业务证据，再决定是否扩大到流程、岗位和管理机制。",
    actions90Days: [
      {
        phase: "第 1–30 天",
        objective: "确定一个边界清楚的改进点",
        actions: ["选择一个高频任务并记录现有成本、时效和质量基线。", "明确 AI 可以处理的范围和必须人工复核的情形。"],
      },
      {
        phase: "第 31–60 天",
        objective: "完成小范围真实业务验证",
        actions: ["让目标员工在真实任务中使用方案。", "每周记录采用率、节省时间和错误类型。"],
      },
      {
        phase: "第 61–90 天",
        objective: "决定维持、扩大或停止",
        actions: ["根据业务数据判断是否扩展到完整岗位或流程。", "如需扩大，重新评估变革深度和组织承载力。"],
      },
    ],
  },
  reconstruction: {
    headline: "在有限范围内快速完成流程重构",
    summary: "当前变革目标仍然有限，业务窗口和组织承载支持较快推进。建议锁定一个明确范围，在短周期内完成流程与协作方式调整，同时保持整体组织结构稳定。",
    actions90Days: [
      {
        phase: "第 1–30 天",
        objective: "冻结重构范围与业务底线",
        actions: ["选定一条受窗口压力影响最大的业务流程。", "明确负责人、交付指标、人工接管条件和不可中断环节。"],
      },
      {
        phase: "第 31–60 天",
        objective: "集中完成流程切换",
        actions: ["在真实业务中运行新的 AI 工作流。", "按日处理数据、权限和协作接口问题。"],
      },
      {
        phase: "第 61–90 天",
        objective: "稳定运行并评估下一步深度",
        actions: ["固化流程标准、质量指标和异常处理机制。", "判断是否需要进一步调整岗位与管理机制。"],
      },
    ],
  },
  evolution: {
    headline: "以核心流程为起点分阶段完成深层转型",
    summary: "企业已经提出深层变革目标，当前速度压力或组织承载条件更适合分阶段推进。建议用连续的真实业务验证积累能力，再逐步扩大到岗位、绩效和组织机制。",
    actions90Days: [
      {
        phase: "第 1–30 天",
        objective: "选定试点并建立扩展标准",
        actions: ["选择一条高价值且责任边界清楚的核心流程。", "设定业务指标、人工接管率、风险红线和扩展门槛。"],
      },
      {
        phase: "第 31–60 天",
        objective: "完成端到端业务闭环",
        actions: ["让 AI 覆盖完整任务链并保留人工复核。", "每周复盘错误类型、数据质量和岗位职责变化。"],
      },
      {
        phase: "第 61–90 天",
        objective: "形成下一阶段转型路线图",
        actions: ["依据收益、质量和采用率决定扩大、修正或停止。", "确定下一批流程及配套的职责和治理调整。"],
      },
    ],
  },
  revolution: {
    headline: "以集中变革抢占 AI Native 时间窗口",
    summary: "企业的深层转型目标、业务时间压力和组织承载力共同支持集中推进。建议在同一阶段协调业务流程、岗位职责和管理机制，并用统一治理控制同步变革风险。",
    actions90Days: [
      {
        phase: "第 1–30 天",
        objective: "建立全公司级变革指挥机制",
        actions: ["成立由一号位、业务负责人和 AI 负责人组成的决策小组。", "选定 2–3 条直接影响收入或成本的核心流程。"],
      },
      {
        phase: "第 31–60 天",
        objective: "同步改造流程与岗位责任",
        actions: ["让 AI 进入真实业务闭环并记录质量、时效和人工接管率。", "同步调整岗位目标、协作边界和绩效指标。"],
      },
      {
        phase: "第 61–90 天",
        objective: "固化治理并扩大覆盖",
        actions: ["复盘业务收益、风险事件和人员变化。", "形成可复制的工作流、权限、数据和质量标准。"],
      },
    ],
  },
};

export function createFallbackReport(result: AssessmentResult): DiagnosticReport {
  const content = routeContent[result.recommendation];
  const boundaryText = result.boundaryState
    ? " 当前判断接近路线阈值，建议用短周期验证校准。"
    : " 当前三个维度对该路线形成了较清晰的支持。";

  return {
    headline: content.headline,
    executiveSummary: `${content.summary}${boundaryText}`,
    evidence: [
      `变革目标：${result.answerLabels.transformationDepth}；岗位调整授权：${result.answerLabels.roleRedesignScope}。`,
      `业务影响时间：${result.answerLabels.urgency}，速度压力为 ${result.speedPressureScore} 分。`,
      `审批链：${result.answerLabels.decisionLayers}；项目启动周期：${result.answerLabels.executionSpeed}。`,
      `系统改造量：${result.answerLabels.processCoupling}；流程准备：${result.answerLabels.workflowReadiness}。`,
    ],
    risks: risksFor(result),
    actions90Days: content.actions90Days,
    caveat: "该结果用于战略讨论与路径校准，仍需结合财务约束、监管要求和真实业务数据作出最终决策。",
  };
}

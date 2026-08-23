import type { AssessmentResult, RiskSignal } from "./assessment";
import type { DiagnosticReport, QuestionId, RouteType } from "./types";

const questionName: Record<QuestionId, string> = {
  formalMandate: "正式授权范围",
  productionAiWorkflows: "真实运行流程数",
  measuredAiWorkflows: "有使用前后结果对比的 AI 应用数",
  recentProjectScope: "最近项目覆盖范围",
  recentProjectLeadTime: "最近项目实际耗时",
  priorityWorkflowEvidence: "优先流程材料",
  leadershipDecisionCount: "一号位决策记录",
  formalRoleChange: "已生效岗位变化",
};

const riskCopy: Record<RiskSignal, string> = {
  "information-gap": "部分信息选择了“无法确认或没有记录”，本次路线建议的置信度相应降低。",
  "inconsistent-project-record": "最近项目的覆盖范围与耗时答案采用了不同项目口径，建议复核；系统仍会结合其他答案给出路线建议。",
  "no-delivery-evidence": "过去 12 个月没有可用于判断跨部门交付能力的已投入使用项目。",
  "measurement-gap": "已有 AI 应用进入真实业务，但拿不出使用前后的业务结果对比，实际价值无法验证。",
  "leadership-gap": "一号位近期缺少形成记录的 AI 决策活动，跨部门争议可能无法及时裁决。",
  "workflow-evidence-gap": "优先流程缺少足够的书面材料，实施团队容易在规则和异常处理上反复返工。",
  "role-change-gap": "正式授权范围已经扩大，岗位管理变化仍停留在较浅层级。",
  "operational-proof-gap": "连续运行四周的 AI 流程数量较少，规模化判断仍缺少运行证据。",
};

const defaultRisk: Record<RouteType, string> = {
  evolution: "分阶段推进可能因验证周期过长而停滞，需要提前确定扩展、修正和停止条件。",
  revolution: "多条职能线同步推进会增加治理压力，需要统一决策节奏和风险边界。",
};

function risksFor(result: AssessmentResult): string[] {
  const selected = result.riskSignals.map((signal) => riskCopy[signal]).slice(0, 3);
  return selected.length > 0 ? selected : [defaultRisk[result.recommendation]];
}

function scoreText(score: number | null): string {
  return score === null ? "暂缺评分" : `${score} 分`;
}

function evidenceFor(result: AssessmentResult): string[] {
  const answers = result.answerLabels;
  const evidence = [
    `正式授权为“${answers.formalMandate}”，已生效岗位变化为“${answers.formalRoleChange}”，两项记录共同形成 ${scoreText(result.depthScore)}的变革深度。`,
    `最近项目覆盖“${answers.recentProjectScope}”、实际耗时“${answers.recentProjectLeadTime}”；按项目范围校正后，交付能力为 ${scoreText(result.deliveryCapacityScore)}。`,
    `连续运行的 AI 流程为“${answers.productionAiWorkflows}”，能拿出使用前后结果对比的 AI 应用为“${answers.measuredAiWorkflows}”；结合流程材料后，运营基础为 ${scoreText(result.operationalEvidenceScore)}。`,
    `一号位决策记录为“${answers.leadershipDecisionCount}”，需要与实际使用数量和结果记录覆盖率一起判断治理是否进入稳定节奏。`,
  ];
  if (result.unknownQuestions.length > 0) {
    evidence[3] = `当前证据完整度为 ${result.evidenceCompleteness} 分；待核实项目包括：${result.unknownQuestions.map((id) => questionName[id]).join("、")}。`;
  }
  return evidence;
}

const routeContent: Record<
  RouteType,
  Pick<DiagnosticReport, "headline" | "actions90Days"> & { summary: (result: AssessmentResult) => string }
> = {
  evolution: {
    headline: "用连续的真实业务证据推进深层转型",
    summary: (result) =>
      `正式授权和岗位制度已经指向深层变化，当前交付记录或运营证据仍适合分阶段积累。证据完整度为 ${result.evidenceCompleteness} 分。`,
    actions90Days: [
      {
        phase: "第 1–30 天",
        objective: "选定试点并建立扩展证据",
        actions: ["选择一条已有流程材料的核心流程。", "记录使用前业务结果，并设定连续四周观察项和扩展门槛。"],
      },
      {
        phase: "第 31–60 天",
        objective: "完成端到端业务闭环",
        actions: ["让 AI 覆盖完整任务链并保留人工复核。", "同步记录质量、异常和实际岗位变化。"],
      },
      {
        phase: "第 61–90 天",
        objective: "依据证据扩大正式授权",
        actions: ["比较项目范围校正后的交付速度与业务收益。", "达到门槛后启动下一条流程并更新岗位制度。"],
      },
    ],
  },
  revolution: {
    headline: "以成熟交付证据支撑集中深层变革",
    summary: (result) =>
      `正式授权、已生效岗位变化、范围校正后的交付速度和运营记录共同支持集中推进。证据完整度为 ${result.evidenceCompleteness} 分。`,
    actions90Days: [
      {
        phase: "第 1–30 天",
        objective: "建立全公司级证据与决策机制",
        actions: ["统一项目台账、使用前业务结果和 AI 运行记录。", "由一号位主持固定节奏的跨部门决策会议。"],
      },
      {
        phase: "第 31–60 天",
        objective: "同步改造流程与岗位责任",
        actions: ["在多条核心流程运行 AI 并持续记录人工接管率。", "同步发布岗位说明书和绩效指标变更。"],
      },
      {
        phase: "第 61–90 天",
        objective: "用运营数据控制扩张节奏",
        actions: ["复盘业务收益、风险事件和交付周期。", "只复制已经达到连续四周指标门槛的方案。"],
      },
    ],
  },
};

export function createFallbackReport(result: AssessmentResult): DiagnosticReport {
  const content = routeContent[result.recommendation];
  const boundaryText = result.boundaryState
    ? " 当前分值接近路线阈值，建议增加一个记录方式一致的项目样本后复核。"
    : "";
  return {
    headline: content.headline,
    executiveSummary: `${content.summary(result)}${boundaryText}`,
    evidence: evidenceFor(result),
    risks: risksFor(result),
    actions90Days: content.actions90Days,
    caveat: "该结果只依据已填写的可核验事实，用于战略讨论；仍需结合财务、监管和外部竞争信息作出最终决策。",
  };
}

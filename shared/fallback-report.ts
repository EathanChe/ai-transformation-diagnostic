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
  "evidence-gap": "部分关键事实缺少可核验记录，当前路线判断的证据基础有限。",
  "inconsistent-project-record": "最近项目的覆盖范围与耗时答案互相冲突，需要核对项目台账。",
  "inconsistent-operational-record": "有使用前后结果对比的 AI 应用数量超过实际运行数量，需要核对记录。",
  "no-delivery-evidence": "过去 12 个月没有可用于判断跨部门交付能力的已投入使用项目。",
  "measurement-gap": "已有 AI 应用进入真实业务，但拿不出使用前后的业务结果对比，实际价值无法验证。",
  "leadership-gap": "一号位近期缺少形成记录的 AI 决策活动，跨部门争议可能无法及时裁决。",
  "workflow-evidence-gap": "优先流程缺少足够的书面材料，实施团队容易在规则和异常处理上反复返工。",
  "role-change-gap": "正式授权范围已经扩大，岗位管理变化仍停留在较浅层级。",
  "operational-proof-gap": "连续运行四周的 AI 流程数量较少，规模化判断仍缺少运行证据。",
};

const defaultRisk: Record<RouteType, string> = {
  "evidence-gap": "缺少事实记录时，管理层容易用立场代替证据作出路线选择。",
  adaptation: "局部优化容易长期停留在工具使用层面，需要设置是否扩大正式授权范围的复盘节点。",
  reconstruction: "快速调整有限范围的流程会压缩协调时间，需要明确冻结范围和业务连续性底线。",
  evolution: "分阶段推进可能因验证周期过长而停滞，需要提前确定扩展、修正和停止条件。",
  revolution: "多条职能线同步推进会增加治理压力，需要统一决策节奏和风险边界。",
};

function risksFor(result: AssessmentResult): string[] {
  const selected = result.riskSignals.map((signal) => riskCopy[signal]).slice(0, 3);
  return selected.length > 0 ? selected : [defaultRisk[result.recommendation]];
}

function scoreText(score: number | null): string {
  return score === null ? "证据不足" : `${score} 分`;
}

function evidenceFor(result: AssessmentResult): string[] {
  const answers = result.answerLabels;
  const evidence = [
    `正式授权为“${answers.formalMandate}”，已生效岗位变化为“${answers.formalRoleChange}”，两项记录共同形成 ${scoreText(result.depthScore)}的变革深度。`,
    `最近项目覆盖“${answers.recentProjectScope}”、实际耗时“${answers.recentProjectLeadTime}”；按项目范围校正后，交付能力为 ${scoreText(result.deliveryCapacityScore)}。`,
    `真实运行的 AI 应用为“${answers.productionAiWorkflows}”，其中能拿出使用前后结果对比的为“${answers.measuredAiWorkflows}”，结合现有流程材料后，运营证据为 ${scoreText(result.operationalEvidenceScore)}。`,
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
  "evidence-gap": {
    headline: "先补齐关键事实，再选择变革路线",
    summary: (result) =>
      `当前可核验信息完整度为 ${result.evidenceCompleteness} 分，关键事实仍不足以支持稳定的路线判断。建议先从现有文件和项目台账补录数据，再进行战略讨论。`,
    actions90Days: [
      {
        phase: "第 1–30 天",
        objective: "建立最小事实清单",
        actions: ["收集 AI 相关会议纪要、项目章程、预算文件和岗位制度。", "统一投入使用、应用数量和业务结果的记录方式。"],
      },
      {
        phase: "第 31–60 天",
        objective: "补齐项目与运营记录",
        actions: ["从项目台账核对最近跨部门项目的覆盖范围、批准日期和投入使用日期。", "为已经使用的 AI 应用补录使用前后的业务结果。"],
      },
      {
        phase: "第 61–90 天",
        objective: "用完整证据重新诊断",
        actions: ["由业务、财务、人力和技术共同确认事实清单。", "重新测评并把证据分歧列入管理层议题。"],
      },
    ],
  },
  adaptation: {
    headline: "以有记录的局部改进积累转型证据",
    summary: (result) =>
      `正式授权和已生效岗位变化显示当前变革范围有限，现有交付与运营记录也更支持渐进验证。证据完整度为 ${result.evidenceCompleteness} 分。`,
    actions90Days: [
      {
        phase: "第 1–30 天",
        objective: "确定一个可测量的局部改进",
        actions: ["选择一个高频任务并记录使用 AI 前的业务结果。", "形成责任人、操作规则和人工复核记录。"],
      },
      {
        phase: "第 31–60 天",
        objective: "形成连续运行证据",
        actions: ["在真实业务中连续运行四周。", "按同一口径记录采用率、时效、质量和异常。"],
      },
      {
        phase: "第 61–90 天",
        objective: "依据数据决定是否扩大",
        actions: ["比较使用 AI 前后的业务结果并完成复盘。", "根据结果决定维持局部改进或申请更大授权范围。"],
      },
    ],
  },
  reconstruction: {
    headline: "在有限授权范围内快速完成流程重构",
    summary: (result) =>
      `正式授权仍集中在有限范围，最近项目的范围校正交付记录与运营证据支持较快推进。证据完整度为 ${result.evidenceCompleteness} 分。`,
    actions90Days: [
      {
        phase: "第 1–30 天",
        objective: "锁定重构边界与使用前记录",
        actions: ["从正式授权文件确认唯一实施范围。", "记录批准日期、投入使用日期、使用前业务结果和中止条件。"],
      },
      {
        phase: "第 31–60 天",
        objective: "集中完成真实业务切换",
        actions: ["在选定范围运行新的 AI 工作流。", "按日记录异常、人工接管和业务连续性事件。"],
      },
      {
        phase: "第 61–90 天",
        objective: "固化记录并评估深层转型",
        actions: ["形成流程、权限和质量标准。", "根据正式岗位变化需求决定是否扩大转型深度。"],
      },
    ],
  },
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

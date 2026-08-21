import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Compass,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import type { AnalyzeResponse } from "../../shared/types";

type ResultViewProps = {
  result: AnalyzeResponse;
  onRestart: () => void;
};

const routeCopy = {
  "evidence-gap": {
    cn: "证据待补",
    en: "EVIDENCE GAP",
    descriptor: "关键事实不足，暂缓路线选择",
  },
  adaptation: {
    cn: "适应",
    en: "ADAPTATION",
    descriptor: "分阶段完成有限范围的调整",
  },
  reconstruction: {
    cn: "重构",
    en: "RECONSTRUCTION",
    descriptor: "在短时间内完成有限范围的调整",
  },
  evolution: {
    cn: "进化",
    en: "EVOLUTION",
    descriptor: "分阶段完成深层变革",
  },
  revolution: {
    cn: "革命",
    en: "REVOLUTION",
    descriptor: "在短时间内集中完成深层变革",
  },
};

const confidenceCopy = {
  low: "低置信",
  medium: "中等置信",
  high: "高置信",
};

function ScoreBar({ label, score }: { label: string; score: number | null }) {
  const missing = score === null;
  return (
    <div className={`score-row score-row-active ${missing ? "score-row-missing" : ""}`}>
      <div className="score-meta">
        <span>{label}</span>
        <strong>{missing ? "—" : score}</strong>
      </div>
      <div className="score-track" aria-label={missing ? `${label}证据不足` : `${label} ${score} 分`}>
        <div className="score-fill" style={{ width: `${score ?? 0}%` }} />
      </div>
    </div>
  );
}

export function ResultView({ result, onRestart }: ResultViewProps) {
  const route = routeCopy[result.recommendation];
  const generatedByAi = result.source === "model";

  return (
    <main className="result-shell">
      <header className="result-hero animate-rise">
        <div className="result-kicker">
          <Compass size={16} aria-hidden="true" />
          <span>战略诊断结果 · {confidenceCopy[result.confidence]}</span>
        </div>
        <div className="result-route-grid">
          <div>
            <p className="result-label">{result.recommendation === "evidence-gap" ? "当前判断状态" : "当前证据支持的路线"}</p>
            <h1>{route.cn}</h1>
            <p className="result-route-en">{route.en}</p>
          </div>
          <div className="route-statement">
            <span>{route.descriptor}</span>
            <p>{result.report.headline}</p>
          </div>
        </div>
        {(result.boundaryState || result.recommendation === "evidence-gap") && (
          <div className="boundary-note">
            <AlertTriangle size={18} aria-hidden="true" />
            <span>
              {result.recommendation === "evidence-gap"
                ? "关键事实缺少记录或存在冲突。补齐证据后再选择变革路线。"
                : "当前判断接近路线阈值。建议增加一个同口径项目样本后复核。"}
            </span>
          </div>
        )}
      </header>

      <section className="result-section score-section animate-rise delay-1" aria-labelledby="scores-title">
        <div className="section-heading">
          <span>01</span>
          <div>
            <p>事实证据评分</p>
            <h2 id="scores-title">范围校正与证据完整度分别计算</h2>
          </div>
        </div>
        <div className="scores-card">
          <ScoreBar
            label="变革深度"
            score={result.depthScore}
          />
          <ScoreBar
            label="实际交付能力"
            score={result.deliveryCapacityScore}
          />
          <ScoreBar
            label="运营证据"
            score={result.operationalEvidenceScore}
          />
          <ScoreBar label="证据完整度" score={result.evidenceCompleteness} />
          <p className="score-footnote">交付能力由同一个实际项目的覆盖部门数与实际耗时共同计算；未知事实不按低分处理。</p>
        </div>
      </section>

      <section className="result-section animate-rise delay-2" aria-labelledby="summary-title">
        <div className="section-heading">
          <span>02</span>
          <div>
            <p>核心判断</p>
            <h2 id="summary-title">多项事实共同支持什么判断</h2>
          </div>
        </div>
        <p className="executive-summary">{result.report.executiveSummary}</p>
        <div className="evidence-grid">
          {result.report.evidence.map((item, index) => (
            <article key={item} className="evidence-card">
              <span>0{index + 1}</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="result-section risk-section animate-rise delay-3" aria-labelledby="risks-title">
        <div className="section-heading section-heading-light">
          <span>03</span>
          <div>
            <p>关键风险</p>
            <h2 id="risks-title">执行前需要正视的约束</h2>
          </div>
        </div>
        <div className="risk-list">
          {result.report.risks.map((risk) => (
            <div key={risk} className="risk-item">
              <AlertTriangle size={20} aria-hidden="true" />
              <p>{risk}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="result-section animate-rise delay-4" aria-labelledby="actions-title">
        <div className="section-heading">
          <span>04</span>
          <div>
            <p>90 天行动计划</p>
            <h2 id="actions-title">把战略选择变成执行节奏</h2>
          </div>
        </div>
        <div className="timeline">
          {result.report.actions90Days.map((phase, index) => (
            <article key={phase.phase} className="timeline-item">
              <div className="timeline-marker">{index + 1}</div>
              <div className="timeline-card">
                <span>{phase.phase}</span>
                <h3>{phase.objective}</h3>
                <ul>
                  {phase.actions.map((action) => (
                    <li key={action}>
                      <CheckCircle2 size={17} aria-hidden="true" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="result-footer">
        <div className="privacy-note">
          <ShieldCheck size={20} aria-hidden="true" />
          <div>
            <strong>{generatedByAi ? "AI 模型已完成深度分析" : "已使用本地战略规则完成分析"}</strong>
            <p>本次答案和报告不会被保存。{result.report.caveat}</p>
          </div>
        </div>
        <button type="button" className="restart-button" onClick={onRestart}>
          <RotateCcw size={17} aria-hidden="true" />
          重新测评
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </footer>
    </main>
  );
}

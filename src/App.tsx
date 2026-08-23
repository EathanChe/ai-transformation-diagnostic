import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  Clock3,
  Gauge,
  Layers3,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { questions } from "../shared/assessment";
import { analyzeResponseSchema, type AnalyzeResponse, type QuestionId } from "../shared/types";
import { ResultView } from "./components/ResultView";
import { StrategyMatrix } from "./components/StrategyMatrix";

type Screen = "intro" | "questionnaire" | "loading" | "result" | "error";
type AssessmentForm = {
  answers: Record<QuestionId, string>;
  context: string;
};

const emptyAnswers = Object.fromEntries(questions.map((question) => [question.id, ""])) as Record<
  QuestionId,
  string
>;

const loadingSteps = [
  "正在核对事实证据完整度",
  "正在按项目范围校正交付能力",
  "正在生成 90 天行动建议",
];

function Brand() {
  return (
    <a className="brand" href="/" aria-label="AI 转型战略诊断首页">
      <span className="brand-mark">AI</span>
      <span>
        转型战略诊断
        <small>STRATEGY DIAGNOSTIC</small>
      </span>
    </a>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <main className="intro-shell">
      <section className="hero animate-rise">
        <div className="hero-copy">
          <div className="eyebrow-pill">
            <Sparkles size={15} aria-hidden="true" />
            <span>8 项事实核验 · 约 4 分钟</span>
          </div>
          <h1>
            AI 转型的关键，
            <br />
            是选择合适的<span>变革速度</span>
          </h1>
          <p className="hero-lead">
            基于已批准文件、项目台账和真实运行记录，判断企业当前能够获得事实支持的
            <strong>战略变革路线</strong>。
          </p>
          <button className="primary-button" type="button" onClick={onStart}>
            开始战略诊断
            <ArrowRight size={19} aria-hidden="true" />
          </button>
          <div className="hero-facts" aria-label="测评特点">
            <span><Clock3 size={16} />3 分钟完成</span>
            <span><ShieldCheck size={16} />答案不保存</span>
            <span><BrainCircuit size={16} />AI 结构化分析</span>
          </div>
        </div>
        <StrategyMatrix />
      </section>

      <section className="what-you-get animate-rise delay-2" aria-labelledby="value-title">
        <div className="section-intro">
          <span>你将获得</span>
          <h2 id="value-title">一份可以进入管理层讨论的路径判断</h2>
        </div>
        <div className="value-grid">
          <article>
            <Gauge aria-hidden="true" />
            <span>01</span>
            <h3>事实证据完整度</h3>
            <p>允许选择“无法确认”，信息不足时自动降低结果置信度。</p>
          </article>
          <article>
            <Layers3 aria-hidden="true" />
            <span>02</span>
            <h3>关键证据与风险</h3>
            <p>结合实际项目范围、交付耗时和运行指标解释结论。</p>
          </article>
          <article>
            <BrainCircuit aria-hidden="true" />
            <span>03</span>
            <h3>90 天行动建议</h3>
            <p>把路径选择拆解为三个阶段的落地节奏。</p>
          </article>
        </div>
      </section>

      <p className="model-note">
        测评用于战略讨论与路径校准，不替代基于企业财务、监管与业务数据的专业决策。
      </p>
    </main>
  );
}

function LoadingView({ step }: { step: number }) {
  return (
    <main className="loading-shell" aria-live="polite">
      <div className="loader-orbit" aria-hidden="true">
        <LoaderCircle />
        <span>AI</span>
      </div>
      <p className="loading-kicker">分析进行中</p>
      <h1>{loadingSteps[step]}</h1>
      <div className="loading-steps">
        {loadingSteps.map((label, index) => (
          <div key={label} className={index <= step ? "complete" : ""}>
            <span>{index < step ? <Check size={14} /> : index + 1}</span>
            <p>{label}</p>
          </div>
        ))}
      </div>
      <p className="loading-note">通常需要 10–25 秒，请保持页面开启。</p>
    </main>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const { watch, setValue, getValues, reset } = useForm<AssessmentForm>({
    defaultValues: { answers: emptyAnswers, context: "" },
  });

  const answers = watch("answers");
  const context = watch("context");
  const isContextQuestion = currentIndex === questions.length;
  const activeQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / (questions.length + 1)) * 100;
  const canContinue = isContextQuestion || Boolean(activeQuestion && answers[activeQuestion.id]);

  useEffect(() => {
    if (screen !== "loading") return;
    const timer = window.setInterval(() => {
      setLoadingStep((step) => Math.min(step + 1, loadingSteps.length - 1));
    }, 2200);
    return () => window.clearInterval(timer);
  }, [screen]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [screen, currentIndex]);

  const questionCountLabel = useMemo(
    () => `${Math.min(currentIndex + 1, questions.length + 1)} / ${questions.length + 1}`,
    [currentIndex],
  );

  const submitAssessment = async () => {
    setScreen("loading");
    setLoadingStep(0);
    setErrorMessage("");

    try {
      const values = getValues();
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          assessmentVersion: "3.3",
          answers: values.answers,
          context: values.context.trim() || undefined,
          turnstileToken: "",
        }),
      });

      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
            ? payload.message
            : "分析服务暂时不可用，请稍后重试。";
        throw new Error(message);
      }

      setResult(analyzeResponseSchema.parse(payload));
      setScreen("result");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "分析服务暂时不可用，请稍后重试。");
      setScreen("error");
    }
  };

  const goNext = () => {
    if (!canContinue) return;
    if (currentIndex < questions.length) {
      setCurrentIndex((index) => index + 1);
      return;
    }
    void submitAssessment();
  };

  const restart = () => {
    reset({ answers: emptyAnswers, context: "" });
    setCurrentIndex(0);
    setResult(null);
    setErrorMessage("");
    setScreen("intro");
  };

  return (
    <div className="app-frame">
      {screen !== "loading" && screen !== "result" && (
        <header className="site-header">
          <Brand />
          <div className="header-meta">
            <span className="company-name">杭州亿序科技有限公司</span>
            <span className="privacy-chip"><ShieldCheck size={14} />匿名测评</span>
          </div>
        </header>
      )}

      {screen === "intro" && <Intro onStart={() => setScreen("questionnaire")} />}

      {screen === "questionnaire" && (
        <main className="question-shell">
          <div className="progress-meta">
            <span>战略诊断</span>
            <strong>{questionCountLabel}</strong>
          </div>
          <div className="progress-track" aria-label={`测评进度 ${Math.round(progress)}%`}>
            <div style={{ width: `${progress}%` }} />
          </div>

          <section className="question-card animate-rise" key={currentIndex}>
            {isContextQuestion ? (
              <>
                <div className="question-number question-number-text">补充</div>
                <p className="question-eyebrow">补充背景 · 选填</p>
                <h1>还有哪些已发生的事实需要纳入判断？</h1>
                <p className="question-hint">
                  可补充未被题目覆盖的已批准文件、已投入使用项目、已生效制度或已记录结果。
                </p>
                <div className="textarea-wrap">
                  <textarea
                    value={context}
                    onChange={(event) => setValue("context", event.target.value.slice(0, 300))}
                    maxLength={300}
                    rows={7}
                    placeholder="例如：2025 年 6 月批准客服流程改造，9 月投入使用；前后都记录了一次解决率……"
                    aria-label="企业 AI 转型背景补充"
                  />
                  <span>{context.length} / 300</span>
                </div>
              </>
            ) : (
              <>
                <div className="question-number">{String(currentIndex + 1).padStart(2, "0")}</div>
                <p className="question-eyebrow">{activeQuestion.eyebrow}</p>
                <h1>{activeQuestion.title}</h1>
                <p className="question-hint">{activeQuestion.hint}</p>
                <div className="option-list" role="radiogroup" aria-label={activeQuestion.title}>
                  {activeQuestion.options.map((item, index) => {
                    const selected = answers[activeQuestion.id] === item.id;
                    return (
                      <button
                        key={item.id}
                        className={`option-button ${selected ? "selected" : ""}`}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setValue(`answers.${activeQuestion.id}`, item.id, { shouldDirty: true })}
                      >
                        <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                        <span className="option-label">{item.label}</span>
                        <span className="option-check">{selected && <Check size={17} />}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          <div className="question-actions">
            <button
              type="button"
              className="back-button"
              onClick={() => {
                if (currentIndex === 0) setScreen("intro");
                else setCurrentIndex((index) => index - 1);
              }}
            >
              <ArrowLeft size={18} />返回
            </button>
            <button type="button" className="primary-button" disabled={!canContinue} onClick={goNext}>
              {isContextQuestion ? "生成诊断结果" : "下一题"}
              <ArrowRight size={18} />
            </button>
          </div>
        </main>
      )}

      {screen === "loading" && <LoadingView step={loadingStep} />}

      {screen === "result" && result && <ResultView result={result} onRestart={restart} />}

      {screen === "error" && (
        <main className="error-shell">
          <div className="error-code">!</div>
          <p>分析未完成</p>
          <h1>{errorMessage}</h1>
          <div className="error-actions">
            <button className="primary-button" type="button" onClick={() => void submitAssessment()}>
              重新分析<ArrowRight size={18} />
            </button>
            <button className="back-button" type="button" onClick={() => setScreen("questionnaire")}>
              <ArrowLeft size={18} />返回检查答案
            </button>
          </div>
        </main>
      )}
    </div>
  );
}

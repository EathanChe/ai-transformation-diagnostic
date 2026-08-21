export function StrategyMatrix() {
  return (
    <figure className="matrix" aria-labelledby="matrix-caption">
      <div className="matrix-axis matrix-axis-speed">变革速度 →</div>
      <div className="matrix-grid">
        <div className="matrix-cell matrix-cell-active">
          <span>深层 · 渐进</span>
          <strong>Evolution</strong>
          <small>进化</small>
        </div>
        <div className="matrix-cell matrix-cell-active matrix-cell-revolution">
          <span>深层 · 快速</span>
          <strong>Revolution</strong>
          <small>革命</small>
        </div>
        <div className="matrix-cell matrix-cell-muted">
          <span>有限 · 渐进</span>
          <strong>Adaptation</strong>
          <small>适应</small>
        </div>
        <div className="matrix-cell matrix-cell-muted">
          <span>有限 · 快速</span>
          <strong>Reconstruction</strong>
          <small>重构</small>
        </div>
      </div>
      <figcaption id="matrix-caption">
        Balogun 与 Hope Hailey 的变革类型模型。测评先判断深度，再结合速度压力与组织承载选择路线。
      </figcaption>
    </figure>
  );
}

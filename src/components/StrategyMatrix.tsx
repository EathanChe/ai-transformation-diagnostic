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
      </div>
      <figcaption id="matrix-caption">
        AI 转型聚焦深层变革。测评依据正式授权、实际交付和运营记录，在进化与革命之间判断合适路线。
      </figcaption>
    </figure>
  );
}

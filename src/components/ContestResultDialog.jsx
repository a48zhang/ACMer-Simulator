function ContestResultDialog({ outcome, onConfirm, onClose }) {
    if (!outcome) return null;
    const { total, solved, attempts, ratingDelta, scoreDelta, sanDelta, timeUsed, performanceRating } = outcome;
    const ratingText = `${ratingDelta >= 0 ? '+' : ''}${ratingDelta}`;
    const scoreText = `${scoreDelta >= 0 ? '+' : ''}${scoreDelta}`;
    const sanText = `${sanDelta >= 0 ? '+' : ''}${sanDelta}`;

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
                <h3 className="dialog-title">📊 比赛结算</h3>
                <p className="dialog-subtitle">本次比赛用时 {timeUsed} 分钟，解出 {solved}/{total} 题</p>

                <div className="contest-result-grid">
                    <div className="result-item">
                        <div className="result-label">Rating 变化</div>
                        <div className="result-value">{ratingText}</div>
                    </div>
                    {performanceRating != null && (
                        <div className="result-item">
                            <div className="result-label">表现分</div>
                            <div className="result-value">{performanceRating}</div>
                        </div>
                    )}
                    <div className="result-item">
                        <div className="result-label">尝试次数</div>
                        <div className="result-value">{attempts}</div>
                    </div>
                </div>

                <div className="dialog-actions">
                    <button className="btn btn-secondary" onClick={onClose}>关闭</button>
                    <button className="btn btn-primary" onClick={onConfirm}>确认结算</button>
                </div>
            </div>
        </div>
    );
}

export default ContestResultDialog;

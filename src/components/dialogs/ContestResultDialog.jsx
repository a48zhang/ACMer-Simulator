function ContestResultDialog({ outcome, onConfirm }) {
    if (!outcome) return null;
    const { total, solved, attempts, ratingDelta, scoreDelta, sanDelta, timeUsed, performanceRating, weakAttr } = outcome;
    const ratingText = `${ratingDelta >= 0 ? '+' : ''}${ratingDelta}`;
    const scoreText = `${scoreDelta >= 0 ? '+' : ''}${scoreDelta}`;
    const sanText = `${sanDelta >= 0 ? '+' : ''}${sanDelta}`;

    const attrNames = {
        algorithm: '算法思维', coding: '代码能力', speed: '速度', stress: '抗压',
        teamwork: '团队配合', english: '英语', math: '数学', dp: '动态规划',
        graph: '图论', dataStructure: '数据结构', string: '字符串',
        search: '搜索', greedy: '贪心', geometry: '计算几何'
    };

    return (
        <div className="dialog-overlay">
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
                        <div className="result-label">SAN 变化</div>
                        <div className="result-value">{sanText}</div>
                    </div>
                    <div className="result-item">
                        <div className="result-label">尝试次数</div>
                        <div className="result-value">{attempts}</div>
                    </div>
                </div>

                {weakAttr && (
                    <p className="dialog-hint">
                        💡 本场最弱项：<strong>{attrNames[weakAttr] || weakAttr}</strong>，建议加强训练。
                    </p>
                )}

                <div className="dialog-actions">
                    <button className="btn btn-primary" onClick={onConfirm}>确认结算</button>
                </div>
            </div>
        </div>
    );
}

export default ContestResultDialog;

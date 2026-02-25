function GameOverDialog({ reason, stats, onRestart }) {
    return (
        <div className="dialog-overlay">
            <div className="dialog-box" style={{ maxWidth: '480px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                    {reason === 'graduation' ? '🎓' : '💀'}
                </div>
                <h3 className="dialog-title">
                    {reason === 'graduation' ? '游戏结束 — 毕业！' : '游戏结束 — 退学'}
                </h3>
                <p style={{ margin: '0.75rem 0 1.25rem', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                    {reason === 'graduation'
                        ? '恭喜你完成了四年的ACM旅程！'
                        : reason}
                </p>

                <div className="contest-result-grid" style={{ marginBottom: '1.5rem' }}>
                    <div className="result-item">
                        <div className="result-label">参赛次数</div>
                        <div className="result-value">{stats.playerContests}</div>
                    </div>
                    <div className="result-item">
                        <div className="result-label">解题总数</div>
                        <div className="result-value">{stats.playerProblems}</div>
                    </div>
                    <div className="result-item">
                        <div className="result-label">最终 Rating</div>
                        <div className="result-value">{stats.rating}</div>
                    </div>
                    <div className="result-item">
                        <div className="result-label">最终 GPA</div>
                        <div className="result-value">{stats.gpa?.toFixed(2)}</div>
                    </div>
                </div>

                <div className="dialog-actions" style={{ justifyContent: 'center' }}>
                    <button className="btn btn-primary" onClick={onRestart}>重新开始</button>
                </div>
            </div>
        </div>
    );
}

export default GameOverDialog;

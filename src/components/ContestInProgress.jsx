// ContestInProgress 组件 - 在比赛进行时显示并支持做题
import { useState } from 'react';

function ContestInProgress({ contest, timeRemaining, onAttempt, onFinish }) {
    const solvedCount = contest.problems.filter(p => p.status === 'solved').length;
    const totalCount = contest.problems.length;
    const allSolved = solvedCount === totalCount;

    return (
        <section className="contest-in-progress">
            <div className="contest-header">
                <div className="contest-title-row">
                    <h2>🏁 Codeforces 比赛进行中</h2>
                    <span className="contest-badge">{solvedCount}/{totalCount} 已解</span>
                </div>
                <div className="contest-meta">
                    <span className="contest-time">⏱️ 剩余时间：{timeRemaining} 分钟</span>
                </div>
            </div>

            <div className="contest-problem-grid">
                {contest.problems.map((p, idx) => {
                    const isSolved = p.status === 'solved';
                    const isPending = p.status === 'pending';

                    return (
                        <div key={p.id} className={`contest-problem-card ${p.status}`}>
                            <div className="contest-problem-title">Problem {p.letter}</div>
                            <div className="contest-problem-status">
                                {isSolved ? '✅ Accepted' : (isPending ? '—' : '❌')}
                            </div>
                            <button
                                className="btn btn-primary btn-sm"
                                type="button"
                                onClick={() => onAttempt(p.id)}
                                disabled={isSolved || timeRemaining <= 0}
                            >
                                {isSolved ? 'Accepted' : 'Submit'}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="contest-footer">
                <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={onFinish}
                    disabled={timeRemaining <= 0 || allSolved}
                >
                    提前交卷
                </button>
                <span className="contest-hint">⏰ 到时或全部解出后自动结算</span>
            </div>
        </section>
    );
}

export default ContestInProgress;

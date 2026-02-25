// ContestInProgress 组件 - 在比赛进行时显示并支持做题
function ContestInProgress({ contest, timeRemaining, onAttempt, onFinish, onRead, onThink }) {
  const solvedCount = contest.problems.filter(p => p.status === 'solved').length;
  const totalCount = contest.problems.length;
  const allSolved = solvedCount === totalCount;

  // 难度星级
  const getDifficultyStars = (diff) => {
    return '★'.repeat(Math.ceil(diff / 2)) + '☆'.repeat(5 - Math.ceil(diff / 2));
  };

  return (
    <section className="contest-in-progress">
      <div className="contest-header">
        <div className="contest-title-row">
          <h2>🏁 {contest.name} 进行中</h2>
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
          const isCoding = p.status === 'coding';
          const isSubmittedFail = p.status === 'submitted_fail';
          const canThink = (isCoding || isSubmittedFail) && p.thinkBonus < 2;

          return (
            <div 
              key={p.id} 
              className={`contest-problem-card ${p.status}`}
            >
              <div className="contest-problem-top">
                <div className="contest-problem-title">
                  Problem {p.letter}
                  <span className="contest-problem-diff">
                    {getDifficultyStars(p.difficulty)}
                  </span>
                </div>
                <div className="contest-problem-status">
                  {isSolved ? '✅ Accepted' : (isPending ? '未读题' : (isSubmittedFail ? '❌ 已尝试' : '📝 可写代码'))}
                </div>
              </div>

              {p.revealedInfo && (
                <div className="contest-problem-info">
                  <span className="contest-problem-tags">
                    🏷️ {p.revealedInfo.tags.join(' | ')}
                  </span>
                  <span className="contest-problem-rate">
                    🎯 预估成功率：{p.revealedInfo.estimatedSuccessRate}%
                  </span>
                </div>
              )}

              {p.thinkBonus > 0 && (
                <div className="contest-problem-bonus">
                  🧠 思考加成：×{p.thinkBonus}
                </div>
              )}

              <div className="contest-problem-actions">
                {isPending && (
                  <button
                    className="btn btn-secondary btn-sm"
                    type="button"
                    onClick={() => onRead(p.id)}
                    disabled={timeRemaining <= 0}
                  >
                    读题
                  </button>
                )}
                {(isCoding || isSubmittedFail) && (
                  <>
                    <button
                      className="btn btn-secondary btn-sm"
                      type="button"
                      onClick={() => onThink(p.id)}
                      disabled={!canThink || timeRemaining <= 0}
                    >
                      写代码{!canThink ? '（已满）' : ''}
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      type="button"
                      onClick={() => onAttempt(p.id)}
                      disabled={timeRemaining <= 0}
                    >
                      提交
                    </button>
                  </>
                )}
                {isSolved && (
                  <span className="contest-problem-solved">Accepted</span>
                )}
              </div>
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

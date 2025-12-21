function GameControls({ gameState, onStart, onTogglePause, onReset, onAdvanceMonth }) {
  const getStatusText = () => {
    if (!gameState.isRunning) return '未开始';
    if (gameState.isPaused) return '已暂停';
    if (gameState.month > 34) return '已结束';
    return '进行中';
  };

  const getYearMonth = () => {
    // gameState.month 从 1 开始，对应大一9月
    const monthsSinceStart = gameState.month - 1; // 0-based
    const startCalendarMonth = 9; // 9月（September）
    const totalCalendarMonth = startCalendarMonth + monthsSinceStart;
    const yearOffset = Math.floor((totalCalendarMonth - 1) / 12);
    const year = yearOffset + 1;
    const monthInYear = ((totalCalendarMonth - 1) % 12) + 1;
    return `大学 ${year} 年 ${monthInYear} 月`;
  };

  const hasPendingEvents = (gameState.pendingEvents?.length || 0) > 0;
  const hasActiveContest = !!gameState.activeContest;

  return (
    <section className="game-start-section">
      <h2>游戏控制</h2>
      <div className="game-controls">
        <button
          className="btn btn-primary"
          onClick={onStart}
          disabled={gameState.isRunning}
        >
          开始游戏
        </button>
        <button
          className="btn btn-secondary"
          onClick={onTogglePause}
          disabled={!gameState.isRunning || gameState.month > 34}
        >
          {gameState.isPaused ? '继续游戏' : '暂停游戏'}
        </button>
        <button
          className="btn btn-success"
          onClick={onAdvanceMonth}
          disabled={!gameState.isRunning || gameState.isPaused || gameState.month > 34 || hasPendingEvents || hasActiveContest}
        >
          下一月 ➡️
        </button>
        <button className="btn btn-danger" onClick={onReset}>
          重置游戏
        </button>
      </div>
      <div className="game-status">
        <p>状态: <span>{getStatusText()}</span></p>
        <p>时间: <span>{getYearMonth()}</span></p>
        <p>剩余行动点: <span className="ap-display">{gameState.remainingAP}</span> / {gameState.monthlyAP} AP</p>
        {hasPendingEvents && (
          <p>事件: <span>当月待处理 {gameState.pendingEvents.length} 项</span></p>
        )}
        {hasActiveContest && (
          <p>比赛: <span>进行中，剩余 {gameState.contestTimeRemaining} 分钟</span></p>
        )}
      </div>
    </section>
  );
}

export default GameControls;

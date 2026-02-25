function GameControls({ gameState, onStart, onReset, onAdvanceMonth }) {
  const getStatusText = () => {
    if (!gameState.isRunning) return '未开始';
    if (gameState.isPaused) return '已暂停';
    if (gameState.month > 46) return '已结束';
    return '进行中';
  };

  const getYearMonth = () => {
    const gameMonth = gameState.month;
    const monthsSinceStart = gameMonth - 1;
    const startCalendarMonth = 9;
    const totalCalendarMonth = startCalendarMonth + monthsSinceStart;
    
    const calendarMonth = ((totalCalendarMonth - 1) % 12) + 1;
    
    let academicYear;
    if (gameMonth <= 4) {
      academicYear = 1;
    } else {
      const monthsAfterFirstSemester = gameMonth - 5;
      const completedYears = Math.floor(monthsAfterFirstSemester / 12);
      if (calendarMonth < 9) {
        academicYear = completedYears + 1;
      } else {
        academicYear = completedYears + 2;
      }
    }
    
    return `大学 ${academicYear} 年 ${calendarMonth} 月`;
  };

  const hasPendingEvents = (gameState.pendingEvents?.length || 0) > 0;
  const hasActiveContest = !!gameState.activeContest;

  // AP进度条颜色
  const getAPProgressColor = () => {
    const ratio = gameState.remainingAP / gameState.monthlyAP;
    if (ratio >= 0.7) return '#22c55e';
    if (ratio >= 0.3) return '#f59e0b';
    return '#ef4444';
  };

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
          className="btn btn-success"
          onClick={onAdvanceMonth}
          disabled={!gameState.isRunning || gameState.isPaused || gameState.month > 46 || hasPendingEvents || hasActiveContest}
        >
          下一月 ➡️
        </button>
        <button className="btn btn-danger" onClick={onReset}>
          重置
        </button>
      </div>
      <div className="game-status">
        <span className="status-chip">📌 <strong>{getStatusText()}</strong></span>
        <span className="status-chip">📅 <strong>{getYearMonth()}</strong></span>
        <span className="status-chip ap">
          <div className="ap-bar-container">
            <div 
              className="ap-bar-fill" 
              style={{ 
                width: `${(gameState.remainingAP / gameState.monthlyAP) * 100}%`,
                background: getAPProgressColor()
              }}
            ></div>
          </div>
          <strong>{gameState.remainingAP}</strong> / {gameState.monthlyAP} AP
        </span>
        {hasPendingEvents && (
          <span className="status-chip alert">🔔 待处理事件 <strong>{gameState.pendingEvents.length}</strong></span>
        )}
        {hasActiveContest && (
          <span className="status-chip alert">⏱️ 比赛剩余 <strong>{gameState.contestTimeRemaining}</strong> 分钟</span>
        )}
      </div>
    </section>
  );
}

export default GameControls;

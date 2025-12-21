function GameControls({ gameState, onStart, onTogglePause, onReset, onAdvanceMonth }) {
  const getStatusText = () => {
    if (!gameState.isRunning) return '未开始';
    if (gameState.isPaused) return '已暂停';
    if (gameState.month > 46) return '已结束';
    return '进行中';
  };

  const getYearMonth = () => {
    // gameState.month 从 1 开始，对应大一9月
    // 学年（大一、大二等）在每年9月变化
    const gameMonth = gameState.month;
    const monthsSinceStart = gameMonth - 1; // 0-based
    const startCalendarMonth = 9; // September
    const totalCalendarMonth = startCalendarMonth + monthsSinceStart;
    
    // 计算日历月份 (1-12)
    const calendarMonth = ((totalCalendarMonth - 1) % 12) + 1;
    
    // 计算学年（大一、大二、大三、大四）
    // 学年在每年9月递增
    let academicYear;
    if (gameMonth <= 4) {
      // 前4个月（9-12月）属于大一
      academicYear = 1;
    } else {
      // 之后，每过一个9月，学年递增
      // 计算经过了多少个完整的学年周期（从第5个月开始）
      const monthsAfterFirstSemester = gameMonth - 5; // Jan Y2开始
      const completedYears = Math.floor(monthsAfterFirstSemester / 12);
      
      // 如果当前在9月之前，还在上一学年
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
          disabled={!gameState.isRunning || gameState.month > 46}
        >
          {gameState.isPaused ? '继续游戏' : '暂停游戏'}
        </button>
        <button
          className="btn btn-success"
          onClick={onAdvanceMonth}
          disabled={!gameState.isRunning || gameState.isPaused || gameState.month > 46 || hasPendingEvents || hasActiveContest}
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

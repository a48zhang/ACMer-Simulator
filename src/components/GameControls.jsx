function GameControls({ gameState, onStart, onTogglePause, onReset }) {
  const getStatusText = () => {
    if (!gameState.isRunning) return '未开始';
    if (gameState.isPaused) return '已暂停';
    return '进行中';
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
          className="btn btn-secondary"
          onClick={onTogglePause}
          disabled={!gameState.isRunning}
        >
          {gameState.isPaused ? '继续游戏' : '暂停游戏'}
        </button>
        <button className="btn btn-danger" onClick={onReset}>
          重置游戏
        </button>
      </div>
      <div className="game-status">
        <p>状态: <span>{getStatusText()}</span></p>
        <p>游戏时间: <span>{gameState.gameTime}</span> 天</p>
      </div>
    </section>
  );
}

export default GameControls;

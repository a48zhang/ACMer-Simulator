function PlayerStatus({ score, contests, problems, leaderboardData }) {
  const getRank = () => {
    if (leaderboardData.length === 0) {
      return '未上榜';
    }

    const sortedData = [...leaderboardData].sort((a, b) => b.score - a.score);
    let rank = sortedData.length + 1;

    for (let i = 0; i < sortedData.length; i++) {
      if (score > sortedData[i].score) {
        rank = i + 1;
        break;
      }
    }

    return rank > sortedData.length ? '未上榜' : `#${rank}`;
  };

  return (
    <section className="player-status-section">
      <h2>我的状态</h2>
      <div className="player-stats">
        <div className="player-stat">
          <span className="stat-label">当前分数:</span>
          <span className="stat-number">{score.toLocaleString()}</span>
        </div>
        <div className="player-stat">
          <span className="stat-label">参赛次数:</span>
          <span className="stat-number">{contests}</span>
        </div>
        <div className="player-stat">
          <span className="stat-label">解题数:</span>
          <span className="stat-number">{problems}</span>
        </div>
        <div className="player-stat">
          <span className="stat-label">排名:</span>
          <span className="stat-number">{getRank()}</span>
        </div>
      </div>
    </section>
  );
}

export default PlayerStatus;

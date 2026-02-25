function GlobalStatistics({ leaderboardData, playerScore }) {
  const totalPlayers = leaderboardData.length;
  const avgScore = totalPlayers > 0
    ? Math.floor(leaderboardData.reduce((sum, p) => sum + p.score, 0) / totalPlayers)
    : 0;
  const highScore = totalPlayers > 0
    ? Math.max(...leaderboardData.map(p => p.score))
    : 0;
  const avgContests = totalPlayers > 0
    ? Math.floor(leaderboardData.reduce((sum, p) => sum + p.contests, 0) / totalPlayers)
    : 0;
  const avgPlayTime = avgContests * 5;

  const sortedLeaderboard = [...leaderboardData]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <section className="statistics-section">
      <h2>全球玩家成绩统计</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>🌍 总玩家数</h3>
          <p className="stat-value">{totalPlayers.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>🏅 平均分数</h3>
          <p className="stat-value">{avgScore.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>👑 最高分</h3>
          <p className="stat-value">{highScore.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>⏱️ 平均游戏时长</h3>
          <p className="stat-value">{avgPlayTime}天</p>
        </div>
      </div>

      <div className="leaderboard">
        <h3>🏆 排行榜 Top 10</h3>
        <table>
          <thead>
            <tr>
              <th>排名</th>
              <th>玩家</th>
              <th>分数</th>
              <th>比赛场次</th>
            </tr>
          </thead>
          <tbody>
            {sortedLeaderboard.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  暂无排行榜数据
                </td>
              </tr>
            ) : (
              sortedLeaderboard.map((player, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{player.name}</td>
                  <td>{player.score.toLocaleString()}</td>
                  <td>{player.contests}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default GlobalStatistics;

import styled from 'styled-components';

const StatisticsSection = styled.section`
  background-color: ${props => props.theme.colors.surface};
  padding: 0.875rem 1.25rem;
  border-radius: ${props => props.theme.radius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  margin-bottom: 1rem;
  border: 1px solid ${props => props.theme.colors.border};
`;

const StatsTitle = styled.h2`
  font-size: 1rem;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.textMain};
  font-weight: 700;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radius.md};
  padding: 1rem;
  border: 1px solid ${props => props.theme.colors.border};
`;

const StatCardTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.5rem;
`;

const StatValue = styled.p`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0;
`;

const Leaderboard = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radius.md};
  padding: 1rem;
  border: 1px solid ${props => props.theme.colors.border};
`;

const LeaderboardTitle = styled.h3`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textMain};
  margin-bottom: 1rem;
`;

const LeaderboardTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const LeaderboardTh = styled.th`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  text-align: left;
  padding: 0.5rem;
  border-bottom: 2px solid ${props => props.theme.colors.border};
`;

const LeaderboardTd = styled.td`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textMain};
  padding: 0.5rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const LeaderboardEmpty = styled.td`
  text-align: center;
  padding: 1.25rem;
  color: #999;
`;

interface PlayerScore {
  name: string;
  score: number;
  contests: number;
}

interface GlobalStatisticsProps {
  leaderboardData: PlayerScore[];
  playerScore?: number;
}

function GlobalStatistics({ leaderboardData }: GlobalStatisticsProps) {
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
    <StatisticsSection>
      <StatsTitle>全球玩家成绩统计</StatsTitle>
      <StatsGrid>
        <StatCard>
          <StatCardTitle>🌍 总玩家数</StatCardTitle>
          <StatValue>{totalPlayers.toLocaleString()}</StatValue>
        </StatCard>
        <StatCard>
          <StatCardTitle>🏅 平均分数</StatCardTitle>
          <StatValue>{avgScore.toLocaleString()}</StatValue>
        </StatCard>
        <StatCard>
          <StatCardTitle>👑 最高分</StatCardTitle>
          <StatValue>{highScore.toLocaleString()}</StatValue>
        </StatCard>
        <StatCard>
          <StatCardTitle>⏱️ 平均游戏时长</StatCardTitle>
          <StatValue>{avgPlayTime}天</StatValue>
        </StatCard>
      </StatsGrid>

      <Leaderboard>
        <LeaderboardTitle>🏆 排行榜 Top 10</LeaderboardTitle>
        <LeaderboardTable>
          <thead>
            <tr>
              <LeaderboardTh>排名</LeaderboardTh>
              <LeaderboardTh>玩家</LeaderboardTh>
              <LeaderboardTh>分数</LeaderboardTh>
              <LeaderboardTh>比赛场次</LeaderboardTh>
            </tr>
          </thead>
          <tbody>
            {sortedLeaderboard.length === 0 ? (
              <tr>
                <LeaderboardEmpty colSpan={4}>
                  暂无排行榜数据
                </LeaderboardEmpty>
              </tr>
            ) : (
              sortedLeaderboard.map((player, index) => (
                <tr key={index}>
                  <LeaderboardTd>{index + 1}</LeaderboardTd>
                  <LeaderboardTd>{player.name}</LeaderboardTd>
                  <LeaderboardTd>{player.score.toLocaleString()}</LeaderboardTd>
                  <LeaderboardTd>{player.contests}</LeaderboardTd>
                </tr>
              ))
            )}
          </tbody>
        </LeaderboardTable>
      </Leaderboard>
    </StatisticsSection>
  );
}

export default GlobalStatistics;

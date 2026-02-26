import styled from 'styled-components';

const StatusSection = styled.section`
  background-color: ${props => props.theme.colors.surface};
  padding: 0.875rem 1.25rem;
  border-radius: ${props => props.theme.radius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  margin-bottom: 1rem;
  border: 1px solid ${props => props.theme.colors.border};
`;

const StatusTitle = styled.h2`
  font-size: 1rem;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.textMain};
  font-weight: 700;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
`;

const StatItem = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radius.md};
  padding: 0.875rem;
  border: 1px solid ${props => props.theme.colors.border};
  text-align: center;
`;

const StatLabel = styled.span`
  display: block;
  font-size: 0.8125rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.375rem;
`;

const StatNumber = styled.span`
  display: block;
  font-size: 1.375rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
`;

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
    <StatusSection>
      <StatusTitle>我的状态</StatusTitle>
      <StatsContainer>
        <StatItem>
          <StatLabel>当前分数:</StatLabel>
          <StatNumber>{score.toLocaleString()}</StatNumber>
        </StatItem>
        <StatItem>
          <StatLabel>参赛次数:</StatLabel>
          <StatNumber>{contests}</StatNumber>
        </StatItem>
        <StatItem>
          <StatLabel>解题数:</StatLabel>
          <StatNumber>{problems}</StatNumber>
        </StatItem>
        <StatItem>
          <StatLabel>排名:</StatLabel>
          <StatNumber>{getRank()}</StatNumber>
        </StatItem>
      </StatsContainer>
    </StatusSection>
  );
}

export default PlayerStatus;

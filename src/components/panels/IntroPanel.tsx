import styled from 'styled-components';
import { Button } from '../common/Button';

const IntroPanelWrapper = styled.section`
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const IntroHero = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  flex-shrink: 0;
`;

const IntroLogo = styled.div`
  font-size: 3rem;
  margin-bottom: 0.5rem;
`;

const IntroTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 0.25rem;
`;

const IntroSubtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const IntroCards = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex: 1;
  min-height: 0;
`;

const IntroCard = styled.div`
  flex: 1;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.lg};
  padding: 1.25rem;
  box-shadow: ${props => props.theme.shadows.sm};
  border: 1px solid ${props => props.theme.colors.border};
  overflow-y: auto;
  min-width: 0;
`;

const IntroCardIcon = styled.div`
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const IntroCardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textMain};
  margin-bottom: 0.5rem;
  text-align: center;
`;

const IntroCardText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.5;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const IntroCardList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const IntroCardListItem = styled.li`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.5;
  margin-bottom: 0.35rem;
  font-size: 0.875rem;

  strong {
    color: ${props => props.theme.colors.textMain};
    font-weight: 600;
  }
`;

const IntroFooter = styled.div`
  text-align: center;
  padding: 1rem 0;
  flex-shrink: 0;
`;

const IntroStartButton = styled(Button)`
  padding: 1.25rem 3.5rem;
  font-size: 1.375rem;
  font-weight: 600;
  box-shadow: ${props => props.theme.shadows.lg};
  transform: scale(1);
  transition: all 0.2s ease;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% {
      box-shadow: ${props => props.theme.shadows.lg};
    }
    50% {
      box-shadow: 0 0 0 8px rgba(99, 102, 241, 0.2);
    }
  }

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    animation: none;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

interface IntroPanelProps {
  onStart: () => void;
}

function IntroPanel({ onStart }: IntroPanelProps) {
  return (
    <IntroPanelWrapper>
      <IntroHero>
        <IntroLogo>🏆</IntroLogo>
        <IntroTitle>ACMer选手模拟器</IntroTitle>
        <IntroSubtitle>体验编程竞赛选手的四年大学生涯</IntroSubtitle>
      </IntroHero>

      <IntroCards>
        <IntroCard>
          <IntroCardIcon>🎮</IntroCardIcon>
          <IntroCardTitle>游戏背景</IntroCardTitle>
          <IntroCardText>
            你是一名计算机专业的大一新生，怀揣着成为顶尖程序设计竞赛选手的梦想。在接下来的四年里，你需要在学业、竞赛和生活之间找到平衡。
          </IntroCardText>
        </IntroCard>

        <IntroCard>
          <IntroCardIcon>🎯</IntroCardIcon>
          <IntroCardTitle>核心玩法</IntroCardTitle>
          <IntroCardList>
            <IntroCardListItem><strong>选择特性：</strong>选择你的特质，影响初始能力</IntroCardListItem>
            <IntroCardListItem><strong>管理时间：</strong>每月合理分配行动点(AP)</IntroCardListItem>
            <IntroCardListItem><strong>参加比赛：</strong>参加各类编程竞赛，提升Rating</IntroCardListItem>
            <IntroCardListItem><strong>平衡生活：</strong>保持GPA和SAN值</IntroCardListItem>
          </IntroCardList>
        </IntroCard>

        <IntroCard>
          <IntroCardIcon>⚡</IntroCardIcon>
          <IntroCardTitle>关键提示</IntroCardTitle>
          <IntroCardList>
            <IntroCardListItem>每场比赛都需要权衡收益和风险</IntroCardListItem>
            <IntroCardListItem>不要忽视学业，GPA过低可能导致退学</IntroCardListItem>
            <IntroCardListItem>保持SAN值，心理崩溃会影响表现</IntroCardListItem>
            <IntroCardListItem>利用队友，团队协作可以提升成绩</IntroCardListItem>
          </IntroCardList>
        </IntroCard>
      </IntroCards>

      <IntroFooter>
        <IntroStartButton variant="primary" size="lg" onClick={onStart}>
          🚀 开始我的ACM之旅
        </IntroStartButton>
      </IntroFooter>
    </IntroPanelWrapper>
  );
}

export default IntroPanel;

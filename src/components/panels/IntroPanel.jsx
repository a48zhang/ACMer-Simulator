import styled from 'styled-components';
import { Button } from '../common/Button';

const IntroPanelWrapper = styled.section`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const IntroHero = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const IntroLogo = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const IntroTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const IntroSubtitle = styled.p`
  font-size: 1.125rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const IntroCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const IntroCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.lg};
  padding: 1.5rem;
  box-shadow: ${props => props.theme.shadows.sm};
  border: 1px solid ${props => props.theme.colors.border};
`;

const IntroCardIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.75rem;
`;

const IntroCardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textMain};
  margin-bottom: 0.75rem;
`;

const IntroCardText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;
  margin-bottom: 0.75rem;
`;

const IntroCardList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const IntroCardListItem = styled.li`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;
  margin-bottom: 0.5rem;

  strong {
    color: ${props => props.theme.colors.textMain};
    font-weight: 600;
  }
`;

const IntroFooter = styled.div`
  text-align: center;
`;

const IntroStartButton = styled(Button)`
  padding: 0.75rem 2rem;
  font-size: 1.125rem;
`;

function IntroPanel({ onStart }) {
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

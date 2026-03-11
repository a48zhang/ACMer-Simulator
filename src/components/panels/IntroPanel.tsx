import styled from 'styled-components';
import { Button } from '../common/Button';

const IntroPanelWrapper = styled.section`
  width: min(1220px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
`;

const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.9fr);
  gap: 1.25rem;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const HeroPrimary = styled.div`
  position: relative;
  overflow: hidden;
  padding: clamp(1.6rem, 4vw, 2.8rem);
  border-radius: 30px;
  background:
    linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92)),
    ${props => props.theme.colors.surface};
  color: #f8fafc;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.22);

  &::before {
    content: '';
    position: absolute;
    inset: auto -12% -28% auto;
    width: 280px;
    height: 280px;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(56, 189, 248, 0.42), transparent 68%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(120deg, rgba(37, 99, 235, 0.16), transparent 38%),
      linear-gradient(320deg, rgba(16, 185, 129, 0.15), transparent 34%);
    pointer-events: none;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  width: fit-content;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.16);
  color: #bfdbfe;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.3rem, 5vw, 4.2rem);
  line-height: 0.96;
  letter-spacing: -0.05em;
  max-width: 10ch;
`;

const HeroDescription = styled.p`
  max-width: 52ch;
  color: rgba(226, 232, 240, 0.88);
  font-size: 1rem;
  line-height: 1.7;
`;

const HeroMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div`
  padding: 0.9rem 1rem;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.28);
  border: 1px solid rgba(148, 163, 184, 0.16);
  backdrop-filter: blur(10px);
`;

const MetricValue = styled.div`
  font-size: 1.4rem;
  font-weight: 800;
  color: #f8fafc;
`;

const MetricLabel = styled.div`
  margin-top: 0.15rem;
  color: rgba(191, 219, 254, 0.88);
  font-size: 0.78rem;
`;

const HeroActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const IntroStartButton = styled(Button)`
  min-width: 220px;
  padding: 1rem 1.6rem;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 700;
  box-shadow: 0 18px 40px rgba(37, 99, 235, 0.3);
`;

const ActionHint = styled.p`
  color: rgba(226, 232, 240, 0.72);
  font-size: 0.88rem;
`;

const HeroAside = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AsideCard = styled.div`
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(229, 231, 235, 0.9);
  border-radius: 26px;
  padding: 1.4rem;
  box-shadow: 0 18px 50px rgba(148, 163, 184, 0.18);
`;

const AsideTitle = styled.h2`
  font-size: 1rem;
  font-weight: 800;
  color: ${props => props.theme.colors.textMain};
  margin-bottom: 0.9rem;
`;

const AsideLead = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const RhythmList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RhythmItem = styled.div`
  display: grid;
  grid-template-columns: 78px 1fr;
  gap: 0.8rem;
  align-items: start;
`;

const RhythmTag = styled.div`
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.1);
  color: ${props => props.theme.colors.primary};
  font-size: 0.76rem;
  font-weight: 700;
  text-align: center;
`;

const RhythmContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
`;

const RhythmTitle = styled.div`
  font-size: 0.92rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textMain};
`;

const RhythmText = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.84rem;
  line-height: 1.5;
`;

const HighlightStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const HighlightBlock = styled.div`
  padding: 0.95rem 1rem;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.94), rgba(241, 245, 249, 0.94));
  border: 1px solid rgba(226, 232, 240, 0.95);
`;

const HighlightLabel = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const HighlightValue = styled.div`
  margin-top: 0.3rem;
  color: ${props => props.theme.colors.textMain};
  font-size: 1rem;
  font-weight: 800;
`;

const StrategyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const StrategyCard = styled.article`
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(229, 231, 235, 0.9);
  border-radius: 24px;
  padding: 1.3rem;
  box-shadow: ${props => props.theme.shadows.md};
`;

const StrategyIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-size: 1.35rem;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.14), rgba(16, 185, 129, 0.18));
  margin-bottom: 0.85rem;
`;

const StrategyTitle = styled.h3`
  font-size: 1rem;
  font-weight: 800;
  color: ${props => props.theme.colors.textMain};
  margin-bottom: 0.45rem;
`;

const StrategyText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.65;
  font-size: 0.9rem;
`;

const heroMetrics = [
  { value: '48', label: '个月，打完整个大学生涯' },
  { value: 'AP', label: '每月行动点决定训练与生活节奏' },
  { value: 'GPA / SAN', label: '学业与精神状态都不能崩' }
];

const rhythmItems = [
  { tag: '9-12月', title: '入学试水', text: '先建队、摸清校园节奏，决定你是卷训练还是先把课稳住。' },
  { tag: '1-6月', title: '积累强度', text: '考试周、社团活动、邀请赛会同时压上来，节奏会开始变硬。' },
  { tag: '7-8月', title: '夏训窗口', text: '这是最能拉开差距的时间段，收益高，但 SAN 消耗也很明显。' },
  { tag: '大二后', title: '正式赛季', text: '区域赛、校赛、线上预选都可能影响你的评级和后续资源。' }
];

const strategyCards = [
  {
    icon: '🧠',
    title: '训练不是无脑堆',
    text: '算法、代码、做题量要一起推进。单项极端偏科，正式比赛很容易卡在读题、实现或调试。'
  },
  {
    icon: '📚',
    title: '学业是硬门槛',
    text: 'GPA 低会触发挂科和学业警告。竞赛打得再好，只要学业连续失守，游戏会直接结束。'
  },
  {
    icon: '🤝',
    title: '队伍管理同样关键',
    text: '部分比赛要先选队友。好的队友能补你的短板，但选错节奏也会拖慢整个赛季。'
  }
];

interface IntroPanelProps {
  onStart: () => void;
}

function IntroPanel({ onStart }: IntroPanelProps) {
  return (
    <IntroPanelWrapper>
      <HeroGrid>
        <HeroPrimary>
          <HeroContent>
            <Eyebrow>ACM Career Simulator</Eyebrow>
            <HeroTitle>把四年竞赛生涯打成一条清晰曲线</HeroTitle>
            <HeroDescription>
              你会从大一新生一路打到毕业，处理社团、训练、考试、邀请赛和区域赛。
              这不是单纯点按钮刷数值，而是在有限时间里持续做取舍。
            </HeroDescription>

            <HeroMetrics>
              {heroMetrics.map((item) => (
                <MetricCard key={item.label}>
                  <MetricValue>{item.value}</MetricValue>
                  <MetricLabel>{item.label}</MetricLabel>
                </MetricCard>
              ))}
            </HeroMetrics>

            <HeroActions>
              <IntroStartButton variant="primary" size="lg" onClick={onStart}>
                开始我的 ACM 生涯
              </IntroStartButton>
              <ActionHint>先选特性，再进入每月行动与事件决策。</ActionHint>
            </HeroActions>
          </HeroContent>
        </HeroPrimary>

        <HeroAside>
          <AsideCard>
            <AsideTitle>四年节奏</AsideTitle>
            <AsideLead>真正的压力不是某一场比赛，而是连续 48 个月里每个月都要做对当前最值的事。</AsideLead>
            <RhythmList>
              {rhythmItems.map((item) => (
                <RhythmItem key={item.title}>
                  <RhythmTag>{item.tag}</RhythmTag>
                  <RhythmContent>
                    <RhythmTitle>{item.title}</RhythmTitle>
                    <RhythmText>{item.text}</RhythmText>
                  </RhythmContent>
                </RhythmItem>
              ))}
            </RhythmList>
          </AsideCard>

          <HighlightStrip>
            <HighlightBlock>
              <HighlightLabel>目标</HighlightLabel>
              <HighlightValue>冲更高 Rating，活着毕业</HighlightValue>
            </HighlightBlock>
            <HighlightBlock>
              <HighlightLabel>失败条件</HighlightLabel>
              <HighlightValue>连续学业失守或精神状态崩盘</HighlightValue>
            </HighlightBlock>
          </HighlightStrip>
        </HeroAside>
      </HeroGrid>

      <StrategyGrid>
        {strategyCards.map((card) => (
          <StrategyCard key={card.title}>
            <StrategyIcon>{card.icon}</StrategyIcon>
            <StrategyTitle>{card.title}</StrategyTitle>
            <StrategyText>{card.text}</StrategyText>
          </StrategyCard>
        ))}
      </StrategyGrid>
    </IntroPanelWrapper>
  );
}

export default IntroPanel;

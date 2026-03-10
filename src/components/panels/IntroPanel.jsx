import styled, { keyframes } from 'styled-components';
import { Button } from '../common/Button';
import { TRAITS } from '../../data/traits';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.25); }
  50%       { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
`;

/* ─── Outer wrapper ─────────────────────────────────────── */
const IntroPanelWrapper = styled.section`
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: ${fadeUp} 0.5s ease-out both;
`;

/* ─── Hero row ───────────────────────────────────────────── */
const HeroRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.xl};
  padding: 2rem 2.25rem;
  box-shadow: ${props => props.theme.shadows.md};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg,
      ${props => props.theme.colors.primary},
      ${props => props.theme.colors.secondary});
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const HeroLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  background: rgba(99,102,241,0.08);
  padding: 0.25rem 0.75rem;
  border-radius: ${props => props.theme.radius.full};
  width: fit-content;
`;

const HeroTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: ${props => props.theme.colors.textMain};
  line-height: 1.15;
  margin: 0;
  background: linear-gradient(135deg,
    ${props => props.theme.colors.primary},
    ${props => props.theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeroTagline = styled.p`
  font-size: 0.95rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
  line-height: 1.5;
`;

const HeroDesc = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;
  margin: 0.25rem 0 0;
  max-width: 480px;
`;

/* Stat mini-grid on the right */
const HeroStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  min-width: 180px;

  @media (max-width: 640px) {
    grid-template-columns: repeat(4, 1fr);
    min-width: unset;
  }
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radius.lg};
  padding: 0.6rem 0.5rem;
  text-align: center;
`;

const StatIcon = styled.span`
  font-size: 1.1rem;
`;
const StatNum = styled.span`
  font-size: 1.25rem;
  font-weight: 800;
  color: ${props => props.theme.colors.primary};
  line-height: 1;
`;
const StatLabel = styled.span`
  font-size: 0.65rem;
  color: ${props => props.theme.colors.textTertiary};
  font-weight: 500;
`;

/* ─── Feature cards row ─────────────────────────────────── */
const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FeatureCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
  padding: 1rem 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  box-shadow: ${props => props.theme.shadows.sm};
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const FeatureIcon = styled.div`
  font-size: 1.4rem;
  line-height: 1;
`;

const FeatureTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textMain};
  margin: 0;
`;

const FeatureDesc = styled.p`
  font-size: 0.78rem;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.45;
  margin: 0;
`;

/* ─── Bottom row (tips + CTA) ───────────────────────────── */
const BottomRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1.25rem;
  align-items: stretch;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const TipsCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
  padding: 1rem 1.25rem;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const TipsTitle = styled.h3`
  font-size: 0.8rem;
  font-weight: 700;
  color: ${props => props.theme.colors.warning};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const TipsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.3rem 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const TipsItem = styled.li`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.4;
  padding-left: 0.9rem;
  position: relative;

  &::before {
    content: '▸';
    position: absolute;
    left: 0;
    color: ${props => props.theme.colors.primary};
    font-size: 0.7rem;
  }
`;

const CtaBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
  padding: 1rem 1.5rem;
  box-shadow: ${props => props.theme.shadows.sm};
  min-width: 180px;

  @media (max-width: 640px) {
    min-width: unset;
    width: 100%;
  }
`;

const CtaHint = styled.p`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textTertiary};
  text-align: center;
  margin: 0;
`;

const IntroStartButton = styled(Button)`
  padding: 0.875rem 2rem;
  font-size: 1.1rem;
  font-weight: 700;
  width: 100%;
  animation: ${pulse} 2s infinite;

  &:hover:not(:disabled) {
    animation: none;
    transform: scale(1.04);
  }
  &:active:not(:disabled) {
    transform: scale(0.97);
  }
`;

function IntroPanel({ onStart }) {
  const traitCount = TRAITS.length;
  return (
    <IntroPanelWrapper>
      {/* Hero */}
      <HeroRow>
        <HeroLeft>
          <HeroBadge>🏆 XCPC 模拟游戏</HeroBadge>
          <HeroTitle>ACMer 选手模拟器</HeroTitle>
          <HeroTagline>模拟一名 XCPC 竞赛选手完整的四年大学生涯</HeroTagline>
          <HeroDesc>
            你是一名计算机专业的大一新生，怀揣着成为顶尖程序设计竞赛选手的梦想。
            在四年里，合理分配时间，平衡学业、竞赛与生活，走向属于你的终点。
          </HeroDesc>
        </HeroLeft>
        <HeroStats>
          <StatCard>
            <StatIcon>📅</StatIcon>
            <StatNum>48</StatNum>
            <StatLabel>游戏月份</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon>🏅</StatIcon>
            <StatNum>10+</StatNum>
            <StatLabel>赛事类型</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon>🎭</StatIcon>
            <StatNum>{traitCount}</StatNum>
            <StatLabel>可选特性</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon>⚡</StatIcon>
            <StatNum>AP</StatNum>
            <StatLabel>行动资源</StatLabel>
          </StatCard>
        </HeroStats>
      </HeroRow>

      {/* Feature cards */}
      <FeatureGrid>
        <FeatureCard>
          <FeatureIcon>🎭</FeatureIcon>
          <FeatureTitle>选择特性</FeatureTitle>
          <FeatureDesc>消耗或获得特性点，塑造你的初始能力与风格</FeatureDesc>
        </FeatureCard>
        <FeatureCard>
          <FeatureIcon>⚡</FeatureIcon>
          <FeatureTitle>管理行动点</FeatureTitle>
          <FeatureDesc>每月合理分配 AP，在练习、学习、休息之间取舍</FeatureDesc>
        </FeatureCard>
        <FeatureCard>
          <FeatureIcon>🏆</FeatureIcon>
          <FeatureTitle>参加比赛</FeatureTitle>
          <FeatureDesc>参加各类编程竞赛，提升 Rating，争夺金牌</FeatureDesc>
        </FeatureCard>
        <FeatureCard>
          <FeatureIcon>⚖️</FeatureIcon>
          <FeatureTitle>平衡生活</FeatureTitle>
          <FeatureDesc>保持 GPA 和 SAN 值，避免退学或心理崩溃</FeatureDesc>
        </FeatureCard>
      </FeatureGrid>

      {/* Tips + CTA */}
      <BottomRow>
        <TipsCard>
          <TipsTitle>⚡ 关键提示</TipsTitle>
          <TipsList>
            <TipsItem>每场比赛都要权衡收益与风险</TipsItem>
            <TipsItem>GPA 过低可能导致退学</TipsItem>
            <TipsItem>保持 SAN 值，心理崩溃影响发挥</TipsItem>
            <TipsItem>善用队友，团队协作提升成绩</TipsItem>
          </TipsList>
        </TipsCard>
        <CtaBlock>
          <IntroStartButton variant="primary" size="lg" onClick={onStart}>
            🚀 开始我的ACM之旅
          </IntroStartButton>
          <CtaHint>4年 · 48个月 · 无数可能</CtaHint>
        </CtaBlock>
      </BottomRow>
    </IntroPanelWrapper>
  );
}

export default IntroPanel;

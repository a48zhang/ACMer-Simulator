import styled from 'styled-components';
import { Button } from '../common/Button';

const IntroPanelWrapper = styled.section`
  width: min(920px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  justify-content: center;
`;

const HeroPrimary = styled.div`
  position: relative;
  overflow: hidden;
  padding: clamp(1.15rem, 2.6vw, 2rem);
  border-radius: 24px;
  background:
    linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92)),
    ${props => props.theme.colors.surface};
  color: #f8fafc;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.22);
  display: flex;
  min-height: 0;

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
  gap: 0.95rem;
  justify-content: space-between;
  min-height: 0;
  flex: 1;
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  width: fit-content;
  padding: 0.35rem 0.72rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.16);
  color: #bfdbfe;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const HeroTitle = styled.h1`
  font-size: clamp(1.55rem, 3vw, 2.4rem);
  line-height: 1.08;
  letter-spacing: -0.025em;
  max-width: 15ch;
  text-wrap: balance;
`;

const HeroDescription = styled.p`
  max-width: 52ch;
  color: rgba(226, 232, 240, 0.88);
  font-size: 0.94rem;
  line-height: 1.55;
`;

const HeroMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.6rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div`
  padding: 0.75rem 0.85rem;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.28);
  border: 1px solid rgba(148, 163, 184, 0.16);
  backdrop-filter: blur(10px);
`;

const MetricValue = styled.div`
  font-size: 1.2rem;
  font-weight: 800;
  color: #f8fafc;
`;

const MetricLabel = styled.div`
  margin-top: 0.15rem;
  color: rgba(191, 219, 254, 0.88);
  font-size: 0.72rem;
`;

const HeroActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const IntroStartButton = styled(Button)`
  min-width: 200px;
  padding: 0.9rem 1.4rem;
  border-radius: 16px;
  font-size: 0.95rem;
  font-weight: 700;
  box-shadow: 0 18px 40px rgba(37, 99, 235, 0.3);
`;

const ActionHint = styled.p`
  color: rgba(226, 232, 240, 0.72);
  font-size: 0.82rem;
`;

const heroMetrics = [
  { value: '48 个月', label: '从入学打到毕业前' },
  { value: '每月 AP', label: '时间不够用才是常态' },
  { value: 'GPA / SAN', label: '两个都不能先崩' }
];

interface IntroPanelProps {
  onStart: () => void;
}

function IntroPanel({ onStart }: IntroPanelProps) {
  return (
    <IntroPanelWrapper>
      <HeroPrimary>
        <HeroContent>
          <Eyebrow>XCPC Simulator</Eyebrow>
          <HeroTitle>比赛、补题、考试周，这四年一起上。</HeroTitle>
          <HeroDescription>
            从大一打到毕业。
            队要组，题要补，课不能彻底寄，心态也别先炸。
            最后能打到哪，看你自己。
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
              开始这四年
            </IntroStartButton>
            <ActionHint>先选天赋。</ActionHint>
          </HeroActions>
        </HeroContent>
      </HeroPrimary>
    </IntroPanelWrapper>
  );
}

export default IntroPanel;

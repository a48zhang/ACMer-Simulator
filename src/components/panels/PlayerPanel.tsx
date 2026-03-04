import { memo, useMemo } from 'react';
import styled from 'styled-components';
import { Button } from '../common/Button';
import type { Attributes, Buffs } from '../../types';

const PlayerPanelWrapper = styled.aside`
  width: 280px;
  background: linear-gradient(180deg, ${props => props.theme.colors.surface} 0%, #f8fafc 100%);
  border-right: 1px solid ${props => props.theme.colors.border};
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  color: ${props => props.theme.colors.textMain};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 240px;
  }

  @media (max-width: 480px) {
    width: 100%;
    max-width: none;
    border-right: none;
    border-bottom: 1px solid ${props => props.theme.colors.border};
    height: 50vh;
  }
`;

const PanelContent = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  flex: 1;
`;

const PanelSection = styled.div``;

const PanelTitle = styled.h3`
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.625rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const PanelTitleLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    width: 3px;
    height: 12px;
    background: linear-gradient(180deg, ${props => props.theme.colors.primary} 0%, #8b5cf6 100%);
    border-radius: 2px;
    flex-shrink: 0;
  }
`;

const ResetButton = styled(Button)`
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
`;

const StatusCards = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.625rem;
`;

const StatusCard = styled.div<{ $accentColor?: string }>`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
  padding: 0.75rem;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background: ${props => props.$accentColor || props.theme.colors.primary};
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover {
    border-color: ${props => props.$accentColor || props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);

    &::before {
      opacity: 1;
    }
  }
`;

const StatusIcon = styled.div`
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
`;

const StatusLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.125rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatusValue = styled.div<{ $color?: string }>`
  font-weight: 800;
  font-size: 1.125rem;
  color: ${props => props.$color || props.theme.colors.textMain};
  line-height: 1.1;
  letter-spacing: -0.02em;
`;

const BuffsDisplay = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
`;

const BuffItem = styled.span<{ $warning?: boolean; $danger?: boolean }>`
  font-size: 0.75rem;
  padding: 0.375rem 0.625rem;
  border-radius: ${props => props.theme.radius.md};
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;

  ${props => props.$warning && `
    color: #d97706;
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border: 1px solid #fcd34d;
  `}

  ${props => props.$danger && `
    color: #dc2626;
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    border: 1px solid #fca5a5;
  `}
`;

const AttrCategory = styled.div`
  margin-bottom: 1rem;
  flex-shrink: 0;
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const CategoryLabel = styled.div`
  font-size: 0.65rem;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
  padding-left: 4px;
`;

const AttrGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
`;

const AttrCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  padding: 0.625rem;
  transition: all 0.2s ease;

  &:hover {
    background: #fafbff;
    border-color: #c7d2fe;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
  }
`;

const AttrHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.375rem;
  gap: 0.375rem;
`;

const AttrLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AttrValueText = styled.span`
  font-size: 0.875rem;
  font-weight: 800;
  color: ${props => props.theme.colors.textMain};
  line-height: 1;
  font-variant-numeric: tabular-nums;
`;

const AttrProgressBg = styled.div`
  height: 5px;
  background: ${props => props.theme.colors.border};
  border-radius: 3px;
  overflow: hidden;
`;

const AttrProgressFill = styled.div<{ $width: number; $primary?: boolean; $secondary?: boolean; $gradient?: boolean }>`
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  width: ${props => props.$width}%;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  ${props => props.$primary && !props.$gradient && `
    background: linear-gradient(90deg, ${props.theme.colors.primary} 0%, #818cf8 100%);
  `}

  ${props => props.$secondary && !props.$gradient && `
    background: linear-gradient(90deg, ${props.theme.colors.secondary} 0%, #34d399 100%);
  `}

  ${props => props.$primary && props.$gradient && `
    background: linear-gradient(90deg, ${props.theme.colors.primary} 0%, #818cf8 50%, #f59e0b 100%);
  `}

  ${props => props.$secondary && props.$gradient && `
    background: linear-gradient(90deg, ${props.theme.colors.secondary} 0%, #34d399 50%, #f59e0b 100%);
  `}
`;

interface AttributeCardProps {
  name: string;
  short: string;
  value: number;
  isPrimary: boolean;
}

// 独立的属性卡片组件，使用 memo 包装
const AttributeCard = memo(function AttributeCard({ name, short, value, isPrimary }: AttributeCardProps) {
  return (
    <AttrCard>
      <AttrHeader>
        <AttrLabel title={name}>{short}</AttrLabel>
        <AttrValueText>{value}</AttrValueText>
      </AttrHeader>
      <AttrProgressBg>
        <AttrProgressFill
          $primary={isPrimary}
          $secondary={!isPrimary}
          $width={Math.min(value * 10, 100)}
          $gradient={value > 10}
        />
      </AttrProgressBg>
    </AttrCard>
  );
});

AttributeCard.displayName = 'AttributeCard';

interface StatusCardItemProps {
  icon: string;
  label: string;
  value: string | number;
  accentColor?: string;
  valueColor?: string;
}

// 独立的状态卡片组件，使用 memo 包装
const StatusCardItem = memo(function StatusCardItem({ icon, label, value, accentColor, valueColor }: StatusCardItemProps) {
  return (
    <StatusCard $accentColor={accentColor}>
      <StatusIcon>{icon}</StatusIcon>
      <StatusLabel>{label}</StatusLabel>
      <StatusValue $color={valueColor}>{value}</StatusValue>
    </StatusCard>
  );
});

StatusCardItem.displayName = 'StatusCardItem';

interface PlayerPanelProps {
  attributes: Attributes;
  balance: number;
  remainingAP: number;
  monthlyAP: number;
  san: number;
  rating: number;
  gpa: number;
  buffs: Buffs;
  onReset: () => void;
}

function PlayerPanel({
  attributes,
  balance,
  san,
  rating,
  gpa,
  buffs,
  onReset
}: PlayerPanelProps) {
  // 缓存属性列表
  const generalAttributes = useMemo(() => [
    { key: 'coding', name: '💻 编程', short: '编程' },
    { key: 'algorithm', name: '🧠 思维', short: '思维' },
    { key: 'speed', name: '🏃 速度', short: '速度' },
    { key: 'stress', name: '🧘 抗压', short: '抗压' }
  ], []);

  const specializedAttributes = useMemo(() => [
    { key: 'math', name: '📐 数学', short: '数学' },
    { key: 'dp', name: '🔄 DP', short: 'DP' },
    { key: 'graph', name: '🕸️ 图论', short: '图论' },
    { key: 'dataStructure', name: '🗂️ 数据结构', short: '数据' },
    { key: 'string', name: '🔤 字符串', short: '字符串' },
    { key: 'search', name: '🔍 搜索', short: '搜索' },
    { key: 'greedy', name: '💡 贪心', short: '贪心' },
    { key: 'geometry', name: '📏 几何', short: '几何' }
  ], []);

  // 缓存颜色计算
  const colors = useMemo(() => {
    const getSanColor = (value: number) => {
      if (value >= 70) return '#059669';
      if (value >= 40) return '#d97706';
      return '#dc2626';
    };

    const getGpaColor = (value: number) => {
      if (value >= 3.5) return '#059669';
      if (value >= 2.5) return '#d97706';
      return '#dc2626';
    };

    const getRatingAccent = (value: number) => {
      if (value >= 2400) return '#f59e0b';
      if (value >= 2100) return '#ec4899';
      if (value >= 1900) return '#8b5cf6';
      if (value >= 1600) return '#3b82f6';
      if (value >= 1400) return '#10b981';
      return '#6b7280';
    };

    return {
      sanColor: getSanColor(san),
      gpaColor: getGpaColor(gpa),
      ratingAccent: getRatingAccent(rating)
    };
  }, [san, gpa, rating]);

  // 缓存 buffs 显示条件
  const shouldShowBuffs = useMemo(() => {
    return buffs && (buffs.failedCourses > 0 || buffs.academicWarnings > 0);
  }, [buffs]);

  return (
    <PlayerPanelWrapper>
      <PanelContent>
        <PanelSection>
          <PanelTitle>
            <PanelTitleLeft>我的状态</PanelTitleLeft>
            <ResetButton variant="danger" size="sm" onClick={onReset}>
              退学重开
            </ResetButton>
          </PanelTitle>
          <StatusCards>
            <StatusCardItem
              icon="💰"
              label="余额"
              value={`¥${balance}`}
              accentColor="#f59e0b"
            />
            <StatusCardItem
              icon="💊"
              label="SAN值"
              value={san}
              accentColor={colors.sanColor}
              valueColor={colors.sanColor}
            />
            <StatusCardItem
              icon="🏆"
              label="Rating"
              value={rating}
              accentColor={colors.ratingAccent}
              valueColor={colors.ratingAccent}
            />
            <StatusCardItem
              icon="📚"
              label="GPA"
              value={gpa.toFixed(2)}
              accentColor={colors.gpaColor}
              valueColor={colors.gpaColor}
            />
          </StatusCards>
          {shouldShowBuffs && (
            <BuffsDisplay>
              {buffs.failedCourses > 0 && (
                <BuffItem $warning>📉 挂科×{buffs.failedCourses}</BuffItem>
              )}
              {buffs.academicWarnings > 0 && (
                <BuffItem $danger>⚠️ 学业警告×{buffs.academicWarnings}</BuffItem>
              )}
            </BuffsDisplay>
          )}
        </PanelSection>

        <PanelSection>
          <PanelTitle>
            <PanelTitleLeft>我的属性</PanelTitleLeft>
          </PanelTitle>

          <AttrCategory>
            <CategoryHeader>
              <CategoryLabel>通用能力</CategoryLabel>
            </CategoryHeader>
            <AttrGrid>
              {generalAttributes.map(({ key, name, short }) => (
                <AttributeCard
                  key={key}
                  name={name}
                  short={short}
                  value={attributes[key as keyof Attributes]}
                  isPrimary={true}
                />
              ))}
            </AttrGrid>
          </AttrCategory>

          <AttrCategory>
            <CategoryHeader>
              <CategoryLabel>专业知识</CategoryLabel>
            </CategoryHeader>
            <AttrGrid>
              {specializedAttributes.map(({ key, name, short }) => (
                <AttributeCard
                  key={key}
                  name={name}
                  short={short}
                  value={attributes[key as keyof Attributes]}
                  isPrimary={false}
                />
              ))}
            </AttrGrid>
          </AttrCategory>
        </PanelSection>
      </PanelContent>
    </PlayerPanelWrapper>
  );
}

export default memo(PlayerPanel);

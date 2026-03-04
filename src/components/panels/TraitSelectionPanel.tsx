import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Button } from '../common/Button';
import { TRAITS, TRAIT_TYPES, INITIAL_TRAIT_POINTS, calculateTraitCost, isTraitSelectionValid } from '../../data/traits';

// 动画
const floatIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) rotateX(-10deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
`;

const TraitPanelWrapper = styled.section`
  width: 100%;
  max-width: 1200px;
  padding: 1rem;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 100%;
  height: auto;
  min-height: min-content;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 60%);
    pointer-events: none;
    z-index: -1;
  }
`;

const TraitPanelContainer = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  animation: ${floatIn} 0.8s ease-out;
`;

const StatusBar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1.25rem 1.5rem;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.xl};
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.shadows.lg};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary}, ${props => props.theme.colors.warning});
  }
`;

const HeaderContent = styled.div`
  text-align: center;
`;

const TitleDecoration = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.35rem;

  &::before,
  &::after {
    content: '';
    height: 2px;
    width: 50px;
    background: linear-gradient(90deg, transparent, ${props => props.theme.colors.primary}, transparent);
  }
`;

const TraitPanelTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const TraitPanelSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  margin: 0.25rem 0 0 0;
  font-weight: 500;
`;

const StatusContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const TpBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radius.lg};
  min-width: 75px;
  position: relative;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const TpLabel = styled.span`
  font-size: 0.7rem;
  color: ${props => props.theme.colors.textSecondary};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TpValue = styled.span<{ $consumed?: boolean; $negative?: boolean; $positive?: boolean }>`
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
  color: ${props => props.theme.colors.textMain};

  ${props => props.$consumed && `
    color: ${props.theme.colors.warning};
  `}

  ${props => props.$negative && `
    color: ${props.theme.colors.danger};
  `}

  ${props => props.$positive && `
    color: ${props.theme.colors.secondary};
  `}
`;

const TpArrow = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textTertiary};
`;

const ActionButtonWrapper = styled.div`
  margin-left: 0.75rem;
  padding-left: 1rem;
  border-left: 2px solid ${props => props.theme.colors.border};

  @media (max-width: 768px) {
    margin-left: 0;
    padding-left: 0;
    border-left: none;
    width: 100%;
    margin-top: 0.5rem;
  }
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const TraitCategory = styled.div`
  display: flex;
  flex-direction: column;
`;

const CategoryHeader = styled.div<{ $negative?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${props => props.$negative ? props.theme.colors.warning : props.theme.colors.primary};
`;

const CategoryIcon = styled.span<{ $negative?: boolean }>`
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: ${props => props.$negative ? 'rgba(245, 158, 11, 0.15)' : 'rgba(99, 102, 241, 0.15)'};
`;

const CategoryTitle = styled.h2<{ $negative?: boolean }>`
  font-size: 1.15rem;
  font-weight: 700;
  color: ${props => props.$negative ? props.theme.colors.warning : props.theme.colors.primary};
  margin: 0;
  flex: 1;
`;

const CategoryHint = styled.span<{ $negative?: boolean }>`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: ${props => props.$negative ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)'};
  color: ${props => props.$negative ? props.theme.colors.warning : props.theme.colors.primary};
`;

const TraitGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.6rem;
  flex: 1;
`;

const TraitCard = styled.div<{ $selected?: boolean; $negative?: boolean }>`
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
  padding: 0.75rem 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  background: ${props => props.theme.colors.surface};

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.sm};
    border-color: ${props => props.$negative ? props.theme.colors.warning : props.theme.colors.primary};
  }

  /* Selected state */
  border-color: ${props => props.$selected
    ? (props.$negative ? props.theme.colors.warning : props.theme.colors.primary)
    : props.theme.colors.border};
  background: ${props => props.$selected
    ? (props.$negative ? 'rgba(245, 158, 11, 0.06)' : 'rgba(99, 102, 241, 0.06)')
    : props.theme.colors.surface};
  box-shadow: ${props => props.$selected
    ? (props.$negative ? '0 0 0 2px rgba(245, 158, 11, 0.2)' : '0 0 0 2px rgba(99, 102, 241, 0.2)')
    : 'none'};
`;

const TraitCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
`;

const TraitName = styled.span`
  font-weight: 700;
  font-size: 0.95rem;
  color: ${props => props.theme.colors.textMain};
  line-height: 1.2;
`;

const TraitCost = styled.span<{ $negative?: boolean }>`
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  background: ${props => props.$negative ? 'rgba(245, 158, 11, 0.15)' : 'rgba(99, 102, 241, 0.12)'};
  color: ${props => props.$negative ? props.theme.colors.warning : props.theme.colors.primary};
  white-space: nowrap;
  flex-shrink: 0;
`;

const TraitDesc = styled.div`
  font-size: 0.82rem;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.4;
`;

const SelectedBadge = styled.div<{ $negative?: boolean }>`
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  background: ${props => props.$negative ? props.theme.colors.warning : props.theme.colors.primary};
  color: white;
  font-size: 0.65rem;
  padding: 0.12rem 0.35rem;
  border-radius: 5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

interface TraitSelectionPanelProps {
  onConfirm: (selectedTraits: string[]) => void;
}

function TraitSelectionPanel({ onConfirm }: TraitSelectionPanelProps) {
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);

  const traitCost = calculateTraitCost(selectedTraits);
  const remainingTP = INITIAL_TRAIT_POINTS - traitCost;
  const canStart = isTraitSelectionValid(selectedTraits);

  const positiveTraits = TRAITS.filter(t => t.type === TRAIT_TYPES.POSITIVE);
  const negativeTraits = TRAITS.filter(t => t.type === TRAIT_TYPES.NEGATIVE);

  const toggleTrait = (traitId: string) => {
    setSelectedTraits(prev => {
      if (prev.includes(traitId)) {
        return prev.filter(id => id !== traitId);
      } else {
        return [...prev, traitId];
      }
    });
  };

  const handleConfirm = () => {
    if (canStart) {
      onConfirm(selectedTraits);
    }
  };

  return (
    <TraitPanelWrapper>
      <TraitPanelContainer>
        <StatusBar>
          <HeaderContent>
            <TitleDecoration>
              <TraitPanelTitle>🎭 选择你的特性</TraitPanelTitle>
            </TitleDecoration>
            <TraitPanelSubtitle>选择正面特性消耗特性点，选择负面特性获得特性点</TraitPanelSubtitle>
          </HeaderContent>

          <StatusContent>
            <TpBox>
              <TpLabel>初始 TP</TpLabel>
              <TpValue>{INITIAL_TRAIT_POINTS}</TpValue>
            </TpBox>
            <TpArrow>→</TpArrow>
            <TpBox>
              <TpLabel>已消耗</TpLabel>
              <TpValue $consumed={traitCost > 0}>
                {traitCost > 0 ? `-${traitCost}` : traitCost < 0 ? `+${-traitCost}` : '0'}
              </TpValue>
            </TpBox>
            <TpArrow>=</TpArrow>
            <TpBox>
              <TpLabel>剩余</TpLabel>
              <TpValue $negative={remainingTP < 0} $positive={remainingTP >= 0}>
                {remainingTP}
              </TpValue>
            </TpBox>

            <ActionButtonWrapper>
              <Button
                variant="primary"
                size="lg"
                onClick={handleConfirm}
                disabled={!canStart}
              >
                {!canStart
                  ? `特性点不足！还需要 ${-remainingTP} TP`
                  : '🚀 开始游戏'}
              </Button>
            </ActionButtonWrapper>
          </StatusContent>
        </StatusBar>

        <ContentWrapper>
          <TraitCategory>
            <CategoryHeader>
              <CategoryIcon>✨</CategoryIcon>
              <CategoryTitle>正面特性</CategoryTitle>
              <CategoryHint>消耗 TP</CategoryHint>
            </CategoryHeader>
            <TraitGrid>
              {positiveTraits.map((trait, index) => {
                const isSelected = selectedTraits.includes(trait.id);
                return (
                  <TraitCard
                    key={trait.id}
                    $selected={isSelected}
                    onClick={() => toggleTrait(trait.id)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <TraitCardHeader>
                      <TraitName>{trait.name}</TraitName>
                      <TraitCost>-{trait.cost}</TraitCost>
                    </TraitCardHeader>
                    <TraitDesc>{trait.description}</TraitDesc>
                    {isSelected && <SelectedBadge>✓ 已选</SelectedBadge>}
                  </TraitCard>
                );
              })}
            </TraitGrid>
          </TraitCategory>

          <TraitCategory>
            <CategoryHeader $negative>
              <CategoryIcon $negative>⚠️</CategoryIcon>
              <CategoryTitle $negative>负面特性</CategoryTitle>
              <CategoryHint $negative>获得 TP</CategoryHint>
            </CategoryHeader>
            <TraitGrid>
              {negativeTraits.map((trait, index) => {
                const isSelected = selectedTraits.includes(trait.id);
                return (
                  <TraitCard
                    key={trait.id}
                    $selected={isSelected}
                    $negative
                    onClick={() => toggleTrait(trait.id)}
                    style={{ animationDelay: `${(positiveTraits.length + index) * 0.05}s` }}
                  >
                    <TraitCardHeader>
                      <TraitName>{trait.name}</TraitName>
                      <TraitCost $negative>+{-trait.cost}</TraitCost>
                    </TraitCardHeader>
                    <TraitDesc>{trait.description}</TraitDesc>
                    {isSelected && <SelectedBadge $negative>✓ 已选</SelectedBadge>}
                  </TraitCard>
                );
              })}
            </TraitGrid>
          </TraitCategory>
        </ContentWrapper>
      </TraitPanelContainer>
    </TraitPanelWrapper>
  );
}

export default TraitSelectionPanel;

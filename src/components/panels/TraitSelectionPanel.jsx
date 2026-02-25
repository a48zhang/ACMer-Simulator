import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../common/Button';
import { TRAITS, TRAIT_TYPES, INITIAL_TRAIT_POINTS, calculateTraitCost, isTraitSelectionValid } from '../../data/traits';

const TraitPanelWrapper = styled.section`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const TraitPanelHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const TraitPanelTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textMain};
  margin-bottom: 0.5rem;
`;

const TraitPanelSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1rem;
`;

const TraitPanelStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.lg};
  border: 1px solid ${props => props.theme.colors.border};
`;

const TpBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radius.md};
`;

const TpLabel = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  font-weight: 500;
`;

const TpValue = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
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
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textSecondary};
`;

const TraitPanelContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const TraitCategory = styled.div``;

const CategoryTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textMain};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => props.$negative && `
    color: ${props.theme.colors.danger};
  `}
`;

const CategoryIcon = styled.span`
  font-size: 1.25rem;
`;

const CategoryHint = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textSecondary};
  margin-left: auto;
`;

const TraitGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.75rem;
`;

const TraitCard = styled.div`
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  background: ${props => props.theme.colors.surface};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  ${props => props.$selected && `
    border-color: ${props.theme.colors.primary};
    background: rgba(99, 102, 241, 0.05);
  `}

  ${props => props.$negative && `
    border-color: #fed7aa;

    &:hover {
      border-color: ${props.theme.colors.warning};
    }

    ${props.$selected && `
      border-color: ${props.theme.colors.warning};
      background: rgba(245, 158, 11, 0.05);
    `}
  `}
`;

const TraitCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const TraitName = styled.span`
  font-weight: 600;
  font-size: 0.9375rem;
  color: ${props => props.theme.colors.textMain};
`;

const TraitCost = styled.span`
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.background};
`;

const TraitDesc = styled.div`
  font-size: 0.8125rem;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.4;
`;

const TraitCheck = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: ${props => props.theme.radius.md};
  font-weight: 600;
`;

const TraitPanelFooter = styled.div`
  text-align: center;
`;

function TraitSelectionPanel({ onConfirm }) {
  const [selectedTraits, setSelectedTraits] = useState([]);
  
  const traitCost = calculateTraitCost(selectedTraits);
  const remainingTP = INITIAL_TRAIT_POINTS - traitCost;
  const canStart = isTraitSelectionValid(selectedTraits);

  const positiveTraits = TRAITS.filter(t => t.type === TRAIT_TYPES.POSITIVE);
  const negativeTraits = TRAITS.filter(t => t.type === TRAIT_TYPES.NEGATIVE);

  const toggleTrait = (traitId) => {
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
      <TraitPanelHeader>
        <TraitPanelTitle>🎭 选择你的特性</TraitPanelTitle>
        <TraitPanelSubtitle>选择正面特性消耗特性点，选择负面特性获得特性点</TraitPanelSubtitle>
      </TraitPanelHeader>
      
      <TraitPanelStatus>
        <TpBox>
          <TpLabel>初始TP</TpLabel>
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
      </TraitPanelStatus>

      <TraitPanelContent>
        <TraitCategory>
          <CategoryTitle>
            <CategoryIcon>✨</CategoryIcon>
            正面特性
            <CategoryHint>(消耗TP)</CategoryHint>
          </CategoryTitle>
          <TraitGrid>
            {positiveTraits.map(trait => {
              const isSelected = selectedTraits.includes(trait.id);
              return (
                <TraitCard
                  key={trait.id}
                  $selected={isSelected}
                  onClick={() => toggleTrait(trait.id)}
                >
                  <TraitCardHeader>
                    <TraitName>{trait.name}</TraitName>
                    <TraitCost>-{trait.cost}</TraitCost>
                  </TraitCardHeader>
                  <TraitDesc>{trait.description}</TraitDesc>
                  {isSelected && <TraitCheck>✓</TraitCheck>}
                </TraitCard>
              );
            })}
          </TraitGrid>
        </TraitCategory>

        <TraitCategory>
          <CategoryTitle $negative>
            <CategoryIcon>⚠️</CategoryIcon>
            负面特性
            <CategoryHint>(获得TP)</CategoryHint>
          </CategoryTitle>
          <TraitGrid>
            {negativeTraits.map(trait => {
              const isSelected = selectedTraits.includes(trait.id);
              return (
                <TraitCard
                  key={trait.id}
                  $selected={isSelected}
                  $negative
                  onClick={() => toggleTrait(trait.id)}
                >
                  <TraitCardHeader>
                    <TraitName>{trait.name}</TraitName>
                    <TraitCost>+{-trait.cost}</TraitCost>
                  </TraitCardHeader>
                  <TraitDesc>{trait.description}</TraitDesc>
                  {isSelected && <TraitCheck>✓</TraitCheck>}
                </TraitCard>
              );
            })}
          </TraitGrid>
        </TraitCategory>
      </TraitPanelContent>

      <TraitPanelFooter>
        <Button 
          variant="primary" 
          size="lg"
          onClick={handleConfirm}
          disabled={!canStart}
        >
          {!canStart 
            ? `特性点不足！还需要 ${-remainingTP} TP` 
            : '🚀 确认并开始游戏'}
        </Button>
      </TraitPanelFooter>
    </TraitPanelWrapper>
  );
}

export default TraitSelectionPanel;

import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../common/Button';
import { TRAITS, TRAIT_TYPES, INITIAL_TRAIT_POINTS, calculateTraitCost, isTraitSelectionValid } from '../../data/traits';

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DialogBox = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.lg};
  padding: 1.5rem;
  box-shadow: ${props => props.theme.shadows.lg};
  border: 1px solid ${props => props.theme.colors.border};
  max-width: 700px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 1.25rem;
    max-width: 95%;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    max-width: 98%;
  }
`;

const DialogTitle = styled.h2`
  font-size: 1.375rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textMain};
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }

  @media (max-width: 480px) {
    font-size: 1.125rem;
  }
`;

const DialogSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 1.5rem;
  font-size: 0.9375rem;
`;

const DialogPoints = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radius.md};
`;

const TpInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const PointsCount = styled.span<{ $consumed?: boolean; $gained?: boolean; $negative?: boolean; $positive?: boolean }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};

  ${props => props.$consumed && `
    color: ${props.theme.colors.warning};
  `}

  ${props => props.$gained && `
    color: ${props.theme.colors.secondary};
  `}

  ${props => props.$negative && `
    color: ${props.theme.colors.danger};
  `}

  ${props => props.$positive && `
    color: ${props.theme.colors.secondary};
  `}
`;

const DialogContent = styled.div`
  margin-bottom: 1.5rem;
`;

const DialogCategory = styled.div`
  margin-bottom: 1.5rem;
`;

const CategoryTitle = styled.h3<{ $positive?: boolean; $negative?: boolean }>`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textMain};
  margin-bottom: 0.75rem;

  ${props => props.$positive && `
    color: ${props.theme.colors.secondary};
  `}

  ${props => props.$negative && `
    color: ${props.theme.colors.warning};
  `}
`;

const TraitList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 0.625rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const TraitCard = styled.div<{ $selected?: boolean; $positive?: boolean; $negative?: boolean }>`
  background: ${props => props.theme.colors.background};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  @media (max-width: 768px) {
    padding: 0.875rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
  }

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }

  ${props => props.$selected && `
    border-color: ${props.theme.colors.primary};
    background: rgba(99, 102, 241, 0.05);
  `}
`;

const TraitHeader = styled.div`
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
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: ${props => props.theme.radius.sm};
`;

const TraitDescription = styled.div`
  font-size: 0.8125rem;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.5;
`;

const TraitSelectedBadge = styled.div<{ $positive?: boolean; $negative?: boolean }>`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin-top: 0.5rem;

  ${props => props.$positive && `
    color: ${props.theme.colors.secondary};
  `}

  ${props => props.$negative && `
    color: ${props.theme.colors.warning};
  `}
`;

const DialogFooter = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

const DialogConfirmBtn = styled(Button)`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
`;

interface TraitSelectionDialogProps {
  onConfirm: (selectedTraitIds: string[]) => void;
}

function TraitSelectionDialog({ onConfirm }: TraitSelectionDialogProps) {
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
    <DialogOverlay>
      <DialogBox>
        <DialogTitle>🎭 选择你的特性</DialogTitle>
        <DialogSubtitle>选择正面特性会消耗特性点，选择负面特性会增加特性点</DialogSubtitle>
        
        <DialogPoints>
          <TpInfo>
            <span>初始特性点 (TP):</span>
            <PointsCount>{INITIAL_TRAIT_POINTS}</PointsCount>
          </TpInfo>
          <TpInfo>
            <span>已消耗:</span>
            <PointsCount
              $consumed={traitCost > 0}
              $gained={traitCost < 0}
            >
              {traitCost > 0 ? `-${traitCost}` : traitCost < 0 ? `+${-traitCost}` : '0'}
            </PointsCount>
          </TpInfo>
          <TpInfo>
            <span>剩余:</span>
            <PointsCount
              $negative={remainingTP < 0}
              $positive={remainingTP >= 0}
            >
              {remainingTP}
            </PointsCount>
          </TpInfo>
        </DialogPoints>

        <DialogContent>
          <DialogCategory>
            <CategoryTitle $positive>✨ 正面特性 (消耗TP)</CategoryTitle>
            <TraitList>
              {positiveTraits.map(trait => {
                const isSelected = selectedTraits.includes(trait.id);
                return (
                  <TraitCard
                    key={trait.id}
                    $selected={isSelected}
                    $positive
                    onClick={() => toggleTrait(trait.id)}
                  >
                    <TraitHeader>
                      <TraitName>{trait.name}</TraitName>
                      <TraitCost>-{trait.cost} TP</TraitCost>
                    </TraitHeader>
                    <TraitDescription>{trait.description}</TraitDescription>
                    {isSelected && <TraitSelectedBadge $positive>✓ 已选择</TraitSelectedBadge>}
                  </TraitCard>
                );
              })}
            </TraitList>
          </DialogCategory>

          <DialogCategory>
            <CategoryTitle $negative>⚠️ 负面特性 (获得TP)</CategoryTitle>
            <TraitList>
              {negativeTraits.map(trait => {
                const isSelected = selectedTraits.includes(trait.id);
                return (
                  <TraitCard
                    key={trait.id}
                    $selected={isSelected}
                    $negative
                    onClick={() => toggleTrait(trait.id)}
                  >
                    <TraitHeader>
                      <TraitName>{trait.name}</TraitName>
                      <TraitCost>+{-trait.cost} TP</TraitCost>
                    </TraitHeader>
                    <TraitDescription>{trait.description}</TraitDescription>
                    {isSelected && <TraitSelectedBadge $negative>✓ 已选择</TraitSelectedBadge>}
                  </TraitCard>
                );
              })}
            </TraitList>
          </DialogCategory>
        </DialogContent>

        <DialogFooter>
          <DialogConfirmBtn
            variant="primary"
            onClick={handleConfirm}
            disabled={!canStart}
          >
            {!canStart 
              ? `特性点不足！还需要 ${-remainingTP} TP` 
              : '确认并开始游戏'}
          </DialogConfirmBtn>
        </DialogFooter>
      </DialogBox>
    </DialogOverlay>
  );
}

export default TraitSelectionDialog;

import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../common/Button';
import type { Teammate } from '../../types';

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
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const DialogTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textMain};
  margin-bottom: 0.5rem;
`;

const DialogSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 1.5rem;
  font-size: 0.9375rem;
`;

const TeammateSelection = styled.div``;

const SelectionStatus = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radius.md};
  display: inline-block;
`;

const TeammateList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const TeammateCard = styled.div<{ $selected?: boolean }>`
  background: ${props => props.theme.colors.background};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }

  ${props => props.$selected && `
    border-color: ${props.theme.colors.primary};
    background: rgba(99, 102, 241, 0.05);
  `}
`;

const TeammateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const TeammateName = styled.span`
  font-weight: 600;
  font-size: 1rem;
  color: ${props => props.theme.colors.textMain};
`;

const SelectedBadge = styled.span`
  background: ${props => props.theme.colors.primary};
  color: white;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: ${props => props.theme.radius.md};
  font-weight: 600;
`;

const TeammateAttributes = styled.div``;

const AttrSummary = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const AttrItem = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const DialogActions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

interface TeammateSelectionDialogProps {
  teammates: Teammate[];
  onConfirm: (selectedIds: string[]) => void;
  onCancel: () => void;
  contestName?: string;
}

function TeammateSelectionDialog({ teammates, onConfirm, onCancel, contestName }: TeammateSelectionDialogProps) {
  const [selectedTeammates, setSelectedTeammates] = useState<string[]>([]);

  const toggleTeammate = (teammateId: string) => {
    setSelectedTeammates(prev => {
      if (prev.includes(teammateId)) {
        return prev.filter(id => id !== teammateId);
      } else {
        if (prev.length >= 2) {
          return prev;
        }
        return [...prev, teammateId];
      }
    });
  };

  const canConfirm = selectedTeammates.length === 2;

  return (
    <DialogOverlay>
      <DialogBox>
        <DialogTitle>👥 选择队友</DialogTitle>
        <DialogSubtitle>
          {contestName ? `即将参加${contestName}，` : ''}请选择2位队友组队
        </DialogSubtitle>
        
        <TeammateSelection>
          <SelectionStatus>
            已选择: {selectedTeammates.length} / 2
          </SelectionStatus>
          
          <TeammateList>
            {teammates.map(teammate => {
              const isSelected = selectedTeammates.includes(teammate.id);
              return (
                <TeammateCard
                  key={teammate.id}
                  $selected={isSelected}
                  onClick={() => toggleTeammate(teammate.id)}
                >
                  <TeammateHeader>
                    <TeammateName>{teammate.name}</TeammateName>
                    {isSelected && <SelectedBadge>✓</SelectedBadge>}
                  </TeammateHeader>
                  <TeammateAttributes>
                    <AttrSummary>
                      <AttrItem>💻 {teammate.attributes.coding}</AttrItem>
                      <AttrItem>🧠 {teammate.attributes.algorithm}</AttrItem>
                      <AttrItem>🏃 {teammate.attributes.speed}</AttrItem>
                      <AttrItem>🧘 {teammate.attributes.stress}</AttrItem>
                    </AttrSummary>
                  </TeammateAttributes>
                </TeammateCard>
              );
            })}
          </TeammateList>
        </TeammateSelection>

        <DialogActions>
          <Button variant="secondary" onClick={onCancel}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={() => onConfirm(selectedTeammates)}
            disabled={!canConfirm}
          >
            确认组队
          </Button>
        </DialogActions>
      </DialogBox>
    </DialogOverlay>
  );
}

export default TeammateSelectionDialog;

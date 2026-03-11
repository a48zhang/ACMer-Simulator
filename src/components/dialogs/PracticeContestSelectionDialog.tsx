import styled from 'styled-components';
import { Button } from '../common/Button';
import type { PracticeOption } from '../../types';

const DialogOverlay = styled.div`
  position: fixed;
  inset: 0;
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
  max-width: 760px;
  width: 92%;
  max-height: 85vh;
  overflow-y: auto;
`;

const DialogTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textMain};
  margin-bottom: 0.45rem;
`;

const DialogSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 1.2rem;
  font-size: 0.92rem;
  line-height: 1.5;
`;

const UnlockHint = styled.div`
  margin-bottom: 1rem;
  padding: 0.75rem 0.9rem;
  border-radius: ${props => props.theme.radius.md};
  background: rgba(59, 130, 246, 0.08);
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.84rem;
  border: 1px solid rgba(59, 130, 246, 0.18);
`;

const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.95rem;
  margin-bottom: 1.4rem;
`;

const OptionCard = styled.button`
  text-align: left;
  padding: 1rem;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.background};
  cursor: pointer;
  transition: all 0.18s;
  font: inherit;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const OptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.45rem;
`;

const OptionName = styled.div`
  font-weight: 700;
  font-size: 0.95rem;
  color: ${props => props.theme.colors.textMain};
`;

const OptionBadge = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  background: rgba(37, 99, 235, 0.12);
  padding: 0.18rem 0.45rem;
  border-radius: ${props => props.theme.radius.full};
  flex-shrink: 0;
`;

const OptionDescription = styled.div`
  font-size: 0.82rem;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.45;
  margin-bottom: 0.75rem;
`;

const OptionMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
`;

const OptionMode = styled.span`
  color: ${props => props.theme.colors.textSecondary};
`;

const OptionCost = styled.span`
  color: ${props => props.theme.colors.primary};
  font-weight: 700;
`;

const DialogFooter = styled.div`
  display: flex;
  justify-content: flex-end;
`;

interface PracticeContestSelectionDialogProps {
  options: PracticeOption[];
  backlogCount: number;
  onSelect: (option: PracticeOption) => void;
  onCancel: () => void;
}

function PracticeContestSelectionDialog({
  options,
  backlogCount,
  onSelect,
  onCancel
}: PracticeContestSelectionDialogProps) {
  return (
    <DialogOverlay>
      <DialogBox>
        <DialogTitle>📚 选择练习计划</DialogTitle>
        <DialogSubtitle>
          可以做预设题单，也可以回头补最近比赛没做完的题。练习沿用比赛式的读题、思考、写代码、对拍、提交流程。
        </DialogSubtitle>

        <UnlockHint>
          练习中的每道题都可以直接看题解，用来补思路或卡关时兜底。
          {backlogCount > 0 ? ` 当前有 ${backlogCount} 道待补题。` : ' 当前还没有待补的比赛题。'}
        </UnlockHint>

        <OptionGrid>
          {options.map((option) => (
            <OptionCard key={option.id} type="button" onClick={() => onSelect(option)}>
              <OptionHeader>
                <OptionName>{option.name}</OptionName>
                {option.badge && <OptionBadge>{option.badge}</OptionBadge>}
              </OptionHeader>
              <OptionDescription>{option.description}</OptionDescription>
              <OptionMeta>
                <OptionMode>{option.mode === 'upsolve' ? '补题模式' : '题单模式'}</OptionMode>
                <OptionCost>{option.cost} AP</OptionCost>
              </OptionMeta>
            </OptionCard>
          ))}
        </OptionGrid>

        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>
            取消
          </Button>
        </DialogFooter>
      </DialogBox>
    </DialogOverlay>
  );
}

export default PracticeContestSelectionDialog;

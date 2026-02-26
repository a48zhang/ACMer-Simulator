import styled from 'styled-components';
import { Button } from '../common/Button';

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

const ContestGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ContestCard = styled.div`
  padding: 1rem;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.background};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ContestName = styled.div`
  font-weight: 600;
  font-size: 0.9375rem;
  color: ${props => props.theme.colors.textMain};
  margin-bottom: 0.25rem;
`;

const ContestDesc = styled.div`
  font-size: 0.8125rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.5rem;
`;

const ContestCost = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  background: rgba(99, 102, 241, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: ${props => props.theme.radius.sm};
  display: inline-block;
`;

const DialogFooter = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

function PracticeContestSelectionDialog({ onSelect, onCancel }) {
    const contestTypes = [
        {
            id: 'cf_div2',
            name: 'Codeforces Div.2',
            description: '7-8道题目，120分钟，有Rating',
            problemCount: [7, 8],
            durationMinutes: 120,
            difficulties: [1, 2, 3, 5, 7, 8, 10, 10],
            isRated: true,
            ratingSource: 'cf',
            cost: 10
        },
        {
            id: 'cf_div3',
            name: 'Codeforces Div.3',
            description: '6-7道题目，120分钟，有Rating',
            problemCount: [6, 7],
            durationMinutes: 120,
            difficulties: [1, 1, 2, 3, 4, 5, 7],
            isRated: true,
            ratingSource: 'cf',
            cost: 10
        },
        {
            id: 'cf_div4',
            name: 'Codeforces Div.4',
            description: '5-6道题目，90分钟，有Rating',
            problemCount: [5, 6],
            durationMinutes: 90,
            difficulties: [1, 1, 1, 2, 2, 3],
            isRated: true,
            ratingSource: 'cf',
            cost: 8
        },
        {
            id: 'cf_educational',
            name: 'Educational Round',
            description: '6-7道题目，120分钟，有Rating',
            problemCount: [6, 7],
            durationMinutes: 120,
            difficulties: [1, 2, 2, 3, 4, 5, 6],
            isRated: true,
            ratingSource: 'cf',
            cost: 10
        },
        {
            id: 'atcoder_beginner',
            name: 'AtCoder Beginner',
            description: '6道题目，100分钟，有Rating',
            problemCount: 6,
            durationMinutes: 100,
            difficulties: [1, 2, 3, 4, 5, 6],
            isRated: true,
            ratingSource: 'atcoder',
            cost: 10
        },
        {
            id: 'practice_school',
            name: '校内练习赛',
            description: '4-5道题目，120分钟，无Rating',
            problemCount: [4, 5],
            durationMinutes: 120,
            difficulties: [2, 3, 4, 5, 6],
            isRated: false,
            ratingSource: null,
            cost: 8
        }
    ];

    return (
        <DialogOverlay>
            <DialogBox>
                <DialogTitle>🏆 选择练习赛</DialogTitle>
                <DialogSubtitle>选择你要参加的练习赛类型</DialogSubtitle>
                
                <ContestGrid>
                    {contestTypes.map(contest => (
                        <ContestCard
                            key={contest.id}
                            onClick={() => onSelect(contest)}
                        >
                            <ContestName>{contest.name}</ContestName>
                            <ContestDesc>{contest.description}</ContestDesc>
                            <ContestCost>⚡ {contest.cost} AP</ContestCost>
                        </ContestCard>
                    ))}
                </ContestGrid>

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

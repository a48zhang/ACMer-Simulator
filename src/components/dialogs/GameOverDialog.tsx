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
  padding: 2rem;
  box-shadow: ${props => props.theme.shadows.lg};
  border: 1px solid ${props => props.theme.colors.border};
  max-width: 480px;
  width: 90%;
  text-align: center;
`;

const GameOverIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 0.5rem;
`;

const DialogTitle = styled.h3`
  font-size: 1.375rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textMain};
  margin-bottom: 0.75rem;
`;

const DialogMessage = styled.p`
  margin: 0.75rem 0 1.25rem;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.7;
  font-size: 0.95rem;
`;

const ContestResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ResultItem = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radius.md};
  padding: 1rem;
`;

const ResultLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.25rem;
`;

const ResultValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
`;

const DialogActions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
`;

interface GameOverStats {
  playerContests: number;
  playerProblems: number;
  rating: number;
  gpa: number;
}

interface GameOverDialogProps {
  reason: string;
  stats: GameOverStats;
  onRestart: () => void;
}

function GameOverDialog({ reason, stats, onRestart }: GameOverDialogProps) {
    return (
        <DialogOverlay>
            <DialogBox>
                <GameOverIcon>
                    {reason === 'graduation' ? '🎓' : '💀'}
                </GameOverIcon>
                <DialogTitle>
                    {reason === 'graduation' ? '游戏结束 — 毕业！' : '游戏结束 — 退学'}
                </DialogTitle>
                <DialogMessage>
                    {reason === 'graduation'
                        ? '恭喜你完成了四年的ACM旅程！'
                        : reason}
                </DialogMessage>

                <ContestResultGrid>
                    <ResultItem>
                        <ResultLabel>参赛次数</ResultLabel>
                        <ResultValue>{stats.playerContests}</ResultValue>
                    </ResultItem>
                    <ResultItem>
                        <ResultLabel>解题总数</ResultLabel>
                        <ResultValue>{stats.playerProblems}</ResultValue>
                    </ResultItem>
                    <ResultItem>
                        <ResultLabel>最终 Rating</ResultLabel>
                        <ResultValue>{stats.rating}</ResultValue>
                    </ResultItem>
                    <ResultItem>
                        <ResultLabel>最终 GPA</ResultLabel>
                        <ResultValue>{stats.gpa?.toFixed(2)}</ResultValue>
                    </ResultItem>
                </ContestResultGrid>

                <DialogActions>
                    <Button variant="primary" onClick={onRestart}>重新开始</Button>
                </DialogActions>
            </DialogBox>
        </DialogOverlay>
    );
}

export default GameOverDialog;

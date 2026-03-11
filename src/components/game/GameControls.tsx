import styled from 'styled-components';
import { Button } from '../common/Button';
import type { GameState } from '../../types';
import { getCurrentMonthlyAPCap } from '../../utils';

const GameStartSection = styled.section`
  background-color: ${props => props.theme.colors.surface};
  padding: 0.72rem 1rem;
  border-radius: ${props => props.theme.radius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  border: 1px solid ${props => props.theme.colors.border};

  @media (max-width: 768px) {
    padding: 0.65rem 0.9rem;
    gap: 0.45rem;
  }

  @media (max-width: 480px) {
    padding: 0.55rem 0.75rem;
    gap: 0.375rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  margin-bottom: 0;
  color: ${props => props.theme.colors.textMain};
  font-weight: 700;
  display: none;
`;

const GameControlsWrapper = styled.div`
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
`;

const GameStatusWrapper = styled.div`
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
  align-items: center;
`;

const StatusChip = styled.span<{ $alert?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.full};
  padding: 0.24rem 0.62rem;
  font-size: 0.76rem;
  color: ${props => props.theme.colors.textSecondary};
  white-space: nowrap;

  ${props => props.$alert && `
    border-color: #fde68a;
    background: #fffbeb;
    color: #92400e;
  `}

  @media (max-width: 768px) {
    padding: 0.25rem 0.625rem;
    font-size: 0.75rem;
  }

  @media (max-width: 480px) {
    padding: 0.2rem 0.5rem;
    font-size: 0.7rem;
    gap: 0.25rem;
  }
`;

const StatusChipStrong = styled.strong<{ $ap?: boolean; $alert?: boolean }>`
  color: ${props => props.theme.colors.textMain};
  font-weight: 700;

  ${props => props.$ap && `
    color: ${props.theme.colors.primary};
  `}

  ${props => props.$alert && `
    color: #b45309;
  `}
`;

const ApBarContainer = styled.div`
  width: 84px;
  height: 7px;
  background: ${props => props.theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
`;

const ApBarFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  width: ${props => props.$width}%;
  background: ${props => props.$color};
`;

interface GameControlsProps {
  gameState: GameState;
  onStart: () => void;
  onReset: () => void;
  onAdvanceMonth: () => void;
}

function GameControls({ gameState, onAdvanceMonth }: GameControlsProps) {
  const currentAPCap = Math.max(1, getCurrentMonthlyAPCap(gameState));

  const getYearMonth = () => {
    const gameMonth = gameState.month;
    const monthsSinceStart = gameMonth - 1;
    const startCalendarMonth = 9;
    const totalCalendarMonth = startCalendarMonth + monthsSinceStart;
    
    const calendarMonth = ((totalCalendarMonth - 1) % 12) + 1;
    
    let academicYear;
    if (gameMonth <= 4) {
      academicYear = 1;
    } else {
      const monthsAfterFirstSemester = gameMonth - 5;
      const completedYears = Math.floor(monthsAfterFirstSemester / 12);
      if (calendarMonth < 9) {
        academicYear = completedYears + 1;
      } else {
        academicYear = completedYears + 2;
      }
    }
    
    return `大学 ${academicYear} 年 ${calendarMonth} 月`;
  };

  const hasActiveContest = !!gameState.activeContest;

  const getAPProgressColor = () => {
    const ratio = gameState.remainingAP / currentAPCap;
    if (ratio >= 0.7) return '#22c55e';
    if (ratio >= 0.3) return '#f59e0b';
    return '#ef4444';
  };

  const hasPendingEvents = (gameState.pendingEvents?.length || 0) > 0;

  return (
    <GameStartSection>
      <SectionTitle>游戏控制</SectionTitle>
      <GameControlsWrapper>
        <Button
          variant="success"
          onClick={onAdvanceMonth}
          disabled={!gameState.isRunning || gameState.isPaused || gameState.month > 46 || hasPendingEvents || hasActiveContest}
        >
          下一月 ➡️
        </Button>
      </GameControlsWrapper>
      <GameStatusWrapper>
        <StatusChip>
          📅 <StatusChipStrong>{getYearMonth()}</StatusChipStrong>
        </StatusChip>
        <StatusChip>
          <ApBarContainer>
            <ApBarFill
              $width={(gameState.remainingAP / currentAPCap) * 100}
              $color={getAPProgressColor()}
            />
          </ApBarContainer>
          <StatusChipStrong $ap>{gameState.remainingAP}</StatusChipStrong> / {currentAPCap} AP
        </StatusChip>
        {hasActiveContest && (
          <StatusChip $alert>
            ⏱️ 比赛剩余 <StatusChipStrong $alert>{gameState.contestTimeRemaining}</StatusChipStrong> 分钟
          </StatusChip>
        )}
      </GameStatusWrapper>
    </GameStartSection>
  );
}

export default GameControls;

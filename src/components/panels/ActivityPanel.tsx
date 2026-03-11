import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import type { Activity } from '../../types';

const ActivityPanelWrapper = styled.section`
  background-color: ${props => props.theme.colors.surface};
  padding: 0.82rem 1rem;
  border-radius: ${props => props.theme.radius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  border: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

const ActivityTitle = styled.h2`
  font-size: 0.95rem;
  margin: 0;
  color: ${props => props.theme.colors.textMain};
  font-weight: 700;
`;

const ActivityList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.55rem;
  align-content: start;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    gap: 0.375rem;
  }
`;

const ActivityCard = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.md};
  padding: 0.62rem;
  box-shadow: ${props => props.theme.shadows.sm};
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  border: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  height: 148px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
    border-color: ${props => props.theme.colors.primary};
  }

  @media (max-width: 768px) {
    padding: 0.58rem;
    height: 140px;
  }

  @media (max-width: 560px) {
    padding: 0.5rem;
    height: 132px;
  }
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
`;

const ActivityName = styled.h3`
  font-size: 0.86rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textMain};
  margin: 0;
`;

const ActivityCost = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  background: rgba(99, 102, 241, 0.1);
  padding: 0.2rem 0.45rem;
  border-radius: ${props => props.theme.radius.sm};
`;

const ActivityDescription = styled.p`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.65rem;
  line-height: 1.32;
`;

const ActivityButton = styled.button`
  padding: 0.34rem 0.68rem;
  border-radius: ${props => props.theme.radius.md};
  font-weight: 500;
  font-size: 0.72rem;
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: all 0.15s;
  background-color: ${props => props.theme.colors.secondary};
  color: white;
  margin-top: auto;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: ${props => props.theme.colors.border};
    color: ${props => props.theme.colors.textSecondary};
  }

  &:hover:not(:disabled) {
    background-color: ${props => props.theme.colors.secondaryHover};
  }
`;

interface ActivityCardItemProps {
  activity: Activity;
  canExecute: boolean;
  remainingAP: number;
  onExecute: (id: string) => void;
}

const ActivityCardItem = memo(({ activity, canExecute, remainingAP, onExecute }: ActivityCardItemProps) => {
  const handleClick = useCallback(() => {
    onExecute(activity.id);
  }, [activity.id, onExecute]);

  const buttonText = useMemo(() => {
    return remainingAP < activity.cost ? '行动点不足' : '执行';
  }, [remainingAP, activity.cost]);

  return (
    <ActivityCard>
      <ActivityHeader>
        <ActivityName>{activity.name}</ActivityName>
        <ActivityCost>{activity.cost} AP</ActivityCost>
      </ActivityHeader>
      <ActivityDescription>{activity.description}</ActivityDescription>
      <ActivityButton
        onClick={handleClick}
        disabled={!canExecute}
      >
        {buttonText}
      </ActivityButton>
    </ActivityCard>
  );
});

ActivityCardItem.displayName = 'ActivityCardItem';

interface ActivityPanelProps {
  activities: Activity[];
  remainingAP: number;
  onExecuteActivity: (activityId: string) => void;
  isRunning: boolean;
  isPaused: boolean;
  gameEnded: boolean;
}

function ActivityPanel({ activities, remainingAP, onExecuteActivity, isRunning, isPaused, gameEnded }: ActivityPanelProps) {
  const canExecute = useCallback((activity: Activity) => {
    return isRunning && !isPaused && !gameEnded && remainingAP >= activity.cost;
  }, [isRunning, isPaused, gameEnded, remainingAP]);

  const handleExecute = useCallback((activityId: string) => {
    onExecuteActivity(activityId);
  }, [onExecuteActivity]);

  const memoizedActivities = useMemo(() => activities, [activities]);

  return (
    <ActivityPanelWrapper>
      <ActivityTitle>📋 本月活动</ActivityTitle>
      <ActivityList>
        {memoizedActivities.map(activity => (
          <ActivityCardItem
            key={activity.id}
            activity={activity}
            canExecute={canExecute(activity)}
            remainingAP={remainingAP}
            onExecute={handleExecute}
          />
        ))}
      </ActivityList>
    </ActivityPanelWrapper>
  );
}

export default memo(ActivityPanel);

import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import type { Activity } from '../../types';

const ActivityPanelWrapper = styled.section`
  background-color: ${props => props.theme.colors.surface};
  padding: 0.875rem 1.25rem;
  border-radius: ${props => props.theme.radius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  margin-bottom: 1rem;
  border: 1px solid ${props => props.theme.colors.border};
`;

const ActivityTitle = styled.h2`
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: ${props => props.theme.colors.textMain};
  font-weight: 700;
`;

const ActivityList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
  gap: 0.625rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.5rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.5rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.375rem;
  }
`;

const ActivityCard = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.md};
  padding: 0.75rem;
  box-shadow: ${props => props.theme.shadows.sm};
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  border: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  min-height: 160px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
    border-color: ${props => props.theme.colors.primary};
  }

  @media (max-width: 768px) {
    padding: 0.625rem;
    min-height: 140px;
  }

  @media (max-width: 480px) {
    padding: 0.5rem;
    min-height: 120px;
  }
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ActivityName = styled.h3`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textMain};
  margin: 0;
`;

const ActivityCost = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  background: rgba(99, 102, 241, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: ${props => props.theme.radius.sm};
`;

const ActivityDescription = styled.p`
  font-size: 0.8125rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.75rem;
  line-height: 1.4;
`;

const ActivityButton = styled.button`
  padding: 0.375rem 0.75rem;
  border-radius: ${props => props.theme.radius.md};
  font-weight: 500;
  font-size: 0.75rem;
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

// 独立的活动卡片组件
const ActivityCardItem = memo(function ActivityCardItem({ activity, canExecute, remainingAP, onExecute }: ActivityCardItemProps) {
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
  // 缓存 canExecute 检查函数
  const canExecute = useCallback((activity: Activity) => {
    return isRunning && !isPaused && !gameEnded && remainingAP >= activity.cost;
  }, [isRunning, isPaused, gameEnded, remainingAP]);

  // 缓存 onExecute 回调
  const handleExecute = useCallback((activityId: string) => {
    onExecuteActivity(activityId);
  }, [onExecuteActivity]);

  return (
    <ActivityPanelWrapper>
      <ActivityTitle>📋 本月活动</ActivityTitle>
      <ActivityList>
        {activities.map(activity => (
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

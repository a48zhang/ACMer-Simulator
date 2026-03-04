import { memo, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { Button } from '../common/Button';
import type { Event, Choice } from '../../types';

const EventPanelWrapper = styled.section`
  background-color: ${props => props.theme.colors.surface};
  padding: 0.875rem 1.25rem;
  border-radius: ${props => props.theme.radius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  margin-bottom: 1rem;
  border: 1px solid ${props => props.theme.colors.border};
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const PanelTitle = styled.h2`
  font-size: 1rem;
  margin-bottom: 0;
  color: ${props => props.theme.colors.textMain};
  font-weight: 700;
`;

const EventBadge = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  background: ${props => props.theme.colors.background};
  padding: 0.25rem 0.5rem;
  border-radius: ${props => props.theme.radius.full};
`;

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const EventCard = styled.div<{ $isSimple?: boolean }>`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.md};
  padding: 0.875rem;
  box-shadow: ${props => props.theme.shadows.sm};
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  border: 1px solid ${props => props.theme.colors.border};
  display: flex;
  gap: 0.875rem;
  align-items: flex-start;

  ${props => !props.$isSimple && `
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${props.theme.shadows.md};
      border-color: ${props.theme.colors.primary};
    }
  `}

  @media (max-width: 768px) {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  @media (max-width: 480px) {
    padding: 0.625rem;
    gap: 0.625rem;
  }
`;

const EventCardIcon = styled.div`
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const EventCardContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const EventCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const EventCardTitle = styled.h3`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textMain};
  margin: 0;
`;

const TagMandatory = styled.span`
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.danger};
  background: rgba(239, 68, 68, 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: ${props => props.theme.radius.sm};
`;

const EventCardDesc = styled.p`
  font-size: 0.8125rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.75rem;
  line-height: 1.4;
`;

const EventInlineChoices = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const BtnInlineChoice = styled.button`
  padding: 0.375rem 0.75rem;
  border-radius: ${props => props.theme.radius.md};
  font-weight: 500;
  font-size: 0.75rem;
  cursor: pointer;
  border: 1px solid ${props => props.theme.colors.border};
  font-family: inherit;
  transition: all 0.15s;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.textMain};

  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const BtnEventAction = styled(Button)`
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  align-self: center;
  flex-shrink: 0;
`;

const EventBlockWarning = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: ${props => props.theme.radius.md};
  color: ${props => props.theme.colors.warning};
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
`;

interface InlineChoiceButtonProps {
  choice: Choice;
  eventId: string;
  onDirectChoice: (eventId: string, choiceId: string) => void;
}

const InlineChoiceButton = memo(({ choice, eventId, onDirectChoice }: InlineChoiceButtonProps) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDirectChoice(eventId, choice.id);
  }, [choice.id, eventId, onDirectChoice]);

  return (
    <BtnInlineChoice onClick={handleClick}>
      {choice.label}
    </BtnInlineChoice>
  );
});

InlineChoiceButton.displayName = 'InlineChoiceButton';

interface EventCardItemProps {
  event: Event;
  onOpenEvent: (eventId: string) => void;
  onDirectChoice: (eventId: string, choiceId: string) => void;
}

const EventCardItem = memo(({ event, onOpenEvent, onDirectChoice }: EventCardItemProps) => {
  const isSimple = useMemo(() => {
    return event.choices?.length === 2 &&
      event.choices.every((c: Choice) => !c.requiresTeamSelection && !c.specialAction);
  }, [event.choices]);

  const handleCardClick = useCallback(() => {
    if (!isSimple) {
      onOpenEvent(event.id);
    }
  }, [event.id, isSimple, onOpenEvent]);

  const handleActionClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenEvent(event.id);
  }, [event.id, onOpenEvent]);

  return (
    <EventCard
      $isSimple={isSimple}
      onClick={handleCardClick}
    >
      <EventCardIcon>📩</EventCardIcon>
      <EventCardContent>
        <EventCardHeader>
          <EventCardTitle>{event.title}</EventCardTitle>
          {event.mandatory && <TagMandatory>必做</TagMandatory>}
        </EventCardHeader>
        <EventCardDesc>{event.description}</EventCardDesc>
        {isSimple && (
          <EventInlineChoices>
            {event.choices.map((choice: Choice) => (
              <InlineChoiceButton
                key={choice.id}
                choice={choice}
                eventId={event.id}
                onDirectChoice={onDirectChoice}
              />
            ))}
          </EventInlineChoices>
        )}
      </EventCardContent>
      {!isSimple && (
        <BtnEventAction
          variant="secondary"
          size="sm"
          onClick={handleActionClick}
        >
          处理 →
        </BtnEventAction>
      )}
    </EventCard>
  );
});

EventCardItem.displayName = 'EventCardItem';

interface EventPanelProps {
  pendingEvents: Event[];
  onOpenEvent: (eventId: string) => void;
  onDirectChoice: (eventId: string, choiceId: string) => void;
  canAdvance: boolean;
}

function EventPanel({ pendingEvents, onOpenEvent, onDirectChoice, canAdvance }: EventPanelProps) {
  const count = pendingEvents?.length || 0;

  const sorted = useMemo(() => pendingEvents || [], [pendingEvents]);

  const handleOpenEvent = useCallback((eventId: string) => {
    onOpenEvent(eventId);
  }, [onOpenEvent]);

  const handleDirectChoice = useCallback((eventId: string, choiceId: string) => {
    onDirectChoice(eventId, choiceId);
  }, [onDirectChoice]);

  if (count === 0) return null;

  return (
    <EventPanelWrapper>
      <PanelHeader>
        <PanelTitle>📅 当月事件</PanelTitle>
        <EventBadge>{count} 待处理</EventBadge>
      </PanelHeader>

      <EventList>
        {sorted.map((ev) => (
          <EventCardItem
            key={ev.id}
            event={ev}
            onOpenEvent={handleOpenEvent}
            onDirectChoice={handleDirectChoice}
          />
        ))}
      </EventList>

      {!canAdvance && (
        <EventBlockWarning>
          ⚠️ 请先处理完所有事件才能进入下一月
        </EventBlockWarning>
      )}
    </EventPanelWrapper>
  );
}

export default memo(EventPanel);

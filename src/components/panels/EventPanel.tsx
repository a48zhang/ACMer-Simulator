import { memo, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { Button } from '../common/Button';
import type { Event, Choice } from '../../types';

const EventPanelWrapper = styled.section`
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9)),
    ${props => props.theme.colors.surface};
  padding: 1rem 1.2rem;
  border-radius: ${props => props.theme.radius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  margin-bottom: 1rem;
  border: 1px solid ${props => props.theme.colors.border};
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const PanelTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
`;

const PanelTitle = styled.h2`
  font-size: 1rem;
  margin-bottom: 0;
  color: ${props => props.theme.colors.textMain};
  font-weight: 800;
`;

const PanelSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.8rem;
`;

const EventBadge = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.primary};
  background: rgba(37, 99, 235, 0.08);
  padding: 0.3rem 0.65rem;
  border-radius: ${props => props.theme.radius.full};
  font-weight: 700;
  white-space: nowrap;
`;

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const EventCard = styled.div<{ $interactive?: boolean }>`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.md};
  padding: 0.95rem;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  border: 1px solid ${props => props.theme.colors.border};
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.95rem;
  align-items: start;

  ${props => props.$interactive && `
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${props.theme.shadows.md};
      border-color: ${props.theme.colors.primary};
    }
  `}

  @media (max-width: 768px) {
    grid-template-columns: auto 1fr;
    padding: 0.85rem;
    gap: 0.8rem;
  }
`;

const EventCardIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 1.2rem;
  flex-shrink: 0;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(16, 185, 129, 0.15));
`;

const EventCardContent = styled.div`
  min-width: 0;
`;

const EventCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.45rem;
  flex-wrap: wrap;
`;

const EventCardTitle = styled.h3`
  font-size: 0.96rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textMain};
  margin: 0;
`;

const TagMandatory = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  color: ${props => props.theme.colors.danger};
  background: rgba(239, 68, 68, 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: ${props => props.theme.radius.sm};
`;

const EventCardDesc = styled.p`
  font-size: 0.84rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.8rem;
  line-height: 1.55;
`;

const EventInlineChoices = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const InlineChoiceButton = styled.button<{ $primary?: boolean }>`
  padding: 0.45rem 0.82rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.76rem;
  cursor: pointer;
  border: 1px solid ${props => props.$primary ? props.theme.colors.primary : props.theme.colors.border};
  font-family: inherit;
  transition: all 0.15s;
  background: ${props => props.$primary ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.$primary ? '#ffffff' : props.theme.colors.textMain};

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.sm};
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.$primary ? props.theme.colors.primaryHover : 'rgba(37, 99, 235, 0.08)'};
  }
`;

const BtnEventAction = styled(Button)`
  padding: 0.45rem 0.8rem;
  font-size: 0.78rem;
  align-self: center;
  flex-shrink: 0;

  @media (max-width: 768px) {
    grid-column: 2;
    justify-self: start;
  }
`;

const EventBlockWarning = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: ${props => props.theme.radius.md};
  color: ${props => props.theme.colors.warning};
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
`;

interface ChoiceButtonProps {
  choice: Choice;
  eventId: string;
  index: number;
  onDirectChoice: (eventId: string, choiceId: string) => void;
}

const ChoiceButton = memo(({ choice, eventId, index, onDirectChoice }: ChoiceButtonProps) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDirectChoice(eventId, choice.id);
  }, [choice.id, eventId, onDirectChoice]);

  return (
    <InlineChoiceButton $primary={index === 0} onClick={handleClick}>
      {choice.label}
    </InlineChoiceButton>
  );
});

ChoiceButton.displayName = 'ChoiceButton';

interface EventCardItemProps {
  event: Event;
  onOpenEvent: (eventId: string) => void;
  onDirectChoice: (eventId: string, choiceId: string) => void;
}

const EventCardItem = memo(({ event, onOpenEvent, onDirectChoice }: EventCardItemProps) => {
  const useInlineChoices = useMemo(() => {
    const count = event.choices?.length || 0;
    return count > 0 && count <= 3;
  }, [event.choices]);

  const handleCardClick = useCallback(() => {
    if (!useInlineChoices) {
      onOpenEvent(event.id);
    }
  }, [event.id, onOpenEvent, useInlineChoices]);

  const handleActionClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenEvent(event.id);
  }, [event.id, onOpenEvent]);

  return (
    <EventCard $interactive={!useInlineChoices} onClick={handleCardClick}>
      <EventCardIcon>📌</EventCardIcon>
      <EventCardContent>
        <EventCardHeader>
          <EventCardTitle>{event.title}</EventCardTitle>
          {event.mandatory && <TagMandatory>必做</TagMandatory>}
        </EventCardHeader>
        <EventCardDesc>{event.description}</EventCardDesc>
        {useInlineChoices && (
          <EventInlineChoices>
            {event.choices.map((choice, index) => (
              <ChoiceButton
                key={choice.id}
                choice={choice}
                eventId={event.id}
                index={index}
                onDirectChoice={onDirectChoice}
              />
            ))}
          </EventInlineChoices>
        )}
      </EventCardContent>
      {!useInlineChoices && (
        <BtnEventAction variant="secondary" size="sm" onClick={handleActionClick}>
          查看选项
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
        <PanelTitleGroup>
          <PanelTitle>当月事件</PanelTitle>
          <PanelSubtitle>能直接决策的事件会在这里就地处理，不再额外弹窗。</PanelSubtitle>
        </PanelTitleGroup>
        <EventBadge>{count} 个待处理</EventBadge>
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
          请先处理完本月事件，再进入下个月。
        </EventBlockWarning>
      )}
    </EventPanelWrapper>
  );
}

export default memo(EventPanel);

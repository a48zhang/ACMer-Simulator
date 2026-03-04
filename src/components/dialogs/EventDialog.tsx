import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from '../common/Button';
import type { Event, Choice } from '../../types';

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
  max-width: 550px;
  width: 90%;
`;

const EventDialogHeader = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: flex-start;
`;

const EventDialogIcon = styled.div`
  font-size: 2rem;
  flex-shrink: 0;
`;

const DialogTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textMain};
  margin-bottom: 0.25rem;
`;

const DialogSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9375rem;
  margin: 0;
`;

const EventDialogContent = styled.div`
  margin-bottom: 1.5rem;
`;

const ChoicesTitle = styled.h4`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textMain};
  margin-bottom: 0.75rem;
`;

const EventChoices = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ChoiceCard = styled.label<{ $selected?: boolean }>`
  background: ${props => props.theme.colors.background};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  padding: 0.875rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }

  ${props => props.$selected && `
    border-color: ${props.theme.colors.primary};
    background: rgba(99, 102, 241, 0.05);
  `}
`;

const ChoiceRadio = styled.input`
  flex-shrink: 0;
  width: 1.125rem;
  height: 1.125rem;
`;

const ChoiceContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ChoiceIndicator = styled.div<{ $selected?: boolean }>`
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  border: 2px solid ${props => props.theme.colors.border};
  flex-shrink: 0;

  ${props => props.$selected && `
    background: ${props.theme.colors.primary};
    border-color: ${props.theme.colors.primary};
  `}
`;

const ChoiceLabel = styled.span`
  font-weight: 500;
  color: ${props => props.theme.colors.textMain};
`;

const DialogActions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

interface EventDialogProps {
  event: Event;
  onSelectChoice: (eventId: string, choiceId: string) => void;
  onClose: () => void;
}

function EventDialog({ event, onSelectChoice, onClose }: EventDialogProps) {
    const [selected, setSelected] = useState<string | null>(null);
    useEffect(() => { setSelected(null); }, [event?.id]);
    if (!event) return null;

    return (
        <DialogOverlay onClick={onClose}>
            <DialogBox onClick={(e) => e.stopPropagation()}>
                <EventDialogHeader>
                    <EventDialogIcon>📅</EventDialogIcon>
                    <div>
                        <DialogTitle>{event.title}</DialogTitle>
                        <DialogSubtitle>{event.description}</DialogSubtitle>
                    </div>
                </EventDialogHeader>

                <EventDialogContent>
                    <ChoicesTitle>请选择你的决策：</ChoicesTitle>
                    <EventChoices>
                        {event.choices.map((choice: Choice) => (
                            <ChoiceCard
                                key={choice.id}
                                $selected={selected === choice.id}
                            >
                                <ChoiceRadio
                                    type="radio"
                                    name="event-choice"
                                    value={choice.id}
                                    checked={selected === choice.id}
                                    onChange={() => setSelected(choice.id)}
                                />
                                <ChoiceContent>
                                    <ChoiceIndicator $selected={selected === choice.id} />
                                    <ChoiceLabel>{choice.label}</ChoiceLabel>
                                </ChoiceContent>
                            </ChoiceCard>
                        ))}
                    </EventChoices>
                </EventDialogContent>

                <DialogActions>
                    <Button variant="secondary" onClick={onClose}>稍后处理</Button>
                    <Button
                        variant="primary"
                        onClick={() => selected && onSelectChoice(event.id, selected)}
                        disabled={!selected}
                    >
                        确认决策
                    </Button>
                </DialogActions>
            </DialogBox>
        </DialogOverlay>
    );
}

export default EventDialog;

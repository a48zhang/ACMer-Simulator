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
  max-width: 420px;
  width: 90%;
`;

const DialogTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textMain};
  margin-bottom: 0.75rem;
`;

const DialogMessage = styled.p`
  margin: 0.75rem 0 1.5rem;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;
`;

const DialogActions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
    if (!message) return null;

    return (
        <DialogOverlay onClick={onCancel}>
            <DialogBox onClick={(e) => e.stopPropagation()}>
                <DialogTitle>确认操作</DialogTitle>
                <DialogMessage>
                    {message}
                </DialogMessage>
                <DialogActions>
                    <Button variant="secondary" onClick={onCancel}>取消</Button>
                    <Button variant="primary" onClick={onConfirm}>确认</Button>
                </DialogActions>
            </DialogBox>
        </DialogOverlay>
    );
}

export default ConfirmDialog;

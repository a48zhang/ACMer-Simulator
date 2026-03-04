import { useEffect, useState } from 'react';
import styled from 'styled-components';

const NotificationWrapper = styled.div<{ $exiting?: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.textMain};
  padding: 1rem 1.5rem;
  border-radius: ${props => props.theme.radius.md};
  box-shadow: ${props => props.theme.shadows.lg};
  border: 1px solid ${props => props.theme.colors.border};
  z-index: 9999;
  animation: fadeIn 0.3s ease;

  ${props => props.$exiting && `
    animation: fadeOut 0.5s ease forwards;
  `}

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
`;

interface NotificationProps {
  message: string | { message: string; type: string };
  onClose: () => void;
}

function Notification({ message, onClose }: NotificationProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const displayMessage = typeof message === 'string' ? message : message.message;

  return (
    <NotificationWrapper $exiting={isExiting}>
      {displayMessage}
    </NotificationWrapper>
  );
}

export default Notification;

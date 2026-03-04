import styled from 'styled-components';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'info' | 'danger';
  size?: 'sm' | 'lg';
  block?: boolean;
  disabled?: boolean;
}

export const Button = styled.button<ButtonProps>`
  padding: 0.5rem 1rem;
  border-radius: ${props => props.theme.radius.md};
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  transition: all 0.15s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${props => props.variant === 'primary' && `
    background-color: ${props.theme.colors.primary};
    color: white;
    
    &:hover:not(:disabled) {
      background-color: ${props.theme.colors.primaryHover};
    }
  `}

  ${props => props.variant === 'secondary' && `
    background-color: ${props.theme.colors.secondary};
    color: white;

    &:hover:not(:disabled) {
      background-color: ${props.theme.colors.secondaryHover};
    }
  `}

  ${props => props.variant === 'success' && `
    background-color: ${props.theme.colors.secondary};
    color: white;

    &:hover:not(:disabled) {
      background-color: ${props.theme.colors.secondaryHover};
    }
  `}

  ${props => props.variant === 'info' && `
    background-color: #3b82f6;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #2563eb;
    }
  `}

  ${props => props.variant === 'danger' && `
    background-color: ${props.theme.colors.danger};
    color: white;
    
    &:hover:not(:disabled) {
      background-color: ${props.theme.colors.dangerHover};
    }
  `}

  ${props => props.size === 'sm' && `
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  `}

  ${props => props.size === 'lg' && `
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  `}

  ${props => props.block && `
    width: 100%;
  `}
`;

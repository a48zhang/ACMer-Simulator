import styled from 'styled-components';

interface CardProps {
  $elevated?: boolean;
  $borderless?: boolean;
  $compact?: boolean;
  $background?: 'background';
}

export const Card = styled.div<CardProps>`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.lg};
  padding: 0.875rem 1.25rem;
  box-shadow: ${props => props.theme.shadows.sm};
  margin-bottom: 1rem;
  border: 1px solid ${props => props.theme.colors.border};

  ${props => props.$elevated && `
    box-shadow: ${props.theme.shadows.md};
  `}

  ${props => props.$borderless && `
    border: none;
    box-shadow: none;
  `}

  ${props => props.$compact && `
    padding: 0.625rem 0.875rem;
  `}

  ${props => props.$background === 'background' && `
    background: ${props.theme.colors.background};
  `}
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

export const CardTitle = styled.h2`
  font-size: 1rem;
  margin: 0;
  color: ${props => props.theme.colors.textMain};
  font-weight: 700;
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

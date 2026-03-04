import styled from 'styled-components';

export const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.header`
  background-color: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  padding: 0.75rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: ${props => props.theme.shadows.sm};
  z-index: 10;
  flex-shrink: 0;
`;

export const HeaderTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
`;

export const AppLayout = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

export const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${props => props.theme.colors.background};

  &.full-width {
    width: 100%;
  }
`;

export const Footer = styled.footer`
  background-color: ${props => props.theme.colors.surface};
  border-top: 1px solid ${props => props.theme.colors.border};
  padding: 0.75rem 2rem;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.75rem;
  flex-shrink: 0;
`;

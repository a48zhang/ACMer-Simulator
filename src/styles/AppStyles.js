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

  h1 {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${props => props.theme.colors.primary};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .subtitle {
    color: ${props => props.theme.colors.textSecondary};
    font-size: 0.875rem;
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;

    h1 {
      font-size: 1rem;
    }

    .subtitle {
      font-size: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    padding: 0.5rem;

    h1 {
      font-size: 0.875rem;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .subtitle {
      font-size: 0.7rem;
    }
  }
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
    align-items: center;
    justify-content: flex-start;
    padding: 2rem;
    overflow: auto;
  }
`;

export const MainContentLayout = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 1rem;
  padding: 1rem;
  min-height: 0;

  .main-content-left {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;

    @media (max-width: 768px) {
      padding: 0;
      gap: 0.75rem;
    }

    @media (max-width: 480px) {
      gap: 0.5rem;
    }
  }

  .main-content-right {
    display: flex;
    flex-direction: column;
    overflow: hidden;

    @media (max-width: 768px) {
      display: none;
    }
  }
`;

export const Footer = styled.footer`
  background-color: ${props => props.theme.colors.surface};
  border-top: 1px solid ${props => props.theme.colors.border};
  padding: 0.5rem 1rem;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.8rem;
  text-align: center;
  flex-shrink: 0;
`;

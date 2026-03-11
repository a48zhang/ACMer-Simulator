import styled from 'styled-components';

export const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 28%),
    radial-gradient(circle at top right, rgba(16, 185, 129, 0.08), transparent 24%),
    ${props => props.theme.colors.background};
`;

export const Header = styled.header`
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(229, 231, 235, 0.9);
  padding: 0.9rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  box-shadow: ${props => props.theme.shadows.sm};
  backdrop-filter: blur(14px);
  z-index: 10;
  flex-shrink: 0;

  h1 {
    font-size: 1.25rem;
    font-weight: 800;
    color: ${props => props.theme.colors.primary};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    letter-spacing: -0.02em;
  }

  .subtitle {
    color: ${props => props.theme.colors.textSecondary};
    font-size: 0.875rem;
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;

    h1 {
      font-size: 1rem;
    }

    .subtitle {
      font-size: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    padding: 0.65rem 0.9rem;
    align-items: flex-start;
    flex-direction: column;

    h1 {
      font-size: 0.95rem;
    }
  }
`;

export const AppLayout = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
`;

export const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  background: transparent;

  &.landing-screen {
    overflow-y: auto;
    padding: clamp(1.25rem, 3vw, 2.5rem);
  }

  &.trait-selection-screen {
    overflow-y: auto;
    padding: clamp(0.9rem, 2.4vw, 1.8rem);
    justify-content: flex-start;
    align-items: stretch;
  }
`;

export const MainContentLayout = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 1rem;
  padding: 1.1rem 1.1rem 1.3rem;
  min-height: 0;

  .main-content-left {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;
    padding-right: 0.2rem;
  }

  .main-content-right {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  @media (max-width: 768px) {
    padding: 0.85rem;
    gap: 0.75rem;

    .main-content-left {
      gap: 0.75rem;
      padding-right: 0;
    }

    .main-content-right {
      display: none;
    }
  }

  @media (max-width: 480px) {
    padding: 0.7rem;

    .main-content-left {
      gap: 0.65rem;
    }
  }
`;

export const Footer = styled.footer`
  background-color: rgba(255, 255, 255, 0.88);
  border-top: 1px solid rgba(229, 231, 235, 0.92);
  padding: 0.5rem 1rem;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.8rem;
  text-align: center;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
`;

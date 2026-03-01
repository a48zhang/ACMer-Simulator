import { useEffect, useRef } from 'react';
import styled from 'styled-components';

const LogPanelWrapper = styled.section`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.lg};
  padding: 0.875rem 1rem;
  box-shadow: ${props => props.theme.shadows.sm};
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid ${props => props.theme.colors.border};
  width: 320px;
  flex-shrink: 0;

  @media (max-width: 1024px) {
    width: 280px;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 280px;
  }

  @media (max-width: 480px) {
    width: 100%;
    max-width: none;
    height: 40vh;
    border-radius: ${props => props.theme.radius.lg} ${props => props.theme.radius.lg} 0 0;
    border-right: none;
    border-bottom: none;
  }
`;

const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const LogTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textMain};
  margin: 0;
`;

const LogCount = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  background: ${props => props.theme.colors.background};
  padding: 0.25rem 0.5rem;
  border-radius: ${props => props.theme.radius.full};
`;

const LogContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background-color: #1e1e1e;
  border-radius: ${props => props.theme.radius.md};
  padding: 0.75rem;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #2d2d2d;
  }

  &::-webkit-scrollbar-thumb {
    background: #4b5563;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
`;

const LogEmpty = styled.div`
  color: #6b7280;
  text-align: center;
  margin-top: 2rem;
  font-style: italic;
`;

const LogEntry = styled.div`
  display: flex;
  gap: 0.5rem;
  line-height: 1.4;
  animation: fadeIn 0.2s ease;
`;

const LogTime = styled.span`
  color: #6b7280;
  flex-shrink: 0;
`;

const LogMessage = styled.span`
  color: #d4d4d4;
  word-break: break-word;

  ${props => props.$type === 'success' && `
    color: #4ade80;
  `}

  ${props => props.$type === 'warning' && `
    color: #fbbf24;
  `}

  ${props => props.$type === 'error' && `
    color: #f87171;
  `}

  ${props => props.$type === 'info' && `
    color: #60a5fa;
  `}
`;

function LogPanel({ logs }) {
    const containerRef = useRef(null);

    const scrollToBottom = () => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [logs]);

    return (
        <LogPanelWrapper>
            <LogHeader>
                <LogTitle>📜 消息列表</LogTitle>
                <LogCount>{logs.length} 条消息</LogCount>
            </LogHeader>
            <LogContainer ref={containerRef}>
                {logs.length === 0 ? (
                    <LogEmpty>暂无消息...</LogEmpty>
                ) : (
                    logs.map((log) => (
                        <LogEntry key={log.id}>
                            <LogTime>[{log.time}]</LogTime>
                            <LogMessage $type={log.type}>{log.message}</LogMessage>
                        </LogEntry>
                    ))
                )}
            </LogContainer>
        </LogPanelWrapper>
    );
}

export default LogPanel;

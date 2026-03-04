import styled from 'styled-components';
import { Button } from '../common/Button';
import type { ContestOutcome } from '../../types';

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
  max-width: 500px;
  width: 90%;
`;

const DialogTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textMain};
  margin-bottom: 0.5rem;
`;

const DialogSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 1.5rem;
  font-size: 0.9375rem;
`;

const ContestResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ResultItem = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radius.md};
  padding: 1rem;
  text-align: center;
`;

const ResultLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.5rem;
`;

const ResultValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
`;

const DialogHint = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 1.5rem;
  font-size: 0.9375rem;
  line-height: 1.5;

  strong {
    color: ${props => props.theme.colors.textMain};
    font-weight: 600;
  }
`;

const DialogActions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

interface ContestResultDialogProps {
  outcome: ContestOutcome;
  onConfirm: () => void;
}

function ContestResultDialog({ outcome, onConfirm }: ContestResultDialogProps) {
    if (!outcome) return null;
    const { total, solved, attempts, ratingDelta, sanDelta, timeUsed, performanceRating, weakAttr } = outcome;
    const ratingText = `${ratingDelta >= 0 ? '+' : ''}${ratingDelta}`;
    const sanText = `${sanDelta >= 0 ? '+' : ''}${sanDelta}`;

    const attrNames: Record<string, string> = {
        algorithm: '算法思维', coding: '代码能力', speed: '速度', stress: '抗压',
        math: '数学', dp: '动态规划',
        graph: '图论', dataStructure: '数据结构', string: '字符串',
        search: '搜索', greedy: '贪心', geometry: '计算几何'
    };

    return (
        <DialogOverlay>
            <DialogBox onClick={(e) => e.stopPropagation()}>
                <DialogTitle>📊 比赛结算</DialogTitle>
                <DialogSubtitle>本次比赛用时 {timeUsed} 分钟，解出 {solved}/{total} 题</DialogSubtitle>

                <ContestResultGrid>
                    <ResultItem>
                        <ResultLabel>Rating 变化</ResultLabel>
                        <ResultValue>{ratingText}</ResultValue>
                    </ResultItem>
                    {performanceRating != null && (
                        <ResultItem>
                            <ResultLabel>表现分</ResultLabel>
                            <ResultValue>{performanceRating}</ResultValue>
                        </ResultItem>
                    )}
                    <ResultItem>
                        <ResultLabel>SAN 变化</ResultLabel>
                        <ResultValue>{sanText}</ResultValue>
                    </ResultItem>
                    <ResultItem>
                        <ResultLabel>尝试次数</ResultLabel>
                        <ResultValue>{attempts}</ResultValue>
                    </ResultItem>
                </ContestResultGrid>

                {weakAttr && (
                    <DialogHint>
                        💡 本场最弱项：<strong>{attrNames[weakAttr] || weakAttr}</strong>，建议加强训练。
                    </DialogHint>
                )}

                <DialogActions>
                    <Button variant="primary" onClick={onConfirm}>确认结算</Button>
                </DialogActions>
            </DialogBox>
        </DialogOverlay>
    );
}

export default ContestResultDialog;

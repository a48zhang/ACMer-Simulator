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

const AwardBanner = styled.div<{ $tier?: string }>`
  margin-bottom: 1rem;
  padding: 0.9rem 1rem;
  border-radius: ${props => props.theme.radius.md};
  border: 1px solid ${props => props.$tier === 'gold'
    ? 'rgba(245, 158, 11, 0.45)'
    : props.$tier === 'silver'
      ? 'rgba(148, 163, 184, 0.5)'
      : props.$tier === 'bronze'
        ? 'rgba(180, 83, 9, 0.42)'
        : 'rgba(37, 99, 235, 0.28)'};
  background: ${props => props.$tier === 'gold'
    ? 'linear-gradient(135deg, rgba(254, 243, 199, 0.95), rgba(255, 251, 235, 0.95))'
    : props.$tier === 'silver'
      ? 'linear-gradient(135deg, rgba(241, 245, 249, 0.96), rgba(248, 250, 252, 0.96))'
      : props.$tier === 'bronze'
        ? 'linear-gradient(135deg, rgba(254, 215, 170, 0.9), rgba(255, 237, 213, 0.95))'
        : 'linear-gradient(135deg, rgba(219, 234, 254, 0.95), rgba(239, 246, 255, 0.95))'};
  color: ${props => props.theme.colors.textMain};
`;

const AwardTitle = styled.div`
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: 0.2rem;
`;

const AwardText = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
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
    const { total, solved, attempts, ratingDelta, sanDelta, timeUsed, performanceRating, weakAttr, ranking, award } = outcome;
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

                {ranking && (
                    <AwardBanner $tier={award?.tier}>
                        <AwardTitle>
                            {award ? `🏅 获得 ${award.label}` : '📈 获得正式比赛排名'}
                        </AwardTitle>
                        <AwardText>
                            最终排名第 <strong>{ranking.rank}</strong> / <strong>{ranking.participants}</strong> 名
                        </AwardText>
                    </AwardBanner>
                )}

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
                    {ranking && (
                        <ResultItem>
                            <ResultLabel>比赛排名</ResultLabel>
                            <ResultValue>{ranking.rank}</ResultValue>
                        </ResultItem>
                    )}
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

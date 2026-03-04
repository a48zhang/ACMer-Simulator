import styled from 'styled-components';
import { Button } from '../common/Button';
import type { ContestSession } from '../../types';

const ContestSection = styled.section`
  background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
  border: 2px solid #ffd4d4;
  border-radius: ${props => props.theme.radius.lg};
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);
  margin-bottom: 1.5rem;
`;

const ContestHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #ffe0e0;
`;

const ContestTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ContestTitle = styled.h2`
  font-size: 1rem;
  margin: 0;
  color: ${props => props.theme.colors.textMain};
`;

const ContestBadge = styled.span`
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
`;

const ContestMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  font-size: 0.8rem;
`;

const ContestTime = styled.span`
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
`;

const ContestProblemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.75rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ContestProblemCard = styled.div<{ $status?: string }>`
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  padding: 0.6rem 0.75rem;
  background: ${props => props.theme.colors.background};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: ${props => props.theme.shadows.sm};

  ${props => props.$status === 'solved' && `
    border-color: #22c55e;
    background: linear-gradient(135deg, #ecfdf3 0%, #ffffff 100%);
  `}

  ${props => (props.$status === 'coding' || props.$status === 'submitted_fail') && `
    border-color: #fde68a;
    background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
  `}

  ${props => props.$status === 'attempted' && `
    border-color: #fde68a;
    background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
  `}
`;

const ContestProblemTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
`;

const ContestProblemTitle = styled.div`
  font-weight: 700;
  color: ${props => props.theme.colors.textMain};
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ContestProblemStatus = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ContestProblemInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ContestProblemTags = styled.span`
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border-radius: ${props => props.theme.radius.sm};
`;

const ContestProblemActions = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: nowrap;
`;

const ContestProblemSolved = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #22c55e;
`;

const ContestFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid #ffe0e0;
`;

const ContestHint = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.8rem;
`;

const SmallButton = styled(Button)`
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
`;

interface RevealedInfo {
  tags?: string[];
}

interface ContestInProgressProps {
  contest: ContestSession;
  timeRemaining: number;
  onAttempt: (problemId: string) => void;
  onFinish: () => void;
  onRead: (problemId: string) => void;
  onThink: (problemId: string) => void;
  onCode: (problemId: string) => void;
  onDebug: (problemId: string) => void;
}

function ContestInProgress({ contest, timeRemaining, onAttempt, onFinish, onRead, onThink, onCode, onDebug }: ContestInProgressProps) {
  const solvedCount = contest.problems.filter(p => p.status === 'solved').length;
  const totalCount = contest.problems.length;
  const allSolved = solvedCount === totalCount;

  return (
    <ContestSection>
      <ContestHeader>
        <ContestTitleRow>
          <ContestTitle>🏁 {contest.name} 进行中</ContestTitle>
          <ContestBadge>{solvedCount}/{totalCount} 已解</ContestBadge>
        </ContestTitleRow>
        <ContestMeta>
          <ContestTime>⏱️ 剩余时间：{timeRemaining} 分钟</ContestTime>
        </ContestMeta>
      </ContestHeader>

      <ContestProblemGrid>
        {contest.problems.map((p) => {
          const isSolved = p.status === 'solved';
          const isPending = p.status === 'pending';
          const isCoding = p.status === 'coding';
          const isSubmittedFail = p.status === 'submitted_fail';
          const canThink = (isCoding || isSubmittedFail);
          const canDebug = (isCoding || isSubmittedFail) && p.hasWrittenCode;
          const canSubmit = (isCoding || isSubmittedFail) && p.hasWrittenCode;
          const revealedInfo = p.revealedInfo as RevealedInfo | null;

          return (
            <ContestProblemCard
              key={p.id}
              $status={p.status}
            >
              <ContestProblemTop>
                <ContestProblemTitle>
                  Problem {p.letter}
                </ContestProblemTitle>
                <ContestProblemStatus>
                  {isSolved ? '✅ Accepted' : (isPending ? '未读题' : (isSubmittedFail ? '❌ 已尝试' : '📝 可开始'))}
                </ContestProblemStatus>
              </ContestProblemTop>

              {revealedInfo && (
                <ContestProblemInfo>
                  {revealedInfo.tags && revealedInfo.tags.length > 0 && (
                    <ContestProblemTags>
                      ��️ {revealedInfo.tags.join(' | ')}
                    </ContestProblemTags>
                  )}
                </ContestProblemInfo>
              )}

              <ContestProblemActions>
                {isPending && (
                  <SmallButton
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={() => onRead(p.id)}
                    disabled={timeRemaining <= 0}
                  >
                    读题
                  </SmallButton>
                )}
                {(isCoding || isSubmittedFail) && (
                  <>
                    <SmallButton
                      variant="secondary"
                      size="sm"
                      type="button"
                      onClick={() => onThink(p.id)}
                      disabled={!canThink || timeRemaining <= 0}
                    >
                      思考
                    </SmallButton>
                    <SmallButton
                      variant="secondary"
                      size="sm"
                      type="button"
                      onClick={() => onCode(p.id)}
                      disabled={p.hasWrittenCode || timeRemaining <= 0}
                    >
                      写代码{p.hasWrittenCode ? '（已写）' : ''}
                    </SmallButton>
                    <SmallButton
                      variant="info"
                      size="sm"
                      type="button"
                      onClick={() => onDebug(p.id)}
                      disabled={!canDebug || timeRemaining <= 0}
                    >
                      对拍
                    </SmallButton>
                    <SmallButton
                      variant="primary"
                      size="sm"
                      type="button"
                      onClick={() => onAttempt(p.id)}
                      disabled={!canSubmit || timeRemaining <= 0}
                    >
                      提交
                    </SmallButton>
                  </>
                )}
                {isSolved && (
                  <ContestProblemSolved>Accepted</ContestProblemSolved>
                )}
              </ContestProblemActions>
            </ContestProblemCard>
          );
        })}
      </ContestProblemGrid>

      <ContestFooter>
        <Button
          variant="secondary"
          type="button"
          onClick={onFinish}
          disabled={timeRemaining <= 0 || allSolved}
        >
          提前交卷
        </Button>
        <ContestHint>⏰ 到时或全部解出后自动结算</ContestHint>
      </ContestFooter>
    </ContestSection>
  );
}

export default ContestInProgress;

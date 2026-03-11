import styled from 'styled-components';
import { Button } from '../common/Button';
import type { PracticeSession } from '../../types';

const PracticeSection = styled.section`
  background: linear-gradient(135deg, #f5fbff 0%, #ffffff 100%);
  border: 2px solid #cfe7ff;
  border-radius: ${props => props.theme.radius.lg};
  padding: 0.85rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.14);
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

const PracticeHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-bottom: 0.7rem;
  padding-bottom: 0.55rem;
  border-bottom: 2px solid #dbeafe;
`;

const PracticeTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.6rem;
  align-items: center;
`;

const PracticeTitle = styled.h2`
  font-size: 0.95rem;
  margin: 0;
  color: ${props => props.theme.colors.textMain};
`;

const PracticeBadge = styled.span`
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  padding: 0.18rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.66rem;
  font-weight: 700;
`;

const PracticeMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  font-size: 0.76rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const PracticeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.45rem;
  margin-bottom: 0.7rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ProblemCard = styled.div<{ $status: string }>`
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  padding: 0.55rem 0.62rem;
  background: ${props => props.theme.colors.background};
  display: flex;
  flex-direction: column;
  gap: 0.42rem;
  box-shadow: ${props => props.theme.shadows.sm};

  ${props => props.$status === 'solved' && `
    border-color: #22c55e;
    background: linear-gradient(135deg, #ecfdf3 0%, #ffffff 100%);
  `}

  ${props => (props.$status === 'coding' || props.$status === 'submitted_fail') && `
    border-color: #93c5fd;
    background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
  `}
`;

const ProblemTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  align-items: center;
`;

const ProblemTitle = styled.div`
  font-weight: 700;
  color: ${props => props.theme.colors.textMain};
  font-size: 0.88rem;
`;

const ProblemStatus = styled.div`
  font-size: 0.74rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ProblemInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  font-size: 0.7rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ProblemTag = styled.span`
  padding: 0.2rem 0.42rem;
  background: #eff6ff;
  border-radius: ${props => props.theme.radius.sm};
`;

const ProblemActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
`;

const SmallButton = styled(Button)`
  padding: 0.32rem 0.62rem;
  font-size: 0.74rem;
`;

const PracticeFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.55rem;
  padding-top: 0.6rem;
  border-top: 1px solid #dbeafe;
`;

const PracticeHint = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.74rem;
`;

interface RevealedInfo {
  tags?: string[];
}

interface PracticeInProgressProps {
  session: PracticeSession;
  onRead: (problemId: string) => void;
  onThink: (problemId: string) => void;
  onCode: (problemId: string) => void;
  onDebug: (problemId: string) => void;
  onEditorial: (problemId: string) => void;
  onAttempt: (problemId: string) => void;
  onFinish: () => void;
}

function PracticeInProgress({
  session,
  onRead,
  onThink,
  onCode,
  onDebug,
  onEditorial,
  onAttempt,
  onFinish
}: PracticeInProgressProps) {
  const solvedCount = session.problems.filter((problem) => problem.status === 'solved').length;

  return (
    <PracticeSection>
      <PracticeHeader>
        <PracticeTitleRow>
          <PracticeTitle>📚 {session.name}</PracticeTitle>
          <PracticeBadge>{solvedCount}/{session.problems.length} 已解</PracticeBadge>
        </PracticeTitleRow>
        <PracticeMeta>
          <span>{session.mode === 'upsolve' ? '补题模式' : '题单模式'}</span>
          <span>已消耗 {session.cost} AP</span>
          <span>{session.description}</span>
        </PracticeMeta>
      </PracticeHeader>

      <PracticeGrid>
        {session.problems.map((problem) => {
          const revealedInfo = problem.revealedInfo as RevealedInfo | null;
          const isSolved = problem.status === 'solved';
          const canOperate = problem.status === 'coding' || problem.status === 'submitted_fail';

          return (
            <ProblemCard key={problem.id} $status={problem.status}>
              <ProblemTop>
                <ProblemTitle>Problem {problem.letter}</ProblemTitle>
                <ProblemStatus>
                  {isSolved ? '✅ 已攻克' : problem.status === 'pending' ? '未读题' : problem.status === 'submitted_fail' ? '❌ 待修正' : '📝 推进中'}
                </ProblemStatus>
              </ProblemTop>

              <ProblemInfo>
                {problem.sourceContestName && (
                  <ProblemTag>来源: {problem.sourceContestName}</ProblemTag>
                )}
                {problem.editorialViewed && (
                  <ProblemTag>已看题解</ProblemTag>
                )}
                {revealedInfo?.tags?.length ? (
                  <ProblemTag>标签: {revealedInfo.tags.join(' | ')}</ProblemTag>
                ) : null}
              </ProblemInfo>

              <ProblemActions>
                {problem.status === 'pending' && (
                  <SmallButton variant="secondary" size="sm" type="button" onClick={() => onRead(problem.id)}>
                    读题
                  </SmallButton>
                )}
                {canOperate && (
                  <>
                    <SmallButton variant="secondary" size="sm" type="button" onClick={() => onThink(problem.id)}>
                      思考
                    </SmallButton>
                    <SmallButton
                      variant="secondary"
                      size="sm"
                      type="button"
                      onClick={() => onCode(problem.id)}
                      disabled={problem.hasWrittenCode}
                    >
                      写代码
                    </SmallButton>
                    <SmallButton
                      variant="info"
                      size="sm"
                      type="button"
                      onClick={() => onDebug(problem.id)}
                      disabled={!problem.hasWrittenCode}
                    >
                      对拍
                    </SmallButton>
                    <SmallButton
                      variant="primary"
                      size="sm"
                      type="button"
                      onClick={() => onAttempt(problem.id)}
                      disabled={!problem.hasWrittenCode}
                    >
                      提交
                    </SmallButton>
                    <SmallButton
                      variant="danger"
                      size="sm"
                      type="button"
                      onClick={() => onEditorial(problem.id)}
                      disabled={problem.editorialViewed}
                    >
                      看题解
                    </SmallButton>
                  </>
                )}
              </ProblemActions>
            </ProblemCard>
          );
        })}
      </PracticeGrid>

      <PracticeFooter>
        <Button variant="secondary" type="button" onClick={onFinish}>
          结束练习
        </Button>
        <PracticeHint>完成题目后有概率提升相关属性；补题通过后会从待补池移除。</PracticeHint>
      </PracticeFooter>
    </PracticeSection>
  );
}

export default PracticeInProgress;

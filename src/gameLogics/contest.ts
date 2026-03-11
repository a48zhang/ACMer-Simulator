import {
  calculateContestOutcome,
  readProblem,
  thinkProblem,
  codeProblem,
  debugProblem,
  evaluateAttempt,
  resetProblemProgress
} from '../data/contests';
import { getEffectiveContestAttributes } from '../utils';
import type { GameState, LogicResult, Problem, ContestSession, Teammate, Attributes, LogEntry } from '../types';

function buildContestCompletionState(
  gameState: GameState,
  session: ContestSession,
  extraState: Partial<GameState> = {}
): GameState {
  const backlogItems = session.problems
    .filter((problem) => problem.status !== 'solved')
    .map((problem) => ({
      id: crypto.randomUUID(),
      contestId: session.id,
      contestName: session.name,
      problem: resetProblemProgress(problem, {
        sourceContestId: session.id,
        sourceContestName: session.name
      }),
      createdAt: Date.now()
    }));

  return {
    ...gameState,
    activeContest: null,
    contestTimeRemaining: 0,
    practiceBacklog: [...gameState.practiceBacklog, ...backlogItems],
    ...extraState
  };
}

function getProblemFit(problem: Problem, attributes: Partial<Attributes>): number {
  const keys = Object.keys(problem.requires || {});
  if (!keys.length) return 0;

  const total = keys.reduce((sum, key) => {
    const playerVal = (attributes as Record<string, number>)[key] ?? 0;
    const reqVal = (problem.requires as Record<string, number>)[key] ?? 1;
    return sum + (playerVal + 1) / (reqVal + 1);
  }, 0);

  return total / keys.length;
}

function getSelectedTeammates(gameState: GameState): Teammate[] {
  if (!gameState.selectedTeam?.length) return [];

  return gameState.selectedTeam
    .map((id) => gameState.teammates.find((teammate) => teammate.id === id))
    .filter((teammate): teammate is Teammate => Boolean(teammate));
}

function clampChance(value: number, min = 0.05, max = 0.95): number {
  return Math.max(min, Math.min(max, value));
}

function simulateTeammateActions(
  gameState: GameState,
  session: ContestSession,
  initialTimeRemaining: number
): { session: ContestSession; timeRemaining: number; logs: LogEntry[] } {
  const teammates = getSelectedTeammates(gameState);
  if (!teammates.length || initialTimeRemaining <= 0) {
    return { session, timeRemaining: initialTimeRemaining, logs: [] };
  }

  let currentSession = session;
  let timeRemaining = initialTimeRemaining;
  const logs: LogEntry[] = [];

  teammates.forEach((teammate) => {
    if (timeRemaining <= 0) return;

    const teammateAttributes = teammate.attributes;
    const activeProblems = currentSession.problems;
    const speed = teammateAttributes.speed ?? 0;
    const stress = teammateAttributes.stress ?? 0;
    const coding = teammateAttributes.coding ?? 0;
    const algorithm = teammateAttributes.algorithm ?? 0;
    const initiativeChance = clampChance(0.18 + speed * 0.045 + stress * 0.025 + algorithm * 0.015, 0.18, 0.88);

    if (Math.random() > initiativeChance) {
      return;
    }

    const solvableCandidates = activeProblems
      .filter((problem) => problem.status !== 'solved' && (problem.status === 'coding' || problem.status === 'submitted_fail') && problem.hasWrittenCode)
      .map((problem) => ({
        problem,
        attempt: evaluateAttempt(problem, teammateAttributes, problem.thinkBonus, problem.debugBonus || 0),
        fit: getProblemFit(problem, teammateAttributes)
      }))
      .filter((candidate) => candidate.attempt.success)
      .sort((a, b) => (b.attempt.adjustedRatio + b.fit * 0.08) - (a.attempt.adjustedRatio + a.fit * 0.08));

    if (solvableCandidates.length > 0) {
      const { problem, attempt } = solvableCandidates[0];
      const solveChance = clampChance(0.14 + (coding + algorithm) * 0.028 + speed * 0.01 + Math.max(0, attempt.adjustedRatio - 1) * 0.45 + solvableCandidates[0].fit * 0.12, 0.18, 0.94);
      if (Math.random() < solveChance) {
        timeRemaining = Math.max(0, timeRemaining - attempt.timeCost);
        currentSession = {
          ...currentSession,
          problems: activeProblems.map((item) => item.id !== problem.id ? item : {
            ...item,
            status: 'solved',
            attempts: (item.attempts || 0) + 1
          }),
          attempts: [...(currentSession.attempts || []), {
            problemId: problem.id,
            success: true,
            timeCost: attempt.timeCost,
            weakestAttr: attempt.weakestAttr
          }],
          timeRemaining
        };
        logs.push({
          message: `🤝 ${teammate.name} 过了 ${problem.letter} 题，额外消耗 ${attempt.timeCost} 分钟`,
          type: 'success'
        });
        return;
      }
    }

    const debuggableCandidates = activeProblems
      .filter((problem) => problem.status === 'submitted_fail' && problem.hasWrittenCode && (problem.bugCount || 0) > (problem.fixedBugCount || 0))
      .sort((a, b) => getProblemFit(b, teammateAttributes) - getProblemFit(a, teammateAttributes));

    if (debuggableCandidates.length > 0) {
      const problem = debuggableCandidates[0];
      const debugChance = clampChance(0.12 + coding * 0.035 + speed * 0.025 + stress * 0.015 + getProblemFit(problem, teammateAttributes) * 0.2, 0.14, 0.88);
      if (Math.random() < debugChance) {
        const debugResult = debugProblem(problem, teammateAttributes);
        timeRemaining = Math.max(0, timeRemaining - debugResult.debugTime);
        currentSession = {
          ...currentSession,
          problems: activeProblems.map((item) => {
            if (item.id !== problem.id) return item;
            const hasRemainingBugs = (item.bugCount || 0) > debugResult.fixedBugCount;
            return {
              ...item,
              debugBonus: debugResult.newDebugBonus,
              bugFound: item.bugFound || debugResult.foundBug,
              hasBug: hasRemainingBugs,
              fixedBugCount: debugResult.fixedBugCount
            };
          }),
          timeRemaining
        };
        logs.push({
          message: debugResult.foundBug
            ? `🛠️ ${teammate.name} debug 了 ${problem.letter} 题，修掉了一部分隐藏问题`
            : `🛠️ ${teammate.name} debug 了 ${problem.letter} 题，但暂时没修出结果`,
          type: 'info'
        });
        return;
      }
    }

    const thinkableCandidates = activeProblems
      .filter((problem) => problem.status === 'coding' || problem.status === 'submitted_fail')
      .sort((a, b) => getProblemFit(b, teammateAttributes) - getProblemFit(a, teammateAttributes));

    if (thinkableCandidates.length > 0) {
      const problem = thinkableCandidates[0];
      const thinkChance = clampChance(0.14 + algorithm * 0.04 + stress * 0.018 + getProblemFit(problem, teammateAttributes) * 0.24, 0.16, 0.9);
      if (Math.random() < thinkChance) {
        const thinkResult = thinkProblem(problem, teammateAttributes);
        timeRemaining = Math.max(0, timeRemaining - thinkResult.thinkTime);
        currentSession = {
          ...currentSession,
          problems: activeProblems.map((item) => {
            if (item.id !== problem.id) return item;
            const updatedProblem: Problem = {
              ...item,
              thinkBonus: thinkResult.newThinkBonus
            };
            if (thinkResult.newTags && item.revealedInfo) {
              updatedProblem.revealedInfo = {
                ...item.revealedInfo,
                tags: thinkResult.newTags
              };
            }
            return updatedProblem;
          }),
          timeRemaining
        };
        logs.push({
          message: `💭 ${teammate.name} 思考了 ${problem.letter} 题，额外消耗 ${thinkResult.thinkTime} 分钟`,
          type: 'info'
        });
        return;
      }
    }

    const readableCandidates = activeProblems
      .filter((problem) => problem.status === 'pending')
      .sort((a, b) => getProblemFit(b, teammateAttributes) - getProblemFit(a, teammateAttributes));

    if (readableCandidates.length > 0) {
      const problem = readableCandidates[0];
      const readChance = clampChance(0.16 + algorithm * 0.03 + speed * 0.02 + getProblemFit(problem, teammateAttributes) * 0.2, 0.18, 0.92);
      if (Math.random() < readChance) {
        const readResult = readProblem(problem, teammateAttributes);
        timeRemaining = Math.max(0, timeRemaining - readResult.readTime);
        currentSession = {
          ...currentSession,
          problems: activeProblems.map((item) => item.id !== problem.id ? item : {
            ...item,
            status: 'coding',
            revealedInfo: readResult
          }),
          timeRemaining
        };
        logs.push({
          message: `📖 ${teammate.name} 读了 ${problem.letter} 题，额外消耗 ${readResult.readTime} 分钟`,
          type: 'info'
        });
      }
    }
  });

  return { session: currentSession, timeRemaining, logs };
}

/**
 * 完成比赛
 * @param gameState - 当前游戏状态
 * @returns LogicResult
 */
export function finishContest(gameState: GameState): LogicResult {
  const session = gameState.activeContest;
  if (!session) return { newState: gameState, logs: [], uiState: {} };

  const outcome = calculateContestOutcome(session, gameState.contestTimeRemaining, gameState.rating);
  const newState = buildContestCompletionState(gameState, session);

  return {
    newState,
    logs: [{
      message: `📊 比赛结束：解出 ${outcome.solved}/${outcome.total} 题，用时 ${outcome.timeUsed} 分钟`,
      type: 'success'
    }],
    uiState: {
      showContestResult: true,
      contestOutcome: outcome
    }
  };
}

/**
 * 读题阶段
 * @param gameState - 当前游戏状态
 * @param problemId - 题目ID
 * @returns LogicResult
 */
export function readContestProblem(gameState: GameState, problemId: string): LogicResult {
  const session = gameState.activeContest;
  if (!session) return { newState: gameState, logs: [], uiState: {} };
  if (gameState.contestTimeRemaining <= 0) return { newState: gameState, logs: [], uiState: {} };
  const effectiveAttributes = getEffectiveContestAttributes(gameState);

  const problem = session.problems.find((p: Problem) => p.id === problemId);
  if (!problem || problem.status !== 'pending') return { newState: gameState, logs: [], uiState: {} };

  const readResult = readProblem(problem, effectiveAttributes);
  const timeRemaining = Math.max(0, gameState.contestTimeRemaining - readResult.readTime);

  const updatedProblems: Problem[] = session.problems.map((p: Problem) => {
    if (p.id !== problemId) return p;
    return {
      ...p,
      status: 'coding',
      revealedInfo: readResult
    };
  });

  const nextSession: ContestSession = {
    ...session,
    problems: updatedProblems,
    timeRemaining
  };
  const teammateTurn = simulateTeammateActions(gameState, nextSession, timeRemaining);
  const finalSession = teammateTurn.session;
  const finalTimeRemaining = teammateTurn.timeRemaining;

  const solvedAll = finalSession.problems.every((p: Problem) => p.status === 'solved');
  const shouldFinish = solvedAll || finalTimeRemaining <= 0;

  if (shouldFinish) {
    const outcome = calculateContestOutcome(finalSession, finalTimeRemaining, gameState.rating);
    return {
      newState: {
        ...buildContestCompletionState(gameState, finalSession)
      },
      logs: [
        {
          message: `📖 阅读题目 ${problem.letter}：耗时 ${readResult.readTime} 分钟，揭露标签 ${readResult.tags.join('、')}`,
          type: 'info'
        },
        ...teammateTurn.logs,
        {
          message: `📊 比赛结束：解出 ${outcome.solved}/${outcome.total} 题，用时 ${outcome.timeUsed} 分钟`,
          type: 'success'
        }
      ],
      uiState: {
        showContestResult: true,
        contestOutcome: outcome
      }
    };
  }

  return {
    newState: {
      ...gameState,
      activeContest: finalSession,
      contestTimeRemaining: finalTimeRemaining
    },
    logs: [
      {
        message: `📖 阅读题目 ${problem.letter}：耗时 ${readResult.readTime} 分钟，揭露标签 ${readResult.tags.join('、')}`,
        type: 'info'
      },
      ...teammateTurn.logs
    ],
    uiState: {}
  };
}

/**
 * 思考阶段
 * @param gameState - 当前游戏状态
 * @param problemId - 题目ID
 * @returns LogicResult
 */
export function thinkContestProblem(gameState: GameState, problemId: string): LogicResult {
  const session = gameState.activeContest;
  if (!session) return { newState: gameState, logs: [], uiState: {} };
  if (gameState.contestTimeRemaining <= 0) return { newState: gameState, logs: [], uiState: {} };
  const effectiveAttributes = getEffectiveContestAttributes(gameState);

  const problem = session.problems.find((p: Problem) => p.id === problemId);
  if (!problem) return { newState: gameState, logs: [], uiState: {} };
  if (problem.status !== 'coding' && problem.status !== 'submitted_fail') {
    return { newState: gameState, logs: [], uiState: {} };
  }

  const thinkResult = thinkProblem(problem, effectiveAttributes);
  const timeRemaining = Math.max(0, gameState.contestTimeRemaining - thinkResult.thinkTime);

  const updatedProblems: Problem[] = session.problems.map((p: Problem) => {
    if (p.id !== problemId) return p;
    const updatedProblem = {
      ...p,
      thinkBonus: thinkResult.newThinkBonus
    };
    if (thinkResult.newTags && problem.revealedInfo) {
      updatedProblem.revealedInfo = {
        ...problem.revealedInfo,
        tags: thinkResult.newTags
      };
    }
    return updatedProblem;
  });

  const nextSession: ContestSession = {
    ...session,
    problems: updatedProblems,
    timeRemaining
  };
  const teammateTurn = simulateTeammateActions(gameState, nextSession, timeRemaining);
  const finalSession = teammateTurn.session;
  const finalTimeRemaining = teammateTurn.timeRemaining;

  const solvedAll = finalSession.problems.every((p: Problem) => p.status === 'solved');
  const shouldFinish = solvedAll || finalTimeRemaining <= 0;

  if (shouldFinish) {
    const outcome = calculateContestOutcome(finalSession, finalTimeRemaining, gameState.rating);
    return {
      newState: {
        ...buildContestCompletionState(gameState, finalSession)
      },
      logs: [
        {
          message: `🧠 思考题目 ${problem.letter}：耗时 ${thinkResult.thinkTime} 分钟`,
          type: 'info'
        },
        ...teammateTurn.logs,
        {
          message: `📊 比赛结束：解出 ${outcome.solved}/${outcome.total} 题，用时 ${outcome.timeUsed} 分钟`,
          type: 'success'
        }
      ],
      uiState: {
        showContestResult: true,
        contestOutcome: outcome
      }
    };
  }

  return {
    newState: {
      ...gameState,
      activeContest: finalSession,
      contestTimeRemaining: finalTimeRemaining
    },
    logs: [
      {
        message: `🧠 思考题目 ${problem.letter}：耗时 ${thinkResult.thinkTime} 分钟`,
        type: 'info'
      },
      ...teammateTurn.logs
    ],
    uiState: {}
  };
}

/**
 * 写代码阶段
 * @param gameState - 当前游戏状态
 * @param problemId - 题目ID
 * @returns LogicResult
 */
export function codeContestProblem(gameState: GameState, problemId: string): LogicResult {
  const session = gameState.activeContest;
  if (!session) return { newState: gameState, logs: [], uiState: {} };
  if (gameState.contestTimeRemaining <= 0) return { newState: gameState, logs: [], uiState: {} };
  const effectiveAttributes = getEffectiveContestAttributes(gameState);

  const problem = session.problems.find((p: Problem) => p.id === problemId);
  if (!problem) return { newState: gameState, logs: [], uiState: {} };
  if (problem.status !== 'coding' && problem.status !== 'submitted_fail') {
    return { newState: gameState, logs: [], uiState: {} };
  }

  const codeResult = codeProblem(problem, effectiveAttributes);
  const timeRemaining = Math.max(0, gameState.contestTimeRemaining - codeResult.codeTime);

  const updatedProblems: Problem[] = session.problems.map((p: Problem) => {
    if (p.id !== problemId) return p;
    return {
      ...p,
      status: 'coding',
      hasWrittenCode: true,
      hasBug: codeResult.hasBug,
      bugFound: false,
      codeScore: codeResult.codeScore,
      bugCount: codeResult.bugCount,
      fixedBugCount: codeResult.fixedBugCount,
      codeAttempts: codeResult.codeAttempts,
      debugBonus: 0
    };
  });

  const nextSession: ContestSession = {
    ...session,
    problems: updatedProblems,
    timeRemaining
  };
  const teammateTurn = simulateTeammateActions(gameState, nextSession, timeRemaining);
  const finalSession = teammateTurn.session;
  const finalTimeRemaining = teammateTurn.timeRemaining;

  const solvedAll = finalSession.problems.every((p: Problem) => p.status === 'solved');
  const shouldFinish = solvedAll || finalTimeRemaining <= 0;

  if (shouldFinish) {
    const outcome = calculateContestOutcome(finalSession, finalTimeRemaining, gameState.rating);
    return {
      newState: {
        ...buildContestCompletionState(gameState, finalSession)
      },
      logs: [
        {
          message: `💻 写代码题目 ${problem.letter}：耗时 ${codeResult.codeTime} 分钟`,
          type: 'info'
        },
        ...teammateTurn.logs,
        {
          message: `📊 比赛结束：解出 ${outcome.solved}/${outcome.total} 题，用时 ${outcome.timeUsed} 分钟`,
          type: 'success'
        }
      ],
      uiState: {
        showContestResult: true,
        contestOutcome: outcome
      }
    };
  }

  return {
    newState: {
      ...gameState,
      activeContest: finalSession,
      contestTimeRemaining: finalTimeRemaining
    },
    logs: [
      {
        message: `💻 写代码题目 ${problem.letter}：耗时 ${codeResult.codeTime} 分钟`,
        type: 'info'
      },
      ...teammateTurn.logs
    ],
    uiState: {}
  };
}

/**
 * 对拍阶段
 * @param gameState - 当前游戏状态
 * @param problemId - 题目ID
 * @returns LogicResult
 */
export function debugContestProblem(gameState: GameState, problemId: string): LogicResult {
  const session = gameState.activeContest;
  if (!session) return { newState: gameState, logs: [], uiState: {} };
  if (gameState.contestTimeRemaining <= 0) return { newState: gameState, logs: [], uiState: {} };
  const effectiveAttributes = getEffectiveContestAttributes(gameState);

  const problem = session.problems.find((p: Problem) => p.id === problemId);
  if (!problem) return { newState: gameState, logs: [], uiState: {} };
  if (problem.status !== 'coding' && problem.status !== 'submitted_fail') {
    return { newState: gameState, logs: [], uiState: {} };
  }

  const debugResult = debugProblem(problem, effectiveAttributes);
  const timeRemaining = Math.max(0, gameState.contestTimeRemaining - debugResult.debugTime);

  const updatedProblems: Problem[] = session.problems.map((p: Problem) => {
    if (p.id !== problemId) return p;
    const hasRemainingBugs = (p.bugCount || 0) > debugResult.fixedBugCount;
    return {
      ...p,
      debugBonus: debugResult.newDebugBonus,
      bugFound: p.bugFound || debugResult.foundBug,
      hasBug: hasRemainingBugs,
      fixedBugCount: debugResult.fixedBugCount
    };
  });

  const nextSession: ContestSession = {
    ...session,
    problems: updatedProblems,
    timeRemaining
  };
  const teammateTurn = simulateTeammateActions(gameState, nextSession, timeRemaining);
  const finalSession = teammateTurn.session;
  const finalTimeRemaining = teammateTurn.timeRemaining;

  let logMessage;
  if (debugResult.foundBug) {
    logMessage = `🔍 对拍题目 ${problem.letter}：耗时 ${debugResult.debugTime} 分钟，修掉了一部分隐藏问题`;
  } else {
    logMessage = `🔍 对拍题目 ${problem.letter}：耗时 ${debugResult.debugTime} 分钟，未发现异常`;
  }

  const solvedAll = finalSession.problems.every((p: Problem) => p.status === 'solved');
  const shouldFinish = solvedAll || finalTimeRemaining <= 0;

  if (shouldFinish) {
    const outcome = calculateContestOutcome(finalSession, finalTimeRemaining, gameState.rating);
    return {
      newState: {
        ...buildContestCompletionState(gameState, finalSession)
      },
      logs: [
        { message: logMessage, type: debugResult.foundBug ? 'success' : 'info' },
        ...teammateTurn.logs,
        {
          message: `📊 比赛结束：解出 ${outcome.solved}/${outcome.total} 题，用时 ${outcome.timeUsed} 分钟`,
          type: 'success'
        }
      ],
      uiState: {
        showContestResult: true,
        contestOutcome: outcome
      }
    };
  }

  return {
    newState: {
      ...gameState,
      activeContest: finalSession,
      contestTimeRemaining: finalTimeRemaining
    },
    logs: [
      { message: logMessage, type: debugResult.foundBug ? 'success' : 'info' },
      ...teammateTurn.logs
    ],
    uiState: {}
  };
}

/**
 * 尝试比赛题目
 * @param gameState - 当前游戏状态
 * @param problemId - 题目ID
 * @returns LogicResult
 */
export function attemptContestProblem(gameState: GameState, problemId: string): LogicResult {
  const session = gameState.activeContest;
  if (!session) return { newState: gameState, logs: [], uiState: {} };
  if (gameState.contestTimeRemaining <= 0) return { newState: gameState, logs: [], uiState: {} };
  const effectiveAttributes = getEffectiveContestAttributes(gameState);

  const problem = session.problems.find((p: Problem) => p.id === problemId);
  if (!problem || problem.status === 'solved') return { newState: gameState, logs: [], uiState: {} };
  if (problem.status !== 'coding' && problem.status !== 'submitted_fail') {
    return { newState: gameState, logs: [], uiState: {} };
  }

  if ((session as unknown as { isOrdered?: boolean }).isOrdered) {
    const blocked = session.problems.some((p: Problem) => p.order < problem.order && p.status !== 'solved');
    if (blocked) return { newState: gameState, logs: [], uiState: {} };
  }

  const attempt = evaluateAttempt(problem, effectiveAttributes, problem.thinkBonus, problem.debugBonus || 0);
  const updatedProblems: Problem[] = session.problems.map((p: Problem) => {
    if (p.id !== problemId) return p;
    return {
      ...p,
      status: attempt.success ? 'solved' : 'submitted_fail',
      attempts: (p.attempts || 0) + 1
    };
  });

  const timeRemaining = Math.max(0, gameState.contestTimeRemaining - attempt.timeCost);
  const attemptLog = {
    problemId,
    success: attempt.success,
    timeCost: attempt.timeCost,
    weakestAttr: attempt.weakestAttr
  };

  const nextSession: ContestSession = {
    ...session,
    problems: updatedProblems,
    attempts: [...(session.attempts || []), attemptLog],
    timeRemaining
  };
  const teammateTurn = simulateTeammateActions(gameState, nextSession, timeRemaining);
  const finalSession = teammateTurn.session;
  const finalTimeRemaining = teammateTurn.timeRemaining;

  const solvedAll = finalSession.problems.every((p: Problem) => p.status === 'solved');
  const shouldFinish = solvedAll || finalTimeRemaining <= 0;
  const problemSolved = attempt.success;

  if (shouldFinish) {
    const outcome = calculateContestOutcome(finalSession, finalTimeRemaining, gameState.rating);
    return {
      newState: {
        ...buildContestCompletionState(gameState, finalSession, {
        playerProblems: problemSolved ? gameState.playerProblems + 1 : gameState.playerProblems
        })
      },
      logs: [
        {
          message: `🧩 尝试题目 ${problem.letter}：${attempt.success ? '通过' : '未通过'}，耗时 ${attempt.timeCost} 分钟`,
          type: attempt.success ? 'success' : 'warning'
        },
        ...teammateTurn.logs,
        {
          message: `📊 比赛结束：解出 ${outcome.solved}/${outcome.total} 题，用时 ${outcome.timeUsed} 分钟`,
          type: 'success'
        }
      ],
      uiState: {
        showContestResult: true,
        contestOutcome: outcome
      }
    };
  }

  return {
    newState: {
      ...gameState,
      activeContest: finalSession,
      contestTimeRemaining: finalTimeRemaining,
      playerProblems: problemSolved ? gameState.playerProblems + 1 : gameState.playerProblems
    },
    logs: [
      {
        message: `🧩 尝试题目 ${problem.letter}：${attempt.success ? '通过' : '未通过'}，耗时 ${attempt.timeCost} 分钟`,
        type: attempt.success ? 'success' : 'warning'
      },
      ...teammateTurn.logs
    ],
    uiState: {}
  };
}

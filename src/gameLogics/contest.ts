import { calculateContestOutcome, readProblem, thinkProblem, codeProblem, debugProblem, evaluateAttempt } from '../data/contests';
import type { GameState, LogicResult, Problem, ContestSession } from '../types';

/**
 * 完成比赛
 * @param gameState - 当前游戏状态
 * @returns LogicResult
 */
export function finishContest(gameState: GameState): LogicResult {
  const session = gameState.activeContest;
  if (!session) return { newState: gameState, logs: [], uiState: {} };

  const outcome = calculateContestOutcome(session, gameState.contestTimeRemaining, gameState.rating);

  const newState = {
    ...gameState,
    activeContest: null,
    contestTimeRemaining: 0
  };

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

  const problem = session.problems.find((p: Problem) => p.id === problemId);
  if (!problem || problem.status !== 'pending') return { newState: gameState, logs: [], uiState: {} };

  const readResult = readProblem(problem, gameState.attributes);
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

  const solvedAll = updatedProblems.every((p: Problem) => p.status === 'solved');
  const shouldFinish = solvedAll || timeRemaining <= 0;

  if (shouldFinish) {
    const outcome = calculateContestOutcome(nextSession, timeRemaining, gameState.rating);
    return {
      newState: {
        ...gameState,
        activeContest: null,
        contestTimeRemaining: 0
      },
      logs: [
        {
          message: `📖 阅读题目 ${problem.letter}：耗时 ${readResult.readTime} 分钟，揭露标签 ${readResult.tags.join('、')}`,
          type: 'info'
        },
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
      activeContest: nextSession,
      contestTimeRemaining: timeRemaining
    },
    logs: [{
      message: `📖 阅读题目 ${problem.letter}：耗时 ${readResult.readTime} 分钟，揭露标签 ${readResult.tags.join('、')}`,
      type: 'info'
    }],
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

  const problem = session.problems.find((p: Problem) => p.id === problemId);
  if (!problem) return { newState: gameState, logs: [], uiState: {} };
  if (problem.status !== 'coding' && problem.status !== 'submitted_fail') {
    return { newState: gameState, logs: [], uiState: {} };
  }

  const thinkResult = thinkProblem(problem, gameState.attributes);
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

  const solvedAll = updatedProblems.every((p: Problem) => p.status === 'solved');
  const shouldFinish = solvedAll || timeRemaining <= 0;

  if (shouldFinish) {
    const outcome = calculateContestOutcome(nextSession, timeRemaining, gameState.rating);
    return {
      newState: {
        ...gameState,
        activeContest: null,
        contestTimeRemaining: 0
      },
      logs: [
        {
          message: `🧠 思考题目 ${problem.letter}：耗时 ${thinkResult.thinkTime} 分钟`,
          type: 'info'
        },
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
      activeContest: nextSession,
      contestTimeRemaining: timeRemaining
    },
    logs: [{
      message: `🧠 思考题目 ${problem.letter}：耗时 ${thinkResult.thinkTime} 分钟`,
      type: 'info'
    }],
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

  const problem = session.problems.find((p: Problem) => p.id === problemId);
  if (!problem) return { newState: gameState, logs: [], uiState: {} };
  if (problem.status !== 'coding' && problem.status !== 'submitted_fail') {
    return { newState: gameState, logs: [], uiState: {} };
  }
  if (problem.hasWrittenCode) return { newState: gameState, logs: [], uiState: {} };

  const codeResult = codeProblem(problem, gameState.attributes);
  const timeRemaining = Math.max(0, gameState.contestTimeRemaining - codeResult.codeTime);

  const updatedProblems: Problem[] = session.problems.map((p: Problem) => {
    if (p.id !== problemId) return p;
    return {
      ...p,
      hasWrittenCode: true,
      hasBug: codeResult.hasBug
    };
  });

  const nextSession: ContestSession = {
    ...session,
    problems: updatedProblems,
    timeRemaining
  };

  const solvedAll = updatedProblems.every((p: Problem) => p.status === 'solved');
  const shouldFinish = solvedAll || timeRemaining <= 0;

  if (shouldFinish) {
    const outcome = calculateContestOutcome(nextSession, timeRemaining, gameState.rating);
    return {
      newState: {
        ...gameState,
        activeContest: null,
        contestTimeRemaining: 0
      },
      logs: [
        {
          message: `💻 写代码题目 ${problem.letter}：耗时 ${codeResult.codeTime} 分钟`,
          type: 'info'
        },
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
      activeContest: nextSession,
      contestTimeRemaining: timeRemaining
    },
    logs: [{
      message: `💻 写代码题目 ${problem.letter}：耗时 ${codeResult.codeTime} 分钟`,
      type: 'info'
    }],
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

  const problem = session.problems.find((p: Problem) => p.id === problemId);
  if (!problem) return { newState: gameState, logs: [], uiState: {} };
  if (problem.status !== 'coding' && problem.status !== 'submitted_fail') {
    return { newState: gameState, logs: [], uiState: {} };
  }

  const debugResult = debugProblem(problem, gameState.attributes);
  const timeRemaining = Math.max(0, gameState.contestTimeRemaining - debugResult.debugTime);

  const updatedProblems: Problem[] = session.problems.map((p: Problem) => {
    if (p.id !== problemId) return p;
    return {
      ...p,
      debugBonus: debugResult.newDebugBonus,
      bugFound: p.bugFound || debugResult.foundBug,
      thinkBonus: debugResult.bonusIncrease > 0 ? p.thinkBonus + debugResult.bonusIncrease : p.thinkBonus,
      hasBug: debugResult.foundBug ? false : p.hasBug,
      hasWrittenCode: debugResult.foundBug ? false : p.hasWrittenCode
    };
  });

  const nextSession: ContestSession = {
    ...session,
    problems: updatedProblems,
    timeRemaining
  };

  let logMessage;
  if (debugResult.foundBug) {
    logMessage = `🔍 对拍题目 ${problem.letter}：耗时 ${debugResult.debugTime} 分钟，发现了bug！需要重新写代码`;
  } else if (debugResult.bonusIncrease > 0) {
    logMessage = `🔍 对拍题目 ${problem.letter}：耗时 ${debugResult.debugTime} 分钟，获得额外加成`;
  } else {
    logMessage = `🔍 对拍题目 ${problem.letter}：耗时 ${debugResult.debugTime} 分钟，未发现异常`;
  }

  const solvedAll = updatedProblems.every((p: Problem) => p.status === 'solved');
  const shouldFinish = solvedAll || timeRemaining <= 0;

  if (shouldFinish) {
    const outcome = calculateContestOutcome(nextSession, timeRemaining, gameState.rating);
    return {
      newState: {
        ...gameState,
        activeContest: null,
        contestTimeRemaining: 0
      },
      logs: [
        { message: logMessage, type: debugResult.foundBug ? 'success' : 'info' },
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
      activeContest: nextSession,
      contestTimeRemaining: timeRemaining
    },
    logs: [{ message: logMessage, type: debugResult.foundBug ? 'success' : 'info' }],
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

  const problem = session.problems.find((p: Problem) => p.id === problemId);
  if (!problem || problem.status === 'solved') return { newState: gameState, logs: [], uiState: {} };
  if (problem.status !== 'coding' && problem.status !== 'submitted_fail') {
    return { newState: gameState, logs: [], uiState: {} };
  }

  if ((session as unknown as { isOrdered?: boolean }).isOrdered) {
    const blocked = session.problems.some((p: Problem) => p.order < problem.order && p.status !== 'solved');
    if (blocked) return { newState: gameState, logs: [], uiState: {} };
  }

  const attempt = evaluateAttempt(problem, gameState.attributes, problem.thinkBonus, problem.debugBonus || 0);
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

  const solvedAll = updatedProblems.every((p: Problem) => p.status === 'solved');
  const shouldFinish = solvedAll || timeRemaining <= 0;
  const problemSolved = attempt.success;

  if (shouldFinish) {
    const outcome = calculateContestOutcome(nextSession, timeRemaining, gameState.rating);
    return {
      newState: {
        ...gameState,
        activeContest: null,
        contestTimeRemaining: 0,
        playerProblems: problemSolved ? gameState.playerProblems + 1 : gameState.playerProblems
      },
      logs: [
        {
          message: `🧩 尝试题目 ${problem.letter}：${attempt.success ? '通过' : '未通过'}，耗时 ${attempt.timeCost} 分钟`,
          type: attempt.success ? 'success' : 'warning'
        },
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
      activeContest: nextSession,
      contestTimeRemaining: timeRemaining,
      playerProblems: problemSolved ? gameState.playerProblems + 1 : gameState.playerProblems
    },
    logs: [{
      message: `🧩 尝试题目 ${problem.letter}：${attempt.success ? '通过' : '未通过'}，耗时 ${attempt.timeCost} 分钟`,
      type: attempt.success ? 'success' : 'warning'
    }],
    uiState: {}
  };
}

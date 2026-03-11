import {
  readProblem,
  thinkProblem,
  codeProblem,
  debugProblem,
  evaluateAttempt,
  getProblemTagNames
} from '../data/contests';
import { applyAttributeChanges } from '../utils';
import type {
  Attributes,
  GameState,
  LogicResult,
  PracticeOption,
  PracticeSession,
  Problem,
  LogEntry
} from '../types';

const PRACTICE_REWARD_CHANCE = 0.45;

function getPracticeState(gameState: GameState): PracticeSession | null {
  return gameState.activePractice;
}

function createPracticeSession(option: PracticeOption): PracticeSession {
  return {
    id: `practice-${crypto.randomUUID()}`,
    name: option.name,
    description: option.description,
    mode: option.mode,
    cost: option.cost,
    problems: option.problems,
    startedAt: Date.now()
  };
}

function getFocusAttributeKeys(problem: Problem): (keyof Attributes)[] {
  const specialized: (keyof Attributes)[] = [
    'math',
    'dp',
    'graph',
    'dataStructure',
    'string',
    'search',
    'greedy',
    'geometry'
  ];
  const fallback: (keyof Attributes)[] = ['algorithm', 'coding', 'speed', 'stress'];
  const requireKeys = Object.keys(problem.requires || {}) as (keyof Attributes)[];
  const focused = requireKeys.filter((key) => specialized.includes(key));
  return (focused.length > 0 ? focused : requireKeys.filter((key) => fallback.includes(key))).slice(0, 3);
}

function formatRewardLabel(key: keyof Attributes): string {
  const names: Record<keyof Attributes, string> = {
    coding: '代码',
    algorithm: '算法',
    speed: '速度',
    stress: '抗压',
    math: '数学',
    dp: '动态规划',
    graph: '图论',
    dataStructure: '数据结构',
    string: '字符串',
    search: '搜索',
    greedy: '贪心',
    geometry: '计算几何'
  };
  return names[key];
}

function pickRewardAttributes(problem: Problem): Partial<Attributes> | null {
  if (Math.random() >= PRACTICE_REWARD_CHANCE) return null;

  const keys = getFocusAttributeKeys(problem);
  if (!keys.length) return null;

  const pool = [...keys];
  const rewardCount = problem.difficulty >= 4 && pool.length > 1 && Math.random() < 0.35 ? 2 : 1;
  const changes: Partial<Attributes> = {};

  for (let i = 0; i < rewardCount && pool.length > 0; i += 1) {
    const index = Math.floor(Math.random() * pool.length);
    const key = pool.splice(index, 1)[0];
    changes[key] = (changes[key] || 0) + 1;
  }

  return changes;
}

function finalizePracticeIfCompleted(
  gameState: GameState,
  session: PracticeSession,
  logs: LogEntry[],
  stateOverrides: Partial<GameState> = {}
): LogicResult {
  const allSolved = session.problems.every((problem) => problem.status === 'solved');
  if (!allSolved) {
    return {
      newState: {
        ...gameState,
        activePractice: session,
        ...stateOverrides
      },
      logs,
      uiState: {}
    };
  }

  return {
    newState: {
      ...gameState,
      activePractice: null,
      ...stateOverrides
    },
    logs: [
      ...logs,
      {
        message: `✅ ${session.name} 完成，共攻克 ${session.problems.length} 道题。`,
        type: 'success'
      }
    ],
    uiState: {}
  };
}

export function startPracticeSession(gameState: GameState, option: PracticeOption): LogicResult {
  const logs: LogEntry[] = [];

  if (gameState.activeContest) {
    logs.push({ message: '⚠️ 正在比赛中，不能开始练习。', type: 'warning' });
    return { newState: gameState, logs, uiState: { showPracticeContestDialog: false } };
  }

  if (gameState.activePractice) {
    logs.push({ message: '⚠️ 已有正在进行的练习。', type: 'warning' });
    return { newState: gameState, logs, uiState: { showPracticeContestDialog: false } };
  }

  if (gameState.remainingAP < option.cost) {
    logs.push({
      message: `❌ 行动点不足！需要 ${option.cost} AP，剩余 ${gameState.remainingAP} AP`,
      type: 'error'
    });
    return { newState: gameState, logs, uiState: { showPracticeContestDialog: true } };
  }

  const session = createPracticeSession(option);
  logs.push({
    message: `📚 开始${session.name}（${session.problems.length} 题，消耗 ${session.cost} AP）`,
    type: 'info'
  });

  return {
    newState: {
      ...gameState,
      remainingAP: Math.max(0, gameState.remainingAP - option.cost),
      activePractice: session,
      selectedTeam: null
    },
    logs,
    uiState: { showPracticeContestDialog: false }
  };
}

export function finishPracticeSession(gameState: GameState): LogicResult {
  if (!gameState.activePractice) return { newState: gameState, logs: [], uiState: {} };
  return {
    newState: {
      ...gameState,
      activePractice: null
    },
    logs: [{ message: `📘 结束${gameState.activePractice.name}，本次练习进度已关闭。`, type: 'info' }],
    uiState: {}
  };
}

export function readPracticeProblem(gameState: GameState, problemId: string): LogicResult {
  const session = getPracticeState(gameState);
  if (!session) return { newState: gameState, logs: [], uiState: {} };

  const problem = session.problems.find((item) => item.id === problemId);
  if (!problem || problem.status !== 'pending') return { newState: gameState, logs: [], uiState: {} };

  const readResult = readProblem(problem, gameState.attributes);
  const nextSession: PracticeSession = {
    ...session,
    problems: session.problems.map((item) => item.id !== problemId ? item : {
      ...item,
      status: 'coding',
      revealedInfo: readResult
    })
  };

  return {
    newState: {
      ...gameState,
      activePractice: nextSession
    },
    logs: [{
      message: `📖 练习读题 ${problem.letter}：揭露标签 ${readResult.tags.join('、')}`,
      type: 'info'
    }],
    uiState: {}
  };
}

export function thinkPracticeProblem(gameState: GameState, problemId: string): LogicResult {
  const session = getPracticeState(gameState);
  if (!session) return { newState: gameState, logs: [], uiState: {} };

  const problem = session.problems.find((item) => item.id === problemId);
  if (!problem || (problem.status !== 'coding' && problem.status !== 'submitted_fail')) {
    return { newState: gameState, logs: [], uiState: {} };
  }

  const thinkResult = thinkProblem(problem, gameState.attributes);
  const nextSession: PracticeSession = {
    ...session,
    problems: session.problems.map((item) => {
      if (item.id !== problemId) return item;
      const updated: Problem = {
        ...item,
        thinkBonus: thinkResult.newThinkBonus
      };
      if (thinkResult.newTags && item.revealedInfo) {
        updated.revealedInfo = {
          ...item.revealedInfo,
          tags: thinkResult.newTags
        };
      }
      return updated;
    })
  };

  return {
    newState: {
      ...gameState,
      activePractice: nextSession
    },
    logs: [{
      message: `🧠 练习思考 ${problem.letter}：思路更清晰了一些。`,
      type: 'info'
    }],
    uiState: {}
  };
}

export function codePracticeProblem(gameState: GameState, problemId: string): LogicResult {
  const session = getPracticeState(gameState);
  if (!session) return { newState: gameState, logs: [], uiState: {} };

  const problem = session.problems.find((item) => item.id === problemId);
  if (!problem || (problem.status !== 'coding' && problem.status !== 'submitted_fail')) {
    return { newState: gameState, logs: [], uiState: {} };
  }

  const codeResult = codeProblem(problem, gameState.attributes);
  const nextSession: PracticeSession = {
    ...session,
    problems: session.problems.map((item) => item.id !== problemId ? item : {
      ...item,
      status: 'coding',
      hasWrittenCode: true,
      hasBug: codeResult.hasBug,
      bugFound: false,
      codeScore: codeResult.codeScore,
      bugCount: codeResult.bugCount,
      fixedBugCount: codeResult.fixedBugCount,
      codeAttempts: codeResult.codeAttempts,
      debugBonus: 0
    })
  };

  return {
    newState: {
      ...gameState,
      activePractice: nextSession
    },
    logs: [{
      message: `💻 练习写代码 ${problem.letter}：${codeResult.hasBug ? '可能埋了点坑。' : '实现完成。'}`,
      type: 'info'
    }],
    uiState: {}
  };
}

export function debugPracticeProblem(gameState: GameState, problemId: string): LogicResult {
  const session = getPracticeState(gameState);
  if (!session) return { newState: gameState, logs: [], uiState: {} };

  const problem = session.problems.find((item) => item.id === problemId);
  if (!problem || (problem.status !== 'coding' && problem.status !== 'submitted_fail')) {
    return { newState: gameState, logs: [], uiState: {} };
  }

  const debugResult = debugProblem(problem, gameState.attributes);
  const nextSession: PracticeSession = {
    ...session,
    problems: session.problems.map((item) => {
      if (item.id !== problemId) return item;
      const hasRemainingBugs = (item.bugCount || 0) > debugResult.fixedBugCount;
      return {
        ...item,
        debugBonus: debugResult.newDebugBonus,
        bugFound: item.bugFound || debugResult.foundBug,
        hasBug: hasRemainingBugs,
        fixedBugCount: debugResult.fixedBugCount
      };
    })
  };

  const message = debugResult.foundBug
    ? `🔍 练习对拍 ${problem.letter}：修掉了一部分隐藏问题。`
    : `🔍 练习对拍 ${problem.letter}：暂时没找到明显问题。`;

  return {
    newState: {
      ...gameState,
      activePractice: nextSession
    },
    logs: [{ message, type: debugResult.foundBug ? 'success' : 'info' }],
    uiState: {}
  };
}

export function viewPracticeEditorial(gameState: GameState, problemId: string): LogicResult {
  const session = getPracticeState(gameState);
  if (!session) return { newState: gameState, logs: [], uiState: {} };

  const problem = session.problems.find((item) => item.id === problemId);
  if (!problem || problem.status === 'solved' || problem.editorialViewed) {
    return { newState: gameState, logs: [], uiState: {} };
  }

  const tags = getProblemTagNames(problem);
  const nextSession: PracticeSession = {
    ...session,
    problems: session.problems.map((item) => item.id !== problemId ? item : {
      ...item,
      editorialViewed: true,
      thinkBonus: item.thinkBonus + 1.25,
      debugBonus: item.debugBonus + 1,
      revealedInfo: {
        tags,
        estimatedSuccessRate: 100
      }
    })
  };

  return {
    newState: {
      ...gameState,
      activePractice: nextSession
    },
    logs: [{
      message: `📘 看题解 ${problem.letter}：补全了关键思路，相关标签 ${tags.join('、')}。`,
      type: 'success'
    }],
    uiState: {}
  };
}

export function attemptPracticeProblem(gameState: GameState, problemId: string): LogicResult {
  const session = getPracticeState(gameState);
  if (!session) return { newState: gameState, logs: [], uiState: {} };

  const problem = session.problems.find((item) => item.id === problemId);
  if (!problem || problem.status === 'solved' || (problem.status !== 'coding' && problem.status !== 'submitted_fail')) {
    return { newState: gameState, logs: [], uiState: {} };
  }

  const attempt = evaluateAttempt(problem, gameState.attributes, problem.thinkBonus, problem.debugBonus || 0);
  const nextSession: PracticeSession = {
    ...session,
    problems: session.problems.map((item) => item.id !== problemId ? item : {
      ...item,
      status: attempt.success ? 'solved' : 'submitted_fail',
      attempts: (item.attempts || 0) + 1
    })
  };

  const logs: LogEntry[] = [{
    message: `🧩 练习提交 ${problem.letter}：${attempt.success ? '通过' : '未通过'}`,
    type: attempt.success ? 'success' : 'warning'
  }];

  if (!attempt.success) {
    return {
      newState: {
        ...gameState,
        activePractice: nextSession
      },
      logs,
      uiState: {}
    };
  }

  let nextAttributes = gameState.attributes;
  const reward = pickRewardAttributes(problem);
  if (reward) {
    nextAttributes = applyAttributeChanges(gameState.attributes, reward);
    const rewardText = Object.entries(reward)
      .map(([key, value]) => `${formatRewardLabel(key as keyof Attributes)}+${value}`)
      .join('，');
    logs.push({
      message: `✨ 练习吸收了这道题的套路，${rewardText}。`,
      type: 'success'
    });
  }

  const nextBacklog = problem.backlogId
    ? gameState.practiceBacklog.filter((item) => item.id !== problem.backlogId)
    : gameState.practiceBacklog;

  return finalizePracticeIfCompleted(gameState, nextSession, logs, {
    attributes: nextAttributes,
    playerProblems: gameState.playerProblems + 1,
    practiceBacklog: nextBacklog
  });
}

import { INITIAL_SAN, INITIAL_BALANCE, INITIAL_GPA, START_MONTH } from '../constants';
import { clampValue } from '../utils';
import { applyTraitEffects } from '../data/traits';
import { scheduleMonthlyEvents } from '../data/events';
import { createInitialGameState } from '../gameState';
import { createContestSession } from '../data/contests';
import type { GameState, LogicResult, LogEntry, Teammate, ContestConfig, ContestOutcome } from '../types';

/**
 * 默认队友列表
 */
const DEFAULT_TEAMMATES: Teammate[] = [
  {
    id: 'teammate_lu_renjia',
    name: '陆任佳',
    attributes: {
      coding: 1, algorithm: 1, speed: 1, stress: 1,
      math: 1, dp: 1, graph: 1, dataStructure: 1, string: 1, search: 1, greedy: 1, geometry: 1
    },
    description: undefined
  },
  {
    id: 'teammate_lu_renyi',
    name: '路仁义',
    attributes: {
      coding: 1, algorithm: 1, speed: 1, stress: 1,
      math: 1, dp: 1, graph: 1, dataStructure: 1, string: 1, search: 1, greedy: 1, geometry: 1
    },
    description: undefined
  }
];

/**
 * 处理特性确认
 * @param gameState - 当前游戏状态
 * @param selectedTraitIds - 选中的特性ID列表
 * @returns LogicResult
 */
export function handleTraitConfirm(gameState: GameState, selectedTraitIds: string[]): LogicResult {
  const { attributes, sanPenalty, moneyPenalty } = applyTraitEffects(
    selectedTraitIds,
    gameState.attributes
  );

  const newState: GameState = {
    ...gameState,
    attributes: attributes,
    san: Math.max(0, INITIAL_SAN - sanPenalty),
    balance: Math.max(0, INITIAL_BALANCE - moneyPenalty),
    selectedTraits: selectedTraitIds,
    isRunning: true,
    isPaused: false,
    month: START_MONTH,
    gpa: INITIAL_GPA,
    remainingAP: 30,
    pendingEvents: scheduleMonthlyEvents(gameState, START_MONTH),
    resolvedEvents: [],
    worldFlags: {},
    eventGraph: {},
    activeContest: null,
    contestTimeRemaining: 0,
    teammates: DEFAULT_TEAMMATES,
    selectedTeam: null,
    buffs: {
      failedCourses: 0,
      academicWarnings: 0
    }
  };

  return {
    newState,
    logs: [],
    uiState: {},
    notification: '🎮 游戏开始！你现在是大学一年级的学生，开始你的ACM之旅吧！'
  };
}

/**
 * 重置游戏
 * @returns LogicResult
 */
export function resetGame(): LogicResult {
  return {
    newState: createInitialGameState(),
    logs: [{ message: '🔄 已退学重开，退回首页', type: 'warning' }],
    uiState: { confirmDialog: null },
    clearLogs: true
  };
}

/**
 * 游戏结束后重新开始
 * @returns LogicResult
 */
export function handleGameOverRestart(): LogicResult {
  return {
    newState: createInitialGameState(),
    logs: [{ message: '🔄 游戏已重置', type: 'warning' }],
    uiState: { gameOverReason: null },
    clearLogs: true
  };
}

export interface PracticeContestConfig extends ContestConfig {
  id: string;
  description: string;
  cost: number;
}

/**
 * 处理练习赛选择
 * @param gameState - 当前游戏状态
 * @param contestConfig - 比赛配置
 * @returns LogicResult
 */
export function handlePracticeContestSelect(gameState: GameState, contestConfig: PracticeContestConfig): LogicResult {
  const logs: LogEntry[] = [];

  if (gameState.activeContest) {
    logs.push({ message: '⚠️ 已有正在进行的比赛', type: 'warning' });
    return { newState: gameState, logs, uiState: { showPracticeContestDialog: false } };
  }

  if (gameState.remainingAP < contestConfig.cost) {
    logs.push({
      message: `❌ 行动点不足！需要 ${contestConfig.cost} AP，剩余 ${gameState.remainingAP} AP`,
      type: 'error'
    });
    return { newState: gameState, logs, uiState: { showPracticeContestDialog: true } };
  }

  const session = createContestSession(contestConfig);
  logs.push({
    message: `🏁 开始${session.name}（${session.problems.length} 题，${session.durationMinutes} 分钟）`,
    type: 'info'
  });

  const newState: GameState = {
    ...gameState,
    remainingAP: Math.max(0, gameState.remainingAP - contestConfig.cost),
    activeContest: session,
    contestTimeRemaining: session.timeRemaining,
    selectedTeam: null
  };

  return {
    newState,
    logs,
    uiState: { showPracticeContestDialog: false }
  };
}

/**
 * 应用比赛结果确认
 * @param gameState - 当前游戏状态
 * @param contestOutcome - 比赛结果
 * @returns LogicResult
 */
export function applyContestResult(gameState: GameState, contestOutcome: ContestOutcome): LogicResult {
  const newState: GameState = {
    ...gameState,
    rating: contestOutcome.isRated && contestOutcome.ratingSource === 'cf'
      ? gameState.rating + contestOutcome.ratingDelta
      : gameState.rating,
    san: clampValue(gameState.san + contestOutcome.sanDelta, 0, INITIAL_SAN),
    playerContests: gameState.playerContests + 1,
    selectedTeam: null
  };

  return {
    newState,
    logs: [],
    uiState: { showContestResult: false, contestOutcome: null }
  };
}

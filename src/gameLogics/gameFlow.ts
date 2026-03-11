import { INITIAL_SAN, INITIAL_BALANCE, INITIAL_GPA, START_MONTH } from '../constants';
import { clampValue } from '../utils';
import { applyTraitEffects } from '../data/traits';
import { getEventById, getSchoolMonth, REGIONAL_QUOTA_EVENT_ID, scheduleMonthlyEvents } from '../data/events';
import { createInitialGameState } from '../gameState';
import type { GameState, LogicResult, Teammate, ContestOutcome } from '../types';

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

const getNumericFlag = (state: GameState, key: string): number => {
  const value = state.worldFlags?.[key];
  return typeof value === 'number' ? value : 0;
};

const computeContestRecordScore = (contestOutcome: ContestOutcome): number => {
  const solveRatio = contestOutcome.total > 0 ? contestOutcome.solved / contestOutcome.total : 0;
  return Math.round(solveRatio * 100 + Math.min(12, contestOutcome.solved * 2));
};

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
    activePractice: null,
    practiceBacklog: [],
    teammates: DEFAULT_TEAMMATES,
    selectedTeam: null,
    buffs: {
      failedCourses: 0,
      academicWarnings: 0,
      contestAwards: {}
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

/**
 * 应用比赛结果确认
 * @param gameState - 当前游戏状态
 * @param contestOutcome - 比赛结果
 * @returns LogicResult
 */
export function applyContestResult(gameState: GameState, contestOutcome: ContestOutcome): LogicResult {
  const currentBuffs = gameState.buffs || { failedCourses: 0, academicWarnings: 0, contestAwards: {} };
  const categoryLabels = {
    invitational: '邀请赛',
    provincial: '省赛',
    regional: '区域赛'
  } as const;
  const awardLabels = {
    gold: '金牌',
    silver: '银牌',
    bronze: '铜牌',
    honorable: '优胜奖'
  } as const;
  const awardKey = contestOutcome.award
    ? `${categoryLabels[contestOutcome.contestCategory as keyof typeof categoryLabels] || '正式赛'}${awardLabels[contestOutcome.award.tier]}`
    : null;
  const nextAwards = { ...(currentBuffs.contestAwards || {}) };
  if (awardKey) {
    nextAwards[awardKey] = (nextAwards[awardKey] || 0) + 1;
  }

  const nextWorldFlags = { ...(gameState.worldFlags || {}) };
  if (contestOutcome.resultFlagKey) {
    nextWorldFlags[`${contestOutcome.resultFlagKey}Score`] = computeContestRecordScore(contestOutcome);
    nextWorldFlags[`${contestOutcome.resultFlagKey}Solved`] = contestOutcome.solved;
    nextWorldFlags[`${contestOutcome.resultFlagKey}Total`] = contestOutcome.total;
  }

  if (contestOutcome.resultFlagKey === 'septemberQualifier') {
    nextWorldFlags.septemberQualifierSettled = 1;
  }

  if (contestOutcome.contestCategory === 'regional') {
    if (contestOutcome.series === 'icpc') {
      nextWorldFlags.regionalICPCUsed = getNumericFlag(gameState, 'regionalICPCUsed') + 1;
    }
    if (contestOutcome.series === 'ccpc') {
      nextWorldFlags.regionalCCPCUsed = getNumericFlag(gameState, 'regionalCCPCUsed') + 1;
    }
    if (contestOutcome.stationId) {
      nextWorldFlags[`${contestOutcome.stationId}Finished`] = 1;
    }
  }

  const newState: GameState = {
    ...gameState,
    rating: contestOutcome.isRated && contestOutcome.ratingSource === 'cf'
      ? gameState.rating + contestOutcome.ratingDelta
      : gameState.rating,
    san: clampValue(gameState.san + contestOutcome.sanDelta, 0, INITIAL_SAN),
    playerContests: gameState.playerContests + 1,
    selectedTeam: null,
    worldFlags: nextWorldFlags,
    buffs: {
      ...currentBuffs,
      contestAwards: nextAwards
    }
  };

  if (contestOutcome.resultFlagKey === 'septemberQualifier') {
    const { month, year } = getSchoolMonth(gameState.month);
    if (month === 9 && year >= 2 && !(newState.pendingEvents || []).some(event => event.id === REGIONAL_QUOTA_EVENT_ID)) {
      const quotaEvent = getEventById(REGIONAL_QUOTA_EVENT_ID);
      if (quotaEvent) {
        newState.pendingEvents = [quotaEvent, ...(newState.pendingEvents || [])];
      }
    }
  }

  const resultLogs = [];
  if (contestOutcome.ranking) {
    resultLogs.push({
      message: contestOutcome.award
        ? `🏅 ${contestOutcome.contestName} 获得${contestOutcome.award.label}，排名第 ${contestOutcome.ranking.rank} / ${contestOutcome.ranking.participants} 名。`
        : `📈 ${contestOutcome.contestName} 最终排名第 ${contestOutcome.ranking.rank} / ${contestOutcome.ranking.participants} 名。`,
      type: contestOutcome.award ? 'success' : 'info'
    });
  }

  return {
    newState,
    logs: resultLogs,
    uiState: { showContestResult: false, contestOutcome: null }
  };
}

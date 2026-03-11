import { INITIAL_SAN, INITIAL_BALANCE, INITIAL_GPA, START_MONTH } from './constants';
import { createBaseAttributes } from './utils';
import type { GameState as GameStateType } from './types';

/**
 * 创建初始游戏状态
 * @returns 初始游戏状态
 */
export const createInitialGameState = (): GameStateType => ({
  isRunning: false,
  isPaused: false,
  month: START_MONTH,
  monthlyAP: 30,
  remainingAP: 30,
  balance: INITIAL_BALANCE,
  monthlyAllowance: 1500,
  san: INITIAL_SAN,
  rating: 0,
  gpa: INITIAL_GPA,
  attributes: createBaseAttributes(),
  playerContests: 0,
  playerProblems: 0,
  selectedTraits: [],
  pendingEvents: [],
  resolvedEvents: [],
  worldFlags: {},
  eventGraph: {},
  activeContest: null,
  contestTimeRemaining: 0,
  activePractice: null,
  practiceBacklog: [],
  teammates: [],
  selectedTeam: null,
  buffs: {
    failedCourses: 0,
    academicWarnings: 0,
    contestAwards: {}
  }
});

/**
 * 创建重置游戏状态（用于resetGame）
 * @param scheduleMonthlyEvents - 月度事件调度函数
 * @returns 重置后的游戏状态
 */
export const createResetGameState = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _scheduleMonthlyEvents: unknown
): GameStateType => {
  const baseState = createInitialGameState();
  // resetGame 使用与初始状态相同的结构
  return baseState;
};

import { INITIAL_SAN, INITIAL_BALANCE, INITIAL_GPA, START_MONTH } from './constants';
import { createBaseAttributes } from './utils';

/**
 * @typedef {Object} GameState
 * @property {boolean} isRunning - 游戏是否正在运行
 * @property {boolean} isPaused - 游戏是否暂停
 * @property {number} month - 当前月份
 * @property {number} monthlyAP - 每月行动点
 * @property {number} remainingAP - 剩余行动点
 * @property {number} balance - 余额
 * @property {number} monthlyAllowance - 每月生活费
 * @property {number} san - SAN值
 * @property {number} rating - 评级
 * @property {number} gpa - GPA
 * @property {Object} attributes - 属性对象
 * @property {number} playerContests - 参赛次数
 * @property {number} playerProblems - 解题数量
 * @property {string[]} selectedTraits - 已选择的特性
 * @property {Array} pendingEvents - 待处理事件
 * @property {Array} resolvedEvents - 已解决事件
 * @property {Object} worldFlags - 世界状态标志
 * @property {Object} eventGraph - 事件图
 * @property {Object|null} activeContest - 当前进行的比赛
 * @property {number} contestTimeRemaining - 比赛剩余时间
 * @property {Array} teammates - 队友列表
 * @property {Array|null} selectedTeam - 当前选择的队伍
 * @property {Object} buffs - Buff系统
 */

/**
 * 创建初始游戏状态
 * @returns {GameState} 初始游戏状态
 */
export const createInitialGameState = () => ({
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
  teammates: [],
  selectedTeam: null,
  buffs: {
    failedCourses: 0,
    academicWarnings: 0
  }
});

/**
 * 创建重置游戏状态（用于resetGame）
 * @param {Function} scheduleMonthlyEvents - 月度事件调度函数
 * @returns {GameState} 重置后的游戏状态
 */
export const createResetGameState = (scheduleMonthlyEvents) => {
  const baseState = createInitialGameState();
  // resetGame 使用与初始状态相同的结构
  return baseState;
};

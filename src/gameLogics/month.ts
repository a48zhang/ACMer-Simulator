import { END_MONTH } from '../constants';
import { clampGPA } from '../utils';
import { scheduleMonthlyEvents } from '../data/events';
import { GPA_CONFIG } from '../config/gameBalance';
import type { GameState, LogicResult, LogEntry, Event } from '../types';

/**
 * 推进到下一月 - 主函数
 * @param gameState - 当前游戏状态
 * @returns LogicResult
 */
export function advanceMonth(gameState: GameState): LogicResult {
  const logs: LogEntry[] = [];
  const newMonth = gameState.month + 1;

  const endCheck = checkGameEnd(gameState, newMonth);
  if (endCheck.isEnded) {
    return endCheck.result!;
  }

  const gpaResult = calculateGPAChange(gameState, newMonth);
  logs.push(...gpaResult.logs);

  const economyResult = processEconomy(gameState);
  logs.push(...economyResult.logs);

  const sanResult = processSanPenalty(gameState);
  if (sanResult.log) logs.push(sanResult.log);

  const events = scheduleMonthlyEvents(gameState, newMonth);
  const academicYear = calculateAcademicYear(newMonth);
  logs.push(formatMonthLog(academicYear, getCalendarMonth(newMonth), events.length));

  const newState = buildNewMonthState(gameState, newMonth, {
    gpa: gpaResult.gpa,
    balance: economyResult.balance,
    remainingAP: sanResult.nextAP,
    pendingEvents: events,
  });

  return { newState, logs, uiState: {} };
}

interface GameEndCheck {
  isEnded: boolean;
  result?: LogicResult;
}

/**
 * 检查游戏是否结束（毕业）
 * @param gameState - 当前游戏状态
 * @param newMonth - 下一月份
 * @returns { isEnded: boolean, result?: LogicResult }
 */
function checkGameEnd(gameState: GameState, newMonth: number): GameEndCheck {
  if (newMonth > END_MONTH) {
    return {
      isEnded: true,
      result: {
        newState: { ...gameState, month: newMonth, isRunning: false },
        logs: [{
          message: `🎓 游戏结束！比赛次数：${gameState.playerContests}，解题数：${gameState.playerProblems}`,
          type: 'success'
        }],
        uiState: {},
        gameOverReason: 'graduation'
      }
    };
  }
  return { isEnded: false };
}

interface GPAResult {
  logs: LogEntry[];
  gpa: number;
}

/**
 * 计算本月GPA变化
 * @param gameState - 当前游戏状态
 * @param newMonth - 推进后的新游戏月份
 * @returns { logs: Array, gpa: number }
 */
function calculateGPAChange(gameState: GameState, newMonth: number): GPAResult {
  const logs: LogEntry[] = [];
  const calendarMonth = getCalendarMonth(newMonth);
  const isHoliday = GPA_CONFIG.HOLIDAY_MONTHS.includes(calendarMonth);

  if (isHoliday) {
    logs.push({ message: `🏖️ 假期月，无需上课，GPA不扣除`, type: 'info' });
    return { logs, gpa: gameState.gpa };
  }

  let deduction = GPA_CONFIG.MONTHLY_DEDUCTION;
  const attended = gameState.worldFlags?.attendedClassThisMonth || false;

  if (!attended && Math.random() < GPA_CONFIG.SKIP_CLASS_PROBABILITY) {
    deduction += GPA_CONFIG.SKIP_CLASS_DEDUCTION;
    logs.push({ message: '⚠️ 本月未上课，GPA额外扣除！', type: 'warning' });
  }

  return { logs, gpa: clampGPA(gameState.gpa - deduction) };
}

interface EconomyResult {
  logs: LogEntry[];
  balance: number;
}

/**
 * 处理月度经济结算（生活费收入与随机支出）
 * @param gameState - 当前游戏状态
 * @returns { logs: Array, balance: number }
 */
function processEconomy(gameState: GameState): EconomyResult {
  const allowance = gameState.monthlyAllowance || 1500;
  const expense = 800 + Math.floor(Math.random() * 701);
  const balance = Math.max(0, gameState.balance + allowance - expense);

  return {
    logs: [{
      message: `💰 家里打生活费 +${allowance}，本月支出 -${expense}，余额：${balance}`,
      type: 'info'
    }],
    balance
  };
}

interface SanResult {
  log: LogEntry | null;
  nextAP: number;
}

/**
 * 处理SAN值耗尽惩罚（行动点减半）
 * @param gameState - 当前游戏状态
 * @returns { log: Object|null, nextAP: number }
 */
function processSanPenalty(gameState: GameState): SanResult {
  const wasBurntOut = gameState.san <= 0;
  const nextAP = wasBurntOut ? Math.floor(gameState.monthlyAP / 2) : gameState.monthlyAP;

  return {
    log: wasBurntOut ? { message: '😵 SAN值耗尽！本月精力大幅下降，行动点减半！', type: 'error' } : null,
    nextAP
  };
}

/**
 * 将游戏月份转换为日历月份（1-12）
 * @param gameMonth - 游戏内月份（1 = 大一9月）
 * @returns 日历月份（1-12）
 */
function getCalendarMonth(gameMonth: number): number {
  return ((9 + gameMonth - 2) % 12) + 1;
}

/**
 * 根据游戏月份计算当前学年（1-4）
 * @param month - 游戏内月份
 * @returns 学年
 */
function calculateAcademicYear(month: number): number {
  if (month <= 4) return 1;
  const cm = getCalendarMonth(month);
  return cm < 9 ? Math.floor((month - 5) / 12) + 1 : Math.floor((month - 5) / 12) + 2;
}

/**
 * 格式化月份推进日志
 * @param year - 学年
 * @param month - 日历月份
 * @param eventCount - 本月待处理事件数量
 * @returns 日志对象
 */
function formatMonthLog(year: number, month: number, eventCount: number): LogEntry {
  return {
    message: `📅 进入大学 ${year} 年 ${month} 月（待处理事件 ${eventCount}）`,
    type: 'info'
  };
}

interface NewMonthUpdates {
  gpa: number;
  balance: number;
  remainingAP: number;
  pendingEvents: Event[];
}

/**
 * 构建推进月份后的新游戏状态
 * @param gameState - 当前游戏状态
 * @param month - 新月份
 * @param updates - 需要合并的状态更新（gpa, balance, remainingAP, pendingEvents）
 * @returns 新游戏状态
 */
function buildNewMonthState(gameState: GameState, month: number, updates: NewMonthUpdates): GameState {
  const nextWorldFlags = {
    ...(gameState.worldFlags || {}),
    attendedClassThisMonth: false,
    monthlyAPCap: updates.remainingAP
  };

  return {
    ...gameState,
    month,
    ...updates,
    resolvedEvents: [],
    worldFlags: nextWorldFlags
  };
}

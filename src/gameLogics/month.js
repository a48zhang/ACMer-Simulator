import { END_MONTH } from '../constants';
import { clampGPA } from '../utils';
import { scheduleMonthlyEvents } from '../data/events';
import { GPA_CONFIG } from '../config/gameBalance';

/**
 * 推进到下一月 - 主函数
 * @param {Object} gameState - 当前游戏状态
 * @returns {Object} LogicResult
 */
export function advanceMonth(gameState) {
  const logs = [];
  const newMonth = gameState.month + 1;

  const endCheck = checkGameEnd(gameState, newMonth);
  if (endCheck.isEnded) {
    return endCheck.result;
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

function checkGameEnd(gameState, newMonth) {
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

function calculateGPAChange(gameState, newMonth) {
  const logs = [];
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

function processEconomy(gameState) {
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

function processSanPenalty(gameState) {
  const wasBurntOut = gameState.san <= 0;
  const nextAP = wasBurntOut ? Math.floor(gameState.monthlyAP / 2) : gameState.monthlyAP;

  return {
    log: wasBurntOut ? { message: '😵 SAN值耗尽！本月精力大幅下降，行动点减半！', type: 'error' } : null,
    nextAP
  };
}

function getCalendarMonth(gameMonth) {
  return ((9 + gameMonth - 2) % 12) + 1;
}

function calculateAcademicYear(month) {
  if (month <= 4) return 1;
  const cm = getCalendarMonth(month);
  return cm < 9 ? Math.floor((month - 5) / 12) + 1 : Math.floor((month - 5) / 12) + 2;
}

function formatMonthLog(year, month, eventCount) {
  return {
    message: `📅 进入大学 ${year} 年 ${month} 月（待处理事件 ${eventCount}）`,
    type: 'info'
  };
}

function buildNewMonthState(gameState, month, updates) {
  return {
    ...gameState,
    month,
    ...updates,
    resolvedEvents: [],
    worldFlags: { ...(gameState.worldFlags || {}), attendedClassThisMonth: false }
  };
}

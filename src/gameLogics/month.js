import { END_MONTH } from '../constants';
import { clampGPA } from '../utils';
import { scheduleMonthlyEvents } from '../data/events';
import { GPA_CONFIG } from '../config/gameBalance';

/**
 * 推进到下一月
 * @param {Object} gameState - 当前游戏状态
 * @returns {Object} LogicResult
 */
export function advanceMonth(gameState) {
  const logs = [];
  const newMonth = gameState.month + 1;

  // 检查游戏是否结束
  if (newMonth > END_MONTH) {
    logs.push({
      message: `🎓 游戏结束！比赛次数：${gameState.playerContests}，解题数：${gameState.playerProblems}`,
      type: 'success'
    });

    const newState = {
      ...gameState,
      month: newMonth,
      isRunning: false
    };

    return {
      newState,
      logs,
      uiState: {},
      gameOverReason: 'graduation'
    };
  }

  // 计算本月日历月份
  const monthsSinceStartEarly = newMonth - 1;
  const totalCalMonthEarly = 9 + monthsSinceStartEarly;
  const calendarMonthForGpa = ((totalCalMonthEarly - 1) % 12) + 1;

  // 假期月份判定
  const isHolidayMonth = GPA_CONFIG.HOLIDAY_MONTHS.includes(calendarMonthForGpa);

  // 月度GPA扣除
  let gpaDeduction = 0;
  if (!isHolidayMonth) {
    const baseGpaDeduction = GPA_CONFIG.MONTHLY_DEDUCTION;
    gpaDeduction = baseGpaDeduction;
    const attendedClass = gameState.worldFlags?.attendedClassThisMonth || false;
    if (!attendedClass && Math.random() < GPA_CONFIG.SKIP_CLASS_PROBABILITY) {
      gpaDeduction += GPA_CONFIG.SKIP_CLASS_DEDUCTION;
      logs.push({ message: '⚠️ 本月未上课，GPA额外扣除！', type: 'warning' });
    }
  } else {
    logs.push({ message: `🏖️ 假期月，无需上课，GPA不扣除`, type: 'info' });
  }

  const newGpa = clampGPA(gameState.gpa - gpaDeduction);

  // 月度经济结算
  const allowance = gameState.monthlyAllowance || 1500;
  const expense = Math.floor(Math.random() * 701) + 800;
  const netBalance = Math.max(0, gameState.balance + allowance - expense);
  logs.push({
    message: `💰 家里打生活费 +${allowance}，本月支出 -${expense}，余额：${netBalance}`,
    type: 'info'
  });

  // SAN=0 惩罚
  const sanWasBurntOut = gameState.san <= 0;
  const baseMonthlyAP = gameState.monthlyAP;
  const nextMonthlyAP = sanWasBurntOut ? Math.floor(baseMonthlyAP / 2) : baseMonthlyAP;
  if (sanWasBurntOut) {
    logs.push({ message: '😵 SAN值耗尽！本月精力大幅下降，行动点减半！', type: 'error' });
  }

  // 生成当月事件
  const events = scheduleMonthlyEvents(gameState, newMonth);
  const calendarMonth = calendarMonthForGpa;

  // 计算学年
  let academicYear;
  if (newMonth <= 4) {
    academicYear = 1;
  } else {
    const monthsAfterFirstSemester = newMonth - 5;
    const completedYears = Math.floor(monthsAfterFirstSemester / 12);
    if (calendarMonth < 9) {
      academicYear = completedYears + 1;
    } else {
      academicYear = completedYears + 2;
    }
  }

  logs.push({
    message: `📅 进入大学 ${academicYear} 年 ${calendarMonth} 月（待处理事件 ${events.length}）`,
    type: 'info'
  });

  const newState = {
    ...gameState,
    month: newMonth,
    gpa: newGpa,
    balance: netBalance,
    remainingAP: nextMonthlyAP,
    pendingEvents: events,
    resolvedEvents: [],
    worldFlags: { ...(gameState.worldFlags || {}), attendedClassThisMonth: false }
  };

  return { newState, logs, uiState: {} };
}

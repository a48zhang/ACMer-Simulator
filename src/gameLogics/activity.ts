import { ACTIVITIES } from '../data/activities';
import { createContestSession } from '../data/contests';
import {
  applyAttributeChanges,
  getFieldValue,
  clampValue,
  clampGPA,
  getCurrentMonthlyAPCap
} from '../utils';
import { INITIAL_SAN, END_MONTH } from '../constants';
import type { GameState, LogicResult, Activity, LogEntry } from '../types';

/**
 * 执行活动
 * @param gameState - 当前游戏状态
 * @param activityId - 活动ID
 * @returns LogicResult
 */
export function executeActivity(gameState: GameState, activityId: string): LogicResult {
  const activity = ACTIVITIES.find((a: Activity) => a.id === activityId);
  if (!activity) return { newState: gameState, logs: [], uiState: {} };

  const logs: LogEntry[] = [];

  // 检查AP是否足够
  if (gameState.remainingAP < activity.cost) {
    logs.push({
      message: `❌ 行动点不足！需要 ${activity.cost} AP，剩余 ${gameState.remainingAP} AP`,
      type: 'error'
    });
    return { newState: gameState, logs, uiState: {} };
  }

  // 检查游戏是否结束
  if (gameState.month > END_MONTH) {
    logs.push({ message: '❌ 游戏已结束！', type: 'error' });
    return { newState: gameState, logs, uiState: {} };
  }

  const effects = activity.effects(gameState);

  // 处理特殊动作：启动比赛
  if (effects.specialAction === 'START_CONTEST') {
    if (gameState.activeContest) {
      logs.push({ message: '⚠️ 已有正在进行的比赛', type: 'warning' });
      return { newState: gameState, logs, uiState: {} };
    }

    const contestConfig = activity.contestConfig;
    if (!contestConfig) {
      logs.push({ message: '❌ 比赛配置错误', type: 'error' });
      return { newState: gameState, logs, uiState: {} };
    }

    const session = createContestSession(contestConfig);
    logs.push({
      message: `🏁 开始${session.name}（${session.problems.length} 题，${session.durationMinutes} 分钟）`,
      type: 'info'
    });

    const newState = {
      ...gameState,
      remainingAP: Math.max(0, gameState.remainingAP - activity.cost),
      activeContest: session,
      contestTimeRemaining: session.timeRemaining,
      selectedTeam: null
    };

    return { newState, logs, uiState: {} };
  }

  // 处理特殊动作：打开练习赛选择对话框
  if (effects.specialAction === 'OPEN_PRACTICE_CONTEST_DIALOG') {
    return {
      newState: gameState,
      logs: effects.log ? [{ message: effects.log, type: effects.logType || 'info' }] : [],
      uiState: { showPracticeContestDialog: true }
    };
  }

  // 记录日志
  if (effects.log) {
    logs.push({ message: effects.log, type: effects.logType || 'info' });
  }

  // 计算新状态
  const updatedAttributes = applyAttributeChanges(gameState.attributes, effects.attributeChanges);
  const baseRemainingAP = Math.max(0, gameState.remainingAP - activity.cost);
  const currentAPCap = getCurrentMonthlyAPCap(gameState);
  let nextRemainingAP = Math.min(currentAPCap, baseRemainingAP);
  if (effects.apBonus !== undefined) {
    nextRemainingAP = Math.max(0, Math.min(currentAPCap, nextRemainingAP + effects.apBonus));
  }

  // Build all newState updates at once
  const worldFlags = effects.setFlags
    ? { ...(gameState.worldFlags || {}), ...effects.setFlags }
    : gameState.worldFlags;

  const balance = effects.balance !== undefined
    ? effects.balance
    : effects.balanceDelta !== undefined
      ? Math.max(0, gameState.balance + effects.balanceDelta)
      : gameState.balance;

  const san = effects.san !== undefined
    ? clampValue(effects.san, 0, INITIAL_SAN)
    : effects.sanDelta !== undefined
      ? clampValue(gameState.san + effects.sanDelta, 0, INITIAL_SAN)
      : gameState.san;

  const rating = effects.rating !== undefined
    ? effects.rating
    : effects.ratingDelta !== undefined
      ? gameState.rating + effects.ratingDelta
      : gameState.rating;

  const gpa = effects.gpa !== undefined
    ? clampGPA(effects.gpa)
    : effects.gpaDelta !== undefined
      ? clampGPA(gameState.gpa + effects.gpaDelta)
      : gameState.gpa;

  const newState: GameState = {
    ...gameState,
    remainingAP: nextRemainingAP,
    playerContests: getFieldValue(effects as Record<string, unknown>, gameState, 'playerContests', 'playerContestsDelta') as number,
    playerProblems: getFieldValue(effects as Record<string, unknown>, gameState, 'playerProblems', 'playerProblemsDelta') as number,
    attributes: updatedAttributes,
    worldFlags,
    balance,
    san,
    rating,
    gpa,
  };

  return { newState, logs, uiState: {} };
}

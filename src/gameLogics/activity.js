import { ACTIVITIES } from '../data/activities';
import { createContestSession } from '../data/contests';
import { applyAttributeChanges, getFieldValue, clampValue, clampGPA } from '../utils';
import { INITIAL_SAN, END_MONTH } from '../constants';

/**
 * 执行活动
 * @param {Object} gameState - 当前游戏状态
 * @param {string} activityId - 活动ID
 * @returns {Object} LogicResult
 */
export function executeActivity(gameState, activityId) {
  const activity = ACTIVITIES.find(a => a.id === activityId);
  if (!activity) return { newState: gameState, logs: [], uiState: {} };

  const logs = [];

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
      contestTimeRemaining: session.timeRemaining
    };

    return { newState, logs, uiState: {} };
  }

  // 处理特殊动作：打开练习赛选择对话框
  if (effects.specialAction === 'OPEN_PRACTICE_CONTEST_DIALOG') {
    return {
      newState: gameState,
      logs: [],
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
  let nextRemainingAP = Math.min(gameState.monthlyAP, baseRemainingAP);
  if (effects.apBonus !== undefined) {
    nextRemainingAP = Math.max(0, Math.min(gameState.monthlyAP, nextRemainingAP + effects.apBonus));
  }

  const newState = {
    ...gameState,
    remainingAP: nextRemainingAP,
    playerContests: getFieldValue(effects, gameState, 'playerContests', 'playerContestsDelta'),
    playerProblems: getFieldValue(effects, gameState, 'playerProblems', 'playerProblemsDelta'),
    attributes: updatedAttributes
  };

  // 处理 setFlags
  if (effects.setFlags) {
    newState.worldFlags = { ...(gameState.worldFlags || {}), ...effects.setFlags };
  }

  // 处理 balance
  if (effects.balance !== undefined) {
    newState.balance = effects.balance;
  } else if (effects.balanceDelta !== undefined) {
    newState.balance = Math.max(0, gameState.balance + effects.balanceDelta);
  }

  // 处理 san
  if (effects.san !== undefined) {
    newState.san = clampValue(effects.san, 0, INITIAL_SAN);
  } else if (effects.sanDelta !== undefined) {
    newState.san = clampValue(gameState.san + effects.sanDelta, 0, INITIAL_SAN);
  }

  // 处理 rating
  if (effects.rating !== undefined) {
    newState.rating = effects.rating;
  } else if (effects.ratingDelta !== undefined) {
    newState.rating = gameState.rating + effects.ratingDelta;
  }

  // 处理 gpa
  if (effects.gpa !== undefined) {
    newState.gpa = clampGPA(effects.gpa);
  } else if (effects.gpaDelta !== undefined) {
    newState.gpa = clampGPA(gameState.gpa + effects.gpaDelta);
  }

  return { newState, logs, uiState: {} };
}

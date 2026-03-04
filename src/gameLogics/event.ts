import { INITIAL_SAN } from '../constants';
import { clampValue, clampGPA, applyAttributeChanges, getFieldValue } from '../utils';
import { createContestSession } from '../data/contests';
import { ACADEMIC_CONFIG } from '../config/gameBalance';
import type { GameState, LogicResult, LogEntry, Effects, Buffs, Event, Choice, Teammate, ResolvedEventItem } from '../types';

/**
 * 检查是否触发学业警告或退学
 * @param gpa - 当前GPA
 * @param buffs - 当前buff状态 { failedCourses, academicWarnings }
 * @returns { isExpelled, buffChanges?, reason?, newState?, logs }
 */
export function checkAcademicWarning(gpa: number, buffs: Buffs): {
  isExpelled: boolean;
  buffChanges?: Partial<Buffs>;
  reason?: string;
  newState?: Partial<GameState>;
  logs: LogEntry[];
} {
  const logs: LogEntry[] = [];

  if (gpa < ACADEMIC_CONFIG.WARNING_THRESHOLD) {
    const newWarnings = buffs.academicWarnings + 1;
    logs.push({
      message: `⚠️ 学业警告！GPA低于${ACADEMIC_CONFIG.WARNING_THRESHOLD}，获得学业警告 buff（当前${newWarnings}个）`,
      type: 'error'
    });

    if (newWarnings >= ACADEMIC_CONFIG.WARNINGS_FOR_EXPULSION) {
      logs.push({ message: '❌ 累计2个学业警告，进入退学结局！', type: 'error' });
      return {
        isExpelled: true,
        reason: `GPA长期低于${ACADEMIC_CONFIG.WARNING_THRESHOLD}，累计获得${newWarnings}次学业警告，被迫退学。`,
        newState: { isRunning: false, buffs: { ...buffs, academicWarnings: newWarnings } },
        logs
      };
    }

    return { isExpelled: false, buffChanges: { academicWarnings: 1 }, logs };
  } else if (gpa < ACADEMIC_CONFIG.FAILURE_THRESHOLD) {
    const newFailures = buffs.failedCourses + 1;
    logs.push({
      message: `📉 挂科！GPA低于${ACADEMIC_CONFIG.FAILURE_THRESHOLD}，获得挂科 buff（当前${newFailures}个）`,
      type: 'warning'
    });

    if (newFailures % ACADEMIC_CONFIG.FAILURES_PER_WARNING === 0) {
      const newWarnings = buffs.academicWarnings + 1;
      logs.push({
        message: `⚠️ 累计${ACADEMIC_CONFIG.FAILURES_PER_WARNING}次挂科，转换为1个学业警告！（当前${newWarnings}个学业警告，0个挂科）`,
        type: 'error'
      });

      if (newWarnings >= ACADEMIC_CONFIG.WARNINGS_FOR_EXPULSION) {
        logs.push({ message: `❌ 累计2个学业警告，进入退学结局！`, type: 'error' });
        return {
          isExpelled: true,
          reason: `GPA长期低于${ACADEMIC_CONFIG.FAILURE_THRESHOLD}，累计挂科${newFailures}次（转换为${newWarnings}次学业警告），被迫退学。`,
          newState: { isRunning: false, buffs: { failedCourses: 0, academicWarnings: newWarnings } },
          logs
        };
      }

      return { isExpelled: false, buffChanges: { failedCourses: -buffs.failedCourses, academicWarnings: 1 }, logs };
    }

    return { isExpelled: false, buffChanges: { failedCourses: 1 }, logs };
  }

  return { isExpelled: false, logs };
}

/**
 * 检查是否获得奖学金
 * @param gpa - 当前GPA
 * @returns 日志对象，未获得则返回 null
 */
export function checkScholarship(gpa: number): LogEntry | null {
  if (gpa >= ACADEMIC_CONFIG.SCHOLARSHIP_THRESHOLD) {
    return {
      message: `🎓 优秀！GPA达到${ACADEMIC_CONFIG.SCHOLARSHIP_THRESHOLD}以上，获得奖学金！`,
      type: 'success'
    };
  }
  return null;
}

interface FinalsWeekResult {
  logs: LogEntry[];
  effects: Effects;
  gameOver: boolean;
  gameOverReason?: string;
  newState?: GameState;
}

/**
 * 处理期末周GPA审核（内部函数）
 */
function processFinalsWeek(gameState: GameState, effects: Effects, ev: Event): FinalsWeekResult {
  const logs: LogEntry[] = [];
  const gpa = gameState.gpa;
  const buffs = gameState.buffs || { failedCourses: 0, academicWarnings: 0 };

  const warningResult = checkAcademicWarning(gpa, buffs);
  logs.push(...warningResult.logs);

  if (warningResult.isExpelled) {
    return {
      logs,
      effects,
      gameOver: true,
      gameOverReason: warningResult.reason,
      newState: { ...gameState, ...warningResult.newState } as GameState
    };
  }

  if (warningResult.buffChanges) {
    effects.buffChanges = warningResult.buffChanges;
  }

  const scholarshipResult = checkScholarship(gpa);
  if (scholarshipResult) {
    logs.push(scholarshipResult);
    effects.balanceDelta = 2000;
  } else if (!warningResult.buffChanges) {
    logs.push({ message: `✅ 期末考试通过，GPA正常`, type: 'info' });
  }

  return { logs, effects, gameOver: false };
}

/**
 * 处理启动比赛（内部函数）
 */
function processStartContest(
  gameState: GameState,
  ev: Event,
  choice: Choice,
  effects: Effects,
  setFlags: Record<string, boolean | number>,
  logs: LogEntry[],
  selectedTeammateIds: string[] | null
): LogicResult {
  const contestConfig = choice.contestConfig;
  if (!contestConfig) {
    logs.push({ message: '❌ 比赛配置错误', type: 'error' });
    return { newState: gameState, logs, uiState: {} };
  }

  if (gameState.activeContest) {
    logs.push({ message: '⚠️ 已有正在进行的比赛', type: 'warning' });
    return { newState: gameState, logs, uiState: {} };
  }

  const session = createContestSession(contestConfig);
  logs.push({
    message: `🏁 开始${session.name}（${session.problems.length} 题，${session.durationMinutes} 分钟）`,
    type: 'info'
  });

  const updatedAttributes = applyAttributeChanges(gameState.attributes, effects.attributeChanges);
  const nextSan = effects.sanDelta !== undefined
    ? clampValue(gameState.san + effects.sanDelta, 0, INITIAL_SAN)
    : gameState.san;
  const remaining = (gameState.pendingEvents || []).filter(e => e.id !== ev.id);
  const resolvedItem = { id: ev.id, choiceId: choice.id, time: Date.now(), uuid: crypto.randomUUID() };

  const newState: GameState = {
    ...gameState,
    attributes: updatedAttributes,
    san: nextSan,
    worldFlags: { ...(gameState.worldFlags || {}), ...setFlags },
    activeContest: session,
    contestTimeRemaining: session.timeRemaining,
    pendingEvents: remaining,
    resolvedEvents: [...(gameState.resolvedEvents || []), resolvedItem]
  };

  if (selectedTeammateIds) {
    newState.selectedTeam = selectedTeammateIds;
  }

  return {
    newState,
    logs,
    uiState: { showEventDialog: false, currentEvent: null }
  };
}

/**
 * 构建事件的新状态（内部函数）
 */
function buildNewStateForEvent(
  gameState: GameState,
  ev: Event,
  choice: Choice,
  effects: Effects,
  setFlags: Record<string, boolean | number>,
  selectedTeammateIds: string[] | null
): GameState {
  const updatedAttributes = applyAttributeChanges(gameState.attributes, effects.attributeChanges);

  const newState: GameState = {
    ...gameState,
    remainingAP: Math.min(gameState.monthlyAP, Math.max(0, gameState.remainingAP + (effects.apBonus || 0))),
    playerContests: getFieldValue(effects, gameState, 'playerContests', 'playerContestsDelta'),
    playerProblems: getFieldValue(effects, gameState, 'playerProblems', 'playerProblemsDelta'),
    attributes: updatedAttributes
  };

  if (selectedTeammateIds) {
    newState.selectedTeam = selectedTeammateIds;
  }

  if (effects.balance !== undefined) {
    newState.balance = effects.balance;
  } else if (effects.balanceDelta !== undefined) {
    newState.balance = Math.max(0, gameState.balance + effects.balanceDelta);
  }

  if (effects.san !== undefined) {
    newState.san = clampValue(effects.san, 0, INITIAL_SAN);
  } else if (effects.sanDelta !== undefined) {
    newState.san = clampValue(gameState.san + effects.sanDelta, 0, INITIAL_SAN);
  }

  if (effects.rating !== undefined) {
    newState.rating = effects.rating;
  } else if (effects.ratingDelta !== undefined) {
    newState.rating = gameState.rating + effects.ratingDelta;
  }

  if (effects.gpa !== undefined) {
    newState.gpa = clampGPA(effects.gpa);
  } else if (effects.gpaDelta !== undefined) {
    newState.gpa = clampGPA(gameState.gpa + effects.gpaDelta);
  }

  newState.worldFlags = { ...(gameState.worldFlags || {}), ...setFlags };

  if (effects.buffChanges) {
    const currentBuffs = gameState.buffs || { failedCourses: 0, academicWarnings: 0 };
    newState.buffs = {
      failedCourses: Math.max(0, currentBuffs.failedCourses + (effects.buffChanges.failedCourses || 0)),
      academicWarnings: Math.max(0, currentBuffs.academicWarnings + (effects.buffChanges.academicWarnings || 0))
    };
  }

  const remaining = (gameState.pendingEvents || []).filter(e => e.id !== ev.id);
  const resolvedItem = { id: ev.id, choiceId: choice.id, time: Date.now(), uuid: crypto.randomUUID() };
  newState.pendingEvents = remaining;
  newState.resolvedEvents = [...(gameState.resolvedEvents || []), resolvedItem] as unknown as string[];

  return newState;
}

interface ProcessEventChoiceResult {
  newState: GameState;
  logs: LogEntry[];
  uiState: Record<string, unknown>;
  gameOverReason?: string;
}

/**
 * 处理事件选择（内部函数）
 */
function processEventChoice(
  gameState: GameState,
  ev: Event,
  choice: Choice,
  selectedTeammateIds: string[] | null = null
): ProcessEventChoiceResult {
  const logs: LogEntry[] = [];
  let effects = { ...(choice.effects || {}) };
  const setFlags = choice.setFlags || {};

  // 特殊处理：期末周GPA审核
  if (ev.id === 'june_finals_week' || ev.id === 'january_finals_week') {
    const result = processFinalsWeek(gameState, effects, ev);
    logs.push(...result.logs);
    effects = result.effects;

    if (result.gameOver) {
      return {
        newState: result.newState as GameState,
        logs,
        uiState: { showEventDialog: false, currentEvent: null },
        gameOverReason: result.gameOverReason
      };
    }
  }

  // 处理特殊动作：启动比赛
  if (choice.specialAction === 'START_CONTEST') {
    return processStartContest(gameState, ev, choice, effects, setFlags, logs, selectedTeammateIds);
  }

  // 普通事件处理
  logs.push({
    message: `🗳️ 事件处理：${ev.title} → ${choice.label}`,
    type: 'info'
  });

  const newState = buildNewStateForEvent(gameState, ev, choice, effects, setFlags, selectedTeammateIds);

  return {
    newState,
    logs,
    uiState: { showEventDialog: false, currentEvent: null }
  };
}

/**
 * 应用事件选择（主入口）
 * @param gameState - 当前游戏状态
 * @param eventId - 事件ID
 * @param choiceId - 选择ID
 * @returns LogicResult
 */
export function applyEventChoice(gameState: GameState, eventId: string, choiceId: string): LogicResult {
  const ev = (gameState.pendingEvents || []).find((e: Event) => e.id === eventId);
  if (!ev) return { newState: gameState, logs: [], uiState: {} };

  const choice = ev.choices.find((c: Choice) => c.id === choiceId);
  if (!choice) return { newState: gameState, logs: [], uiState: {} };

  // 检查是否需要队友选择
  if (choice.requiresTeamSelection) {
    return {
      newState: gameState,
      logs: [],
      uiState: {
        showEventDialog: false,
        showTeammateDialog: true,
        pendingEventChoice: { eventId, choiceId }
      }
    };
  }

  return processEventChoice(gameState, ev, choice);
}

interface PendingEventChoice {
  eventId: string;
  choiceId: string;
}

/**
 * 处理队友确认
 * @param gameState - 当前游戏状态
 * @param pendingEventChoice - 待处理的事件选择
 * @param selectedTeammateIds - 选中的队友ID列表
 * @returns LogicResult
 */
export function handleTeammateConfirm(
  gameState: GameState,
  pendingEventChoice: PendingEventChoice | null | undefined,
  selectedTeammateIds: string[]
): LogicResult {
  if (!pendingEventChoice) {
    return { newState: gameState, logs: [], uiState: { showTeammateDialog: false } };
  }

  const { eventId, choiceId } = pendingEventChoice;
  const logs: LogEntry[] = [];

  logs.push({
    message: `👥 组队成功！队友：${selectedTeammateIds.map(id => {
      const tm = gameState.teammates.find((t: Teammate) => t.id === id);
      return tm ? tm.name : id;
    }).join('、')}`,
    type: 'success'
  });

  const ev = (gameState.pendingEvents || []).find((e: Event) => e.id === eventId);
  if (!ev) {
    return {
      newState: gameState,
      logs,
      uiState: { showTeammateDialog: false, pendingEventChoice: null }
    };
  }

  const choice = ev.choices.find((c: Choice) => c.id === choiceId);
  if (!choice) {
    return {
      newState: gameState,
      logs,
      uiState: { showTeammateDialog: false, pendingEventChoice: null }
    };
  }

  const result = processEventChoice(gameState, ev, choice, selectedTeammateIds);

  return {
    newState: result.newState,
    logs: [...logs, ...result.logs],
    uiState: {
      ...result.uiState,
      showTeammateDialog: false,
      pendingEventChoice: null
    },
    gameOverReason: result.gameOverReason
  };
}

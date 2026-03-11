import { INITIAL_SAN } from '../constants';
import {
  clampValue,
  clampGPA,
  applyAttributeChanges,
  getFieldValue,
  getCurrentMonthlyAPCap
} from '../utils';
import { createContestSession } from '../data/contests';
import { getEventById, getSchoolMonth, REGIONAL_QUOTA_EVENT_ID } from '../data/events';
import { ACADEMIC_CONFIG } from '../config/gameBalance';
import type { GameState, LogicResult, LogEntry, Effects, Buffs, Event, Choice, Teammate } from '../types';

const REGIONAL_PATH_SCHOOL = 1;
const REGIONAL_PATH_WILDCARD = 2;

const getNumericFlag = (state: GameState, key: string): number => {
  const value = state.worldFlags?.[key];
  return typeof value === 'number' ? value : 0;
};

const appendPendingEventIfMissing = (state: GameState, eventId: string): GameState => {
  if ((state.pendingEvents || []).some(event => event.id === eventId)) {
    return state;
  }

  const event = getEventById(eventId);
  if (!event) {
    return state;
  }

  return {
    ...state,
    pendingEvents: [event, ...(state.pendingEvents || [])]
  };
};

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
          newState: { isRunning: false, buffs: { ...buffs, failedCourses: 0, academicWarnings: newWarnings } },
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
function processFinalsWeek(gameState: GameState, effects: Effects, _ev: Event): FinalsWeekResult {
  const logs: LogEntry[] = [];
  const gpa = gameState.gpa;
  const buffs = gameState.buffs || { failedCourses: 0, academicWarnings: 0, contestAwards: {} };

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

function processCampusClinicChoice(choice: Choice): { effects: Effects; logs: LogEntry[] } {
  const logs: LogEntry[] = [];

  if (choice.id === 'go_hospital') {
    const thoroughCheck = Math.random() < 0.45;
    return {
      effects: {
        balanceDelta: thoroughCheck ? -240 : -180,
        sanDelta: thoroughCheck ? 12 : 9
      },
      logs: [{
        message: thoroughCheck
          ? '🏥 去医院做了检查，花得多一点，但状态稳住了不少。SAN+12，余额-240。'
          : '🏥 跑了一趟医院，折腾半天，总算把状态拉回来一些。SAN+9，余额-180。',
        type: 'success'
      }]
    };
  }

  if (choice.id === 'go_campus_clinic') {
    const gotMedicine = Math.random() < 0.5;
    return {
      effects: {
        balanceDelta: gotMedicine ? -60 : -30,
        sanDelta: gotMedicine ? 7 : 4
      },
      logs: [{
        message: gotMedicine
          ? '🏫 去校医院开了点药，恢复得还行。SAN+7，余额-60。'
          : '🏫 去校医院看了下，问题不大，但也就缓了一点。SAN+4，余额-30。',
        type: 'info'
      }]
    };
  }

  if (choice.id === 'buy_medicine') {
    const worked = Math.random() < 0.55;
    return {
      effects: {
        balanceDelta: worked ? -45 : -35,
        sanDelta: worked ? 5 : -2
      },
      logs: [{
        message: worked
          ? '💊 先买了点药顶着，勉强把状态拉回来了。SAN+5，余额-45。'
          : '💊 药是买了，但效果一般，心里还更烦了点。SAN-2，余额-35。',
        type: worked ? 'info' : 'warning'
      }]
    };
  }

  const held = Math.random() < 0.3;
  return {
    effects: {
      sanDelta: held ? -3 : -8
    },
    logs: [{
      message: held
        ? '😮‍💨 你决定先硬扛，好在这次还没彻底出事。SAN-3。'
        : '🥴 你决定继续硬扛，结果状态明显更差了。SAN-8。',
      type: held ? 'info' : 'warning'
    }]
  };
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
  if (effects.log) {
    logs.push({ message: effects.log, type: effects.logType || 'info' });
  }
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
    selectedTeam: selectedTeammateIds ?? null,
    pendingEvents: remaining,
    resolvedEvents: [...(gameState.resolvedEvents || []), resolvedItem]
  };

  return {
    newState,
    logs,
    uiState: { showEventDialog: false, currentEvent: null }
  };
}

function calculateRegionalQualificationSnapshot(gameState: GameState): {
  year: number;
  invitationalScore: number;
  provincialScore: number;
  qualifierScore: number;
  combinedScore: number;
} {
  const { year } = getSchoolMonth(gameState.month);
  const invitationalEntries = ['marchInvitationalScore', 'mayInvitationalScore']
    .map(key => getNumericFlag(gameState, key))
    .filter(score => score > 0);
  const invitationalScore = invitationalEntries.length > 0
    ? Math.round(invitationalEntries.reduce((sum, score) => sum + score, 0) / invitationalEntries.length)
    : 0;
  const provincialScore = getNumericFlag(gameState, 'aprilProvincialScore');
  const qualifierScore = getNumericFlag(gameState, 'septemberQualifierScore');
  const summerTrainingBonus = gameState.worldFlags?.julySummerTrainingParticipating ? 5 : 0;
  const combinedScore = Math.round(
    invitationalScore * 0.3 + provincialScore * 0.35 + qualifierScore * 0.35 + summerTrainingBonus
  );

  return {
    year,
    invitationalScore,
    provincialScore,
    qualifierScore,
    combinedScore
  };
}

function processRegionalQualification(
  gameState: GameState,
  ev: Event,
  choice: Choice,
  effects: Effects,
  logs: LogEntry[]
): ProcessEventChoiceResult {
  const snapshot = calculateRegionalQualificationSnapshot(gameState);
  let quotaPath = choice.id === 'school_quota' ? REGIONAL_PATH_SCHOOL : REGIONAL_PATH_WILDCARD;

  logs.push({
    message: `📊 抢名额评估：邀请赛 ${snapshot.invitationalScore} / 省赛 ${snapshot.provincialScore} / 预选 ${snapshot.qualifierScore}，综合分 ${snapshot.combinedScore}`,
    type: 'info'
  });

  if (choice.id === 'school_quota') {
    if (snapshot.combinedScore >= 28) {
      logs.push({
        message: '🏫 综合表现足够，抢到了校内区域赛名额。本赛季最多可打 2 个 ICPC 站和 2 个 CCPC 站。',
        type: 'success'
      });
    } else {
      quotaPath = REGIONAL_PATH_WILDCARD;
      logs.push({
        message: '⚠️ 校内竞争没抢过，教练建议你转去申请外卡，本赛季仍可继续报名区域赛站点。',
        type: 'warning'
      });
    }
  } else {
    logs.push({
      message: '📝 你选择了外卡路线。本赛季仍然最多可打 2 个 ICPC 站和 2 个 CCPC 站。',
      type: 'success'
    });
  }

  const newState = buildNewStateForEvent(
    gameState,
    ev,
    choice,
    effects,
    {
      regionalSeasonYear: snapshot.year,
      regionalQuotaPath: quotaPath,
      regionalInvitationalScore: snapshot.invitationalScore,
      regionalProvincialScore: snapshot.provincialScore,
      regionalQualifierScore: snapshot.qualifierScore,
      regionalQualificationScore: snapshot.combinedScore,
      regionalICPCUsed: 0,
      regionalCCPCUsed: 0
    },
    null
  );

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
  const currentAPCap = getCurrentMonthlyAPCap(gameState);

  const newState: GameState = {
    ...gameState,
    remainingAP: Math.min(currentAPCap, Math.max(0, gameState.remainingAP + (effects.apBonus || 0))),
    playerContests: getFieldValue(effects as unknown as Record<string, unknown>, gameState, 'playerContests', 'playerContestsDelta') as number,
    playerProblems: getFieldValue(effects as unknown as Record<string, unknown>, gameState, 'playerProblems', 'playerProblemsDelta') as number,
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
    const currentBuffs = gameState.buffs || { failedCourses: 0, academicWarnings: 0, contestAwards: {} };
    newState.buffs = {
      failedCourses: Math.max(0, currentBuffs.failedCourses + (effects.buffChanges.failedCourses || 0)),
      academicWarnings: Math.max(0, currentBuffs.academicWarnings + (effects.buffChanges.academicWarnings || 0)),
      contestAwards: { ...(currentBuffs.contestAwards || {}) }
    };
  }

  const remaining = (gameState.pendingEvents || []).filter(e => e.id !== ev.id);
  const resolvedItem = { id: ev.id, choiceId: choice.id, time: Date.now(), uuid: crypto.randomUUID() };
  newState.pendingEvents = remaining;
  newState.resolvedEvents = [...(gameState.resolvedEvents || []), resolvedItem];

  return newState;
}

interface ProcessEventChoiceResult {
  newState: GameState;
  logs: LogEntry[];
  uiState: Record<string, unknown>;
  gameOverReason?: string;
}

export function hasBlockingPendingEvents(pendingEvents: Event[] | null | undefined): boolean {
  return (pendingEvents || []).some(event => !event.defaultChoiceId);
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

  if (ev.id === 'campus_clinic') {
    const dynamicResult = processCampusClinicChoice(choice);
    logs.push(...dynamicResult.logs);
    effects = { ...effects, ...dynamicResult.effects };
  }

  if (choice.specialAction === 'PROCESS_REGIONAL_QUALIFICATION') {
    return processRegionalQualification(gameState, ev, choice, effects, logs);
  }

  // 处理特殊动作：启动比赛
  if (choice.specialAction === 'START_CONTEST') {
    return processStartContest(gameState, ev, choice, effects, setFlags, logs, selectedTeammateIds) as ProcessEventChoiceResult;
  }

  // 普通事件处理
  logs.push({
    message: `📌 ${ev.title}：${choice.label}`,
    type: 'info'
  });
  if (effects.log) {
    logs.push({ message: effects.log, type: effects.logType || 'info' });
  }

  let newState = buildNewStateForEvent(gameState, ev, choice, effects, setFlags, selectedTeammateIds);
  if (ev.id === 'september_online_qualifier') {
    const { month, year } = getSchoolMonth(gameState.month);
    if (month === 9 && year >= 2) {
      newState = appendPendingEventIfMissing(newState, REGIONAL_QUOTA_EVENT_ID);
    }
  }

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
        currentEvent: ev,
        showTeammateDialog: true,
        pendingEventChoice: { eventId, choiceId }
      }
    };
  }

  return processEventChoice(gameState, ev, choice);
}

export function autoResolveDefaultEvents(gameState: GameState): LogicResult {
  let currentState = gameState;
  const logs: LogEntry[] = [];

  while (true) {
    const nextEvent = (currentState.pendingEvents || []).find(event => event.defaultChoiceId);
    if (!nextEvent || !nextEvent.defaultChoiceId) {
      break;
    }

    const defaultChoice = nextEvent.choices.find(choice => choice.id === nextEvent.defaultChoiceId);
    if (!defaultChoice || defaultChoice.requiresTeamSelection) {
      break;
    }

    logs.push({
      message: `⏭️ ${nextEvent.title} 本月未处理，按“${defaultChoice.label}”结算。`,
      type: 'info'
    });

    const result = applyEventChoice(currentState, nextEvent.id, nextEvent.defaultChoiceId);
    currentState = result.newState || currentState;
    logs.push(...result.logs);

    if (result.gameOverReason) {
      return {
        newState: currentState,
        logs,
        uiState: {},
        gameOverReason: result.gameOverReason
      };
    }
  }

  return {
    newState: currentState,
    logs,
    uiState: {}
  };
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
    message: `👥 队伍定了：${selectedTeammateIds.map(id => {
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

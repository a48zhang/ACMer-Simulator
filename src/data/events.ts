// 事件系统数据定义
// Event system data definitions

import { EVENT_CHANCES } from '../config/gameBalance';
import type { Event, GameState, WorldFlags } from '../types';

// 条件匹配工具
const hasFlag = (flags: WorldFlags, key: string): boolean => !!(flags && flags[key]);

interface SchoolMonth {
  year: number;
  month: number;
}

// 将游戏月份转换为学年和日历月份（gameMonth 1 = 大一9月）
export const getSchoolMonth = (gameMonth: number): SchoolMonth => {
    const monthsSinceStart = gameMonth - 1; // 0-based
    const startCalendarMonth = 9; // September
    const totalCalendarMonth = startCalendarMonth + monthsSinceStart;
    const month = ((totalCalendarMonth - 1) % 12) + 1; // Calendar month 1-12

    // 计算学年（大一、大二、大三、大四）
    // 学年在每年9月递增
    let year: number;
    if (gameMonth <= 4) {
      // 前4个月（9-12月）属于大一
      year = 1;
    } else {
      const monthsAfterFirstSemester = gameMonth - 5;
      const completedYears = Math.floor(monthsAfterFirstSemester / 12);
      if (month < 9) {
        year = completedYears + 1;
      } else {
        year = completedYears + 2;
      }
    }

    return { year, month };
};

const getFlagNumber = (flags: WorldFlags, key: string): number => {
  const value = flags?.[key];
  return typeof value === 'number' ? value : 0;
};

const REGIONAL_PATH_SCHOOL = 1;
const REGIONAL_PATH_WILDCARD = 2;
const REGIONAL_SERIES_LIMIT = 2;

export const REGIONAL_QUOTA_EVENT_ID = 'september_regional_quota';
const REGIONAL_CONTEST_DIFFICULTIES = [2, 3, 4, 5, 5, 6, 8, 10, 13, 17, 21, 25, 30];

const REGIONAL_STATIONS = [
  {
    id: 'october_icpc_jinan',
    month: 10,
    series: 'icpc' as const,
    title: '10月 ICPC 济南站',
    description: '第一批 ICPC 赛站开始确认名单了。学校和教练都在盯着这站。',
    contestName: 'ICPC区域赛（济南站）'
  },
  {
    id: 'october_ccpc_guilin',
    month: 10,
    series: 'ccpc' as const,
    title: '10月 CCPC 桂林站',
    description: 'CCPC 桂林站开放确认，队伍成型的话可以直接去冲。',
    contestName: 'CCPC区域赛（桂林站）'
  },
  {
    id: 'november_icpc_nanjing',
    month: 11,
    series: 'icpc' as const,
    title: '11月 ICPC 南京站',
    description: '11 月的 ICPC 站点到了，通常是学校最看重的一站。',
    contestName: 'ICPC区域赛（南京站）'
  },
  {
    id: 'november_ccpc_chongqing',
    month: 11,
    series: 'ccpc' as const,
    title: '11月 CCPC 重庆站',
    description: 'CCPC 重庆站开始统计名单，想去就得尽快把队伍拉齐。',
    contestName: 'CCPC区域赛（重庆站）'
  },
  {
    id: 'december_icpc_kunming',
    month: 12,
    series: 'icpc' as const,
    title: '12月 ICPC 昆明站',
    description: '赛季尾声还有一站 ICPC，可以作为最后一次冲区域赛成绩的机会。',
    contestName: 'ICPC区域赛（昆明站）'
  },
  {
    id: 'december_ccpc_harbin',
    month: 12,
    series: 'ccpc' as const,
    title: '12月 CCPC 哈尔滨站',
    description: '最后一批 CCPC 名单开放，如果还有名额，这站也能继续上。',
    contestName: 'CCPC区域赛（哈尔滨站）'
  }
];

const hasRegionalSeasonAccess = (state: GameState): boolean => {
  const { year } = getSchoolMonth(state.month);
  const flags = state.worldFlags || {};
  return hasFlag(flags, 'joinedClub')
    && year >= 2
    && getFlagNumber(flags, 'regionalSeasonYear') === year
    && getFlagNumber(flags, 'regionalQuotaPath') > 0;
};

const createRegionalStationCondition = (
  targetMonth: number,
  series: 'icpc' | 'ccpc'
) => {
  return (state: GameState): boolean => {
    const { month } = getSchoolMonth(state.month);
    if (month !== targetMonth || !hasRegionalSeasonAccess(state)) {
      return false;
    }

    const usedKey = series === 'icpc' ? 'regionalICPCUsed' : 'regionalCCPCUsed';
    return getFlagNumber(state.worldFlags || {}, usedKey) < REGIONAL_SERIES_LIMIT;
  };
};

/**
 * 创建通用月份条件检查函数
 * @param targetMonth - 目标日历月份（单月或数组）
 * @param minYear - 最低学年要求
 * @param requiredFlags - 必须满足的 worldFlags 键列表
 * @returns 条件检查函数
 */
const createMonthlyCondition = (
  targetMonth: number | number[],
  minYear: number,
  requiredFlags: string[]
) => {
  return (state: GameState): boolean => {
    const { month, year } = getSchoolMonth(state.month);
    const monthMatch = Array.isArray(targetMonth)
      ? targetMonth.includes(month)
      : month === targetMonth;
    const yearMatch = year >= minYear;
    const flagsMatch = requiredFlags.every(flag => hasFlag(state.worldFlags, flag));
    return monthMatch && yearMatch && flagsMatch;
  };
};

const ACTIVE_SEMESTER_MONTHS = [3, 4, 5, 9, 10, 11];
const ASSIGNMENT_MONTHS = [4, 5, 10, 11];

// 事件库（可扩展）
export const EVENTS: Event[] = [
    {
        id: 'club_intro',
        title: 'ACM社团招新',
        description: 'ACM社团开始招新了。要加入吗？',
        mandatory: false,
        defaultChoiceId: 'skip',
        conditions: (state: GameState): boolean => {
            const { month } = getSchoolMonth(state.month);
            return (month === 9 || month === 6) && !hasFlag(state.worldFlags, 'joinedClub');
        },
        choices: [
            {
                id: 'join',
                label: '加入社团',
                effects: {
                    attributeChanges: { stress: 1 },
                    apBonus: 2,
                    log: '🎉 进队了。抗压+1，本月额外获得2AP。',
                    logType: 'success'
                },
                setFlags: { joinedClub: true },
                eventPath: 'club'
            },
            {
                id: 'skip',
                label: '先不去',
                effects: {
                    sanDelta: 1,
                    log: '😌 这次先不进队。',
                    logType: 'info'
                }
            }
        ]
    },
    {
        id: 'march_invitational_signup',
        title: '3月邀请赛',
        description: '有场 3 月邀请赛在报名。要去的话，先把队友定下来。',
        mandatory: false,
        defaultChoiceId: 'skip',
        conditions: createMonthlyCondition(3, 1, ['joinedClub']),
        choices: [
            {
                id: 'participate',
                label: '参加',
                effects: {
                    sanDelta: -5
                },
                setFlags: { marchInvitationalParticipating: true },
                requiresTeamSelection: true,
                specialAction: 'START_CONTEST',
                contestConfig: {
                    name: '3月邀请赛',
                    problemCount: [10, 12],
                    durationMinutes: 300,
                    difficulties: [1, 2, 3, 4, 5, 5, 6, 7, 7, 8, 9, 10],
                    isRated: false,
                    category: 'invitational',
                    awardEligible: true,
                    resultFlagKey: 'marchInvitational'
                }
            },
            {
                id: 'skip',
                label: '这场不去',
                effects: {
                    sanDelta: 2,
                    log: '😌 这场先不打，缓一口气。',
                    logType: 'info'
                },
                setFlags: { marchInvitationalParticipating: false }
            }
        ]
    },
    {
        id: 'april_provincial',
        title: '4月XCPC省赛',
        description: '省赛快到了。要上的话，得先把队伍定好。',
        mandatory: false,
        defaultChoiceId: 'skip',
        conditions: createMonthlyCondition(4, 1, ['joinedClub']),
        choices: [
            {
                id: 'participate',
                label: '参加',
                effects: {
                    sanDelta: -10
                },
                setFlags: { aprilProvincialParticipating: true },
                requiresTeamSelection: true,
                specialAction: 'START_CONTEST',
                contestConfig: {
                    name: 'XCPC省赛',
                    problemCount: [10, 13],
                    durationMinutes: 300,
                    difficulties: [2, 3, 4, 5, 5, 6, 6, 7, 8, 8, 9, 10, 10],
                    isRated: false,
                    category: 'provincial',
                    awardEligible: true,
                    resultFlagKey: 'aprilProvincial'
                }
            },
            {
                id: 'skip',
                label: '这场不去',
                effects: {
                    sanDelta: 3,
                    log: '😌 这场先放掉，留点状态。',
                    logType: 'info'
                },
                setFlags: { aprilProvincialParticipating: false }
            }
        ]
    },
    {
        id: 'may_invitational',
        title: '5月邀请赛',
        description: '又来一场邀请赛。想打的话，还是得先把人凑齐。',
        mandatory: false,
        defaultChoiceId: 'skip',
        conditions: createMonthlyCondition(5, 1, ['joinedClub']),
        choices: [
            {
                id: 'participate',
                label: '参加',
                effects: {
                    sanDelta: -5
                },
                setFlags: { mayInvitationalParticipating: true },
                requiresTeamSelection: true,
                specialAction: 'START_CONTEST',
                contestConfig: {
                    name: '5月邀请赛',
                    problemCount: [10, 12],
                    durationMinutes: 300,
                    difficulties: [1, 2, 3, 4, 5, 5, 6, 7, 7, 8, 9, 10],
                    isRated: false,
                    category: 'invitational',
                    awardEligible: true,
                    resultFlagKey: 'mayInvitational'
                }
            },
            {
                id: 'skip',
                label: '这场不去',
                effects: {
                    sanDelta: 2,
                    log: '😌 这场先不接，休息一下。',
                    logType: 'info'
                },
                setFlags: { mayInvitationalParticipating: false }
            }
        ]
    },
    {
        id: 'june_finals_week',
        title: '6月期末周',
        description: '期末周到了。先看看这学期有没有把自己玩脱。',
        mandatory: true,
        conditions: (state: GameState): boolean => {
            const { month } = getSchoolMonth(state.month);
            return month === 6;
        },
        choices: [
            {
                id: 'review',
                label: '看看成绩',
                effects: {},
                setFlags: { juneFinalsReviewed: true }
            }
        ]
    },
    {
        id: 'july_summer_training',
        title: '7月多校集训',
        description: '暑假多校开了。去上强度，还是先回家缓一缓？',
        mandatory: false,
        defaultChoiceId: 'skip',
        conditions: (state: GameState): boolean => {
            const { month } = getSchoolMonth(state.month);
            return month === 7;
        },
        choices: [
            {
                id: 'participate',
                label: '去多校',
                effects: {
                    attributeChanges: { algorithm: 1, coding: 1 },
                    sanDelta: -15,
                    log: '🔥 去多校上了一波强度。算法+1，代码+1，SAN-15。',
                    logType: 'success'
                },
                setFlags: { julySummerTrainingParticipating: true }
            },
            {
                id: 'skip',
                label: '回家歇会',
                effects: {
                    sanDelta: 20,
                    log: '🏠 先回家缓口气，SAN+20。',
                    logType: 'info'
                },
                setFlags: { julySummerTrainingParticipating: false }
            }
        ]
    },
    {
        id: 'september_online_qualifier',
        title: '9月网络预选赛',
        description: '区域赛名额开抢前，先打一场网络预选。它会和邀请赛、省赛成绩一起决定你抢校内名额时的分量。',
        mandatory: false,
        defaultChoiceId: 'skip',
        conditions: createMonthlyCondition(9, 2, ['joinedClub']),
        choices: [
            {
                id: 'participate',
                label: '参加',
                effects: {
                    sanDelta: -10
                },
                setFlags: { septemberQualifierParticipating: true },
                specialAction: 'START_CONTEST',
                contestConfig: {
                    name: '9月网络预选赛',
                    problemCount: [8, 10],
                    durationMinutes: 180,
                    difficulties: [2, 3, 4, 5, 5, 6, 7, 8, 9, 10],
                    isRated: false,
                    category: 'qualifier',
                    awardEligible: false,
                    resultFlagKey: 'septemberQualifier'
                }
            },
            {
                id: 'skip',
                label: '这场不打',
                effects: {
                    sanDelta: 5,
                    log: '😌 这场先不打，留点精力。',
                    logType: 'info'
                },
                setFlags: {
                    septemberQualifierParticipating: false,
                    septemberQualifierScore: 0,
                    septemberQualifierSettled: 1
                }
            }
        ]
    },
    {
        id: REGIONAL_QUOTA_EVENT_ID,
        title: '9月区域赛抢名额',
        description: '教练开始按邀请赛、省赛、网络预选的综合表现分配区域赛资格。校内名额抢不过，也可以直接去申请外卡。',
        mandatory: false,
        defaultChoiceId: 'skip',
        conditions: (): boolean => false,
        choices: [
            {
                id: 'school_quota',
                label: '按战绩抢校内名额',
                effects: {
                    sanDelta: -6
                },
                specialAction: 'PROCESS_REGIONAL_QUALIFICATION'
            },
            {
                id: 'wildcard',
                label: '申请外卡',
                effects: {
                    sanDelta: -3,
                    balanceDelta: -600
                },
                specialAction: 'PROCESS_REGIONAL_QUALIFICATION'
            },
            {
                id: 'skip',
                label: '这赛季先不报',
                effects: {
                    sanDelta: 6,
                    log: '😌 这赛季区域赛先放掉，集中刷题。',
                    logType: 'info'
                },
                setFlags: {
                    regionalSeasonYear: 0,
                    regionalQuotaPath: 0,
                    regionalQualificationScore: 0,
                    regionalICPCUsed: 0,
                    regionalCCPCUsed: 0
                }
            }
        ]
    },
    ...REGIONAL_STATIONS.map((station) => ({
        id: `regional_station_${station.id}`,
        title: station.title,
        description: station.description,
        mandatory: false,
        defaultChoiceId: 'skip',
        conditions: createRegionalStationCondition(station.month, station.series),
        choices: [
            {
                id: 'participate',
                label: '确认名单并组队参赛',
                effects: {
                    sanDelta: -15
                },
                setFlags: {
                    [`${station.id}Participating`]: true
                },
                requiresTeamSelection: true,
                specialAction: 'START_CONTEST',
                contestConfig: {
                    name: station.contestName,
                    problemCount: [11, 13],
                    durationMinutes: 300,
                    difficulties: REGIONAL_CONTEST_DIFFICULTIES,
                    isRated: false,
                    category: 'regional',
                    awardEligible: true,
                    series: station.series,
                    stationId: station.id
                }
            },
            {
                id: 'skip',
                label: '这站不去',
                effects: {
                    sanDelta: 0,
                    log: `😔 ${station.title} 这站放了。`,
                    logType: 'info'
                },
                setFlags: {
                    [`${station.id}Participating`]: false
                }
            }
        ]
    })),
    {
        id: 'january_finals_week',
        title: '1月期末周',
        description: '寒假前还得先过期末。看看这学期最后结算成什么样。',
        mandatory: true,
        conditions: (state: GameState): boolean => {
            const { month } = getSchoolMonth(state.month);
            return month === 1;
        },
        choices: [
            {
                id: 'review',
                label: '看看成绩',
                effects: {},
                setFlags: { januaryFinalsReviewed: true }
            }
        ]
    },
    {
        id: 'freshman_contest',
        title: '新生程序设计大赛',
        description: '校里要办新生赛了。个人赛，难度不算高，正好看看自己现在大概什么水平。',
        mandatory: false,
        defaultChoiceId: 'skip',
        chanceToAppear: EVENT_CHANCES.FRESHMAN_CONTEST,
        conditions: (state: GameState): boolean => {
            const { month, year } = getSchoolMonth(state.month);
            return (month === 10 || month === 11) && year === 1;
        },
        choices: [
            {
                id: 'participate',
                label: '参加',
                effects: {
                    sanDelta: -5
                },
                setFlags: { freshmanContestParticipated: true },
                specialAction: 'START_CONTEST',
                contestConfig: {
                    name: '新生程序设计大赛',
                    problemCount: [4, 5],
                    durationMinutes: 120,
                    difficulties: [1, 2, 3, 4, 5],
                    isRated: false,
                    category: 'freshman',
                    awardEligible: false
                }
            },
            {
                id: 'skip',
                label: '先不打',
                effects: {
                    sanDelta: 3,
                    log: '😌 新生赛这次先不去。',
                    logType: 'info'
                },
                setFlags: { freshmanContestParticipated: false }
            }
        ]
    },
    {
        id: 'school_contest',
        title: '校内程序设计大赛',
        description: '校赛来了，需要先把队伍定下来。',
        mandatory: false,
        defaultChoiceId: 'skip',
        chanceToAppear: EVENT_CHANCES.SCHOOL_CONTEST,
        conditions: createMonthlyCondition([10, 11, 12], 2, ['joinedClub']),
        choices: [
            {
                id: 'participate',
                label: '组队参加',
                effects: {
                    sanDelta: -8
                },
                setFlags: { schoolContestParticipating: true },
                requiresTeamSelection: true,
                specialAction: 'START_CONTEST',
                contestConfig: {
                    name: '校内程序设计大赛',
                    problemCount: [8, 10],
                    durationMinutes: 240,
                    difficulties: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    isRated: false,
                    category: 'school',
                    awardEligible: false
                }
            },
            {
                id: 'skip',
                label: '这场不去',
                effects: {
                    sanDelta: 2,
                    log: '😌 校赛这次先不打。',
                    logType: 'info'
                },
                setFlags: { schoolContestParticipating: false }
            }
        ]
    },
    {
        id: 'attendance_spot_check',
        title: '课堂点名抽查',
        description: '这周老师突然开始抓人点名。去补一下出勤，还是当没看见？',
        mandatory: false,
        defaultChoiceId: 'play_dead',
        chanceToAppear: EVENT_CHANCES.ATTENDANCE_SPOT_CHECK,
        conditions: createMonthlyCondition(ACTIVE_SEMESTER_MONTHS, 1, []),
        choices: [
            {
                id: 'rush_to_class',
                label: '赶去教室',
                effects: {
                    gpaDelta: 0.05,
                    sanDelta: -4,
                    log: '🏃 临时冲去上课，点名算是糊过去了。GPA+0.05，SAN-4。',
                    logType: 'success'
                },
                setFlags: { attendedClassThisMonth: true }
            },
            {
                id: 'play_dead',
                label: '装死',
                effects: {
                    gpaDelta: -0.08,
                    sanDelta: 2,
                    log: '🙈 这次就当没看见，平时分掉了一点。GPA-0.08。',
                    logType: 'warning'
                }
            }
        ]
    },
    {
        id: 'assignment_crunch',
        title: '大作业DDL',
        description: '课程大作业快到截止时间了。现在补，还来得及；再拖，平时分大概率要掉。',
        mandatory: false,
        defaultChoiceId: 'delay',
        chanceToAppear: EVENT_CHANCES.ASSIGNMENT_CRUNCH,
        conditions: createMonthlyCondition(ASSIGNMENT_MONTHS, 1, []),
        choices: [
            {
                id: 'rush_deadline',
                label: '熬夜赶完',
                effects: {
                    gpaDelta: 0.06,
                    sanDelta: -8,
                    log: '💻 把大作业硬赶完了，平时分算是保住。GPA+0.06，SAN-8。',
                    logType: 'success'
                }
            },
            {
                id: 'delay',
                label: '先拖着',
                effects: {
                    gpaDelta: -0.10,
                    sanDelta: 1,
                    log: '🫠 DDL 又往后拖了，老师那边记了一笔。GPA-0.10。',
                    logType: 'warning'
                }
            }
        ]
    },
    {
        id: 'dorm_power_outage',
        title: '宿舍断网断电',
        description: '宿舍今晚又断了。是换地方继续学，还是干脆摆一天？',
        mandatory: false,
        defaultChoiceId: 'slack_off',
        chanceToAppear: EVENT_CHANCES.DORM_POWER_OUTAGE,
        conditions: createMonthlyCondition([3, 4, 5, 9, 10, 11, 12], 1, []),
        choices: [
            {
                id: 'move_to_library',
                label: '去图书馆',
                effects: {
                    playerProblemsDelta: 1,
                    sanDelta: -2,
                    log: '📚 换到图书馆继续搞，至少没把今晚全浪费掉。',
                    logType: 'info'
                }
            },
            {
                id: 'slack_off',
                label: '今天算了',
                effects: {
                    sanDelta: 5,
                    log: '🛏️ 宿舍一断，你也顺势摆了半天，SAN+5。',
                    logType: 'info'
                }
            }
        ]
    },
    {
        id: 'campus_clinic',
        title: '身体有点不对劲',
        description: '这几天状态不太对。要不要去医院、去校医院、先买点药，还是继续硬扛？',
        mandatory: false,
        defaultChoiceId: 'tough_it_out',
        chanceToAppear: EVENT_CHANCES.CAMPUS_CLINIC,
        conditions: createMonthlyCondition(ACTIVE_SEMESTER_MONTHS, 1, []),
        choices: [
            {
                id: 'go_hospital',
                label: '去医院',
                effects: {}
            },
            {
                id: 'go_campus_clinic',
                label: '去校医院',
                effects: {}
            },
            {
                id: 'buy_medicine',
                label: '先买点药',
                effects: {}
            },
            {
                id: 'tough_it_out',
                label: '继续硬扛',
                effects: {}
            }
        ]
    },
];

export function getEventById(eventId: string): Event | undefined {
    return EVENTS.find((event) => event.id === eventId);
}

// 调度器：根据月份和状态生成当月事件
export function scheduleMonthlyEvents(state: GameState, month: number): Event[] {
    const flags = state.worldFlags || {};
    const candidates = EVENTS.filter((ev) => {
        const { monthConstraints } = ev;
        let inWindow = true;
        if (monthConstraints) {
            const { start, end } = monthConstraints;
            if (typeof start === 'number') inWindow = inWindow && month >= start;
            if (typeof end === 'number') inWindow = inWindow && month <= end;
        }
        const ok = ev.conditions ? ev.conditions({ ...state, worldFlags: flags, month }) : true;
        if (!inWindow || !ok) return false;
        if (ev.chanceToAppear !== undefined) {
            return Math.random() < ev.chanceToAppear;
        }
        return true;
    });
    const unique: Event[] = [];
    const seen = new Set<string>();
    candidates.forEach((ev) => {
        if (!seen.has(ev.id)) { unique.push(ev); seen.add(ev.id); }
    });
    unique.sort((a, b) => {
        const ab = a.defaultChoiceId ? 0 : 1;
        const bb = b.defaultChoiceId ? 0 : 1;
        if (ab !== bb) {
          return bb - ab;
        }
        const am = a.mandatory ? 1 : 0;
        const bm = b.mandatory ? 1 : 0;
        return bm - am;
    });
    return unique;
}

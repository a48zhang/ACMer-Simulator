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
const getSchoolMonth = (gameMonth: number): SchoolMonth => {
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

// 事件库（可扩展）
export const EVENTS: Event[] = [
    {
        id: 'club_intro',
        title: 'ACM社团招新',
        description: '算法队开始招新了。要不要先进来看看？这个月不选就当你没报。',
        mandatory: false,
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
        mandatory: true,
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
                    isRated: false
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
        mandatory: true,
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
                    isRated: false
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
        mandatory: true,
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
                    isRated: false
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
        mandatory: true,
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
        description: '区域赛前的网络预选来了。个人赛，成绩会影响后面的入场资格。',
        mandatory: true,
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
                    isRated: false
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
                setFlags: { septemberQualifierParticipating: false }
            }
        ]
    },
    {
        id: 'october_regional',
        title: '10月区域赛站点',
        description: '这个月刷到一个区域赛站。要不要组队去打？',
        mandatory: false,
        chanceToAppear: EVENT_CHANCES.REGIONAL_STATION,
        conditions: createMonthlyCondition(10, 2, ['joinedClub']),
        choices: [
            {
                id: 'participate',
                label: '组队参赛',
                effects: {
                    sanDelta: -15
                },
                setFlags: { octoberRegionalParticipating: true },
                requiresTeamSelection: true,
                specialAction: 'START_CONTEST',
                contestConfig: {
                    name: 'XCPC区域赛（10月站）',
                    problemCount: [11, 13],
                    durationMinutes: 300,
                    difficulties: [2, 3, 4, 5, 5, 6, 6, 7, 8, 8, 9, 10, 10],
                    isRated: false
                }
            },
            {
                id: 'skip',
                label: '这站不去',
                effects: {
                    sanDelta: 0,
                    log: '😔 这个站没去。',
                    logType: 'info'
                },
                setFlags: { octoberRegionalParticipating: false }
            }
        ]
    },
    {
        id: 'november_regional',
        title: '11月区域赛站点',
        description: '又刷到一个区域赛站。继续组队往前打，还是这站先算了？',
        mandatory: false,
        chanceToAppear: EVENT_CHANCES.REGIONAL_STATION,
        conditions: createMonthlyCondition(11, 2, ['joinedClub']),
        choices: [
            {
                id: 'participate',
                label: '组队参赛',
                effects: {
                    sanDelta: -15
                },
                setFlags: { novemberRegionalParticipating: true },
                requiresTeamSelection: true,
                specialAction: 'START_CONTEST',
                contestConfig: {
                    name: 'XCPC区域赛（11月站）',
                    problemCount: [11, 13],
                    durationMinutes: 300,
                    difficulties: [2, 3, 4, 5, 5, 6, 6, 7, 8, 8, 9, 10, 10],
                    isRated: false
                }
            },
            {
                id: 'skip',
                label: '这站不去',
                effects: {
                    sanDelta: 0,
                    log: '😔 这个站先放了。',
                    logType: 'info'
                },
                setFlags: { novemberRegionalParticipating: false }
            }
        ]
    },
    {
        id: 'december_regional',
        title: '12月区域赛站点',
        description: '区域赛季差不多到头了。这一站要不要上？',
        mandatory: false,
        chanceToAppear: EVENT_CHANCES.REGIONAL_STATION,
        conditions: createMonthlyCondition(12, 2, ['joinedClub']),
        choices: [
            {
                id: 'participate',
                label: '组队参赛',
                effects: {
                    sanDelta: -15
                },
                setFlags: { decemberRegionalParticipating: true },
                requiresTeamSelection: true,
                specialAction: 'START_CONTEST',
                contestConfig: {
                    name: 'XCPC区域赛（12月站）',
                    problemCount: [11, 13],
                    durationMinutes: 300,
                    difficulties: [2, 3, 4, 5, 5, 6, 6, 7, 8, 8, 9, 10, 10],
                    isRated: false
                }
            },
            {
                id: 'skip',
                label: '这站不去',
                effects: {
                    sanDelta: 0,
                    log: '😔 最后一站也没去。',
                    logType: 'info'
                },
                setFlags: { decemberRegionalParticipating: false }
            }
        ]
    },
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
                    isRated: false
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
                    isRated: false
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
];

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
        const am = a.mandatory ? 1 : 0;
        const bm = b.mandatory ? 1 : 0;
        return bm - am;
    });
    return unique;
}

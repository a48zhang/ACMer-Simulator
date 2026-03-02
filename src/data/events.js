// 事件系统数据定义
// Event system data definitions

// 条件匹配工具
const hasFlag = (flags, key) => !!(flags && flags[key]);
const getFlag = (flags, key, def = 0) => (flags && typeof flags[key] === 'number' ? flags[key] : def);

/**
 * 创建通用月份条件检查函数
 * @param {number|number[]} targetMonth - 目标日历月份（单月或数组）
 * @param {number} minYear - 最低学年要求
 * @param {string[]} requiredFlags - 必须满足的 worldFlags 键列表
 * @returns {Function} 条件检查函数
 */
const createMonthlyCondition = (targetMonth, minYear, requiredFlags) => {
  return (state) => {
    const { month, year } = getSchoolMonth(state.month);
    const monthMatch = Array.isArray(targetMonth)
      ? targetMonth.includes(month)
      : month === targetMonth;
    const yearMatch = year >= minYear;
    const flagsMatch = requiredFlags.every(flag => hasFlag(state.worldFlags, flag));
    return monthMatch && yearMatch && flagsMatch;
  };
};

// 将游戏月份转换为学年和日历月份（gameMonth 1 = 大一9月）
const getSchoolMonth = (gameMonth) => {
    const monthsSinceStart = gameMonth - 1; // 0-based
    const startCalendarMonth = 9; // September
    const totalCalendarMonth = startCalendarMonth + monthsSinceStart;
    const month = ((totalCalendarMonth - 1) % 12) + 1; // Calendar month 1-12
    
    // 计算学年（大一、大二、大三、大四）
    // 学年在每年9月递增
    let year;
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

// 事件库（可扩展）
export const EVENTS = [
    {
        id: 'club_intro',
        title: 'ACM社团招新',
        description: 'ACM算法社团正在招新，是否加入？本月不选择将自动跳过。',
        mandatory: false, // 可选，当月未选择自动过期
        conditions: (state) => {
            const { month } = getSchoolMonth(state.month);
            // 每年9月（新生入学）和6月（社团纳新）刷出，且尚未加入过社团
            return (month === 9 || month === 6) && !hasFlag(state.worldFlags, 'joinedClub');
        },
        choices: [
            {
                id: 'join',
                label: '加入社团',
                effects: {
                    attributeChanges: { stress: 1 },
                    apBonus: 2,
                    log: '🎉 加入了ACM算法社团！抗压+1，本月额外获得2AP。',
                    logType: 'success'
                },
                setFlags: { joinedClub: true },
                eventPath: 'club'
            },
            {
                id: 'skip',
                label: '不了',
                effects: {
                    sanDelta: 1,
                    log: '😌 暂时不加入社团。',
                    logType: 'info'
                }
                // 不设 setFlags，让事件在下次符合条件时继续出现
            }
        ]
    },
    // 3月邀请赛抢名额事件（每年）
    {
        id: 'march_invitational_signup',
        title: '3月邀请赛名额抢夺',
        description: '邀请赛开始报名，是否参加？如果参加，需要提前选择队友。',
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
                label: '跳过',
                effects: {
                    sanDelta: 2,
                    log: '😌 选择跳过3月邀请赛，稍作休息。',
                    logType: 'info'
                },
                setFlags: { marchInvitationalParticipating: false }
            }
        ]
    },
    // 4月省赛事件（每年）
    {
        id: 'april_provincial',
        title: '4月XCPC省赛',
        description: '省级竞赛即将举行，是否参加？如果参加，需要提前选择队友。',
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
                label: '跳过',
                effects: {
                    sanDelta: 3,
                    log: '😌 选择跳过4月省赛，稍作休息。',
                    logType: 'info'
                },
                setFlags: { aprilProvincialParticipating: false }
            }
        ]
    },
    // 5月邀请赛事件（每年）
    {
        id: 'may_invitational',
        title: '5月邀请赛',
        description: '又一场邀请赛来临，是否参加？如果参加，需要提前选择队友。',
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
                label: '跳过',
                effects: {
                    sanDelta: 2,
                    log: '😌 选择跳过5月邀请赛，稍作休息。',
                    logType: 'info'
                },
                setFlags: { mayInvitationalParticipating: false }
            }
        ]
    },
    // 6月期末周事件（每年）
    {
        id: 'june_finals_week',
        title: '6月期末周',
        description: '期末考试周到了，即将进行期末考试...',
        mandatory: true,
        conditions: (state) => {
            const { month } = getSchoolMonth(state.month);
            return month === 6; // 6月
        },
        choices: [
            {
                id: 'review',
                label: '确认',
                effects: {
                    // GPA审核在这里进行
                },
                setFlags: { juneFinalsReviewed: true }
            }
        ]
    },
    // 7月多校集训事件（每年）
    {
        id: 'july_summer_training',
        title: '7月多校集训比赛',
        description: '暑期多校集训系列比赛开始，这是提升实力的好机会！',
        mandatory: true,
        conditions: (state) => {
            const { month } = getSchoolMonth(state.month);
            return month === 7; // 7月
        },
        choices: [
            {
                id: 'participate',
                label: '参加集训',
                effects: {
                    attributeChanges: { algorithm: 1, coding: 1 },
                    sanDelta: -15,
                    log: '🔥 参加了暑期多校集训！算法+1，代码+1，SAN-15。',
                    logType: 'success'
                },
                setFlags: { julySummerTrainingParticipating: true }
            },
            {
                id: 'skip',
                label: '跳过，回家休息',
                effects: {
                    sanDelta: 20,
                    log: '🏠 选择回家休息，放松身心，SAN+20。',
                    logType: 'info'
                },
                setFlags: { julySummerTrainingParticipating: false }
            }
        ]
    },
    // 9月网络预选赛事件（每年）
    {
        id: 'september_online_qualifier',
        title: '9月网络预选赛',
        description: '为区域赛做准备的网络预选赛，是否参加？个人赛，成绩影响区域赛入场资格。',
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
                label: '跳过',
                effects: {
                    sanDelta: 5,
                    log: '😌 选择休息，跳过了网络预选赛。',
                    logType: 'info'
                },
                setFlags: { septemberQualifierParticipating: false }
            }
        ]
    },
    // 10月-12月亚洲区域赛事件（每年，概率刷出）
    {
        id: 'october_regional',
        title: '10月区域赛站点',
        description: '区域赛季开始了！本月有一个赛站，是否组队参赛？',
        mandatory: false,
        chanceToAppear: 0.3, // 30%概率在调度时刷出，由 scheduleMonthlyEvents 负责掷骰
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
                label: '放弃',
                effects: {
                    sanDelta: 0,
                    log: '😔 放弃了10月区域赛站点。',
                    logType: 'info'
                },
                setFlags: { octoberRegionalParticipating: false }
            }
        ]
    },
    {
        id: 'november_regional',
        title: '11月区域赛站点',
        description: '又有区域赛赛站了！是否继续组队参赛？',
        mandatory: false,
        chanceToAppear: 0.3, // 30%概率在调度时刷出
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
                label: '放弃',
                effects: {
                    sanDelta: 0,
                    log: '😔 放弃了11月区域赛站点。',
                    logType: 'info'
                },
                setFlags: { novemberRegionalParticipating: false }
            }
        ]
    },
    {
        id: 'december_regional',
        title: '12月区域赛站点',
        description: '区域赛季的最后机会！是否组队参赛？',
        mandatory: false,
        chanceToAppear: 0.3, // 30%概率在调度时刷出
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
                label: '放弃',
                effects: {
                    sanDelta: 0,
                    log: '😔 放弃了12月区域赛站点。',
                    logType: 'info'
                },
                setFlags: { decemberRegionalParticipating: false }
            }
        ]
    },
    // 1月期末周事件（每年）
    {
        id: 'january_finals_week',
        title: '1月期末周',
        description: '寒假前的期末考试，即将进行期末考试...',
        mandatory: true,
        conditions: (state) => {
            const { month } = getSchoolMonth(state.month);
            return month === 1; // 1月
        },
        choices: [
            {
                id: 'review',
                label: '确认',
                effects: {
                    // GPA审核在这里进行
                },
                setFlags: { januaryFinalsReviewed: true }
            }
        ]
    },
    // 新生赛事件（大一10-11月，个人赛，随机刷出）
    {
        id: 'freshman_contest',
        title: '新生程序设计大赛',
        description: '学校举办新生程序设计大赛，这是展示自己的好机会！个人赛，难度相对较低。',
        mandatory: false,
        chanceToAppear: 0.4, // 40%概率刷出
        conditions: (state) => {
            const { month, year } = getSchoolMonth(state.month);
            return (month === 10 || month === 11) && year === 1; // 仅大一10-11月
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
                label: '跳过',
                effects: {
                    sanDelta: 3,
                    log: '😌 选择跳过新生程序设计大赛，休息一下。',
                    logType: 'info'
                },
                setFlags: { freshmanContestParticipated: false }
            }
        ]
    },
    // 校赛事件（每年10-12月，组队赛，随机刷出，需加入社团）
    {
        id: 'school_contest',
        title: '校内程序设计大赛',
        description: '学校举办校内程序设计比赛，需要组队参赛。',
        mandatory: false,
        chanceToAppear: 0.3, // 30%概率刷出
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
                label: '跳过',
                effects: {
                    sanDelta: 2,
                    log: '😌 选择跳过校内程序设计大赛，休息一下。',
                    logType: 'info'
                },
                setFlags: { schoolContestParticipating: false }
            }
        ]
    },
];

// 调度器：根据月份和状态生成当月事件
export function scheduleMonthlyEvents(state, month) {
    const flags = state.worldFlags || {};
    const candidates = EVENTS.filter((ev) => {
        const { monthConstraints } = ev;
        let inWindow = true;
        if (monthConstraints) {
            const { start, end } = monthConstraints;
            if (typeof start === 'number') inWindow = inWindow && month >= start;
            if (typeof end === 'number') inWindow = inWindow && month <= end;
        }
        // 条件检查（不再包含随机性）
        const ok = ev.conditions ? ev.conditions({ ...state, worldFlags: flags, month }) : true;
        if (!inWindow || !ok) return false;
        // 概率事件：在调度时一次性掷骰，确保结果稳定
        if (ev.chanceToAppear !== undefined) {
            return Math.random() < ev.chanceToAppear;
        }
        return true;
    });
    // 去重（按 id）并返回必须处理的事件优先
    const unique = [];
    const seen = new Set();
    candidates.forEach((ev) => {
        if (!seen.has(ev.id)) { unique.push(ev); seen.add(ev.id); }
    });
    unique.sort((a, b) => {
        const am = a.mandatory ? 1 : 0;
        const bm = b.mandatory ? 1 : 0;
        return bm - am; // mandatory 优先
    });
    return unique;
}

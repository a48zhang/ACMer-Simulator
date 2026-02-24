// 事件系统数据定义
// Event system data definitions

// 条件匹配工具
const hasFlag = (flags, key) => !!(flags && flags[key]);
const getFlag = (flags, key, def = 0) => (flags && typeof flags[key] === 'number' ? flags[key] : def);

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
                    attributeChanges: { teamwork: 1, english: 1 },
                    apBonus: 2,
                    playerScoreDelta: 5
                },
                setFlags: { joinedClub: true },
                eventPath: 'club'
            },
            {
                id: 'skip',
                label: '不了',
                effects: {
                    sanDelta: 1
                },
                setFlags: { joinedClub: false }
            }
        ]
    },
    // 3月邀请赛抢名额事件（每年）
    {
        id: 'march_invitational_signup',
        title: '3月邀请赛名额抢夺',
        description: '邀请赛开始报名，是否参加？如果参加，需要提前选择队友。',
        mandatory: true,
        conditions: (state) => {
            const { month } = getSchoolMonth(state.month);
            return month === 3 && hasFlag(state.worldFlags, 'joinedClub'); // 3月，且已加入社团
        },
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
                    sanDelta: 2
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
        conditions: (state) => {
            const { month } = getSchoolMonth(state.month);
            return month === 4 && hasFlag(state.worldFlags, 'joinedClub'); // 4月，且已加入社团
        },
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
                    sanDelta: 3
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
        conditions: (state) => {
            const { month } = getSchoolMonth(state.month);
            return month === 5 && hasFlag(state.worldFlags, 'joinedClub'); // 5月，且已加入社团
        },
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
                    sanDelta: 2
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
                    sanDelta: -15
                },
                setFlags: { julySummerTrainingParticipating: true }
            },
            {
                id: 'skip',
                label: '跳过，回家休息',
                effects: {
                    sanDelta: 20
                },
                setFlags: { julySummerTrainingParticipating: false }
            }
        ]
    },
    // 9月网络预选赛事件（每年）
    {
        id: 'september_online_qualifier',
        title: '9月网络预选赛',
        description: '为区域赛做准备的网络预选赛，是否参加？',
        mandatory: true,
        conditions: (state) => {
            const { month, year } = getSchoolMonth(state.month);
            return month === 9 && year > 1 && hasFlag(state.worldFlags, 'joinedClub'); // 9月，大二及以上，且已加入社团
        },
        choices: [
            {
                id: 'participate',
                label: '参加',
                effects: {
                    sanDelta: -10
                },
                setFlags: { septemberQualifierParticipating: true }
            },
            {
                id: 'skip',
                label: '跳过',
                effects: {
                    sanDelta: 5
                },
                setFlags: { septemberQualifierParticipating: false }
            }
        ]
    },
    // 10月-12月亚洲区域赛事件（每年，概率刷出）
    {
        id: 'october_regional',
        title: '10月区域赛站点',
        description: '区域赛季开始了！本月有一个赛站，是否争抢外卡名额？赛站越多，中签概率越低。',
        mandatory: false,
        chanceToAppear: 0.3, // 30%概率在调度时刷出，由 scheduleMonthlyEvents 负责掷骰
        conditions: (state) => {
            const { month, year } = getSchoolMonth(state.month);
            return month === 10 && year >= 2 && hasFlag(state.worldFlags, 'joinedClub');
        },
        choices: [
            {
                id: 'participate',
                label: '争抢名额',
                effects: {
                    sanDelta: -15
                },
                setFlags: { octoberRegionalParticipating: true }
            },
            {
                id: 'skip',
                label: '放弃',
                effects: {
                    sanDelta: 0
                },
                setFlags: { octoberRegionalParticipating: false }
            }
        ]
    },
    {
        id: 'november_regional',
        title: '11月区域赛站点',
        description: '又有区域赛赛站了！是否继续争抢？',
        mandatory: false,
        chanceToAppear: 0.3, // 30%概率在调度时刷出
        conditions: (state) => {
            const { month, year } = getSchoolMonth(state.month);
            return month === 11 && year >= 2 && hasFlag(state.worldFlags, 'joinedClub');
        },
        choices: [
            {
                id: 'participate',
                label: '争抢名额',
                effects: {
                    sanDelta: -15
                },
                setFlags: { novemberRegionalParticipating: true }
            },
            {
                id: 'skip',
                label: '放弃',
                effects: {
                    sanDelta: 0
                },
                setFlags: { novemberRegionalParticipating: false }
            }
        ]
    },
    {
        id: 'december_regional',
        title: '12月区域赛站点',
        description: '区域赛季的最后机会！是否参加？',
        mandatory: false,
        chanceToAppear: 0.3, // 30%概率在调度时刷出
        conditions: (state) => {
            const { month, year } = getSchoolMonth(state.month);
            return month === 12 && year >= 2 && hasFlag(state.worldFlags, 'joinedClub');
        },
        choices: [
            {
                id: 'participate',
                label: '争抢名额',
                effects: {
                    sanDelta: -15
                },
                setFlags: { decemberRegionalParticipating: true }
            },
            {
                id: 'skip',
                label: '放弃',
                effects: {
                    sanDelta: 0
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
                    sanDelta: 3
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
        conditions: (state) => {
            const { month, year } = getSchoolMonth(state.month);
            // 10-12月，大二及以上，且已加入社团
            return (month === 10 || month === 11 || month === 12) && year >= 2 && hasFlag(state.worldFlags, 'joinedClub');
        },
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
                    sanDelta: 2
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

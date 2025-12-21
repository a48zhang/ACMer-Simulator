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
        description: 'ACM算法社团正在招新，是否加入？本月不选择将自动过期。',
        mandatory: true,
        conditions: (state) => {
            // 只在每年9月和6月刷新，且未加入社团
            if (hasFlag(state.worldFlags, 'joinedClub')) return false;
            const { month } = getSchoolMonth(state.month);
            return month === 9 || month === 6;
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
                label: '不了，先看课程',
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
        description: '邀请赛开始报名，是否参加？参加后将立即进入比赛模式。',
        mandatory: true,
        conditions: (state) => {
            // 只有加入社团才会刷出
            if (!hasFlag(state.worldFlags, 'joinedClub')) return false;
            const { month } = getSchoolMonth(state.month);
            return month === 3; // 3月
        },
        choices: [
            {
                id: 'participate',
                label: '参加',
                effects: {
                    sanDelta: -5,
                    specialAction: 'START_CONTEST'
                },
                contestConfig: {
                    name: '3月邀请赛',
                    problemCount: [8, 10],
                    durationMinutes: 300,
                    difficulties: [2, 3, 5, 7, 8, 10, 12, 15, 18, 20],
                    isRated: true,
                    ratingSource: 'invitational'
                },
                setFlags: { marchInvitationalParticipating: true }
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
        description: '省级竞赛即将举行，是否参加？参加后将立即进入比赛模式。',
        mandatory: true,
        conditions: (state) => {
            // 只有加入社团才会刷出
            if (!hasFlag(state.worldFlags, 'joinedClub')) return false;
            const { month } = getSchoolMonth(state.month);
            return month === 4; // 4月
        },
        choices: [
            {
                id: 'participate',
                label: '参加',
                effects: {
                    sanDelta: -10,
                    specialAction: 'START_CONTEST'
                },
                contestConfig: {
                    name: 'XCPC省赛',
                    problemCount: [10, 12],
                    durationMinutes: 300,
                    difficulties: [3, 5, 7, 8, 10, 12, 13, 15, 18, 20, 22, 25],
                    isRated: true,
                    ratingSource: 'provincial'
                },
                setFlags: { aprilProvincialParticipating: true }
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
        description: '又一场邀请赛来临，是否参加？参加后将立即进入比赛模式。',
        mandatory: true,
        conditions: (state) => {
            // 只有加入社团才会刷出
            if (!hasFlag(state.worldFlags, 'joinedClub')) return false;
            const { month } = getSchoolMonth(state.month);
            return month === 5; // 5月
        },
        choices: [
            {
                id: 'participate',
                label: '参加',
                effects: {
                    sanDelta: -5,
                    specialAction: 'START_CONTEST'
                },
                contestConfig: {
                    name: '5月邀请赛',
                    problemCount: [8, 10],
                    durationMinutes: 300,
                    difficulties: [2, 3, 5, 7, 8, 10, 12, 15, 18, 20],
                    isRated: true,
                    ratingSource: 'invitational'
                },
                setFlags: { mayInvitationalParticipating: true }
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
        title: '6月期末考试',
        description: '期末考试周到了...',
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
        description: '为区域赛做准备的网络预选赛，是否参加？参加后将立即进入比赛模式。',
        mandatory: true,
        conditions: (state) => {
            // 只有加入社团才会刷出
            if (!hasFlag(state.worldFlags, 'joinedClub')) return false;
            const { month, year } = getSchoolMonth(state.month);
            return month === 9 && year > 1; // 9月，但不是大一9月
        },
        choices: [
            {
                id: 'participate',
                label: '参加',
                effects: {
                    sanDelta: -10,
                    specialAction: 'START_CONTEST'
                },
                contestConfig: {
                    name: '网络预选赛',
                    problemCount: [8, 10],
                    durationMinutes: 300,
                    difficulties: [3, 5, 7, 8, 10, 12, 15, 18, 20, 22],
                    isRated: true,
                    ratingSource: 'qualifier'
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
        description: '区域赛季开始了！本月有一个赛站，是否争抢外卡名额？参加后将立即进入比赛模式。',
        mandatory: false,
        conditions: (state) => {
            // 只有加入社团才会刷出
            if (!hasFlag(state.worldFlags, 'joinedClub')) return false;
            const { month, year } = getSchoolMonth(state.month);
            // 10月，大二及以上，30%概率刷出
            return month === 10 && year >= 2 && Math.random() < 0.3;
        },
        choices: [
            {
                id: 'participate',
                label: '争抢名额',
                effects: {
                    sanDelta: -15,
                    specialAction: 'START_CONTEST'
                },
                contestConfig: {
                    name: '10月区域赛',
                    problemCount: [10, 13],
                    durationMinutes: 300,
                    difficulties: [3, 5, 7, 8, 10, 12, 13, 15, 18, 20, 22, 25, 28],
                    isRated: true,
                    ratingSource: 'regional'
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
        description: '又有区域赛赛站了！是否继续争抢？参加后将立即进入比赛模式。',
        mandatory: false,
        conditions: (state) => {
            // 只有加入社团才会刷出
            if (!hasFlag(state.worldFlags, 'joinedClub')) return false;
            const { month, year } = getSchoolMonth(state.month);
            // 11月，大二及以上，30%概率刷出
            return month === 11 && year >= 2 && Math.random() < 0.3;
        },
        choices: [
            {
                id: 'participate',
                label: '争抢名额',
                effects: {
                    sanDelta: -15,
                    specialAction: 'START_CONTEST'
                },
                contestConfig: {
                    name: '11月区域赛',
                    problemCount: [10, 13],
                    durationMinutes: 300,
                    difficulties: [3, 5, 7, 8, 10, 12, 13, 15, 18, 20, 22, 25, 28],
                    isRated: true,
                    ratingSource: 'regional'
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
        description: '区域赛季的最后机会！是否参加？参加后将立即进入比赛模式。',
        mandatory: false,
        conditions: (state) => {
            // 只有加入社团才会刷出
            if (!hasFlag(state.worldFlags, 'joinedClub')) return false;
            const { month, year } = getSchoolMonth(state.month);
            // 12月，大二及以上，30%概率刷出
            return month === 12 && year >= 2 && Math.random() < 0.3;
        },
        choices: [
            {
                id: 'participate',
                label: '争抢名额',
                effects: {
                    sanDelta: -15,
                    specialAction: 'START_CONTEST'
                },
                contestConfig: {
                    name: '12月区域赛',
                    problemCount: [10, 13],
                    durationMinutes: 300,
                    difficulties: [3, 5, 7, 8, 10, 12, 13, 15, 18, 20, 22, 25, 28],
                    isRated: true,
                    ratingSource: 'regional'
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
        title: '1月期末考试',
        description: '寒假前的期末考试周...',
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
    // 随机校赛/新生赛事件
    {
        id: 'random_school_contest',
        title: '校内编程比赛',
        description: '学校举办了一场编程竞赛，难度和形式都是随机的，是否参加？',
        mandatory: false,
        conditions: (state) => {
            // 20%概率刷出，任意月份
            return Math.random() < 0.2;
        },
        choices: [
            {
                id: 'participate',
                label: '参加比赛',
                effects: (state) => ({
                    specialAction: 'START_CONTEST',
                    sanDelta: -5
                }),
                // 动态生成比赛配置
                contestConfig: () => {
                    const isTeam = Math.random() < 0.5;
                    const difficultyLevel = Math.floor(Math.random() * 3); // 0=简单, 1=中等, 2=困难
                    const problemCounts = [[3, 5], [5, 7], [7, 9]];
                    const difficultyDistributions = [
                        [1, 2, 3, 4, 5], // 简单
                        [2, 3, 5, 7, 8], // 中等
                        [3, 5, 8, 10, 12, 15] // 困难
                    ];
                    
                    return {
                        name: isTeam ? '校内团队赛' : '校内个人赛',
                        problemCount: problemCounts[difficultyLevel],
                        durationMinutes: isTeam ? 180 : 120,
                        difficulties: difficultyDistributions[difficultyLevel],
                        isRated: false,
                        ratingSource: null
                    };
                },
                setFlags: { participatedSchoolContest: true }
            },
            {
                id: 'skip',
                label: '跳过',
                effects: {
                    sanDelta: 1
                },
                setFlags: { skippedSchoolContest: true }
            }
        ]
    },
    {
        id: 'freshman_contest',
        title: '新生编程赛',
        description: '面向新生的编程竞赛开始报名，这是一个很好的练习机会！',
        mandatory: false,
        conditions: (state) => {
            // 只在大一和大二，15%概率刷出
            const { year } = getSchoolMonth(state.month);
            return (year === 1 || year === 2) && Math.random() < 0.15;
        },
        choices: [
            {
                id: 'participate',
                label: '参加新生赛',
                effects: (state) => ({
                    specialAction: 'START_CONTEST',
                    sanDelta: -3
                }),
                contestConfig: () => {
                    // 新生赛通常是个人赛，难度较低
                    return {
                        name: '新生编程赛',
                        problemCount: [4, 6],
                        durationMinutes: 120,
                        difficulties: [1, 2, 2, 3, 4, 5],
                        isRated: false,
                        ratingSource: null
                    };
                },
                setFlags: { participatedFreshmanContest: true }
            },
            {
                id: 'skip',
                label: '跳过',
                effects: {
                    sanDelta: 1
                },
                setFlags: { skippedFreshmanContest: true }
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
        const ok = ev.conditions ? ev.conditions({ ...state, worldFlags: flags, month }) : true;
        return inWindow && ok;
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

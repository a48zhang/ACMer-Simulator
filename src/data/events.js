// 事件系统数据定义
// Event system data definitions

// 条件匹配工具
const hasFlag = (flags, key) => !!(flags && flags[key]);
const getFlag = (flags, key, def = 0) => (flags && typeof flags[key] === 'number' ? flags[key] : def);

// 将绝对月份转换为学年月份（从大一9月开始）
const getSchoolMonth = (absoluteMonth) => {
    const START_MONTH = 9;
    const monthsPassed = absoluteMonth - START_MONTH;
    const year = Math.floor(monthsPassed / 12) + 1;
    const month = (monthsPassed % 12) + 1;
    return { year, month };
};

// 检查是否为指定的学年月份
const isSchoolMonth = (absoluteMonth, targetMonth) => {
    const { month } = getSchoolMonth(absoluteMonth);
    return month === targetMonth;
};

// 事件库（可扩展）
export const EVENTS = [
    {
        id: 'club_intro',
        title: 'ACM社团招新',
        description: 'ACM算法社团正在招新，是否加入？',
        mandatory: true,
        monthConstraints: { start: 9, end: 10 }, // 9-10月（大一开学）
        conditions: (state) => !hasFlag(state.worldFlags, 'joinedClub'),
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
        description: '邀请赛开始报名，是否参加？如果参加，需要提前选择队友。',
        mandatory: true,
        conditions: (state) => {
            const { month } = getSchoolMonth(state.month);
            return month === 7; // 3月对应第7个月（9,10,11,12,1,2,3）
        },
        choices: [
            {
                id: 'participate',
                label: '参加',
                effects: {
                    sanDelta: -5
                },
                setFlags: { marchInvitationalParticipating: true },
                requiresTeamSelection: true
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
            return month === 8; // 4月对应第8个月
        },
        choices: [
            {
                id: 'participate',
                label: '参加',
                effects: {
                    sanDelta: -10
                },
                setFlags: { aprilProvincialParticipating: true },
                requiresTeamSelection: true
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
            return month === 9; // 5月对应第9个月
        },
        choices: [
            {
                id: 'participate',
                label: '参加',
                effects: {
                    sanDelta: -5
                },
                setFlags: { mayInvitationalParticipating: true },
                requiresTeamSelection: true
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
        description: '期末考试周到了，进行学业审核...',
        mandatory: true,
        conditions: (state) => {
            const { month } = getSchoolMonth(state.month);
            return month === 10; // 6月对应第10个月
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
            return month === 11; // 7月对应第11个月
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
            const { month } = getSchoolMonth(state.month);
            return month === 1 && getSchoolMonth(state.month).year > 1; // 9月（第1个月），但不是大一9月
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
        conditions: (state) => {
            const { month, year } = getSchoolMonth(state.month);
            // 10月（第2个月），大二及以上，30%概率刷出
            return month === 2 && year >= 2 && Math.random() < 0.3;
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
        conditions: (state) => {
            const { month, year } = getSchoolMonth(state.month);
            // 11月（第3个月），大二及以上，30%概率刷出
            return month === 3 && year >= 2 && Math.random() < 0.3;
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
        conditions: (state) => {
            const { month, year } = getSchoolMonth(state.month);
            // 12月（第4个月），大二及以上，30%概率刷出
            return month === 4 && year >= 2 && Math.random() < 0.3;
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
        description: '寒假前的期末考试周，再次进行学业审核...',
        mandatory: true,
        conditions: (state) => {
            const { month } = getSchoolMonth(state.month);
            return month === 5; // 1月对应第5个月
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

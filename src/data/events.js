// 事件系统数据定义
// Event system data definitions

// 条件匹配工具
const hasFlag = (flags, key) => !!(flags && flags[key]);
const getFlag = (flags, key, def = 0) => (flags && typeof flags[key] === 'number' ? flags[key] : def);

// 事件库（可扩展）
export const EVENTS = [
    {
        id: 'club_intro',
        title: 'ACM社团招新',
        description: 'ACM算法社团正在招新，是否加入？',
        mandatory: true,
        monthConstraints: { start: 1, end: 2 },
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

// 活动系统数据定义
// Activity system data definitions

const ATTRIBUTE_MULTIPLIERS = {
    // 通用属性
    CODING: 10,
    ALGORITHM: 12,
    SPEED: 8,
    STRESS: 6,
    TEAMWORK: 7,
    ENGLISH: 5,
    // 专业属性
    MATH: 15,
    DP: 13,
    GRAPH: 13,
    DATA_STRUCTURE: 13,
    STRING: 12,
    SEARCH: 12,
    GREEDY: 11,
    GEOMETRY: 14
};

const SUCCESS_RATE_DIVISOR = 40;

const participateInContest = (attributes) => {
    const baseScore = 100;
    // 通用属性
    const codingBonus = attributes.coding * ATTRIBUTE_MULTIPLIERS.CODING;
    const algorithmBonus = attributes.algorithm * ATTRIBUTE_MULTIPLIERS.ALGORITHM;
    const speedBonus = attributes.speed * ATTRIBUTE_MULTIPLIERS.SPEED;
    const stressBonus = attributes.stress * ATTRIBUTE_MULTIPLIERS.STRESS;
    const teamworkBonus = attributes.teamwork * ATTRIBUTE_MULTIPLIERS.TEAMWORK;
    const englishBonus = attributes.english * ATTRIBUTE_MULTIPLIERS.ENGLISH;
    // 专业属性
    const mathBonus = attributes.math * ATTRIBUTE_MULTIPLIERS.MATH;
    const dpBonus = attributes.dp * ATTRIBUTE_MULTIPLIERS.DP;
    const graphBonus = attributes.graph * ATTRIBUTE_MULTIPLIERS.GRAPH;
    const dataStructureBonus = attributes.dataStructure * ATTRIBUTE_MULTIPLIERS.DATA_STRUCTURE;
    const stringBonus = attributes.string * ATTRIBUTE_MULTIPLIERS.STRING;
    const searchBonus = attributes.search * ATTRIBUTE_MULTIPLIERS.SEARCH;
    const greedyBonus = attributes.greedy * ATTRIBUTE_MULTIPLIERS.GREEDY;
    const geometryBonus = attributes.geometry * ATTRIBUTE_MULTIPLIERS.GEOMETRY;

    return baseScore + codingBonus + algorithmBonus +
        speedBonus + stressBonus + teamworkBonus + englishBonus +
        mathBonus + dpBonus + graphBonus + dataStructureBonus +
        stringBonus + searchBonus + greedyBonus + geometryBonus +
        Math.floor(Math.random() * 50);
};

const solveProblem = (attributes) => {
    const successRate = (attributes.coding + attributes.algorithm +
        attributes.math + attributes.dp + attributes.graph + attributes.dataStructure +
        attributes.string + attributes.search + attributes.greedy + attributes.geometry) / SUCCESS_RATE_DIVISOR;
    return Math.random() < successRate;
};

export const ACTIVITIES = [
    {
        id: 'practice',
        name: '刷题',
        cost: 20,
        description: '进行日常刷题训练，提升解题能力',
        effects: (state) => {
            const attempts = Math.floor(Math.random() * 5) + 8;
            const specialSkills = ['math', 'dp', 'graph', 'dataStructure', 'string', 'search', 'greedy', 'geometry'];
            const skillNames = {
                math: '数学', dp: '动态规划', graph: '图论', dataStructure: '数据结构',
                string: '字符串', search: '搜索', greedy: '贪心', geometry: '计算几何',
                algorithm: '思维', coding: '代码'
            };

            // 先判定是否触发全局事件
            const globalRand = Math.random();

            // 10% 概率触发特殊负面事件（影响整个刷题活动）
            if (globalRand < 0.1) {
                const negativeEvents = [
                    { log: '💥 洛谷挂了，刷题失败。+0', type: 'error' },
                    { log: '😵 题目太难，心态崩了。+0', type: 'error' }
                ];
                const event = negativeEvents[Math.floor(Math.random() * negativeEvents.length)];
                return {
                    playerProblems: state.playerProblems,
                    log: event.log,
                    logType: event.type,
                    attributeChanges: {}
                };
            }

            // 8% 概率触发"顿悟"事件
            if (globalRand < 0.18) {
                let solved = 0;
                for (let i = 0; i < attempts; i++) {
                    if (solveProblem(state.attributes)) {
                        solved++;
                    }
                }

                const mainSkill = specialSkills[Math.floor(Math.random() * specialSkills.length)];
                const generalSkills = ['algorithm', 'coding'];
                const generalSkill = generalSkills[Math.floor(Math.random() * generalSkills.length)];

                return {
                    playerProblems: state.playerProblems + solved,
                    attributeChanges: {
                        [mainSkill]: 2,
                        [generalSkill]: 2
                    },
                    log: `✨ 顿悟！解决了 ${solved}/${attempts} 道题！${skillNames[mainSkill]}+2，${skillNames[generalSkill]}+2！`,
                    logType: 'success'
                };
            }

            // 正常刷题：每道题独立判定属性提升
            let solved = 0;
            const attributeGains = {};
            const SKILL_GAIN_PROBABILITY = 0.15; // 15%概率提升

            for (let i = 0; i < attempts; i++) {
                if (solveProblem(state.attributes)) {
                    solved++;

                    // 每做对一道题，有15%概率提升一个随机专业属性
                    if (Math.random() < SKILL_GAIN_PROBABILITY) {
                        const skill = specialSkills[Math.floor(Math.random() * specialSkills.length)];
                        attributeGains[skill] = (attributeGains[skill] || 0) + 1;
                    }
                }
            }

            // 构建日志信息
            let logMessage = `📚 刷题训练完成！解决了 ${solved}/${attempts} 道题！`;
            if (Object.keys(attributeGains).length > 0) {
                const gainDetails = Object.entries(attributeGains)
                    .map(([skill, gain]) => `${skillNames[skill]}+${gain}`)
                    .join('，');
                logMessage += gainDetails;
            }

            return {
                playerProblems: state.playerProblems + solved,
                attributeChanges: attributeGains,
                log: logMessage,
                logType: 'success'
            };
        },
        repeatable: true
    },
    {
        id: 'cf_contest',
        name: 'Codeforces比赛',
        cost: 10,
        description: '参加一场Codeforces Div.2比赛',
        contestConfig: {
            name: 'Codeforces Div.2',
            problemCount: [7, 8],
            durationMinutes: 120,
            difficulties: [1, 2, 3, 5, 8, 10, 15, 15],
            isRated: true,
            ratingSource: 'cf'
        },
        effects: () => ({
            specialAction: 'START_CONTEST',
            log: '🏁 准备开始Codeforces Div.2比赛...',
            logType: 'info'
        }),
        repeatable: true
    },
    {
        id: 'rest',
        name: '休息',
        cost: 3,
        description: '放松休息，恢复状态',
        effects: () => ({
            log: '😌 休息了一段时间，精神状态恢复！',
            logType: 'info'
        }),
        repeatable: true
    },
    {
        id: 'goto_lecture',
        name: '上课',
        cost: 10,
        description: '猛猛学',
        effects: (state) => ({
            sanDelta: -5,
            gpaDelta: 0.03,
            log: '📚 认真上课，GPA+0.03',
            logType: 'info',
            setFlags: { attendedClassThisMonth: true }
        }),
        repeatable: true
    },
    {
        id: 'part_time_job',
        name: '兼职送外卖',
        cost: 5,
        description: '辛苦打工换取生活费和额外资金。',
        effects: () => ({
            balanceDelta: 400,
            sanDelta: -10,
            log: '🍱 兼职赚到了一些钱。',
            logType: 'warning'
        }),
        repeatable: true
    },
    {
        id: 'gym_session',
        name: '健身恢复',
        cost: 10,
        description: '跑步/瑜伽/举铁，恢复体能和精力。',
        effects: () => ({
            attributeChanges: { stress: 1 },
            sanDelta: 3,
            log: '💪 健身让精神和速度都恢复了。',
            logType: 'success'
        }),
        repeatable: true
    }
];

export { participateInContest, solveProblem };

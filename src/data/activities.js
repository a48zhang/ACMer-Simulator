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
        cost: 5,
        description: '进行日常刷题训练，提升解题能力',
        effects: (state) => {
            const attempts = Math.floor(Math.random() * 5) + 8;
            let solved = 0;
            let scoreGain = 0;
            for (let i = 0; i < attempts; i++) {
                if (solveProblem(state.attributes)) {
                    solved++;
                    scoreGain += 5;
                }
            }
            return {
                playerProblems: state.playerProblems + solved,
                playerScore: state.playerScore + scoreGain,
                log: `📚 刷题训练完成！解决了 ${solved}/${attempts} 道题，获得 ${scoreGain} 分！`,
                logType: 'success'
            };
        },
        repeatable: true
    },
    {
        id: 'mock_contest',
        name: 'Codeforces比赛',
        cost: 5,
        description: '参加比赛，全面锻炼比赛能力',
        effects: (state) => {
            const contestScore = participateInContest(state.attributes);
            return {
                playerContests: state.playerContests + 1,
                playerScore: state.playerScore + contestScore,
                log: `🏆 参加了一场模拟赛！获得 ${contestScore} 分！`,
                logType: 'success'
            };
        },
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
            log: '',
            logType: 'info'
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

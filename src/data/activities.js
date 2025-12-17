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
        id: 'algorithm_training',
        name: '算法训练',
        cost: 8,
        description: '进行专项算法训练，提升算法能力',
        effects: (state) => {
            const scoreGain = Math.floor(Math.random() * 30) + 20;
            return {
                playerScore: state.playerScore + scoreGain,
                log: `🧮 算法训练完成！获得 ${scoreGain} 分提升！`,
                logType: 'success'
            };
        },
        repeatable: true
    },
    {
        id: 'mock_contest',
        name: '模拟赛',
        cost: 12,
        description: '参加模拟比赛，全面锻炼比赛能力',
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
        id: 'study_group',
        name: '学习小组',
        cost: 6,
        description: '和小伙伴一起攻克题目，提升协作与算法直觉。',
        effects: (state) => ({
            attributeChanges: { teamwork: 1, algorithm: 1 },
            playerProblems: state.playerProblems + 1,
            playerScore: state.playerScore + 10,
            log: '🤝 学习小组合作愉快，算法与协作都有所提升！',
            logType: 'success'
        }),
        repeatable: true
    },
    {
        id: 'mentor_session',
        name: '导师答疑',
        cost: 7,
        description: '拜访导师答疑，获得实战建议与心里鼓励。',
        effects: (state) => ({
            gpaDelta: 0.02,
            ratingDelta: 8,
            playerScore: state.playerScore + 12,
            sanDelta: 3,
            log: '🔍 导师指点让思路更清晰，收获了实用技巧。',
            logType: 'success'
        }),
        repeatable: true
    },
    {
        id: 'hackathon_sprint',
        name: 'Hackathon 冲刺',
        cost: 10,
        description: '通宵完成项目，短时间爆发输出。',
        effects: (state) => ({
            attributeChanges: { coding: 2, speed: 1 },
            sanDelta: -5,
            playerScore: state.playerScore + 25,
            log: '⚡️ 一场冲刺过后，代码量爆表但精神略显疲惫。',
            logType: 'info'
        }),
        repeatable: true
    },
    {
        id: 'theory_seminar',
        name: '理论讲座',
        cost: 5,
        description: '听取大牛讲解深入原理，夯实基础。',
        effects: (state) => ({
            attributeChanges: { math: 1, geometry: 1 },
            gpaDelta: 0.01,
            playerScore: state.playerScore + 6,
            log: '📚 理论讲座拓宽视野，数学能力更扎实。',
            logType: 'success'
        }),
        repeatable: true
    },
    {
        id: 'club_project',
        name: '社团项目',
        cost: 5,
        description: '承担项目协调，锻炼沟通并赢得额外行动点。',
        effects: (state) => ({
            attributeChanges: { teamwork: 2, english: 1 },
            apBonus: 3,
            playerScore: state.playerScore + 5,
            log: '🎨 社团项目协调顺利，获得了额外行动点。',
            logType: 'success'
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
            sanDelta: -4,
            log: '🍱 兼职赚到了一些钱，但精神有点吃力。',
            logType: 'warning'
        }),
        repeatable: true
    },
    {
        id: 'volunteer',
        name: '志愿服务',
        cost: 4,
        description: '参与志愿活动，积累人际与抗压经验。',
        effects: (state) => ({
            attributeChanges: { teamwork: 1, stress: 1 },
            sanDelta: 2,
            playerScore: state.playerScore + 4,
            log: '🤗 参与志愿服务，收获正能量与协作提升。',
            logType: 'success'
        }),
        repeatable: true
    },
    {
        id: 'code_review_night',
        name: '复盘之夜',
        cost: 6,
        description: '通宵复盘、互评代码，找出潜在问题。',
        effects: (state) => ({
            attributeChanges: { algorithm: 1, coding: 1 },
            sanDelta: -3,
            playerScore: state.playerScore + 12,
            log: '📝 复盘之夜让思路更清晰，略感疲惫但收获满满。',
            logType: 'info'
        }),
        repeatable: true
    },
    {
        id: 'gym_session',
        name: '健身恢复',
        cost: 3,
        description: '跑步/瑜伽/举铁，恢复体能和精力。',
        effects: () => ({
            attributeChanges: { speed: 1, stress: 1 },
            sanDelta: 3,
            log: '💪 健身让精神和速度都恢复了。',
            logType: 'success'
        }),
        repeatable: true
    },
    {
        id: 'research_challenge',
        name: '科研挑战',
        cost: 9,
        description: '参与小型科研项目，挑战思维边界。',
        effects: (state) => ({
            attributeChanges: { math: 1, dp: 1, graph: 1 },
            ratingDelta: 12,
            playerScore: state.playerScore + 20,
            playerProblems: state.playerProblems + 2,
            gpaDelta: 0.02,
            log: '🧪 科研挑战提高了技术深度，也获得了研究经历。',
            logType: 'success'
        }),
        repeatable: true
    }
];

export { participateInContest, solveProblem };

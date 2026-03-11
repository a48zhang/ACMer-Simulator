// 活动系统数据定义
// Activity system data definitions

import { SKILL_CONFIG } from '../config/gameBalance';
import type { Activity, Attributes, GameState, ActivityResult } from '../types';

const ATTRIBUTE_MULTIPLIERS: Record<string, number> = {
    // 通用属性
    CODING: 10,
    ALGORITHM: 12,
    SPEED: 8,
    STRESS: 6,
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

export const participateInContest = (attributes: Attributes): number => {
    const baseScore = 100;
    // 通用属性
    const codingBonus = attributes.coding * ATTRIBUTE_MULTIPLIERS.CODING;
    const algorithmBonus = attributes.algorithm * ATTRIBUTE_MULTIPLIERS.ALGORITHM;
    const speedBonus = attributes.speed * ATTRIBUTE_MULTIPLIERS.SPEED;
    const stressBonus = attributes.stress * ATTRIBUTE_MULTIPLIERS.STRESS;
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
        speedBonus + stressBonus +
        mathBonus + dpBonus + graphBonus + dataStructureBonus +
        stringBonus + searchBonus + greedyBonus + geometryBonus +
        Math.floor(Math.random() * 50);
};

export const solveProblem = (attributes: Attributes): boolean => {
    const successRate = (attributes.coding + attributes.algorithm +
        attributes.math + attributes.dp + attributes.graph + attributes.dataStructure +
        attributes.string + attributes.search + attributes.greedy + attributes.geometry) / SUCCESS_RATE_DIVISOR;
    return Math.random() < successRate;
};

export const ACTIVITIES: Activity[] = [
    {
        id: 'practice',
        name: '刷题',
        cost: 12,
        description: '进行日常刷题训练，提升解题能力',
        effects: (state: GameState): ActivityResult => {
            const attempts = Math.floor(Math.random() * 5) + 8;
            const specialSkills: (keyof Attributes)[] = ['math', 'dp', 'graph', 'dataStructure', 'string', 'search', 'greedy', 'geometry'];
            const skillNames: Partial<Record<keyof Attributes, string>> = {
                math: '数学', dp: '动态规划', graph: '图论', dataStructure: '数据结构',
                string: '字符串', search: '搜索', greedy: '贪心', geometry: '计算几何',
                algorithm: '思维', coding: '代码'
            };

            // 先判定是否触发全局事件
            const globalRand = Math.random();

            // 10% 概率触发特殊负面事件（影响整个刷题活动）
            if (globalRand < 0.1) {
                const negativeEvents = [
                    { log: '💥 洛谷挂了，刷题失败。+0', type: 'error' as const },
                    { log: '😵 题目太难，心态崩了。+0', type: 'error' as const }
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
                const generalSkills: (keyof Attributes)[] = ['algorithm', 'coding'];
                const generalSkill = generalSkills[Math.floor(Math.random() * generalSkills.length)];

                return {
                    playerProblems: state.playerProblems + solved,
                    attributeChanges: {
                        [mainSkill]: 2,
                        [generalSkill]: 2
                    } as Partial<Attributes>,
                    log: `✨ 顿悟！解决了 ${solved}/${attempts} 道题！${skillNames[mainSkill]}+2，${skillNames[generalSkill]}+2！`,
                    logType: 'success'
                };
            }

            // 正常刷题：每道题独立判定属性提升
            let solved = 0;
            const attributeGains: Partial<Attributes> = {};
            const SKILL_GAIN_PROBABILITY = SKILL_CONFIG.GAIN_PROBABILITY; // 15%概率提升

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
                    .map(([skill, gain]) => `${skillNames[skill as keyof Attributes]}+${gain}`)
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
        id: 'practice_contest',
        name: '参加练习赛',
        cost: 0,
        description: '打开练习赛列表，按所选赛事消耗 AP',
        effects: (): ActivityResult => ({
            specialAction: 'OPEN_PRACTICE_CONTEST_DIALOG',
            log: '🏁 准备参加练习赛...',
            logType: 'info'
        }),
        repeatable: true
    },
    {
        id: 'rest',
        name: '休息',
        cost: 3,
        description: '放松休息，恢复状态',
        effects: (): ActivityResult => ({
            sanDelta: 15,
            log: '😌 休息了一段时间，SAN值+15！',
            logType: 'info'
        }),
        repeatable: true
    },
    {
        id: 'goto_lecture',
        name: '上课',
        cost: 10,
        description: '猛猛学',
        effects: (): ActivityResult => ({
            sanDelta: -5,
            gpaDelta: 0.1,
            log: '📚 认真上课，GPA+0.1',
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
        effects: (): ActivityResult => ({
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
        effects: (): ActivityResult => ({
            attributeChanges: { stress: 1 },
            sanDelta: 3,
            log: '💪 健身让精神和速度都恢复了。',
            logType: 'success'
        }),
        repeatable: true
    }
];

// 比赛系统数据与工具
// Contest system utilities

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 所有可能的属性类型
const SKILL_TYPES = {
    general: ['algorithm', 'coding', 'speed', 'stress'],
    specialized: ['math', 'dp', 'graph', 'dataStructure', 'string', 'search', 'greedy', 'geometry']
};

// 根据难度生成题目
const generateProblem = (difficulty) => {
    // difficulty: 1-10
    // 难度越高，要求的属性值越高，涉及的属性越多

    const baseRequirement = Math.max(1, Math.floor(difficulty * 0.7));
    const trickiness = 0.05 + (difficulty - 1) * 0.05; // 0.05 - 0.5

    const requires = {};

    // 基础属性：algorithm 和 coding 总是需要
    requires.algorithm = baseRequirement + Math.floor(Math.random() * 2);
    requires.coding = baseRequirement + Math.floor(Math.random() * 2);

    // 根据难度添加通用属性
    if (difficulty >= 3) {
        const generalSkills = [...SKILL_TYPES.general.filter(s => s !== 'algorithm')];
        const numGeneral = Math.min(2, Math.floor(difficulty / 3));
        for (let i = 0; i < numGeneral; i++) {
            if (generalSkills.length === 0) break;
            const idx = Math.floor(Math.random() * generalSkills.length);
            const skill = generalSkills.splice(idx, 1)[0];
            requires[skill] = Math.max(2, baseRequirement + Math.floor(Math.random() * 2) - 1);
        }
    }

    // 根据难度添加专业属性
    const numSpecialized = Math.min(3, Math.floor((difficulty - 1) / 2));
    const specializedSkills = [...SKILL_TYPES.specialized];
    for (let i = 0; i < numSpecialized; i++) {
        if (specializedSkills.length === 0) break;
        const idx = Math.floor(Math.random() * specializedSkills.length);
        const skill = specializedSkills.splice(idx, 1)[0];
        requires[skill] = Math.max(2, baseRequirement + Math.floor(Math.random() * 3));
    }

    return {
        id: `problem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        difficulty,
        requires,
        trickiness,
        status: 'pending',
        attempts: 0
    };
};

export const createContestSession = (config) => {
    // 配置参数：
    // - problemCount: 题目数量或范围 [min, max]
    // - durationMinutes: 比赛时长（分钟）
    // - difficulties: 难度分布数组，或自动生成
    // - name: 比赛名称（可选）

    if (!config) {
        throw new Error('Contest config is required');
    }

    const durationMinutes = config.durationMinutes;

    // 确定题目数量
    let problemCount;
    if (Array.isArray(config.problemCount)) {
        const [min, max] = config.problemCount;
        problemCount = min + Math.floor(Math.random() * (max - min + 1));
    } else {
        problemCount = config.problemCount;
    }

    // 生成或使用配置的难度分布
    let difficulties;
    if (config.difficulties) {
        difficulties = [...config.difficulties];
    } else {
        // 默认难度分布：递增
        difficulties = [];
        for (let i = 0; i < problemCount; i++) {
            difficulties.push(Math.min(10, Math.ceil((i + 1) * 10 / problemCount)));
        }
    }

    // 生成题目
    const problems = difficulties.slice(0, problemCount).map((diff, idx) => {
        const problem = generateProblem(diff);
        return {
            ...problem,
            letter: String.fromCharCode(65 + idx), // A, B, C...
            order: idx + 1
        };
    });

    return {
        id: `contest-${Date.now()}`,
        name: config.name || 'Contest',
        durationMinutes,
        timeRemaining: durationMinutes,
        problems,
        attempts: [],
        startedAt: Date.now(),
        isRated: Boolean(config?.isRated),
        ratingSource: config?.ratingSource || null
    };
};

export const evaluateAttempt = (problem, attributes) => {
    const attrKeys = Object.keys(problem.requires || {});
    const randomFactor = 0.65 + Math.random() * 0.9; // 0.65 - 1.55
    let ratioSum = 0;
    let weakest = null;

    attrKeys.forEach((key) => {
        const playerVal = (attributes?.[key] ?? 0) + 1;
        const reqVal = (problem.requires[key] ?? 0) + 1;
        const ratio = playerVal / reqVal;
        ratioSum += ratio;
        if (!weakest || ratio < weakest.value) {
            weakest = { key, value: ratio };
        }
    });

    const avgRatio = ratioSum / Math.max(attrKeys.length, 1);
    const adjustedRatio = avgRatio * randomFactor * (1 - problem.trickiness * 0.3);
    const success = adjustedRatio >= 1;

    // 时间消耗与难度相关，能力越强耗时越少
    const baseTime = 5 + problem.trickiness * 20;
    const timeMultiplier = Math.max(0.5, 1.2 - avgRatio * 0.3);
    const timeCost = Math.min(30, Math.round(baseTime * timeMultiplier));

    return {
        success,
        timeCost,
        weakestAttr: weakest?.key || null,
        adjustedRatio,
    };
};

export const calculateContestOutcome = (session, timeRemaining, currentRating = 0) => {
    const total = session.problems.length;
    const solved = session.problems.filter((p) => p.status === 'solved').length;
    const attempts = session.attempts.length;
    const timeUsed = Math.max(0, session.durationMinutes - timeRemaining);
    // 依据当前 rating 动态计算期望解题数与分数变化：
    // 低分选手解题多时大幅上分，高分选手达不到期望则掉分。
    const T = total;
    const S = solved;
    const A = attempts;

    // 以 1500 rating 对应做出 3 题为基准，采用逻辑斯蒂函数映射期望解题比例
    const r0 = Math.max(0.05, Math.min(0.95, 3 / Math.max(T, 1)));
    const d = Math.min(r0 - 0.05, 0.95 - r0);
    const rMin = r0 - Math.max(0, d);
    const rMax = r0 + Math.max(0, d);
    const s = 500; // 斜率控制，更大跨度便于满解上探高分
    const sigmoid = (x) => 1 / (1 + Math.exp(-x));
    const expectedRatio = rMin + (rMax - rMin) * sigmoid((currentRating - 1500) / s);
    const expectedSolved = Math.round(T * expectedRatio);

    // 基于表现与当前分的差距计算上/下分强度（不惩罚未通过）
    const eps = 0.001 * (rMax - rMin); // 更接近上限，满解表现更高
    const solveRatio = Math.min(rMax - eps, Math.max(rMin + eps, T > 0 ? S / T : rMin));
    const normalized = (solveRatio - rMin) / Math.max(1e-6, (rMax - rMin));
    const logit = (y) => Math.log(Math.max(1e-6, y) / Math.max(1e-6, (1 - y)));
    let performanceRating = 1500 + s * logit(normalized);
    // 限制表现分范围，满解可逼近 3900
    performanceRating = Math.max(300, Math.min(3900, performanceRating));
    const gap = performanceRating - currentRating;
    const scaleFactor = Math.max(0.06, Math.min(0.25, 0.15 + (1500 - currentRating) / 3500));
    const perfDelta = Math.round(gap * scaleFactor);
    const timeBonus = Math.round((session.durationMinutes > 0 ? (session.durationMinutes - timeUsed) / session.durationMinutes : 0) * Math.min(3, S));

    let ratingDelta = perfDelta + timeBonus;
    // 限制上下限，避免过度波动
    ratingDelta = Math.max(-250, Math.min(1000, ratingDelta));
    if (!session?.isRated || session?.ratingSource !== 'cf') {
        ratingDelta = 0;
        performanceRating = null;
    }

    const sanDelta = S > 0 ? Math.min(10, S * 2) : -5;
    const scoreDelta = S * 10; // 保持积分增长，避免 NaN

    // 根据最弱属性给出改进建议
    const weaknessCount = {};
    session.attempts.forEach((a) => {
        if (a.weakestAttr) {
            weaknessCount[a.weakestAttr] = (weaknessCount[a.weakestAttr] || 0) + 1;
        }
    });
    let weakAttr = null;
    let weakAttrHits = -1;
    Object.entries(weaknessCount).forEach(([key, count]) => {
        if (count > weakAttrHits) {
            weakAttr = key;
            weakAttrHits = count;
        }
    });

    return {
        contestId: session.id,
        total,
        solved,
        attempts,
        ratingDelta,
        scoreDelta,
        sanDelta,
        timeUsed,
        weakAttr,
        performanceRating: performanceRating == null ? null : Math.round(performanceRating),
        isRated: Boolean(session?.isRated),
        ratingSource: session?.ratingSource || null
    };
};



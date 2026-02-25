// 比赛系统数据与工具
// Contest system utilities

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 所有可能的属性类型
const SKILL_TYPES = {
    general: ['algorithm', 'coding', 'speed', 'stress'],
    specialized: ['math', 'dp', 'graph', 'dataStructure', 'string', 'search', 'greedy', 'geometry']
};

// 中文属性名映射
const ATTR_NAMES_CN = {
    algorithm: '算法', coding: '代码', speed: '速度', stress: '抗压',
    teamwork: '团队', english: '英语', math: '数学',
    dp: '动态规划', graph: '图论', dataStructure: '数据结构',
    string: '字符串', search: '搜索', greedy: '贪心', geometry: '计算几何'
};

// 读题阶段：返回读题耗时、揭露的标签、预估成功率
export const readProblem = (problem, attributes) => {
    const readTime = 3 + Math.max(0, problem.difficulty - 2);

    // 从 requires 中提取主要算法标签（取前2个非通用属性，或通用属性）
    const tags = [];
    const attrKeys = Object.keys(problem.requires || {});
    const specializedKeys = attrKeys.filter(k => SKILL_TYPES.specialized.includes(k));
    if (specializedKeys.length > 0) {
        tags.push(...specializedKeys.slice(0, 2));
    } else {
        tags.push(...attrKeys.slice(0, 2));
    }
    const tagsCn = tags.map(k => ATTR_NAMES_CN[k] || k);

    // 计算预估成功率（不包含随机和 trickiness，只看平均属性比）
    let ratioSum = 0;
    attrKeys.forEach(key => {
        const playerVal = (attributes?.[key] ?? 0) + 1;
        const reqVal = (problem.requires[key] ?? 0) + 1;
        ratioSum += playerVal / reqVal;
    });
    const avgRatio = ratioSum / Math.max(1, attrKeys.length);
    let estimatedSuccessRate = Math.round(Math.min(95, Math.max(5, avgRatio * 100)));

    return { readTime, tags: tagsCn, estimatedSuccessRate };
};

// 思考/写代码阶段：返回耗时和加成信息
// 使用阈值机制：每次加成乘以1-2之间的随机小数，点的越多收益越低
export const thinkProblem = (problem, attributes = {}) => {
    const baseTime = 5 + problem.difficulty * 2;
    const speedRatio = (attributes.speed ?? 0) / 10;
    const timeMultiplier = Math.max(0.3, 1.0 - speedRatio * 0.7);
    const thinkTime = Math.max(1, Math.round(baseTime * timeMultiplier));
    
    const bonusMultiplier = 1 + Math.random();
    const bonusIncrease = (0.5 / (problem.thinkBonus + 1)) * bonusMultiplier;
    const newThinkBonus = Math.min(2, problem.thinkBonus + bonusIncrease);
    
    let newTags = null;
    if (problem.revealedInfo && problem.revealedInfo.tags) {
        const currentTags = problem.revealedInfo.tags;
        const attrKeys = Object.keys(problem.requires || {}).filter(k => SKILL_TYPES.specialized.includes(k));
        if (attrKeys.length > currentTags.length && Math.random() < 0.3) {
            const availableTags = attrKeys.filter(k => !currentTags.includes(ATTR_NAMES_CN[k] || k));
            if (availableTags.length > 0) {
                const newTag = ATTR_NAMES_CN[availableTags[Math.floor(Math.random() * availableTags.length)]] || availableTags[0];
                newTags = [...currentTags, newTag].slice(0, 2);
            }
        }
    }
    
    let hasBug = false;
    if (!problem.hasBug && Math.random() < 0.25) {
        hasBug = true;
    }
    
    return { 
        thinkTime, 
        newThinkBonus, 
        newTags,
        hasBug: hasBug ? true : (problem.hasBug || false)
    };
};

// 对拍阶段：返回对拍结果，可能获得额外加成或发现bug
// 对拍不增加思考次数，但可能获得加成
export const debugProblem = (problem, attributes = {}) => {
    const baseTime = 3 + problem.difficulty;
    const speedRatio = (attributes.speed ?? 0) / 10;
    const timeMultiplier = Math.max(0.3, 1.0 - speedRatio * 0.7);
    const debugTime = Math.max(1, Math.round(baseTime * timeMultiplier));
    
    let foundBug = false;
    let bonusIncrease = 0;
    
    if (problem.hasBug && Math.random() < 0.4) {
        foundBug = true;
    } else if (!problem.hasBug && Math.random() < 0.2) {
        const bonusMultiplier = 1 + Math.random();
        bonusIncrease = (0.3 / (problem.debugBonus + 1)) * bonusMultiplier;
    }
    
    return {
        debugTime,
        foundBug,
        bonusIncrease,
        newDebugBonus: problem.debugBonus + 1
    };
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
        status: 'pending', // pending | reading | coding | submitted_fail | solved
        attempts: 0,
        thinkBonus: 0, // 思考加成次数，最多 2 次，每次 +15% 成功率
        debugBonus: 0, // 对拍加成次数
        hasBug: false, // 是否有 bug（对玩家不可见）
        bugFound: false, // bug 是否已被发现
        revealedInfo: null // { tags }
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

    // 打乱题目顺序（除了用户手动配置的比赛外）
    const shuffledProblems = [...problems].sort(() => Math.random() - 0.5).map((p, idx) => ({
        ...p,
        letter: String.fromCharCode(65 + idx)
    }));

    return {
        id: `contest-${Date.now()}`,
        name: config.name || 'Contest',
        durationMinutes,
        timeRemaining: durationMinutes,
        problems: shuffledProblems,
        attempts: [],
        startedAt: Date.now(),
        isRated: Boolean(config?.isRated),
        ratingSource: config?.ratingSource || null
    };
};

export const evaluateAttempt = (problem, attributes, thinkBonus = 0, debugBonus = 0) => {
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
    // 思考加成：每一层 +15% 成功率（现在是小数累积）
    const thinkBonusMultiplier = 1 + thinkBonus * 0.15;
    // 对拍加成：额外 +10% 成功率
    const debugBonusMultiplier = 1 + debugBonus * 0.1;
    // Bug 惩罚：如果有 bug 未发现，-30% 成功率
    const bugPenalty = (problem.hasBug && !problem.bugFound) ? 0.7 : 1.0;
    
    const adjustedRatio = avgRatio * randomFactor * (1 - problem.trickiness * 0.3) * thinkBonusMultiplier * debugBonusMultiplier * bugPenalty;
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



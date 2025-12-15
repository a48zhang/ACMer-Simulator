// 特性系统数据定义
// Trait system data definitions

export const INITIAL_TRAIT_POINTS = 10;

// 特性类型
export const TRAIT_TYPES = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative'
};

// 特性列表
export const TRAITS = [
  // ========== 正面特性 (Positive Traits) ==========
  {
    id: 'trait_noip_1',
    name: '高中NOIP一等奖',
    type: TRAIT_TYPES.POSITIVE,
    cost: 10,
    description: '你曾是信息学奥赛选手。所有专业属性+2，额外随机分配10点属性。',
    effects: {
      // 固定属性加成
      initialStats: {
        math: 2,
        dp: 2,
        graph: 2,
        dataStructure: 2,
        string: 2,
        search: 2,
        greedy: 2,
        geometry: 2
      },
      // 额外随机分配的属性点
      randomBonus: 10
    }
  },
  {
    id: 'trait_english_master',
    name: '英语专八',
    type: TRAIT_TYPES.POSITIVE,
    cost: 5,
    description: 'English能力直接拉满，读题再也不怕了！',
    effects: {
      initialStats: {
        english: 10
      }
    }
  },
  {
    id: 'trait_math_genius',
    name: '数学天才',
    type: TRAIT_TYPES.POSITIVE,
    cost: 8,
    description: '数学和几何能力大幅提升，数学建模不在话下。',
    effects: {
      initialStats: {
        math: 4,
        geometry: 4
      }
    }
  },
  {
    id: 'trait_speed_coder',
    name: '键盘侠',
    type: TRAIT_TYPES.POSITIVE,
    cost: 6,
    description: '编程和速度属性提升，手速超快！',
    effects: {
      initialStats: {
        coding: 3,
        speed: 3
      }
    }
  },
  {
    id: 'trait_team_player',
    name: '团队之星',
    type: TRAIT_TYPES.POSITIVE,
    cost: 4,
    description: '团队协作能力优秀，是队伍的好伙伴。',
    effects: {
      initialStats: {
        teamwork: 4
      }
    }
  },
  {
    id: 'trait_algorithm_expert',
    name: '算法高手',
    type: TRAIT_TYPES.POSITIVE,
    cost: 7,
    description: '算法思维出众，图论和DP能力提升。',
    effects: {
      initialStats: {
        algorithm: 3,
        graph: 2,
        dp: 2
      }
    }
  },

  // ========== 负面特性 (Negative Traits) ==========
  {
    id: 'trait_stress',
    name: '精神压抑',
    type: TRAIT_TYPES.NEGATIVE,
    cost: -5,
    description: 'SAN值上限降低，抗压能力减弱。',
    effects: {
      initialStats: {
        stress: -3
      },
      sanPenalty: 20 // SAN值初始值降低20
    }
  },
  {
    id: 'trait_lone_wolf',
    name: '独狼',
    type: TRAIT_TYPES.NEGATIVE,
    cost: -3,
    description: '不善于团队协作，团队协作能力无法提升。',
    effects: {
      initialStats: {
        teamwork: -5 // 直接降低，实际游戏中可以考虑锁定为0
      }
    }
  },
  {
    id: 'trait_biased',
    name: '偏科',
    type: TRAIT_TYPES.NEGATIVE,
    cost: -4,
    description: '英语能力较弱，理解题目会更困难。',
    effects: {
      initialStats: {
        english: -3
      }
    }
  },
  {
    id: 'trait_slow_learner',
    name: '反应迟钝',
    type: TRAIT_TYPES.NEGATIVE,
    cost: -4,
    description: '速度和算法思维降低。',
    effects: {
      initialStats: {
        speed: -2,
        algorithm: -2
      }
    }
  },
  {
    id: 'trait_weak_foundation',
    name: '基础薄弱',
    type: TRAIT_TYPES.NEGATIVE,
    cost: -6,
    description: '数据结构和编程能力不足。',
    effects: {
      initialStats: {
        coding: -2,
        dataStructure: -3
      }
    }
  }
];

// 应用特性效果到属性
export function applyTraitEffects(selectedTraits, baseAttributes) {
  const result = { ...baseAttributes };
  let totalRandomBonus = 0;
  let sanPenalty = 0;

  // 应用所有选中的特性效果
  selectedTraits.forEach(traitId => {
    const trait = TRAITS.find(t => t.id === traitId);
    if (!trait) return;

    // 应用固定属性加成
    if (trait.effects.initialStats) {
      Object.entries(trait.effects.initialStats).forEach(([attr, value]) => {
        result[attr] = Math.max(0, Math.min(10, (result[attr] || 0) + value));
      });
    }

    // 累计随机加成点数
    if (trait.effects.randomBonus) {
      totalRandomBonus += trait.effects.randomBonus;
    }

    // 累计SAN值惩罚
    if (trait.effects.sanPenalty) {
      sanPenalty += trait.effects.sanPenalty;
    }
  });

  // 随机分配额外属性点
  if (totalRandomBonus > 0) {
    const attributeKeys = Object.keys(result);
    let remainingBonus = totalRandomBonus;
    let attempts = 0;
    const maxAttempts = totalRandomBonus * 100; // Prevent infinite loop
    
    while (remainingBonus > 0 && attempts < maxAttempts) {
      const randomAttr = attributeKeys[Math.floor(Math.random() * attributeKeys.length)];
      if (result[randomAttr] < 10) {
        result[randomAttr] = Math.min(10, result[randomAttr] + 1);
        remainingBonus--;
      }
      attempts++;
    }
  }

  return {
    attributes: result,
    sanPenalty
  };
}

// 计算当前选择的特性总消耗
export function calculateTraitCost(selectedTraits) {
  return selectedTraits.reduce((total, traitId) => {
    const trait = TRAITS.find(t => t.id === traitId);
    return total + (trait ? trait.cost : 0);
  }, 0);
}

// 检查特性选择是否有效（TP >= 0）
export function isTraitSelectionValid(selectedTraits, initialTP = INITIAL_TRAIT_POINTS) {
  const cost = calculateTraitCost(selectedTraits);
  return (initialTP - cost) >= 0;
}

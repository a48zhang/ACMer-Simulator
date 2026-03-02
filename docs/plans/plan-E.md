# 子计划E：TypeScript迁移

## 目标

将JavaScript模块逐步迁移为TypeScript

## 迁移策略

1. 自底向上：先转纯数据/工具模块，再转依赖模块
2. 渐进式：`allowJs: true` 允许JS/TS共存
3. 保持兼容：修改文件扩展名，添加类型，保持逻辑不变

## 实施步骤

### 批次E1：工具与常量

修改文件：
- `src/utils.js` → `src/utils.ts`
- `src/constants.js` → `src/constants.ts`

**src/utils.ts**:

```typescript
import { Attributes, GameState } from './types';
import { MIN_GPA, MAX_GPA, INITIAL_SAN } from './constants';

export const clampValue = (value: number, min: number, max: number): number => 
  Math.max(min, Math.min(max, value));

export const clampGPA = (value: number): number => 
  clampValue(value, MIN_GPA, MAX_GPA);

export const clampSan = (value: number): number =>
  clampValue(value, 0, INITIAL_SAN);

export const randomStarterValue = (): number => 
  Math.floor(Math.random() * 3);

export const createBaseAttributes = (): Attributes => ({
  coding: 0,
  algorithm: randomStarterValue(),
  speed: randomStarterValue(),
  stress: randomStarterValue(),
  math: randomStarterValue(),
  dp: 0,
  graph: 0,
  dataStructure: 0,
  string: 0,
  search: 0,
  greedy: randomStarterValue(),
  geometry: randomStarterValue()
});

export const applyAttributeChanges = (
  current: Attributes, 
  changes: Partial<Attributes> | undefined
): Attributes => {
  if (!changes) return current;
  
  const updated: Attributes = { ...current };
  Object.entries(changes).forEach(([attr, delta]) => {
    const key = attr as keyof Attributes;
    if (updated[key] !== undefined) {
      updated[key] = Math.max(0, updated[key] + (delta || 0));
    }
  });
  
  return updated;
};

export const getFieldValue = <T>(
  effects: Record<string, T | undefined>, 
  prevState: Record<string, T>, 
  field: string, 
  deltaField: string
): T => {
  if (effects[field] !== undefined) return effects[field] as T;
  if (effects[deltaField] !== undefined) {
    const prev = prevState[field];
    const delta = effects[deltaField];
    return (typeof prev === 'number' && typeof delta === 'number') 
      ? (prev + delta) as unknown as T
      : prev;
  }
  return prevState[field];
};
```

### 批次E2：配置模块

新建文件 `src/config/gameBalance.ts`：

```typescript
import { GPAConfig, AcademicConfig, ActivityCosts } from '../types';

export const GPA_CONFIG: GPAConfig = {
  INITIAL: 3.2,
  MIN: 0,
  MAX: 4.0,
  MONTHLY_DEDUCTION: 0.05,
  ATTEND_CLASS_BONUS: 0.10,
  SKIP_CLASS_DEDUCTION: 0.15,
  SKIP_CLASS_PROBABILITY: 0.30,
  HOLIDAY_MONTHS: [2, 7, 8],
};

export const ACADEMIC_CONFIG: AcademicConfig = {
  WARNING_THRESHOLD: 2.5,
  FAILURE_THRESHOLD: 3.0,
  SCHOLARSHIP_THRESHOLD: 3.7,
  WARNINGS_FOR_EXPULSION: 2,
  FAILURES_PER_WARNING: 3,
};

export const ACTIVITY_COSTS: ActivityCosts = {
  PRACTICE: 12,
  PRACTICE_CONTEST: 10,
  REST: 3,
  LECTURE: 10,
  PART_TIME_JOB: 5,
  GYM: 10,
};

export const CONTEST_DIFFICULTIES: Record<string, number[]> = {
  FRESHMAN: [1, 2, 3, 4, 5],
  INVITATIONAL: [1, 2, 3, 4, 5, 5, 6, 7, 7, 8, 9, 10],
  PROVINCIAL: [2, 3, 4, 5, 5, 6, 6, 7, 8, 8, 9, 10, 10],
  REGIONAL: [2, 3, 4, 5, 5, 6, 6, 7, 8, 8, 9, 10, 10],
  SCHOOL: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
};

export const EVENT_CHANCES: Record<string, number> = {
  REGIONAL_STATION: 0.30,
  SCHOOL_CONTEST: 0.30,
  FRESHMAN_CONTEST: 0.40,
};
```

### 批次E3：数据层迁移

依次迁移：
- `src/data/traits.js` → `traits.ts`
- `src/data/activities.js` → `activities.ts`
- `src/data/contests.js` → `contests.ts`
- `src/data/events.js` → `events.ts`

**src/data/traits.ts** 示例：

```typescript
import { Attributes, Trait } from '../types';

export const TRAIT_TYPES = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
} as const;

export const TRAITS: Trait[] = [
  {
    id: 'trait_noip_1',
    name: '高中NOIP一等奖',
    type: 'positive',
    cost: 10,
    description: '你曾是信息学奥赛选手。所有专业属性+5，并额外随机分配5点属性。',
    effects: {
      initialStats: {
        math: 5,
        dp: 5,
        graph: 5,
        dataStructure: 5,
        string: 5,
        search: 5,
        greedy: 5,
        geometry: 5
      },
      randomBonus: 5
    }
  },
  // ...其他特性
];

export const applyTraitEffects = (
  selectedTraits: string[], 
  baseAttributes: Attributes
): { attributes: Attributes; sanPenalty: number; moneyPenalty: number } => {
  const result: Attributes = { ...baseAttributes };
  let totalRandomBonus = 0;
  let sanPenalty = 0;
  let moneyPenalty = 0;

  selectedTraits.forEach(traitId => {
    const trait = TRAITS.find(t => t.id === traitId);
    if (!trait) return;

    if (trait.effects.initialStats) {
      Object.entries(trait.effects.initialStats).forEach(([attr, value]) => {
        const key = attr as keyof Attributes;
        result[key] = Math.max(0, (result[key] || 0) + (value || 0));
      });
    }

    if (trait.effects.randomBonus) {
      totalRandomBonus += trait.effects.randomBonus;
    }
    if (trait.effects.sanPenalty) {
      sanPenalty += trait.effects.sanPenalty;
    }
    if (trait.effects.moneyPenalty) {
      moneyPenalty += trait.effects.moneyPenalty;
    }
  });

  // 随机分配属性点
  if (totalRandomBonus > 0) {
    const attributeKeys = Object.keys(result) as (keyof Attributes)[];
    let remainingBonus = totalRandomBonus;
    let attempts = 0;
    const maxAttempts = totalRandomBonus * 100;

    while (remainingBonus > 0 && attempts < maxAttempts) {
      const randomAttr = attributeKeys[Math.floor(Math.random() * attributeKeys.length)];
      result[randomAttr] = (result[randomAttr] || 0) + 1;
      remainingBonus--;
      attempts++;
    }
  }

  return { attributes: result, sanPenalty, moneyPenalty };
};
```

### 批次E4：游戏逻辑迁移

迁移 `src/gameLogics/` 下所有文件：
- `activity.js` → `activity.ts`
- `event.js` → `event.ts`
- `month.js` → `month.ts`
- `contest.js` → `contest.ts`
- `gameFlow.js` → `gameFlow.ts`
- `log.js` → `log.ts`

### 批次E5：状态管理迁移

迁移：
- `src/gameState.js` → `gameState.ts`

### 批次E6：UI组件迁移

迁移 `src/components/` 下所有 `.jsx` 文件：
- `App.jsx` → `App.tsx`
- `components/**/*.jsx` → `**.tsx`

## 迁移检查清单

每批次完成后检查：

- [ ] `tsc --noEmit` 零错误
- [ ] 运行时行为与迁移前一致
- [ ] 所有导入路径正确
- [ ] 导出的类型正确

## 验收标准

- [ ] 所有模块转为 `.ts` / `.tsx`
- [ ] `tsc --noEmit` 零错误
- [ ] 运行时行为与迁移前一致
- [ ] 游戏运行正常

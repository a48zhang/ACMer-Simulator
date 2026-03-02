# 子计划A：配置提取与清理

## 目标

集中管理游戏平衡参数，清理代码异味

## 实施步骤

### 步骤1：创建配置中心

创建文件 `src/config/gameBalance.js`：

```javascript
// 游戏平衡配置 - 所有数值可在此调整

export const GPA_CONFIG = {
  INITIAL: 3.2,
  MIN: 0,
  MAX: 4.0,
  MONTHLY_DEDUCTION: 0.05,
  ATTEND_CLASS_BONUS: 0.10,
  SKIP_CLASS_DEDUCTION: 0.15,
  SKIP_CLASS_PROBABILITY: 0.30,
  HOLIDAY_MONTHS: [2, 7, 8],
};

export const ACADEMIC_CONFIG = {
  WARNING_THRESHOLD: 2.5,
  FAILURE_THRESHOLD: 3.0,
  SCHOLARSHIP_THRESHOLD: 3.7,
  WARNINGS_FOR_EXPULSION: 2,
  FAILURES_PER_WARNING: 3,
};

export const ACTIVITY_COSTS = {
  PRACTICE: 12,
  PRACTICE_CONTEST: 10,
  REST: 3,
  LECTURE: 10,
  PART_TIME_JOB: 5,
  GYM: 10,
};

export const ACTIVITY_EFFECTS = {
  REST_SAN_RECOVERY: 15,
  LECTURE_SAN_COST: -5,
  PART_TIME_JOB_BALANCE: 400,
  PART_TIME_JOB_SAN: -10,
};

export const CONTEST_DIFFICULTIES = {
  FRESHMAN: [1, 2, 3, 4, 5],
  INVITATIONAL: [1, 2, 3, 4, 5, 5, 6, 7, 7, 8, 9, 10],
  PROVINCIAL: [2, 3, 4, 5, 5, 6, 6, 7, 8, 8, 9, 10, 10],
  REGIONAL: [2, 3, 4, 5, 5, 6, 6, 7, 8, 8, 9, 10, 10],
  SCHOOL: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
};

export const EVENT_CHANCES = {
  REGIONAL_STATION: 0.30,
  SCHOOL_CONTEST: 0.30,
  FRESHMAN_CONTEST: 0.40,
};

export const SKILL_CONFIG = {
  GAIN_PROBABILITY: 0.15,
  RANDOM_BONUS_MAX: 500,
};
```

### 步骤2：替换硬编码值

修改 `src/gameLogics/month.js`：

```javascript
// 修改前
const baseGpaDeduction = 0.05;
if (!attendedClass && Math.random() < 0.3) {
  gpaDeduction += 0.15;
}

// 修改后
import { GPA_CONFIG } from '../config/gameBalance';

const baseGpaDeduction = GPA_CONFIG.MONTHLY_DEDUCTION;
if (!attendedClass && Math.random() < GPA_CONFIG.SKIP_CLASS_PROBABILITY) {
  gpaDeduction += GPA_CONFIG.SKIP_CLASS_DEDUCTION;
}
```

修改 `src/data/activities.js`：

```javascript
// 修改前
const SKILL_GAIN_PROBABILITY = 0.15;

// 修改后
import { SKILL_CONFIG } from '../config/gameBalance';

const SKILL_GAIN_PROBABILITY = SKILL_CONFIG.GAIN_PROBABILITY;
```

修改 `src/data/events.js`：

```javascript
// 修改前
chanceToAppear: 0.3,

// 修改后
import { EVENT_CHANCES } from '../config/gameBalance';

chanceToAppear: EVENT_CHANCES.REGIONAL_STATION,
```

### 步骤3：重命名问题ID

修改 `src/data/traits.js`：

```javascript
// 修改前
id: 'trait_LGBTQ+',

// 修改后
id: 'trait_LGBTQ',
```

### 步骤4：UUID替换

修改 `src/data/contests.js`：

```javascript
// 修改前
id: `problem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

// 修改后
id: `problem_${crypto.randomUUID()}`,
```

修改 `src/gameLogics/event.js`：

```javascript
// 修改前
const resolvedItem = { id: ev.id, choiceId: choice.id, time: Date.now() };

// 修改后
const resolvedItem = { id: ev.id, choiceId: choice.id, time: Date.now(), uuid: crypto.randomUUID() };
```

## 验收标准

- [ ] 所有魔法数字从代码中移除
- [ ] 修改游戏平衡只需改 `config/gameBalance.js`
- [ ] `trait_LGBTQ` ID 不含特殊字符
- [ ] ID生成使用 `crypto.randomUUID()`
- [ ] 所有导入路径正确
- [ ] 游戏运行正常

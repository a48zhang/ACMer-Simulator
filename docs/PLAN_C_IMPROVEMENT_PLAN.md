# Plan C 分支整改计划

## 一、现状分析

### 当前完成度: 50%
- ✅ 测试框架已配置 (vitest, jsdom)
- ✅ 6个测试文件已创建
- ✅ 基础测试用例存在
- ❌ 覆盖率未达80%要求
- ❌ 边界测试缺失
- ❌ 随机测试缺失
- ❌ gameBalance.js与main分支冲突

### 主要问题

| 问题 | 严重度 | 位置 |
|-----|--------|------|
| gameBalance.js冲突 | 🔴 高 | `src/config/gameBalance.js` |
| 测试覆盖率不足 (~40-50%) | 🟡 中 | 所有测试文件 |
| 边界情况测试缺失 | 🟡 中 | 所有测试文件 |
| 随机行为无测试 | 🟡 中 | month.test.js, activity.test.js |
| 测试可能不稳定 | 🟢 低 | traits.test.js |

---

## 二、整改步骤

### 步骤1: 解决gameBalance.js冲突 (高优先级)

**问题**: Plan C创建的`gameBalance.js`与已合并到main的Plan A版本不兼容

**行动**:
1. 基于main分支rebase Plan C分支
2. 删除Plan C中的`src/config/gameBalance.js`
3. 确保测试导入使用main分支的配置

**验证**:
```bash
# 测试导入是否正确
npm test
```

---

### 步骤2: 补充边界情况测试 (高优先级)

#### 2.1 month.test.js 补充

**需要添加的测试**:

```javascript
// 新增测试用例
it('GPA=0时不应继续扣除', () => {
  gameState.gpa = 0;
  const result = advanceMonth(gameState);
  expect(result.newState.gpa).toBe(0);
});

it('GPA=4.0时应该正常扣除', () => {
  gameState.gpa = 4.0;
  const result = advanceMonth(gameState);
  expect(result.newState.gpa).toBeLessThan(4.0);
});

it('SAN=0时行动点应减半', () => {
  gameState.san = 0;
  gameState.monthlyAP = 30;
  const result = advanceMonth(gameState);
  expect(result.newState.remainingAP).toBe(15);
});

it('余额=0时不应为负数', () => {
  gameState.balance = 0;
  const result = advanceMonth(gameState);
  expect(result.newState.balance).toBeGreaterThanOrEqual(0);
});

it('刚到END_MONTH时不应结束', () => {
  gameState.month = END_MONTH - 1;
  const result = advanceMonth(gameState);
  expect(result.newState.isRunning).toBe(true);
});

it('超过END_MONTH时应结束', () => {
  gameState.month = END_MONTH;
  const result = advanceMonth(gameState);
  expect(result.newState.isRunning).toBe(false);
  expect(result.gameOverReason).toBe('graduation');
});
```

#### 2.2 activity.test.js 补充

**需要添加的测试**:

```javascript
it('AP=0时所有活动都应失败', () => {
  gameState.remainingAP = 0;
  const activities = ['practice', 'rest', 'goto_lecture', 'part_time_job', 'gym_session'];
  activities.forEach(activity => {
    const result = executeActivity(gameState, activity);
    expect(result.logs[0]?.type).toBe('error');
  });
});

it('SAN=100时休息不应超过上限', () => {
  gameState.san = 100;
  const result = executeActivity(gameState, 'rest');
  expect(result.newState.san).toBeLessThanOrEqual(100);
});

it('GPA=4.0时上课不应超过上限', () => {
  gameState.gpa = 4.0;
  const result = executeActivity(gameState, 'goto_lecture');
  expect(result.newState.gpa).toBeLessThanOrEqual(4.0);
});

it('无效活动ID应返回错误', () => {
  const result = executeActivity(gameState, 'invalid_activity');
  expect(result.logs.length).toBeGreaterThan(0);
});
```

#### 2.3 utils.test.js 补充

**需要添加的测试**:

```javascript
it('clampValue边界值测试', () => {
  expect(clampValue(0, 0, 10)).toBe(0);
  expect(clampValue(10, 0, 10)).toBe(10);
  expect(clampValue(-0.0001, 0, 10)).toBe(0);
  expect(clampValue(10.0001, 0, 10)).toBe(10);
});

it('clampGPA边界值测试', () => {
  expect(clampGPA(0)).toBe(0);
  expect(clampGPA(4.0)).toBe(4.0);
  expect(clampGPA(-0.1)).toBe(0);
  expect(clampGPA(4.1)).toBe(4.0);
  expect(clampGPA(2.5)).toBe(2.5);
});

it('applyAttributeChanges空变化测试', () => {
  const current = { math: 5, coding: 3 };
  const result = applyAttributeChanges(current, {});
  expect(result).toEqual(current);
});

it('applyAttributeChanges多个变化测试', () => {
  const current = { math: 5, coding: 3, dp: 2 };
  const changes = { math: 2, coding: -1, dp: 3 };
  const result = applyAttributeChanges(current, changes);
  expect(result.math).toBe(7);
  expect(result.coding).toBe(2);
  expect(result.dp).toBe(5);
});
```

---

### 步骤3: 添加随机性测试 (中优先级)

#### 3.1 使用vitest的mock功能

**需要mock的随机函数**:

```javascript
// 在测试文件顶部添加
vi.mock('math', async () => {
  const actual = await vi.importActual('math');
  return {
    ...actual,
    random: vi.fn()
  };
});
```

#### 3.2 month.test.js 随机测试

```javascript
describe('月份推进 - 随机行为测试', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('未上课且random<0.3时应额外扣除GPA', () => {
    Math.random.mockReturnValue(0.29); // 小于0.3
    gameState.worldFlags.attendedClassThisMonth = false;

    const result = advanceMonth(gameState);

    // 检查是否有警告日志
    const warningLog = result.logs.find(l => l.type === 'warning');
    expect(warningLog).toBeDefined();
    expect(warningLog.message).toContain('GPA额外扣除');
  });

  it('未上课且random>=0.3时不应额外扣除GPA', () => {
    Math.random.mockReturnValue(0.31); // 大于等于0.3
    gameState.worldFlags.attendedClassThisMonth = false;

    const result = advanceMonth(gameState);

    // 检查不应有警告日志
    const warningLog = result.logs.find(l => l.type === 'warning');
    expect(warningLog).toBeUndefined();
  });

  it('多次运行验证概率分布', () => {
    // 运行1000次，统计额外扣除的次数
    let extraDeductionCount = 0;
    const runs = 1000;

    for (let i = 0; i < runs; i++) {
      const state = { ...gameState, worldFlags: { attendedClassThisMonth: false } };
      const result = advanceMonth(state);
      if (result.logs.find(l => l.type === 'warning')) {
        extraDeductionCount++;
      }
    }

    // 应该大约30%的概率 (允许10%误差)
    expect(extraDeductionCount).toBeGreaterThan(runs * 0.2);
    expect(extraDeductionCount).toBeLessThan(runs * 0.4);
  });
});
```

#### 3.3 traits.test.js 稳定化

```javascript
// 使用固定seed或mock随机函数
describe('特性系统 - 稳定测试', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // 固定随机值
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('随机属性分配应有可预测结果', () => {
    const baseAttrs = createBaseAttributes();
    const result = applyTraitEffects(['trait_noip_1'], baseAttrs);

    expect(result.attributes.dp).toBe(5);
    // 现在结果应该是可预测的
  });
});
```

---

### 步骤4: 添加contest.test.js补充测试 (中优先级)

```javascript
it('创建0题比赛应处理边界', () => {
  expect(() => {
    createContestSession({
      name: '边界测试',
      problemCount: [0, 0],
      durationMinutes: 180,
      difficulties: [1]
    });
  }).not.toThrow();
});

it('极高难度题目应有较低成功率', () => {
  const problem = {
    requires: { algorithm: 10, coding: 10 },
    trickiness: 0.9,
    hasBug: false,
    bugFound: false
  };
  const attributes = { algorithm: 1, coding: 1, speed: 1 };

  let successCount = 0;
  for (let i = 0; i < 100; i++) {
    const result = evaluateAttempt(problem, attributes, 0.5, 0);
    if (result.success) successCount++;
  }

  // 低属性应该成功率很低
  expect(successCount).toBeLessThan(30);
});

it('全题解出应有正确结果', () => {
  const session = createContestSession({
    name: '测试',
    problemCount: [3, 3],
    durationMinutes: 180,
    difficulties: [1, 2, 3]
  });
  session.problems.forEach(p => p.status = 'solved');
  const outcome = calculateContestOutcome(session, 100, 1500);
  expect(outcome.solved).toBe(3);
  expect(outcome.total).toBe(3);
});

it('零题解出应有正确结果', () => {
  const session = createContestSession({
    name: '测试',
    problemCount: [3, 3],
    durationMinutes: 180,
    difficulties: [1, 2, 3]
  });
  const outcome = calculateContestOutcome(session, 100, 1500);
  expect(outcome.solved).toBe(0);
  expect(outcome.total).toBe(3);
});
```

---

### 步骤5: 添加event.test.js补充测试 (中优先级)

```javascript
it('无效事件ID应返回空结果', () => {
  const result = applyEventChoice(gameState, 'invalid_event', 'any_choice');
  expect(result.logs.length).toBe(0);
});

it('无效选择ID应返回空结果', () => {
  const event = gameState.pendingEvents[0];
  const result = applyEventChoice(gameState, event.id, 'invalid_choice');
  expect(result.logs.length).toBe(0);
});

it('空pendingEvents应正常处理', () => {
  gameState.pendingEvents = [];
  const result = applyEventChoice(gameState, 'any', 'any');
  expect(result.newState).toBe(gameState);
});
```

---

## 三、覆盖率目标

### 3.1 运行覆盖率检查

```bash
# 添加coverage脚本到package.json（如果还没有）
npm test -- --coverage

# 或者运行
npx vitest --coverage
```

### 3.2 覆盖率目标

| 模块 | 目标覆盖率 | 当前估计 |
|------|-----------|---------|
| month.js | 85%+ | ~40% |
| activity.js | 80%+ | ~45% |
| event.js | 75%+ | ~35% |
| contests.js | 70%+ | ~40% |
| traits.js | 60%+ | ~30% |
| utils.js | 90%+ | ~50% |

### 3.3 覆盖率报告

整改完成后，生成HTML报告并检查：
```bash
npm test -- --coverage --reporter=html
# 打开 coverage/index.html 查看详细报告
```

---

## 四、验收标准

- [ ] 基于main分支rebase完成，无gameBalance.js冲突
- [ ] `npm test` 所有测试通过
- [ ] `npm test -- --coverage` 整体覆盖率 ≥ 80%
- [ ] 所有新增边界测试通过
- [ ] 随机测试使用mock，结果稳定
- [ ] traits.test.js不再依赖随机结果
- [ ] 每个函数至少有一个测试
- [ ] 错误路径有测试覆盖
- [ ] 测试描述清晰明确
- [ ] 测试用例独立，不相互依赖

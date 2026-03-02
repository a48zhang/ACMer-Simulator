# 子计划C：测试覆盖

## 目标

为核心逻辑添加单元测试

## 测试框架

使用 **Vitest**

```bash
npm install -D vitest @testing-library/react jsdom
```

更新 `package.json`：

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

创建 `vitest.config.js`：

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '__tests__/']
    }
  }
});
```

## 实施步骤

### 步骤1：活动系统测试

创建 `__tests__/activity.test.js`：

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { executeActivity } from '../src/gameLogics/activity';
import { createInitialGameState } from '../src/gameState';
import { ACTIVITY_COSTS } from '../src/config/gameBalance';

describe('活动系统', () => {
  let gameState;

  beforeEach(() => {
    gameState = {
      ...createInitialGameState(),
      month: 1,
      remainingAP: 30,
      isRunning: true
    };
  });

  it('刷题应消耗AP并可能增加解题数', () => {
    const result = executeActivity(gameState, 'practice');
    expect(result.newState.remainingAP).toBe(gameState.remainingAP - ACTIVITY_COSTS.PRACTICE);
    expect(result.logs.length).toBeGreaterThan(0);
  });

  it('休息应恢复SAN并消耗AP', () => {
    gameState.san = 50;
    const result = executeActivity(gameState, 'rest');
    expect(result.newState.san).toBeGreaterThan(50);
    expect(result.newState.remainingAP).toBe(gameState.remainingAP - ACTIVITY_COSTS.REST);
  });

  it('AP不足时应返回错误日志', () => {
    gameState.remainingAP = 0;
    const result = executeActivity(gameState, 'practice');
    expect(result.logs[0].type).toBe('error');
    expect(result.logs[0].message).toContain('行动点不足');
  });

  it('上课应增加GPA并设置flag', () => {
    gameState.gpa = 3.0;
    const result = executeActivity(gameState, 'goto_lecture');
    expect(result.newState.gpa).toBeGreaterThan(3.0);
    expect(result.newState.worldFlags.attendedClassThisMonth).toBe(true);
  });
});
```

### 步骤2：事件系统测试

创建 `__tests__/event.test.js`：

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { applyEventChoice } from '../src/gameLogics/event';
import { EVENTS } from '../src/data/events';
import { createInitialGameState } from '../src/gameState';

describe('事件系统', () => {
  let gameState;

  beforeEach(() => {
    gameState = {
      ...createInitialGameState(),
      pendingEvents: [...EVENTS],
      month: 1
    };
  });

  it('应能应用事件选择', () => {
    const event = gameState.pendingEvents[0];
    const choice = event.choices[0];
    const result = applyEventChoice(gameState, event.id, choice.id);
    expect(result.logs.length).toBeGreaterThan(0);
  });

  it('加入社团应设置joinedClub标志', () => {
    const event = gameState.pendingEvents.find(e => e.id === 'club_intro');
    if (event) {
      const joinChoice = event.choices.find(c => c.id === 'join');
      const result = applyEventChoice(gameState, event.id, joinChoice.id);
      expect(result.newState.worldFlags.joinedClub).toBe(true);
    }
  });

  it('需要队友选择的事件应返回UI状态', () => {
    const event = gameState.pendingEvents.find(e => e.requiresTeamSelection);
    if (event) {
      const participateChoice = event.choices.find(c => c.id === 'participate');
      const result = applyEventChoice(gameState, event.id, participateChoice.id);
      expect(result.uiState.showTeammateDialog).toBe(true);
    }
  });
});
```

### 步骤3：月份推进测试

创建 `__tests__/month.test.js`：

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { advanceMonth } from '../src/gameLogics/month';
import { createInitialGameState } from '../src/gameState';
import { GPA_CONFIG, END_MONTH } from '../src/constants';

describe('月份推进', () => {
  let gameState;

  beforeEach(() => {
    gameState = {
      ...createInitialGameState(),
      month: 1,
      gpa: 3.2,
      balance: 3000,
      san: 100,
      monthlyAP: 30,
      remainingAP: 30,
      worldFlags: { attendedClassThisMonth: false }
    };
  });

  it('应正确推进月份', () => {
    const result = advanceMonth(gameState);
    expect(result.newState.month).toBe(2);
  });

  it('非假期月份应扣除GPA', () => {
    const result = advanceMonth(gameState);
    expect(result.newState.gpa).toBeLessThan(3.2);
  });

  it('假期月份（2月）不应扣除GPA', () => {
    gameState.month = 5;
    const result = advanceMonth(gameState);
    expect(result.newState.gpa).toBe(3.2);
  });

  it('超过END_MONTH应结束游戏', () => {
    gameState.month = END_MONTH;
    const result = advanceMonth(gameState);
    expect(result.newState.isRunning).toBe(false);
    expect(result.gameOverReason).toBe('graduation');
  });

  it('应更新余额', () => {
    const result = advanceMonth(gameState);
    expect(result.newState.balance).not.toBe(3000);
  });
});
```

### 步骤4：比赛系统测试

创建 `__tests__/contest.test.js`：

```javascript
import { describe, it, expect } from 'vitest';
import { createContestSession, evaluateAttempt, calculateContestOutcome } from '../src/data/contests';

describe('比赛系统', () => {
  it('应能创建比赛', () => {
    const session = createContestSession({
      name: '测试比赛',
      problemCount: [3, 5],
      durationMinutes: 180,
      difficulties: [1, 2, 3]
    });
    expect(session.name).toBe('测试比赛');
    expect(session.problems.length).toBeGreaterThanOrEqual(3);
    expect(session.problems.length).toBeLessThanOrEqual(5);
  });

  it('应能评估解题尝试', () => {
    const problem = {
      requires: { algorithm: 3, coding: 3 },
      trickiness: 0.1,
      hasBug: false,
      bugFound: false
    };
    const attributes = { algorithm: 5, coding: 5, speed: 5 };
    const result = evaluateAttempt(problem, attributes, 0.5, 0);
    expect(typeof result.success).toBe('boolean');
    expect(result.timeCost).toBeGreaterThan(0);
  });

  it('应计算比赛结果', () => {
    const session = createContestSession({
      name: '测试',
      problemCount: [3, 3],
      durationMinutes: 180,
      difficulties: [1, 2, 3]
    });
    session.problems[0].status = 'solved';
    const outcome = calculateContestOutcome(session, 100, 1500);
    expect(outcome.solved).toBe(1);
    expect(outcome.total).toBe(3);
  });
});
```

### 步骤5：特性系统测试

创建 `__tests__/traits.test.js`：

```javascript
import { describe, it, expect } from 'vitest';
import { applyTraitEffects } from '../src/data/traits';
import { createBaseAttributes } from '../src/utils';

describe('特性系统', () => {
  it('应应用特性效果', () => {
    const baseAttrs = createBaseAttributes();
    const result = applyTraitEffects(['trait_math_genius'], baseAttrs);
    expect(result.attributes.math).toBeGreaterThan(baseAttrs.math);
    expect(result.attributes.geometry).toBeGreaterThan(baseAttrs.geometry);
  });

  it('随机属性分配应有效果', () => {
    const baseAttrs = createBaseAttributes();
    const result = applyTraitEffects(['trait_noip_1'], baseAttrs);
    expect(result.attributes.dp).toBe(5);
    // 随机分配的属性点可能导致总和变化
    const baseSum = Object.values(baseAttrs).reduce((a, b) => a + b, 0);
    const resultSum = Object.values(result.attributes).reduce((a, b) => a + b, 0);
    expect(resultSum).toBeGreaterThan(baseSum);
  });
});
```

### 步骤6：工具函数测试

创建 `__tests__/utils.test.js`：

```javascript
import { describe, it, expect } from 'vitest';
import { clampValue, clampGPA, applyAttributeChanges } from '../src/utils';

describe('工具函数', () => {
  it('clampValue应正确限制范围', () => {
    expect(clampValue(15, 0, 10)).toBe(10);
    expect(clampValue(-5, 0, 10)).toBe(0);
    expect(clampValue(5, 0, 10)).toBe(5);
  });

  it('clampGPA应在0-4范围内', () => {
    expect(clampGPA(5.0)).toBe(4.0);
    expect(clampGPA(-1.0)).toBe(0);
    expect(clampGPA(3.5)).toBe(3.5);
  });

  it('applyAttributeChanges应正确应用变化', () => {
    const current = { math: 5, coding: 3 };
    const changes = { math: 2 };
    const result = applyAttributeChanges(current, changes);
    expect(result.math).toBe(7);
    expect(result.coding).toBe(3);
  });
});
```

## 验收标准

- [ ] `npm test` 通过
- [ ] 核心逻辑覆盖率 > 80%
- [ ] 所有边界情况有测试覆盖
- [ ] 测试报告生成（HTML）

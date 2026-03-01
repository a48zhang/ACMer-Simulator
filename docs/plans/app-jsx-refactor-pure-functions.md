# App.jsx 重构计划 - 纯函数方案

## Context

### 问题背景
当前 App.jsx 是一个 1299 行的单体组件，包含了完整的游戏逻辑和 UI 渲染，存在以下严重问题：

**架构问题：**
- 高度耦合：状态管理、业务逻辑、UI 渲染混合在一起
- 难以维护：单组件过大，违反单一职责原则
- 难以测试：业务逻辑与 UI 耦合，无法单独测试

### 选择纯函数方案的原因
之前考虑的工厂函数模式存在闭包问题（捕获的 gameState 是快照，无法获取最新值）。

**纯函数方案的优势：**
1. ✅ 无闭包问题：每次调用都传入最新状态
2. ✅ 易于测试：纯函数可以独立测试
3. ✅ 可预测：相同输入总是产生相同输出
4. ✅ 更好的 TypeScript 支持：类型清晰
5. ✅ 符合函数式编程最佳实践

---

## 方案设计

### 核心思想

所有游戏逻辑都写成**纯函数**，接受当前状态作为参数，返回新状态或副作用描述。

```javascript
// 函数签名模式
type GameLogicResult = {
  newState: GameState,
  effects: {
    logs?: Array<{ message: string, type: string }>,
    notifications?: string,
    uiUpdates?: {
      showEventDialog?: boolean,
      showContestResult?: boolean,
      // ... 其他 UI 状态
    }
  }
}

// 纯函数示例
function executeActivity(gameState: GameState, activityId: string): GameLogicResult {
  // 计算新状态
  // 返回结果
}
```

---

## 详细实施计划

### 阶段1：提取常量和工具函数

**目标文件：**
- `src/constants.js` - 游戏常量
- `src/utils.js` - 工具函数

**需要提取的内容：**
```javascript
// 常量
- INITIAL_SAN, INITIAL_BALANCE, MIN_GPA, MAX_GPA, INITIAL_GPA
- START_MONTH, END_MONTH
- MONTHLY_ALLOWANCE, ACADEMIC_WARNING_THRESHOLD, FAILURES_PER_WARNING
- SEMESTER_EXAM_MONTHS, GRADUATION_MONTH
- MONTHS_PER_SEMESTER, MONTHS_PER_YEAR

// 工具函数
- clampValue(value, min, max)
- clampGPA(value)
- randomStarterValue()
- createBaseAttributes()
- applyAttributeChanges(currentAttributes, changes)
- getFieldValue(effects, prevState, field, deltaField)
```

### 阶段2：提取游戏状态管理

**目标文件：** `src/gameState.js`

**需要提取的内容：**
- `createInitialGameState()` - 创建初始游戏状态
- 游戏状态类型定义（JSDoc）

---

### 阶段3：创建游戏逻辑模块（纯函数）

**目标文件结构：**
```
src/gameLogics/
  ├── index.js              # 导出所有逻辑
  ├── types.js              # 类型定义
  ├── contest.js            # 比赛相关逻辑（纯函数）
  ├── activity.js           # 活动相关逻辑（纯函数）
  ├── month.js             # 月份推进逻辑（纯函数）
  ├── event.js             # 事件处理逻辑（纯函数）
  └── helpers.js           # 共享辅助函数
```

#### 3.1 types.js - 类型定义

```javascript
/**
 * @typedef {Object} GameState
 * @property {boolean} isRunning
 * @property {boolean} isPaused
 * @property {number} month
 * ... 其他字段
 */

/**
 * @typedef {Object} LogicResult
 * @property {GameState} newState - 新的游戏状态
 * @property {Array<{message: string, type: string}>} logs - 要添加的日志
 * @property {Object} uiState - UI 状态更新
 * @property {string|null} notification - 通知消息
 */
```

#### 3.2 contest.js - 比赛逻辑（纯函数）

```javascript
/**
 * 完成比赛
 * @param {GameState} gameState - 当前游戏状态
 * @returns {LogicResult}
 */
export function finishContest(gameState) {
  const session = gameState.activeContest;
  if (!session) return { newState: gameState, logs: [], uiState: {} };

  const outcome = calculateContestOutcome(
    session,
    gameState.contestTimeRemaining,
    gameState.rating
  );

  const newState = {
    ...gameState,
    activeContest: null,
    contestTimeRemaining: 0
  };

  return {
    newState,
    logs: [{
      message: `📊 比赛结束：解出 ${outcome.solved}/${outcome.total} 题，用时 ${outcome.timeUsed} 分钟`,
      type: 'success'
    }],
    uiState: {
      showContestResult: true,
      contestOutcome: outcome
    }
  };
}

/**
 * 读题
 * @param {GameState} gameState
 * @param {string} problemId
 * @returns {LogicResult}
 */
export function readContestProblem(gameState, problemId) { ... }

/**
 * 思考
 * @param {GameState} gameState
 * @param {string} problemId
 * @returns {LogicResult}
 */
export function thinkContestProblem(gameState, problemId) { ... }

/**
 * 写代码
 * @param {GameState} gameState
 * @param {string} problemId
 * @returns {LogicResult}
 */
export function codeContestProblem(gameState, problemId) { ... }

/**
 * 对拍
 * @param {GameState} gameState
 * @param {string} problemId
 * @returns {LogicResult}
 */
export function debugContestProblem(gameState, problemId) { ... }

/**
 * 尝试提交
 * @param {GameState} gameState
 * @param {string} problemId
 * @returns {LogicResult}
 */
export function attemptContestProblem(gameState, problemId) { ... }
```

#### 3.3 activity.js - 活动逻辑（纯函数）

```javascript
import { ACTIVITIES } from '../data/activities';
import { createContestSession } from '../data/contests';
import { applyAttributeChanges, getFieldValue, clampValue, clampGPA } from '../utils';
import { INITIAL_SAN, END_MONTH } from '../constants';

/**
 * 执行活动
 * @param {GameState} gameState - 当前游戏状态
 * @param {string} activityId - 活动ID
 * @returns {LogicResult}
 */
export function executeActivity(gameState, activityId) {
  const activity = ACTIVITIES.find(a => a.id === activityId);
  if (!activity) return { newState: gameState, logs: [], uiState: {} };

  const logs = [];

  // 检查AP是否足够
  if (gameState.remainingAP < activity.cost) {
    logs.push({
      message: `❌ 行动点不足！需要 ${activity.cost} AP，剩余 ${gameState.remainingAP} AP`,
      type: 'error'
    });
    return { newState: gameState, logs, uiState: {} };
  }

  // 检查游戏是否结束
  if (gameState.month > END_MONTH) {
    logs.push({ message: '❌ 游戏已结束！', type: 'error' });
    return { newState: gameState, logs, uiState: {} };
  }

  const effects = activity.effects(gameState);

  // 处理特殊动作：启动比赛
  if (effects.specialAction === 'START_CONTEST') {
    if (gameState.activeContest) {
      logs.push({ message: '⚠️ 已有正在进行的比赛', type: 'warning' });
      return { newState: gameState, logs, uiState: {} };
    }

    const contestConfig = activity.contestConfig;
    if (!contestConfig) {
      logs.push({ message: '❌ 比赛配置错误', type: 'error' });
      return { newState: gameState, logs, uiState: {} };
    }

    const session = createContestSession(contestConfig);
    logs.push({
      message: `🏁 开始${session.name}（${session.problems.length} 题，${session.durationMinutes} 分钟）`,
      type: 'info'
    });

    const newState = {
      ...gameState,
      remainingAP: Math.max(0, gameState.remainingAP - activity.cost),
      activeContest: session,
      contestTimeRemaining: session.timeRemaining
    };

    return { newState, logs, uiState: {} };
  }

  // 处理特殊动作：打开练习赛选择对话框
  if (effects.specialAction === 'OPEN_PRACTICE_CONTEST_DIALOG') {
    return {
      newState: gameState,
      logs: [],
      uiState: { showPracticeContestDialog: true }
    };
  }

  // 记录日志
  if (effects.log) {
    logs.push({ message: effects.log, type: effects.logType || 'info' });
  }

  // 计算新状态
  const updatedAttributes = applyAttributeChanges(gameState.attributes, effects.attributeChanges);
  const baseRemainingAP = Math.max(0, gameState.remainingAP - activity.cost);
  let nextRemainingAP = Math.min(gameState.monthlyAP, baseRemainingAP);
  if (effects.apBonus !== undefined) {
    nextRemainingAP = Math.max(0, Math.min(gameState.monthlyAP, nextRemainingAP + effects.apBonus));
  }

  const newState = {
    ...gameState,
    remainingAP: nextRemainingAP,
    playerContests: getFieldValue(effects, gameState, 'playerContests', 'playerContestsDelta'),
    playerProblems: getFieldValue(effects, gameState, 'playerProblems', 'playerProblemsDelta'),
    attributes: updatedAttributes
  };

  // 处理 setFlags
  if (effects.setFlags) {
    newState.worldFlags = { ...(gameState.worldFlags || {}), ...effects.setFlags };
  }

  // 处理 balance
  if (effects.balance !== undefined) {
    newState.balance = effects.balance;
  } else if (effects.balanceDelta !== undefined) {
    newState.balance = Math.max(0, gameState.balance + effects.balanceDelta);
  }

  // 处理 san
  if (effects.san !== undefined) {
    newState.san = clampValue(effects.san, 0, INITIAL_SAN);
  } else if (effects.sanDelta !== undefined) {
    newState.san = clampValue(gameState.san + effects.sanDelta, 0, INITIAL_SAN);
  }

  // 处理 rating
  if (effects.rating !== undefined) {
    newState.rating = effects.rating;
  } else if (effects.ratingDelta !== undefined) {
    newState.rating = gameState.rating + effects.ratingDelta;
  }

  // 处理 gpa
  if (effects.gpa !== undefined) {
    newState.gpa = clampGPA(effects.gpa);
  } else if (effects.gpaDelta !== undefined) {
    newState.gpa = clampGPA(gameState.gpa + effects.gpaDelta);
  }

  return { newState, logs, uiState: {} };
}
```

#### 3.4 month.js - 月份逻辑（纯函数）

```javascript
import { END_MONTH } from '../constants';
import { clampGPA } from '../utils';
import { scheduleMonthlyEvents } from '../data/events';

/**
 * 推进到下一月
 * @param {GameState} gameState - 当前游戏状态
 * @returns {LogicResult}
 */
export function advanceMonth(gameState) {
  const logs = [];
  const newMonth = gameState.month + 1;

  // 检查游戏是否结束
  if (newMonth > END_MONTH) {
    logs.push({
      message: `🎓 游戏结束！比赛次数：${gameState.playerContests}，解题数：${gameState.playerProblems}`,
      type: 'success'
    });

    const newState = {
      ...gameState,
      month: newMonth,
      isRunning: false
    };

    return {
      newState,
      logs,
      uiState: {},
      gameOverReason: 'graduation'
    };
  }

  // 计算本月日历月份
  const monthsSinceStartEarly = newMonth - 1;
  const totalCalMonthEarly = 9 + monthsSinceStartEarly;
  const calendarMonthForGpa = ((totalCalMonthEarly - 1) % 12) + 1;

  // 假期月份判定
  const isHolidayMonth = calendarMonthForGpa === 2 || calendarMonthForGpa === 7 || calendarMonthForGpa === 8;

  // 月度GPA扣除
  let gpaDeduction = 0;
  if (!isHolidayMonth) {
    const baseGpaDeduction = 0.05;
    gpaDeduction = baseGpaDeduction;
    const attendedClass = gameState.worldFlags?.attendedClassThisMonth || false;
    if (!attendedClass && Math.random() < 0.3) {
      gpaDeduction += 0.15;
      logs.push({ message: '⚠️ 本月未上课，GPA额外扣除！', type: 'warning' });
    }
  } else {
    logs.push({ message: `🏖️ 假期月，无需上课，GPA不扣除`, type: 'info' });
  }

  const newGpa = clampGPA(gameState.gpa - gpaDeduction);

  // 月度经济结算
  const allowance = gameState.monthlyAllowance || 1500;
  const expense = Math.floor(Math.random() * 701) + 800;
  const netBalance = Math.max(0, gameState.balance + allowance - expense);
  logs.push({
    message: `💰 家里打生活费 +${allowance}，本月支出 -${expense}，余额：${netBalance}`,
    type: 'info'
  });

  // SAN=0 惩罚
  const sanWasBurntOut = gameState.san <= 0;
  const baseMonthlyAP = gameState.monthlyAP;
  const nextMonthlyAP = sanWasBurntOut ? Math.floor(baseMonthlyAP / 2) : baseMonthlyAP;
  if (sanWasBurntOut) {
    logs.push({ message: '😵 SAN值耗尽！本月精力大幅下降，行动点减半！', type: 'error' });
  }

  // 生成当月事件
  const events = scheduleMonthlyEvents(gameState, newMonth);
  const calendarMonth = calendarMonthForGpa;

  // 计算学年
  let academicYear;
  if (newMonth <= 4) {
    academicYear = 1;
  } else {
    const monthsAfterFirstSemester = newMonth - 5;
    const completedYears = Math.floor(monthsAfterFirstSemester / 12);
    if (calendarMonth < 9) {
      academicYear = completedYears + 1;
    } else {
      academicYear = completedYears + 2;
    }
  }

  logs.push({
    message: `📅 进入大学 ${academicYear} 年 ${calendarMonth} 月（待处理事件 ${events.length}）`,
    type: 'info'
  });

  const newState = {
    ...gameState,
    month: newMonth,
    gpa: newGpa,
    balance: netBalance,
    remainingAP: nextMonthlyAP,
    pendingEvents: events,
    resolvedEvents: [],
    worldFlags: { ...(gameState.worldFlags || {}), attendedClassThisMonth: false }
  };

  return { newState, logs, uiState: {} };
}
```

#### 3.5 event.js - 事件逻辑（纯函数）

这是最复杂的模块，需要拆分为多个子函数：

```javascript
import { INITIAL_SAN } from '../constants';
import { clampValue, clampGPA, applyAttributeChanges, getFieldValue } from '../utils';
import { createContestSession } from '../data/contests';

/**
 * 应用事件选择（主入口）
 * @param {GameState} gameState
 * @param {string} eventId
 * @param {string} choiceId
 * @returns {LogicResult}
 */
export function applyEventChoice(gameState, eventId, choiceId) {
  const ev = (gameState.pendingEvents || []).find(e => e.id === eventId);
  if (!ev) return { newState: gameState, logs: [], uiState: {} };

  const choice = ev.choices.find(c => c.id === choiceId);
  if (!choice) return { newState: gameState, logs: [], uiState: {} };

  // 检查是否需要队友选择
  if (choice.requiresTeamSelection) {
    return {
      newState: gameState,
      logs: [],
      uiState: {
        showEventDialog: false,
        showTeammateDialog: true,
        pendingEventChoice: { eventId, choiceId }
      }
    };
  }

  return processEventChoice(gameState, ev, choice);
}

/**
 * 处理事件选择（内部函数）
 * @param {GameState} gameState
 * @param {Object} ev
 * @param {Object} choice
 * @param {string[]} [selectedTeammateIds]
 * @returns {LogicResult}
 */
export function processEventChoice(gameState, ev, choice, selectedTeammateIds = null) {
  const logs = [];
  let effects = { ...(choice.effects || {}) };
  const setFlags = choice.setFlags || {};

  // 特殊处理：期末周GPA审核
  if (ev.id === 'june_finals_week' || ev.id === 'january_finals_week') {
    const result = processFinalsWeek(gameState, effects);
    logs.push(...result.logs);
    effects = result.effects;

    if (result.gameOver) {
      return {
        newState: result.newState,
        logs,
        uiState: { showEventDialog: false, currentEvent: null },
        gameOverReason: result.gameOverReason
      };
    }
  }

  // 处理特殊动作：启动比赛
  if (choice.specialAction === 'START_CONTEST') {
    return processStartContest(
      gameState, ev, choice, effects, setFlags, logs, selectedTeammateIds
    );
  }

  // 普通事件处理
  logs.push({
    message: `🗳️ 事件处理：${ev.title} → ${choice.label}`,
    type: 'info'
  });

  const newState = buildNewStateForEvent(
    gameState, ev, choice, effects, setFlags, selectedTeammateIds
  );

  return {
    newState,
    logs,
    uiState: { showEventDialog: false, currentEvent: null }
  };
}

/**
 * 处理期末周GPA审核
 */
function processFinalsWeek(gameState, effects) {
  const logs = [];
  const currentGpa = gameState.gpa;
  const currentBuffs = gameState.buffs || { failedCourses: 0, academicWarnings: 0 };
  let gameOver = false;
  let gameOverReason = null;
  let newState = gameState;

  if (currentGpa < 2.5) {
    const newWarnings = currentBuffs.academicWarnings + 1;
    logs.push({
      message: `⚠️ 学业警告！GPA低于2.5，获得学业警告 buff（当前${newWarnings}个）`,
      type: 'error'
    });

    if (newWarnings >= 2) {
      logs.push({ message: `❌ 累计2个学业警告，进入退学结局！`, type: 'error' });
      newState = {
        ...gameState,
        isRunning: false,
        buffs: { ...currentBuffs, academicWarnings: newWarnings }
      };
      gameOver = true;
      gameOverReason = `GPA长期低于2.5，累计获得${newWarnings}次学业警告，被迫退学。`;
    } else {
      effects.buffChanges = { academicWarnings: 1 };
    }
  } else if (currentGpa < 3.0) {
    const newFailures = currentBuffs.failedCourses + 1;
    logs.push({
      message: `📉 挂科！GPA低于3.0，获得挂科 buff（当前${newFailures}个）`,
      type: 'warning'
    });

    if (newFailures % 3 === 0) {
      const newWarnings = currentBuffs.academicWarnings + 1;
      logs.push({
        message: `⚠️ 累计3次挂科，转换为1个学业警告！（当前${newWarnings}个学业警告，0个挂科）`,
        type: 'error'
      });

      if (newWarnings >= 2) {
        logs.push({ message: `❌ 累计2个学业警告，进入退学结局！`, type: 'error' });
        newState = {
          ...gameState,
          isRunning: false,
          buffs: { failedCourses: 0, academicWarnings: newWarnings }
        };
        gameOver = true;
        gameOverReason = `GPA长期低于3.0，累计挂科${newFailures}次（转换为${newWarnings}次学业警告），被迫退学。`;
      } else {
        effects.buffChanges = { failedCourses: -currentBuffs.failedCourses, academicWarnings: 1 };
      }
    } else {
      effects.buffChanges = { failedCourses: 1 };
    }
  } else if (currentGpa >= 3.7) {
    logs.push({
      message: `🎓 优秀！GPA达到3.7以上，获得奖学金！`,
      type: 'success'
    });
    effects.balanceDelta = 2000;
  } else {
    logs.push({ message: `✅ 期末考试通过，GPA正常`, type: 'info' });
  }

  return { logs, effects, gameOver, gameOverReason, newState };
}

/**
 * 处理启动比赛
 */
function processStartContest(gameState, ev, choice, effects, setFlags, logs, selectedTeammateIds) {
  const contestConfig = choice.contestConfig;
  if (!contestConfig) {
    logs.push({ message: '❌ 比赛配置错误', type: 'error' });
    return { newState: gameState, logs, uiState: {} };
  }

  if (gameState.activeContest) {
    logs.push({ message: '⚠️ 已有正在进行的比赛', type: 'warning' });
    return { newState: gameState, logs, uiState: {} };
  }

  const session = createContestSession(contestConfig);
  logs.push({
    message: `🏁 开始${session.name}（${session.problems.length} 题，${session.durationMinutes} 分钟）`,
    type: 'info'
  });

  const updatedAttributes = applyAttributeChanges(gameState.attributes, effects.attributeChanges);
  const nextSan = effects.sanDelta !== undefined
    ? clampValue(gameState.san + effects.sanDelta, 0, INITIAL_SAN)
    : gameState.san;
  const remaining = (gameState.pendingEvents || []).filter(e => e.id !== ev.id);
  const resolvedItem = { id: ev.id, choiceId: choice.id, time: Date.now() };

  const newState = {
    ...gameState,
    attributes: updatedAttributes,
    san: nextSan,
    worldFlags: { ...(gameState.worldFlags || {}), ...setFlags },
    activeContest: session,
    contestTimeRemaining: session.timeRemaining,
    pendingEvents: remaining,
    resolvedEvents: [...(gameState.resolvedEvents || []), resolvedItem]
  };

  if (selectedTeammateIds) {
    newState.selectedTeam = selectedTeammateIds;
  }

  return {
    newState,
    logs,
    uiState: { showEventDialog: false, currentEvent: null }
  };
}

/**
 * 构建事件的新状态
 */
function buildNewStateForEvent(gameState, ev, choice, effects, setFlags, selectedTeammateIds) {
  const updatedAttributes = applyAttributeChanges(gameState.attributes, effects.attributeChanges);

  const newState = {
    ...gameState,
    remainingAP: Math.min(gameState.monthlyAP, Math.max(0, gameState.remainingAP + (effects.apBonus || 0))),
    playerContests: getFieldValue(effects, gameState, 'playerContests', 'playerContestsDelta'),
    playerProblems: getFieldValue(effects, gameState, 'playerProblems', 'playerProblemsDelta'),
    attributes: updatedAttributes
  };

  if (selectedTeammateIds) {
    newState.selectedTeam = selectedTeammateIds;
  }

  if (effects.balance !== undefined) {
    newState.balance = effects.balance;
  } else if (effects.balanceDelta !== undefined) {
    newState.balance = Math.max(0, gameState.balance + effects.balanceDelta);
  }

  if (effects.san !== undefined) {
    newState.san = clampValue(effects.san, 0, INITIAL_SAN);
  } else if (effects.sanDelta !== undefined) {
    newState.san = clampValue(gameState.san + effects.sanDelta, 0, INITIAL_SAN);
  }

  if (effects.rating !== undefined) {
    newState.rating = effects.rating;
  } else if (effects.ratingDelta !== undefined) {
    newState.rating = gameState.rating + effects.ratingDelta;
  }

  if (effects.gpa !== undefined) {
    newState.gpa = clampGPA(effects.gpa);
  } else if (effects.gpaDelta !== undefined) {
    newState.gpa = clampGPA(gameState.gpa + effects.gpaDelta);
  }

  newState.worldFlags = { ...(gameState.worldFlags || {}), ...setFlags };

  if (effects.buffChanges) {
    const currentBuffs = gameState.buffs || { failedCourses: 0, academicWarnings: 0 };
    newState.buffs = {
      failedCourses: Math.max(0, currentBuffs.failedCourses + (effects.buffChanges.failedCourses || 0)),
      academicWarnings: Math.max(0, currentBuffs.academicWarnings + (effects.buffChanges.academicWarnings || 0))
    };
  }

  const remaining = (gameState.pendingEvents || []).filter(e => e.id !== ev.id);
  const resolvedItem = { id: ev.id, choiceId: choice.id, time: Date.now() };
  newState.pendingEvents = remaining;
  newState.resolvedEvents = [...(gameState.resolvedEvents || []), resolvedItem];

  return newState;
}

/**
 * 处理队友确认
 * @param {GameState} gameState
 * @param {Object} pendingEventChoice
 * @param {string[]} selectedTeammateIds
 * @returns {LogicResult}
 */
export function handleTeammateConfirm(gameState, pendingEventChoice, selectedTeammateIds) {
  if (!pendingEventChoice) {
    return { newState: gameState, logs: [], uiState: { showTeammateDialog: false } };
  }

  const { eventId, choiceId } = pendingEventChoice;
  const logs = [];

  logs.push({
    message: `👥 组队成功！队友：${selectedTeammateIds.map(id => {
      const tm = gameState.teammates.find(t => t.id === id);
      return tm ? tm.name : id;
    }).join('、')}`,
    type: 'success'
  });

  const ev = (gameState.pendingEvents || []).find(e => e.id === eventId);
  if (!ev) {
    return {
      newState: gameState,
      logs,
      uiState: { showTeammateDialog: false, pendingEventChoice: null }
    };
  }

  const choice = ev.choices.find(c => c.id === choiceId);
  if (!choice) {
    return {
      newState: gameState,
      logs,
      uiState: { showTeammateDialog: false, pendingEventChoice: null }
    };
  }

  const result = processEventChoice(gameState, ev, choice, selectedTeammateIds);

  return {
    newState: result.newState,
    logs: [...logs, ...result.logs],
    uiState: {
      ...result.uiState,
      showTeammateDialog: false,
      pendingEventChoice: null
    }
  };
}
```

#### 3.6 gameFlow.js - 游戏流程逻辑（纯函数）

```javascript
import { INITIAL_SAN, INITIAL_BALANCE, INITIAL_GPA, START_MONTH } from '../constants';
import { createBaseAttributes } from '../utils';
import { applyTraitEffects } from '../data/traits';
import { scheduleMonthlyEvents } from '../data/events';
import { createInitialGameState } from '../gameState';

/**
 * 默认队友列表
 */
const DEFAULT_TEAMMATES = [
  {
    id: 'teammate_lu_renjia',
    name: '陆任佳',
    attributes: {
      coding: 1, algorithm: 1, speed: 1, stress: 1,
      math: 1, dp: 1, graph: 1, dataStructure: 1, string: 1, search: 1, greedy: 1, geometry: 1
    },
    unlocked: true
  },
  {
    id: 'teammate_lu_renyi',
    name: '路仁义',
    attributes: {
      coding: 1, algorithm: 1, speed: 1, stress: 1,
      math: 1, dp: 1, graph: 1, dataStructure: 1, string: 1, search: 1, greedy: 1, geometry: 1
    },
    unlocked: true
  }
];

/**
 * 处理特性确认
 * @param {GameState} gameState
 * @param {string[]} selectedTraitIds
 * @returns {LogicResult}
 */
export function handleTraitConfirm(gameState, selectedTraitIds) {
  const { attributes, sanPenalty, moneyPenalty } = applyTraitEffects(
    selectedTraitIds,
    gameState.attributes
  );

  const newState = {
    ...gameState,
    attributes: attributes,
    san: Math.max(0, INITIAL_SAN - sanPenalty),
    balance: Math.max(0, INITIAL_BALANCE - moneyPenalty),
    selectedTraits: selectedTraitIds,
    isRunning: true,
    isPaused: false,
    month: START_MONTH,
    gpa: INITIAL_GPA,
    remainingAP: 30,
    pendingEvents: scheduleMonthlyEvents(gameState, START_MONTH),
    resolvedEvents: [],
    worldFlags: {},
    eventGraph: {},
    activeContest: null,
    contestTimeRemaining: 0,
    teammates: DEFAULT_TEAMMATES,
    selectedTeam: null,
    buffs: {
      failedCourses: 0,
      academicWarnings: 0
    }
  };

  return {
    newState,
    logs: [],
    uiState: {},
    notification: '🎮 游戏开始！你现在是大学一年级的学生，开始你的ACM之旅吧！'
  };
}

/**
 * 重置游戏
 * @returns {LogicResult}
 */
export function resetGame() {
  return {
    newState: createInitialGameState(),
    logs: [{ message: '🔄 已退学重开，退回首页', type: 'warning' }],
    uiState: { confirmDialog: null },
    clearLogs: true
  };
}

/**
 * 游戏结束后重新开始
 * @returns {LogicResult}
 */
export function handleGameOverRestart() {
  return {
    newState: createInitialGameState(),
    logs: [{ message: '🔄 游戏已重置', type: 'warning' }],
    uiState: { gameOverReason: null },
    clearLogs: true
  };
}

/**
 * 处理练习赛选择
 * @param {GameState} gameState
 * @param {Object} contestConfig
 * @returns {LogicResult}
 */
export function handlePracticeContestSelect(gameState, contestConfig) {
  const logs = [];

  if (gameState.activeContest) {
    logs.push({ message: '⚠️ 已有正在进行的比赛', type: 'warning' });
    return { newState: gameState, logs, uiState: { showPracticeContestDialog: false } };
  }

  const session = createContestSession(contestConfig);
  logs.push({
    message: `🏁 开始${session.name}（${session.problems.length} 题，${session.durationMinutes} 分钟）`,
    type: 'info'
  });

  const newState = {
    ...gameState,
    remainingAP: Math.max(0, gameState.remainingAP - contestConfig.cost),
    activeContest: session,
    contestTimeRemaining: session.timeRemaining
  };

  return {
    newState,
    logs,
    uiState: { showPracticeContestDialog: false }
  };
}

/**
 * 应用比赛结果确认
 * @param {GameState} gameState
 * @param {Object} contestOutcome
 * @returns {LogicResult}
 */
export function applyContestResult(gameState, contestOutcome) {
  const newState = {
    ...gameState,
    rating: contestOutcome.isRated && contestOutcome.ratingSource === 'cf'
      ? gameState.rating + contestOutcome.ratingDelta
      : gameState.rating,
    san: clampValue(gameState.san + contestOutcome.sanDelta, 0, INITIAL_SAN),
    playerContests: gameState.playerContests + 1
  };

  return {
    newState,
    logs: [],
    uiState: { showContestResult: false, contestOutcome: null }
  };
}
```

#### 3.7 index.js - 导出所有逻辑

```javascript
// 类型
export * from './types';

// 比赛逻辑
export {
  finishContest,
  readContestProblem,
  thinkContestProblem,
  codeContestProblem,
  debugContestProblem,
  attemptContestProblem
} from './contest';

// 活动逻辑
export { executeActivity } from './activity';

// 月份逻辑
export { advanceMonth } from './month';

// 事件逻辑
export {
  applyEventChoice,
  processEventChoice,
  handleTeammateConfirm
} from './event';

// 游戏流程逻辑
export {
  handleTraitConfirm,
  resetGame,
  handleGameOverRestart,
  handlePracticeContestSelect,
  applyContestResult
} from './gameFlow';
```

---

### 阶段4：重构 App.jsx 组件

**重构后的 App.jsx 结构：**

```javascript
import { useState, useCallback } from 'react'
// ... 所有组件导入

// 新模块导入
import { createInitialGameState } from './gameState'
import { createAddLog } from './gameLogics/log'
import { clampValue } from './utils'
import { INITIAL_SAN } from './constants'
import { ACTIVITIES } from './data/activities'
import {
  finishContest,
  readContestProblem,
  thinkContestProblem,
  codeContestProblem,
  debugContestProblem,
  attemptContestProblem,
  executeActivity,
  advanceMonth,
  applyEventChoice,
  handleTeammateConfirm as handleTeammateConfirmLogic,
  handleTraitConfirm,
  resetGame as resetGameLogic,
  handleGameOverRestart,
  handlePracticeContestSelect,
  applyContestResult
} from './gameLogics'

function App() {
  // 游戏状态
  const [gameState, setGameState] = useState(createInitialGameState())
  const [gamePhase, setGamePhase] = useState('intro')
  const [gameOverReason, setGameOverReason] = useState(null)

  // UI 状态
  const [notification, setNotification] = useState(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [currentEvent, setCurrentEvent] = useState(null)
  const [showContestResult, setShowContestResult] = useState(false)
  const [contestOutcome, setContestOutcome] = useState(null)
  const [showTeammateDialog, setShowTeammateDialog] = useState(false)
  const [showPracticeContestDialog, setShowPracticeContestDialog] = useState(false)
  const [pendingEventChoice, setPendingEventChoice] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)

  // 日志
  const [logs, setLogs] = useState([])
  const addLog = createAddLog(setLogs)
  const clearLogs = useCallback(() => setLogs([]), [])

  // ========== 辅助函数：应用逻辑结果 ==========
  const applyLogicResult = useCallback((result) => {
    if (!result) return

    // 更新游戏状态
    if (result.newState) {
      setGameState(result.newState)
    }

    // 添加日志
    if (result.logs && result.logs.length > 0) {
      result.logs.forEach(log => addLog(log.message, log.type))
    }

    // 更新 UI 状态
    if (result.uiState) {
      const ui = result.uiState
      if (ui.showEventDialog !== undefined) setShowEventDialog(ui.showEventDialog)
      if (ui.currentEvent !== undefined) setCurrentEvent(ui.currentEvent)
      if (ui.showContestResult !== undefined) setShowContestResult(ui.showContestResult)
      if (ui.contestOutcome !== undefined) setContestOutcome(ui.contestOutcome)
      if (ui.showTeammateDialog !== undefined) setShowTeammateDialog(ui.showTeammateDialog)
      if (ui.showPracticeContestDialog !== undefined) setShowPracticeContestDialog(ui.showPracticeContestDialog)
      if (ui.pendingEventChoice !== undefined) setPendingEventChoice(ui.pendingEventChoice)
      if (ui.confirmDialog !== undefined) setConfirmDialog(ui.confirmDialog)
      if (ui.gameOverReason !== undefined) setGameOverReason(ui.gameOverReason)
    }

    // 游戏结束原因
    if (result.gameOverReason) {
      setGameOverReason(result.gameOverReason)
    }

    // 通知
    if (result.notification) {
      setNotification(result.notification)
    }

    // 清空日志
    if (result.clearLogs) {
      clearLogs()
    }
  }, [addLog, clearLogs])

  // ========== 游戏流程 ==========
  const startGame = useCallback(() => {
    if (gamePhase === 'intro') {
      setGamePhase('traitSelection')
    } else if (gamePhase === 'traitSelection') {
      setGameState(prev => ({ ...prev, isRunning: true, isPaused: false }))
      addLog('🎮 游戏开始！祝你好运！', 'info')
    } else {
      setGameState(prev => ({ ...prev, isRunning: true, isPaused: false }))
      addLog('🎮 游戏继续！', 'info')
    }
  }, [gamePhase, addLog])

  const togglePause = useCallback(() => {
    const newPausedState = !gameState.isPaused
    addLog(newPausedState ? '⏸️ 游戏已暂停' : '▶️ 游戏继续', 'info')
    setGameState(prev => ({ ...prev, isPaused: newPausedState }))
  }, [gameState.isPaused, addLog])

  // ========== 包装逻辑函数 ==========
  const wrappedFinishContest = useCallback(() => {
    const result = finishContest(gameState)
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedReadContestProblem = useCallback((problemId) => {
    const result = readContestProblem(gameState, problemId)
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedThinkContestProblem = useCallback((problemId) => {
    const result = thinkContestProblem(gameState, problemId)
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedCodeContestProblem = useCallback((problemId) => {
    const result = codeContestProblem(gameState, problemId)
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedDebugContestProblem = useCallback((problemId) => {
    const result = debugContestProblem(gameState, problemId)
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedAttemptContestProblem = useCallback((problemId) => {
    const result = attemptContestProblem(gameState, problemId)
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedExecuteActivity = useCallback((activityId) => {
    const result = executeActivity(gameState, activityId)
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedAdvanceMonth = useCallback(() => {
    const result = advanceMonth(gameState)
    applyLogicResult(result)
    if (result.uiState?.gameOverReason) {
      setGamePhase('intro')
    }
  }, [gameState, applyLogicResult])

  const wrappedApplyEventChoice = useCallback((eventId, choiceId) => {
    const result = applyEventChoice(gameState, eventId, choiceId)
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedHandleTraitConfirm = useCallback((selectedTraitIds) => {
    const result = handleTraitConfirm(gameState, selectedTraitIds)
    applyLogicResult(result)
    setGamePhase('playing')
  }, [gameState, applyLogicResult])

  const wrappedHandleTeammateConfirm = useCallback((selectedTeammateIds) => {
    const result = handleTeammateConfirmLogic(gameState, pendingEventChoice, selectedTeammateIds)
    applyLogicResult(result)
  }, [gameState, pendingEventChoice, applyLogicResult])

  const wrappedHandleTeammateCancel = useCallback(() => {
    setShowTeammateDialog(false)
    setPendingEventChoice(null)
    setShowEventDialog(true)
  }, [])

  const wrappedResetGame = useCallback(() => {
    setConfirmDialog({
      message: '确定要退学重开吗？将退回首页重新开始！',
      onConfirm: () => {
        const result = resetGameLogic()
        applyLogicResult(result)
        setGamePhase('intro')
      }
    })
  }, [applyLogicResult])

  const wrappedHandleGameOverRestart = useCallback(() => {
    const result = handleGameOverRestart()
    applyLogicResult(result)
    setGamePhase('intro')
  }, [applyLogicResult])

  const wrappedHandlePracticeContestSelect = useCallback((contestConfig) => {
    const result = handlePracticeContestSelect(gameState, contestConfig)
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const openEventDialog = useCallback((eventId) => {
    const ev = (gameState.pendingEvents || []).find(e => e.id === eventId)
    if (!ev) return
    setCurrentEvent(ev)
    setShowEventDialog(true)
  }, [gameState.pendingEvents])

  // UI 渲染
  return (...)
}
```

---

## 关键文件清单

### 新建文件
- `src/constants.js`
- `src/utils.js`
- `src/gameState.js`
- `src/gameLogics/index.js`
- `src/gameLogics/types.js`
- `src/gameLogics/contest.js`
- `src/gameLogics/activity.js`
- `src/gameLogics/month.js`
- `src/gameLogics/event.js`
- `src/gameLogics/gameFlow.js`

### 修改文件
- `src/App.jsx` - 大幅简化，使用纯函数逻辑

---

## Git Commit 计划

```
阶段1:
git commit -m "refactor: 提取constants和utils模块"

阶段2:
git commit -m "refactor: 提取gameState模块"

阶段3:
git commit -m "refactor: 创建纯函数游戏逻辑模块 - contest"
git commit -m "refactor: 创建纯函数游戏逻辑模块 - activity"
git commit -m "refactor: 创建纯函数游戏逻辑模块 - month"
git commit -m "refactor: 创建纯函数游戏逻辑模块 - event"
git commit -m "refactor: 创建纯函数游戏逻辑模块 - gameFlow"

阶段4:
git commit -m "refactor: 重构App.jsx使用纯函数逻辑"
```

---

## 验证步骤

### 每个阶段后的验证
1. 运行 `npm run build` 确保无编译错误
2. 运行游戏进行完整流程测试：
   - 开始游戏 → 选择特性 → 执行活动 → 推进月份 → 处理事件 → 参加比赛
3. 检查日志输出是否正常
4. 检查所有对话框是否正常工作

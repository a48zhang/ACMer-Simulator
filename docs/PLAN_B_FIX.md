# Plan B 分支整改意见

---

## 一、必须修复的问题

### 🔴 严重问题：逻辑 Bug

**位置**: `src/gameLogics/event.js` - `checkAcademicWarning` 函数

**问题描述**:
```javascript
// 当前代码（错误）
function checkAcademicWarning(gpa, buffs) {
  if (gpa < ACADEMIC_CONFIG.WARNING_THRESHOLD) {  // 2.5
    // 触发学业警告...
  }
  if (gpa < ACADEMIC_CONFIG.FAILURE_THRESHOLD) {  // 3.0
    // 触发挂科警告...
  }
  // 两个 if 是独立的，会同时触发！
}
```

**预期行为**:
- GPA < 2.5 → 只触发学业警告
- GPA 2.5 - 3.0 → 只触发挂科警告
- GPA >= 3.0 → 正常

**修复方案**:
```javascript
function checkAcademicWarning(gpa, buffs) {
  // 先检查学业警告（GPA < 2.5）
  if (gpa < ACADEMIC_CONFIG.WARNING_THRESHOLD) {
    const newWarnings = buffs.academicWarnings + 1;
    // ...处理逻辑
    return { isExpelled: true/false, ... };
  }
  
  // 再检查挂科（GPA < 3.0），使用 else if
  else if (gpa < ACADEMIC_CONFIG.FAILURE_THRESHOLD) {
    // ...处理挂科逻辑
  }
  
  return { isExpelled: false, logs: [] };
}
```

---

## 二、建议修复的问题

### 🟡 问题1：配置命名不一致

**位置**: `src/config/gameBalance.js`

**问题**: 
- 计划中定义的是 `FAILURE_THRESHOLD`
- 实际代码使用的是 `FAILED_COURSE_THRESHOLD`

**修复**: 统一使用 `FAILURE_THRESHOLD`

---

### 🟡 问题2：JSDoc 注释不完整

**位置**: 多个辅助函数

**需要添加注释的函数**:
- `checkGameEnd`
- `calculateGPAChange`
- `processEconomy`
- `processSanPenalty`
- `getCalendarMonth`
- `calculateAcademicYear`
- `formatMonthLog`
- `buildNewMonthState`

**修复示例**:
```javascript
/**
 * 检查游戏是否结束
 * @param {Object} gameState - 当前游戏状态
 * @param {number} newMonth - 下一月份
 * @returns {Object} { isEnded: boolean, result?: LogicResult }
 */
function checkGameEnd(gameState, newMonth) {
  // ...
}
```

---

### 🟡 问题3：内部函数无法外部测试

**位置**: `src/gameLogics/event.js`

**问题**: `checkAcademicWarning` 和 `checkScholarship` 在 `processFinalsWeek` 内部定义，无法被外部测试

**修复方案**:
```javascript
// 提升到模块级别
export function checkAcademicWarning(gpa, buffs) {  // 添加 export
  // ...
}

export function checkScholarship(gpa) {  // 添加 export
  // ...
}

function processFinalsWeek(gameState, effects, ev) {
  // 直接调用模块级函数
  const warningResult = checkAcademicWarning(gpa, buffs);
  // ...
}
```

---

## 三、冲突解决

### 与 Plan A / Plan C 的 gameBalance.js 冲突

**解决方案**: 保留完整的配置（包含 Plan A 所有的配置项）

确保 `src/config/gameBalance.js` 包含:
```javascript
export const GPA_CONFIG = { /* ... */ };
export const ACADEMIC_CONFIG = { /* 完整配置 */ };
export const ACTIVITY_COSTS = { /* ... */ };
export const ACTIVITY_EFFECTS = { /* ... */ };
export const CONTEST_DIFFICULTIES = { /* ... */ };
export const EVENT_CHANCES = { /* ... */ };
export const SKILL_CONFIG = { /* ... */ };
```

---

## 四、修复检查清单

修复完成后，请确认：

- [ ] `checkAcademicWarning` 使用 `if-else if` 结构
- [ ] 配置命名统一为 `FAILURE_THRESHOLD`
- [ ] `checkAcademicWarning` 和 `checkScholarship` 已 export
- [ ] 所有辅助函数有 JSDoc 注释
- [ ] `gameBalance.js` 包含完整配置
- [ ] 代码可正常编译运行

--- 

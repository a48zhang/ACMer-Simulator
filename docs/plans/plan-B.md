# 子计划B：代码重构

## 目标

降低函数复杂度，提升可读性和可测试性

## 实施步骤

### 步骤1：重构 advanceMonth 函数

修改 `src/gameLogics/month.js`：

```javascript
import { END_MONTH } from '../constants';
import { clampGPA } from '../utils';
import { scheduleMonthlyEvents } from '../data/events';
import { GPA_CONFIG } from '../config/gameBalance';

/**
 * 推进到下一月 - 主函数
 */
export function advanceMonth(gameState) {
  const logs = [];
  const newMonth = gameState.month + 1;

  const endCheck = checkGameEnd(gameState, newMonth);
  if (endCheck.isEnded) {
    return endCheck.result;
  }

  const gpaResult = calculateGPAChange(gameState, newMonth);
  logs.push(...gpaResult.logs);

  const economyResult = processEconomy(gameState);
  logs.push(...economyResult.logs);

  const sanResult = processSanPenalty(gameState);
  if (sanResult.log) logs.push(sanResult.log);

  const events = scheduleMonthlyEvents(gameState, newMonth);
  const academicYear = calculateAcademicYear(newMonth);
  logs.push(formatMonthLog(academicYear, getCalendarMonth(newMonth), events.length));

  const newState = buildNewMonthState(gameState, newMonth, {
    gpa: gpaResult.gpa,
    balance: economyResult.balance,
    remainingAP: sanResult.nextAP,
    pendingEvents: events,
  });

  return { newState, logs, uiState: {} };
}

function checkGameEnd(gameState, newMonth) {
  if (newMonth > END_MONTH) {
    return {
      isEnded: true,
      result: {
        newState: { ...gameState, month: newMonth, isRunning: false },
        logs: [{
          message: `🎓 游戏结束！比赛次数：${gameState.playerContests}，解题数：${gameState.playerProblems}`,
          type: 'success'
        }],
        uiState: {},
        gameOverReason: 'graduation'
      }
    };
  }
  return { isEnded: false };
}

function calculateGPAChange(gameState, newMonth) {
  const logs = [];
  const calendarMonth = getCalendarMonth(newMonth);
  const isHoliday = GPA_CONFIG.HOLIDAY_MONTHS.includes(calendarMonth);

  if (isHoliday) {
    logs.push({ message: `🏖️ 假期月，无需上课，GPA不扣除`, type: 'info' });
    return { logs, gpa: gameState.gpa };
  }

  let deduction = GPA_CONFIG.MONTHLY_DEDUCTION;
  const attended = gameState.worldFlags?.attendedClassThisMonth || false;
  
  if (!attended && Math.random() < GPA_CONFIG.SKIP_CLASS_PROBABILITY) {
    deduction += GPA_CONFIG.SKIP_CLASS_DEDUCTION;
    logs.push({ message: '⚠️ 本月未上课，GPA额外扣除！', type: 'warning' });
  }

  return { logs, gpa: clampGPA(gameState.gpa - deduction) };
}

function processEconomy(gameState) {
  const allowance = gameState.monthlyAllowance || 1500;
  const expense = 800 + Math.floor(Math.random() * 701);
  const balance = Math.max(0, gameState.balance + allowance - expense);

  return {
    logs: [{
      message: `💰 家里打生活费 +${allowance}，本月支出 -${expense}，余额：${balance}`,
      type: 'info'
    }],
    balance
  };
}

function processSanPenalty(gameState) {
  const wasBurntOut = gameState.san <= 0;
  const nextAP = wasBurntOut ? Math.floor(gameState.monthlyAP / 2) : gameState.monthlyAP;

  return {
    log: wasBurntOut ? { message: '😵 SAN值耗尽！本月精力大幅下降，行动点减半！', type: 'error' } : null,
    nextAP
  };
}

function getCalendarMonth(gameMonth) {
  return ((9 + gameMonth - 2) % 12) + 1;
}

function calculateAcademicYear(month) {
  if (month <= 4) return 1;
  const cm = getCalendarMonth(month);
  return cm < 9 ? Math.floor((month - 5) / 12) + 2 : Math.floor((month - 5) / 12) + 1;
}

function formatMonthLog(year, month, eventCount) {
  return {
    message: `📅 进入大学 ${year} 年 ${month} 月（待处理事件 ${eventCount}）`,
    type: 'info'
  };
}

function buildNewMonthState(gameState, month, updates) {
  return {
    ...gameState,
    month,
    ...updates,
    resolvedEvents: [],
    worldFlags: { ...(gameState.worldFlags || {}), attendedClassThisMonth: false }
  };
}
```

### 步骤2：重构 processFinalsWeek 函数

修改 `src/gameLogics/event.js`：

```javascript
import { ACADEMIC_CONFIG } from '../config/gameBalance';

function processFinalsWeek(gameState, effects, ev) {
  const logs = [];
  const gpa = gameState.gpa;
  const buffs = gameState.buffs || { failedCourses: 0, academicWarnings: 0 };

  const warningResult = checkAcademicWarning(gpa, buffs);
  logs.push(...warningResult.logs);
  
  if (warningResult.isExpelled) {
    return { 
      logs, 
      effects, 
      gameOver: true, 
      gameOverReason: warningResult.reason, 
      newState: warningResult.newState 
    };
  }

  if (warningResult.buffChanges) {
    effects.buffChanges = warningResult.buffChanges;
  }

  const scholarshipResult = checkScholarship(gpa);
  if (scholarshipResult) {
    logs.push(scholarshipResult);
    effects.balanceDelta = 2000;
  }

  return { logs, effects, gameOver: false };
}

function checkAcademicWarning(gpa, buffs) {
  const logs = [];
  
  if (gpa < ACADEMIC_CONFIG.WARNING_THRESHOLD) {
    const newWarnings = buffs.academicWarnings + 1;
    logs.push({
      message: `⚠️ 学业警告！GPA低于${ACADEMIC_CONFIG.WARNING_THRESHOLD}，获得学业警告 buff（当前${newWarnings}个）`,
      type: 'error'
    });

    if (newWarnings >= ACADEMIC_CONFIG.WARNINGS_FOR_EXPULSION) {
      logs.push({ message: '❌ 累计2个学业警告，进入退学结局！', type: 'error' });
      return {
        isExpelled: true,
        reason: `GPA长期低于${ACADEMIC_CONFIG.WARNING_THRESHOLD}，累计获得${newWarnings}次学业警告，被迫退学。`,
        newState: { isRunning: false, buffs: { ...buffs, academicWarnings: newWarnings } },
        logs
      };
    }
    
    return { isExpelled: false, buffChanges: { academicWarnings: 1 }, logs };
  }
  
  return { isExpelled: false, logs };
}

function checkScholarship(gpa) {
  if (gpa >= ACADEMIC_CONFIG.SCHOLARSHIP_THRESHOLD) {
    return {
      message: `🎓 优秀！GPA达到${ACADEMIC_CONFIG.SCHOLARSHIP_THRESHOLD}以上，获得奖学金！`,
      type: 'success'
    };
  }
  return null;
}
```

### 步骤3：提取事件条件工具函数

在 `src/data/events.js` 添加：

```javascript
// 提取通用条件检查
const createMonthlyCondition = (targetMonth, minYear, requiredFlags) => {
  return (state) => {
    const { month, year } = getSchoolMonth(state.month);
    const monthMatch = Array.isArray(targetMonth) 
      ? targetMonth.includes(month) 
      : month === targetMonth;
    const yearMatch = year >= minYear;
    const flagsMatch = requiredFlags.every(flag => hasFlag(state.worldFlags, flag));
    return monthMatch && yearMatch && flagsMatch;
  };
};

// 使用示例
{
  id: 'october_regional',
  conditions: createMonthlyCondition(10, 2, ['joinedClub']),
  // ...
}
```

## 验收标准

- [ ] `advanceMonth` 函数 < 50行
- [ ] `processFinalsWeek` 函数 < 40行
- [ ] 所有函数圈复杂度 < 10
- [ ] 新增函数有JSDoc注释
- [ ] 原有功能完全保留
- [ ] 测试通过

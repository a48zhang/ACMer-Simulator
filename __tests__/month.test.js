import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { advanceMonth } from '../src/gameLogics/month';
import { createInitialGameState } from '../src/gameState';
import { END_MONTH } from '../src/constants';
import { EVENTS } from '../src/data/events';

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

  it('刚到END_MONTH-1时不应结束', () => {
    gameState.month = END_MONTH - 1;
    gameState.isRunning = true;
    const result = advanceMonth(gameState);
    expect(result.newState.isRunning).toBe(true);
  });

  it('只有默认选项的事件未处理时应自动按默认结算并推进月份', () => {
    gameState.pendingEvents = EVENTS.filter(event => event.id === 'club_intro');
    const result = advanceMonth(gameState);

    expect(result.newState.month).toBe(2);
    expect(result.logs.find(log => log.message.includes('按“先不去”结算'))).toBeDefined();
    expect(result.newState.worldFlags.joinedClub).toBeUndefined();
  });

  it('存在没有默认选项的事件时不应推进月份', () => {
    gameState.pendingEvents = EVENTS.filter(event => event.id === 'june_finals_week');
    const result = advanceMonth(gameState);

    expect(result.newState.month).toBe(1);
    expect(result.logs.find(log => log.message.includes('必须处理的事件'))).toBeDefined();
  });
});

describe('月份推进 - 随机行为测试', () => {
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
    vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('未上课且random<0.3时应额外扣除GPA', () => {
    Math.random.mockReturnValue(0.29);
    gameState.worldFlags.attendedClassThisMonth = false;

    const result = advanceMonth(gameState);

    const warningLog = result.logs.find(l => l.type === 'warning' && l.message.includes('GPA额外扣除'));
    expect(warningLog).toBeDefined();
  });

  it('未上课且random>=0.3时不应额外扣除GPA', () => {
    Math.random.mockReturnValue(0.31);
    gameState.worldFlags.attendedClassThisMonth = false;

    const result = advanceMonth(gameState);

    const warningLog = result.logs.find(l => l.message && l.message.includes('GPA额外扣除'));
    expect(warningLog).toBeUndefined();
  });

  it('上过课且触发正面随机时应出现保住平时分日志', () => {
    Math.random.mockReturnValue(0.1);
    gameState.worldFlags.attendedClassThisMonth = true;

    const result = advanceMonth(gameState);

    const successLog = result.logs.find(l => l.message && l.message.includes('平时分多保住了一点'));
    expect(successLog).toBeDefined();
  });

  it('多次运行验证概率分布', () => {
    vi.restoreAllMocks();
    let extraDeductionCount = 0;
    const runs = 1000;

    for (let i = 0; i < runs; i++) {
      const state = { ...gameState, worldFlags: { attendedClassThisMonth: false } };
      const result = advanceMonth(state);
      if (result.logs.find(l => l.message && l.message.includes('GPA额外扣除'))) {
        extraDeductionCount++;
      }
    }

    expect(extraDeductionCount).toBeGreaterThan(runs * 0.2);
    expect(extraDeductionCount).toBeLessThan(runs * 0.4);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { advanceMonth } from '../src/gameLogics/month';
import { createInitialGameState } from '../src/gameState';
import { END_MONTH } from '../src/constants';

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

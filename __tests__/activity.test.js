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

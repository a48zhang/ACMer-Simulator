import { describe, it, expect, beforeEach } from 'vitest';
import { executeActivity } from '../src/gameLogics/activity';
import { createInitialGameState } from '../src/gameState';
import { ACTIVITIES } from '../src/data/activities';
import { END_MONTH } from '../src/constants';

const getCost = (id) => ACTIVITIES.find(a => a.id === id)?.cost ?? 0;

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

  it('刷题应打开练习赛对话框', () => {
    const result = executeActivity(gameState, 'practice');
    expect(result.uiState.showPracticeContestDialog).toBe(true);
    expect(result.newState.remainingAP).toBe(gameState.remainingAP);
  });

  it('休息应恢复SAN并消耗AP', () => {
    gameState.san = 50;
    const result = executeActivity(gameState, 'rest');
    expect(result.newState.san).toBeGreaterThan(50);
    expect(result.newState.remainingAP).toBe(gameState.remainingAP - getCost('rest'));
  });

  it('AP不足时应返回错误日志', () => {
    gameState.remainingAP = 0;
    const result = executeActivity(gameState, 'practice');
    expect(result.uiState.showPracticeContestDialog).toBe(true);
  });

  it('上课应增加GPA并设置flag', () => {
    gameState.gpa = 3.0;
    const result = executeActivity(gameState, 'goto_lecture');
    expect(result.newState.gpa).toBeGreaterThan(3.0);
    expect(result.newState.worldFlags.attendedClassThisMonth).toBe(true);
  });

  it('AP=0时所有活动都应失败', () => {
    gameState.remainingAP = 0;
    const activities = ['rest', 'goto_lecture', 'part_time_job'];
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

  it('无效活动ID应返回空结果', () => {
    const result = executeActivity(gameState, 'invalid_activity');
    expect(result.newState).toBe(gameState);
    expect(result.logs.length).toBe(0);
  });

  it('游戏结束后活动应返回错误', () => {
    gameState.month = END_MONTH + 1;
    const result = executeActivity(gameState, 'practice');
    expect(result.logs[0].type).toBe('error');
    expect(result.logs[0].message).toContain('游戏已结束');
  });

  it('兼职打工应增加余额', () => {
    const before = gameState.balance;
    const result = executeActivity(gameState, 'part_time_job');
    expect(result.newState.balance).toBeGreaterThan(before);
  });
});

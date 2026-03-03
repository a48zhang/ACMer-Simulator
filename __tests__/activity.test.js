import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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

  it('刷题应消耗AP并可能增加解题数', () => {
    const result = executeActivity(gameState, 'practice');
    expect(result.newState.remainingAP).toBe(gameState.remainingAP - getCost('practice'));
    expect(result.logs.length).toBeGreaterThan(0);
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
    expect(result.logs[0].type).toBe('error');
    expect(result.logs[0].message).toContain('行动点不足');
  });

  it('上课应增加GPA并设置flag', () => {
    gameState.gpa = 3.0;
    const result = executeActivity(gameState, 'goto_lecture');
    expect(result.newState.gpa).toBeGreaterThan(3.0);
    expect(result.newState.worldFlags.attendedClassThisMonth).toBe(true);
  });

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

  it('practice_contest应打开练习赛对话框', () => {
    const result = executeActivity(gameState, 'practice_contest');
    expect(result.uiState.showPracticeContestDialog).toBe(true);
  });

  it('兼职打工应增加余额', () => {
    const before = gameState.balance;
    const result = executeActivity(gameState, 'part_time_job');
    expect(result.newState.balance).toBeGreaterThan(before);
  });

  it('健身应增加stress属性', () => {
    const before = gameState.attributes.stress;
    const result = executeActivity(gameState, 'gym_session');
    expect(result.newState.attributes.stress).toBeGreaterThan(before);
  });
});

describe('活动系统 - 刷题随机路径', () => {
  let gameState;

  beforeEach(() => {
    gameState = {
      ...createInitialGameState(),
      month: 1,
      remainingAP: 30,
      isRunning: true,
      playerProblems: 0
    };
    vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('globalRand<0.1时应触发负面事件', () => {
    Math.random.mockReturnValue(0.05);
    const result = executeActivity(gameState, 'practice');
    expect(result.logs[0].type).toBe('error');
  });

  it('0.1<=globalRand<0.18时应触发顿悟事件', () => {
    let callCount = 0;
    Math.random.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return 0.5; // attempts = Math.floor(0.5*5)+8 = 10
      if (callCount === 2) return 0.15; // globalRand: 0.1<=0.15<0.18 triggers 顿悟
      return 0.5; // all other randoms
    });
    const result = executeActivity(gameState, 'practice');
    expect(result.logs[0].message).toContain('顿悟');
  });
});

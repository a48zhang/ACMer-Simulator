import { describe, it, expect, vi, afterEach } from 'vitest';
import { createInitialGameState } from '../src/gameState';
import { startPracticeSession, attemptPracticeProblem } from '../src/gameLogics/practice';

const makeProblem = (overrides = {}) => ({
  id: 'p1',
  letter: 'A',
  order: 1,
  difficulty: 3,
  requires: { algorithm: 1, coding: 1, dp: 1 },
  trickiness: 0.05,
  status: 'pending',
  attempts: 0,
  thinkBonus: 0,
  debugBonus: 0,
  hasBug: false,
  bugFound: false,
  hasWrittenCode: false,
  editorialViewed: false,
  revealedInfo: null,
  ...overrides
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('练习系统', () => {
  it('应能开始练习计划并扣除AP', () => {
    const gameState = {
      ...createInitialGameState(),
      remainingAP: 20
    };

    const result = startPracticeSession(gameState, {
      id: 'sheet_warmup',
      name: '热身题单',
      description: 'test',
      cost: 5,
      mode: 'sheet',
      problems: [makeProblem()],
      badge: '入门'
    });

    expect(result.newState.activePractice).toBeDefined();
    expect(result.newState.remainingAP).toBe(15);
  });

  it('补题做出后应移出补题池', () => {
    const problem = makeProblem({
      status: 'coding',
      hasWrittenCode: true,
      backlogId: 'b1',
      sourceContestId: 'c1',
      sourceContestName: '测试赛'
    });

    const gameState = {
      ...createInitialGameState(),
      attributes: {
        coding: 8,
        algorithm: 8,
        speed: 3,
        stress: 3,
        math: 1,
        dp: 5,
        graph: 1,
        dataStructure: 1,
        string: 1,
        search: 1,
        greedy: 1,
        geometry: 1
      },
      activePractice: {
        id: 'practice-1',
        name: '过去比赛补题',
        description: 'test',
        mode: 'upsolve',
        cost: 6,
        startedAt: Date.now(),
        problems: [problem]
      },
      practiceBacklog: [{
        id: 'b1',
        contestId: 'c1',
        contestName: '测试赛',
        createdAt: Date.now(),
        problem
      }]
    };

    let callCount = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      callCount += 1;
      if (callCount === 1) return 0.5; // attempt
      if (callCount === 2) return 0.1; // reward chance
      return 0.2;
    });

    const result = attemptPracticeProblem(gameState, 'p1');

    expect(result.newState.activePractice).toBe(null);
    expect(result.newState.practiceBacklog).toHaveLength(0);
    expect(result.logs.some(log => log.message.includes('练习吸收了这道题的套路'))).toBe(true);
  });
});

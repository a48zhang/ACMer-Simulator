import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  createContestSession, evaluateAttempt, calculateContestOutcome,
  readProblem, thinkProblem, codeProblem, debugProblem
} from '../src/data/contests';
import { finishContest, thinkContestProblem } from '../src/gameLogics/contest';
import { applyContestResult } from '../src/gameLogics/gameFlow';
import { createInitialGameState } from '../src/gameState';

afterEach(() => {
  vi.restoreAllMocks();
});

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
      bugFound: false,
      hasWrittenCode: true,
      codeScore: 88,
      passThreshold: 70,
      bugCount: 0,
      fixedBugCount: 0
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
    expect(outcome.ranking).toBeNull();
    expect(outcome.award).toBeNull();
  });

  it('创建0题比赛应处理边界', () => {
    expect(() => {
      createContestSession({
        name: '边界测试',
        problemCount: [0, 0],
        durationMinutes: 180,
        difficulties: []
      });
    }).not.toThrow();
  });

  it('极高难度题目对低属性玩家成功率应较低', () => {
    const problem = {
      requires: { algorithm: 10, coding: 10 },
      trickiness: 0.9,
      hasBug: false,
      bugFound: false,
      hasWrittenCode: true,
      codeScore: 45,
      passThreshold: 90,
      bugCount: 2,
      fixedBugCount: 0
    };
    const attributes = { algorithm: 1, coding: 1, speed: 1 };
    const result = evaluateAttempt(problem, attributes, 0, 0);
    expect(result.success).toBe(false);
  });

  it('全题解出应有正确结果', () => {
    const session = createContestSession({
      name: '测试',
      problemCount: [3, 3],
      durationMinutes: 180,
      difficulties: [1, 2, 3]
    });
    session.problems.forEach(p => { p.status = 'solved'; });
    const outcome = calculateContestOutcome(session, 100, 1500);
    expect(outcome.solved).toBe(3);
    expect(outcome.total).toBe(3);
  });

  it('零题解出应有正确结果', () => {
    const session = createContestSession({
      name: '测试',
      problemCount: [3, 3],
      durationMinutes: 180,
      difficulties: [1, 2, 3]
    });
    const outcome = calculateContestOutcome(session, 100, 1500);
    expect(outcome.solved).toBe(0);
    expect(outcome.total).toBe(3);
  });

  it('比赛结束时应把未解题加入补题池', () => {
    const session = createContestSession({
      name: '测试赛',
      problemCount: [2, 2],
      durationMinutes: 120,
      difficulties: [2, 3]
    });
    session.problems[0].status = 'solved';

    const gameState = {
      ...createInitialGameState(),
      activeContest: session,
      contestTimeRemaining: 60
    };

    const result = finishContest(gameState);
    expect(result.newState.practiceBacklog.length).toBe(1);
    expect(result.newState.practiceBacklog[0].contestName).toBe('测试赛');
  });

  it('正式比赛应计算排名', () => {
    const session = createContestSession({
      name: 'XCPC省赛',
      problemCount: [10, 10],
      durationMinutes: 300,
      difficulties: [2, 3, 4, 5, 5, 6, 6, 7, 8, 9],
      isRated: false,
      category: 'provincial',
      awardEligible: true
    });
    session.problems.slice(0, 6).forEach(p => { p.status = 'solved'; });
    session.attempts = Array.from({ length: 8 }, (_, index) => ({
      problemId: `p-${index}`,
      success: index < 6,
      timeCost: 15,
      weakestAttr: null
    }));

    const outcome = calculateContestOutcome(session, 110, 1500);
    expect(outcome.ranking).not.toBeNull();
    expect(outcome.ranking.rank).toBeGreaterThan(0);
    expect(outcome.ranking.participants).toBeGreaterThan(outcome.ranking.rank);
  });

  it('正式比赛表现足够好时应可能获得奖项', () => {
    const session = createContestSession({
      name: 'XCPC区域赛（10月站）',
      problemCount: [12, 12],
      durationMinutes: 300,
      difficulties: [2, 3, 4, 5, 5, 6, 6, 7, 8, 8, 9, 10],
      isRated: false,
      category: 'regional',
      awardEligible: true
    });
    session.problems.slice(0, 10).forEach(p => { p.status = 'solved'; });
    session.attempts = Array.from({ length: 11 }, (_, index) => ({
      problemId: `p-${index}`,
      success: index < 10,
      timeCost: 10,
      weakestAttr: null
    }));

    const outcome = calculateContestOutcome(session, 140, 1500);
    expect(outcome.ranking).not.toBeNull();
    expect(outcome.award).not.toBeNull();
    expect(['金奖', '银奖', '铜奖', '优胜奖']).toContain(outcome.award.label);
  });

  it('正式比赛排名应呈长尾分布，高解题数对应更稀少的名次', () => {
    const makeOutcome = (solvedCount, usedTime = 180, attemptCount = solvedCount + 1) => {
      const session = createContestSession({
        name: 'XCPC区域赛（长尾测试）',
        problemCount: [12, 12],
        durationMinutes: 300,
        difficulties: [2, 3, 4, 5, 5, 6, 6, 7, 8, 8, 9, 10],
        isRated: false,
        category: 'regional',
        awardEligible: true
      });
      session.problems.slice(0, solvedCount).forEach(p => { p.status = 'solved'; });
      session.attempts = Array.from({ length: attemptCount }, (_, index) => ({
        problemId: `p-${index}`,
        success: index < solvedCount,
        timeCost: 12,
        weakestAttr: null
      }));
      return calculateContestOutcome(session, 300 - usedTime, 1500);
    };

    const low = makeOutcome(2, 230, 5);
    const mid = makeOutcome(6, 180, 8);
    const high = makeOutcome(10, 135, 11);

    expect(low.ranking.rank).toBeGreaterThan(mid.ranking.rank);
    expect(mid.ranking.rank).toBeGreaterThan(high.ranking.rank);
    expect(high.ranking.rank / high.ranking.participants).toBeLessThan(0.12);
  });

  it('确认结算后应把奖项累加到 buffs 中', () => {
    const gameState = createInitialGameState();
    const result = applyContestResult(gameState, {
      contestId: 'contest-1',
      contestName: 'XCPC省赛',
      total: 10,
      solved: 6,
      attempts: 8,
      ratingDelta: 0,
      scoreDelta: 60,
      sanDelta: 8,
      timeUsed: 190,
      weakAttr: null,
      performanceRating: null,
      isRated: false,
      ratingSource: null,
      contestCategory: 'provincial',
      ranking: { rank: 18, participants: 220 },
      award: { tier: 'gold', label: '金奖' }
    });

    expect(result.newState.buffs.contestAwards['省赛金牌']).toBe(1);
  });

  it('组队比赛中玩家行动后应触发队友额外行动', () => {
    const session = createContestSession({
      name: '组队测试赛',
      problemCount: [1, 1],
      durationMinutes: 180,
      difficulties: [3],
      isRated: false,
      category: 'regional',
      awardEligible: true
    });
    session.problems[0] = {
      ...session.problems[0],
      status: 'coding',
      hasWrittenCode: true,
      codeScore: 96,
      passThreshold: 70,
      bugCount: 0,
      fixedBugCount: 0
    };

    const gameState = {
      ...createInitialGameState(),
      activeContest: session,
      contestTimeRemaining: 140,
      teammates: [
        {
          id: 'tm1',
          name: '测试队友',
          attributes: { algorithm: 5, coding: 5, speed: 4, stress: 3 }
        }
      ],
      selectedTeam: ['tm1']
    };

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = thinkContestProblem(gameState, session.problems[0].id);
    expect(result.logs.some(log => log.message.includes('测试队友'))).toBe(true);
    expect(result.uiState.showContestResult).toBe(true);
    expect(result.uiState.contestOutcome?.solved).toBe(1);
  });
});

describe('比赛题目阶段', () => {
  const makeProblem = (diff = 3) => ({
    difficulty: diff,
    requires: { algorithm: diff, coding: diff },
    trickiness: 0.1 + diff * 0.05,
    hasBug: false,
    bugFound: false,
    hasWrittenCode: false,
    thinkBonus: 0,
    debugBonus: 0,
    passThreshold: 70,
    codeScore: 0,
    bugCount: 0,
    fixedBugCount: 0,
    codeAttempts: 0,
    revealedInfo: null
  });

  it('readProblem应返回读题时间和标签', () => {
    const problem = { ...makeProblem(3), requires: { dp: 3, graph: 2 } };
    const result = readProblem(problem, { dp: 5, graph: 3 });
    expect(result.readTime).toBeGreaterThan(0);
    expect(Array.isArray(result.tags)).toBe(true);
    expect(typeof result.estimatedSuccessRate).toBe('number');
  });

  it('thinkProblem应返回思考耗时和加成', () => {
    const problem = makeProblem(3);
    const result = thinkProblem(problem, { algorithm: 5, speed: 3 });
    expect(result.thinkTime).toBeGreaterThan(0);
    expect(result.newThinkBonus).toBeGreaterThan(problem.thinkBonus);
  });

  it('codeProblem应返回编码耗时', () => {
    const problem = makeProblem(3);
    const result = codeProblem(problem, { coding: 5, speed: 4 });
    expect(result.codeTime).toBeGreaterThan(0);
    expect(typeof result.hasBug).toBe('boolean');
    expect(result.hasWrittenCode).toBe(true);
    expect(result.codeScore).toBeGreaterThan(0);
  });

  it('debugProblem应返回调试结果', () => {
    const problem = { ...makeProblem(3), hasBug: false, debugBonus: 0 };
    const result = debugProblem(problem, { speed: 5 });
    expect(result.debugTime).toBeGreaterThan(0);
    expect(typeof result.foundBug).toBe('boolean');
  });

  it('有bug的题目debug应能发现bug', () => {
    const results = [];
    for (let i = 0; i < 50; i++) {
      const problem = { ...makeProblem(2), hasBug: true, bugCount: 2, fixedBugCount: 0, debugBonus: 0 };
      results.push(debugProblem(problem, { speed: 5 }).foundBug);
    }
    expect(results.some(r => r === true)).toBe(true);
  });

  it('重复写代码应只会提升或保持当前代码分', () => {
    const problem = { ...makeProblem(3), hasWrittenCode: true, codeScore: 76, codeAttempts: 1 };
    const originalRandom = Math.random;
    Math.random = () => 0;
    const result = codeProblem(problem, { coding: 3, algorithm: 3, speed: 3 });
    Math.random = originalRandom;
    expect(result.codeScore).toBeGreaterThanOrEqual(76);
  });

  it('debug 后提交时的隐藏惩罚应降低', () => {
    const problem = {
      ...makeProblem(4),
      hasWrittenCode: true,
      codeScore: 86,
      passThreshold: 80,
      hasBug: true,
      bugCount: 2,
      fixedBugCount: 0
    };
    const before = evaluateAttempt(problem, { algorithm: 5, coding: 5, speed: 5 }, problem.thinkBonus, problem.debugBonus);
    const debugged = debugProblem(problem, { algorithm: 8, coding: 5, speed: 8 });
    const after = evaluateAttempt({
      ...problem,
      fixedBugCount: debugged.fixedBugCount,
      debugBonus: debugged.newDebugBonus,
      hasBug: problem.bugCount > debugged.fixedBugCount
    }, { algorithm: 5, coding: 5, speed: 5 }, problem.thinkBonus, debugged.newDebugBonus);

    expect(after.adjustedRatio).toBeGreaterThanOrEqual(before.adjustedRatio);
  });
});

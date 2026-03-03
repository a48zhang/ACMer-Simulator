import { describe, it, expect } from 'vitest';
import {
  createContestSession, evaluateAttempt, calculateContestOutcome,
  readProblem, thinkProblem, codeProblem, debugProblem
} from '../src/data/contests';

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
      bugFound: false
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
      bugFound: false
    };
    const attributes = { algorithm: 1, coding: 1, speed: 1 };

    let successCount = 0;
    for (let i = 0; i < 100; i++) {
      const result = evaluateAttempt(problem, attributes, 0, 0);
      if (result.success) successCount++;
    }

    expect(successCount).toBeLessThan(30);
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
});

describe('比赛题目阶段', () => {
  const makeProblem = (diff = 3) => ({
    difficulty: diff,
    requires: { algorithm: diff, coding: diff },
    trickiness: 0.1 + diff * 0.05,
    hasBug: false,
    bugFound: false,
    thinkBonus: 0,
    debugBonus: 0,
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
      const problem = { ...makeProblem(2), hasBug: true, debugBonus: 0 };
      results.push(debugProblem(problem, { speed: 5 }).foundBug);
    }
    expect(results.some(r => r === true)).toBe(true);
  });
});

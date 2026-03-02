import { describe, it, expect } from 'vitest';
import { createContestSession, evaluateAttempt, calculateContestOutcome } from '../src/data/contests';

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
});

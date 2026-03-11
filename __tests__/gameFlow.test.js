import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '../src/gameState';
import { handlePracticeContestSelect, applyContestResult } from '../src/gameLogics/gameFlow';

describe('gameFlow', () => {
  it('练习赛选择时应校验 AP 是否足够', () => {
    const gameState = {
      ...createInitialGameState(),
      remainingAP: 5
    };

    const result = handlePracticeContestSelect(gameState, {
      id: 'cf_div2',
      name: 'Codeforces Div.2',
      description: 'test',
      problemCount: [7, 8],
      durationMinutes: 120,
      cost: 10
    });

    expect(result.newState).toBe(gameState);
    expect(result.logs[0]?.message).toContain('行动点不足');
  });

  it('比赛结算后应清空已选队友，避免影响后续个人赛', () => {
    const gameState = {
      ...createInitialGameState(),
      selectedTeam: ['tm1', 'tm2'],
      rating: 1200,
      san: 50,
      playerContests: 3
    };

    const result = applyContestResult(gameState, {
      contestId: 'contest-1',
      total: 6,
      solved: 3,
      attempts: 5,
      ratingDelta: 80,
      scoreDelta: 30,
      sanDelta: 4,
      timeUsed: 80,
      weakAttr: null,
      performanceRating: 1500,
      isRated: true,
      ratingSource: 'cf'
    });

    expect(result.newState.selectedTeam).toBe(null);
    expect(result.newState.rating).toBe(1280);
    expect(result.newState.playerContests).toBe(4);
  });
});

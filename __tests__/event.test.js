import { describe, it, expect, beforeEach } from 'vitest';
import { applyEventChoice } from '../src/gameLogics/event';
import { EVENTS } from '../src/data/events';
import { createInitialGameState } from '../src/gameState';

describe('事件系统', () => {
  let gameState;

  beforeEach(() => {
    gameState = {
      ...createInitialGameState(),
      pendingEvents: [...EVENTS],
      month: 1
    };
  });

  it('应能应用事件选择', () => {
    const event = gameState.pendingEvents[0];
    const choice = event.choices[0];
    const result = applyEventChoice(gameState, event.id, choice.id);
    expect(result.logs.length).toBeGreaterThan(0);
  });

  it('加入社团应设置joinedClub标志', () => {
    const event = gameState.pendingEvents.find(e => e.id === 'club_intro');
    if (event) {
      const joinChoice = event.choices.find(c => c.id === 'join');
      const result = applyEventChoice(gameState, event.id, joinChoice.id);
      expect(result.newState.worldFlags.joinedClub).toBe(true);
    }
  });

  it('需要队友选择的事件应返回UI状态', () => {
    const event = gameState.pendingEvents.find(
      e => e.choices && e.choices.some(c => c.requiresTeamSelection)
    );
    if (event) {
      const participateChoice = event.choices.find(c => c.requiresTeamSelection);
      const result = applyEventChoice(gameState, event.id, participateChoice.id);
      expect(result.uiState.showTeammateDialog).toBe(true);
    }
  });
});

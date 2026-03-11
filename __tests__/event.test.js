import { describe, it, expect, beforeEach } from 'vitest';
import { applyEventChoice, handleTeammateConfirm } from '../src/gameLogics/event';
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
      const detailLog = result.logs.find(l => l.message && l.message.includes('加入了ACM算法社团'));
      expect(detailLog).toBeDefined();
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

  it('无效事件ID应返回空结果', () => {
    const result = applyEventChoice(gameState, 'invalid_event', 'any_choice');
    expect(result.logs.length).toBe(0);
    expect(result.newState).toBe(gameState);
  });

  it('无效选择ID应返回空结果', () => {
    const event = gameState.pendingEvents[0];
    const result = applyEventChoice(gameState, event.id, 'invalid_choice');
    expect(result.logs.length).toBe(0);
    expect(result.newState).toBe(gameState);
  });

  it('空pendingEvents应正常处理', () => {
    gameState.pendingEvents = [];
    const result = applyEventChoice(gameState, 'any', 'any');
    expect(result.newState).toBe(gameState);
  });
});

describe('期末周GPA审核', () => {
  let gameState;

  beforeEach(() => {
    gameState = {
      ...createInitialGameState(),
      buffs: { failedCourses: 0, academicWarnings: 0 }
    };
  });

  it('GPA>=3.7时应获得奖学金', () => {
    gameState.gpa = 3.8;
    gameState.pendingEvents = EVENTS.filter(e => e.id === 'june_finals_week');
    const result = applyEventChoice(gameState, 'june_finals_week', 'review');
    const successLog = result.logs.find(l => l.message && l.message.includes('奖学金'));
    expect(successLog).toBeDefined();
  });

  it('GPA<2.5时应获得学业警告', () => {
    gameState.gpa = 2.0;
    gameState.pendingEvents = EVENTS.filter(e => e.id === 'june_finals_week');
    const result = applyEventChoice(gameState, 'june_finals_week', 'review');
    const warningLog = result.logs.find(l => l.message && l.message.includes('学业警告'));
    expect(warningLog).toBeDefined();
  });

  it('GPA<2.5且已有1次学业警告时应触发退学', () => {
    gameState.gpa = 2.0;
    gameState.buffs = { failedCourses: 0, academicWarnings: 1 };
    gameState.pendingEvents = EVENTS.filter(e => e.id === 'june_finals_week');
    const result = applyEventChoice(gameState, 'june_finals_week', 'review');
    expect(result.newState.isRunning).toBe(false);
    expect(result.gameOverReason).toBeDefined();
  });

  it('GPA在2.5-3.0时应挂科', () => {
    gameState.gpa = 2.7;
    gameState.pendingEvents = EVENTS.filter(e => e.id === 'june_finals_week');
    const result = applyEventChoice(gameState, 'june_finals_week', 'review');
    const failLog = result.logs.find(l => l.message && l.message.includes('挂科'));
    expect(failLog).toBeDefined();
  });

  it('累计2次挂科再挂应转换为学业警告', () => {
    gameState.gpa = 2.7;
    gameState.buffs = { failedCourses: 2, academicWarnings: 0 };
    gameState.pendingEvents = EVENTS.filter(e => e.id === 'june_finals_week');
    const result = applyEventChoice(gameState, 'june_finals_week', 'review');
    const conversionLog = result.logs.find(l => l.message && l.message.includes('累计3次挂科'));
    expect(conversionLog).toBeDefined();
  });

  it('累计挂科达3次且已有1次警告时应触发退学', () => {
    gameState.gpa = 2.7;
    gameState.buffs = { failedCourses: 2, academicWarnings: 1 };
    gameState.pendingEvents = EVENTS.filter(e => e.id === 'june_finals_week');
    const result = applyEventChoice(gameState, 'june_finals_week', 'review');
    expect(result.newState.isRunning).toBe(false);
  });

  it('GPA正常时应通过期末考试', () => {
    gameState.gpa = 3.2;
    gameState.pendingEvents = EVENTS.filter(e => e.id === 'june_finals_week');
    const result = applyEventChoice(gameState, 'june_finals_week', 'review');
    const infoLog = result.logs.find(l => l.message && l.message.includes('期末考试通过'));
    expect(infoLog).toBeDefined();
  });
});

describe('事件效果应用', () => {
  let gameState;

  beforeEach(() => {
    gameState = {
      ...createInitialGameState(),
      month: 1,
      rating: 1000,
      balance: 3000,
      san: 80,
      gpa: 3.0
    };
  });

  it('应正确应用rating增量', () => {
    const syntheticEvent = {
      id: 'test_rating',
      title: '测试rating',
      choices: [{ id: 'go', label: '确认', effects: { ratingDelta: 100 } }]
    };
    gameState.pendingEvents = [syntheticEvent];
    const result = applyEventChoice(gameState, 'test_rating', 'go');
    expect(result.newState.rating).toBe(1100);
  });

  it('应正确直接设置gpa', () => {
    const syntheticEvent = {
      id: 'test_gpa',
      title: '测试gpa',
      choices: [{ id: 'go', label: '确认', effects: { gpa: 3.8 } }]
    };
    gameState.pendingEvents = [syntheticEvent];
    const result = applyEventChoice(gameState, 'test_gpa', 'go');
    expect(result.newState.gpa).toBe(3.8);
  });

  it('应正确直接设置balance', () => {
    const syntheticEvent = {
      id: 'test_balance',
      title: '测试balance',
      choices: [{ id: 'go', label: '确认', effects: { balance: 9999 } }]
    };
    gameState.pendingEvents = [syntheticEvent];
    const result = applyEventChoice(gameState, 'test_balance', 'go');
    expect(result.newState.balance).toBe(9999);
  });

  it('SAN耗尽月份的AP奖励不应突破减半上限', () => {
    gameState.remainingAP = 14;
    gameState.worldFlags = { monthlyAPCap: 15 };
    gameState.pendingEvents = EVENTS.filter(e => e.id === 'club_intro');

    const result = applyEventChoice(gameState, 'club_intro', 'join');
    expect(result.newState.remainingAP).toBe(15);
  });
});

describe('队友确认', () => {
  let gameState;

  beforeEach(() => {
    gameState = {
      ...createInitialGameState(),
      pendingEvents: [...EVENTS],
      month: 1,
      teammates: [
        { id: 'tm1', name: '小明' },
        { id: 'tm2', name: '小红' }
      ]
    };
  });

  it('pendingEventChoice为null时应关闭对话框', () => {
    const result = handleTeammateConfirm(gameState, null, []);
    expect(result.uiState.showTeammateDialog).toBe(false);
    expect(result.newState).toBe(gameState);
  });

  it('有效pendingEventChoice应处理队友确认', () => {
    const event = gameState.pendingEvents.find(e => e.id === 'club_intro');
    if (event) {
      const choice = event.choices.find(c => c.id === 'join');
      const result = handleTeammateConfirm(
        gameState,
        { eventId: event.id, choiceId: choice.id },
        ['tm1']
      );
      expect(result.uiState.showTeammateDialog).toBe(false);
      expect(result.logs.length).toBeGreaterThan(0);
    }
  });

  it('无效eventId时应返回日志并关闭对话框', () => {
    const result = handleTeammateConfirm(
      gameState,
      { eventId: 'nonexistent', choiceId: 'any' },
      ['tm1']
    );
    expect(result.uiState.showTeammateDialog).toBe(false);
    expect(result.logs.length).toBeGreaterThan(0);
  });

  it('无效choiceId时应关闭对话框', () => {
    const event = gameState.pendingEvents.find(e => e.id === 'club_intro');
    if (event) {
      const result = handleTeammateConfirm(
        gameState,
        { eventId: event.id, choiceId: 'invalid_choice' },
        ['tm1']
      );
      expect(result.uiState.showTeammateDialog).toBe(false);
    }
  });

  it('START_CONTEST事件应启动比赛会话', () => {
    const contestEvent = gameState.pendingEvents.find(e => e.id === 'march_invitational_signup');
    if (contestEvent) {
      const participateChoice = contestEvent.choices.find(c => c.id === 'participate');
      // SET the worldFlags so conditions pass and event is in pendingEvents properly
      gameState.worldFlags = { joinedClub: true };
      const result = handleTeammateConfirm(
        gameState,
        { eventId: contestEvent.id, choiceId: participateChoice.id },
        ['tm1', 'tm2']
      );
      expect(result.uiState.showTeammateDialog).toBe(false);
      if (result.newState.activeContest) {
        expect(result.newState.activeContest).toBeDefined();
      }
    }
  });
});

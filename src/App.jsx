import { useState } from 'react'
import GameControls from './components/GameControls'
import PlayerPanel from './components/PlayerPanel'
import GlobalStatistics from './components/GlobalStatistics'
import Notification from './components/Notification'
import TraitSelectionDialog from './components/TraitSelectionDialog'
import ActivityPanel from './components/ActivityPanel'
import EventPanel from './components/EventPanel'
import EventDialog from './components/EventDialog'
import ContestInProgress from './components/ContestInProgress'
import ContestResultDialog from './components/ContestResultDialog'
import LogPanel from './components/LogPanel'
import { applyTraitEffects } from './data/traits'
import { ACTIVITIES } from './data/activities'
import { scheduleMonthlyEvents } from './data/events'
import { createContestSession, evaluateAttempt, calculateContestOutcome } from './data/contests'

// 游戏常量
const MAX_ATTRIBUTE_VALUE = 10;
const INITIAL_SAN = 100;
const INITIAL_BALANCE = 3000;
const MIN_GPA = 0;
const MAX_GPA = 4.0;

const clampValue = (value, min, max) => Math.max(min, Math.min(max, value));

const applyAttributeChanges = (currentAttributes, changes) => {
  if (!changes) return currentAttributes;
  const updated = { ...currentAttributes };
  Object.entries(changes).forEach(([attr, delta]) => {
    if (updated[attr] === undefined) return;
    updated[attr] = clampValue(updated[attr] + delta, 0, MAX_ATTRIBUTE_VALUE);
  });
  return updated;
};

const clampGPA = (value) => clampValue(value, MIN_GPA, MAX_GPA);

const randomStarterValue = () => Math.floor(Math.random() * 3);

const createBaseAttributes = () => ({
  coding: 0,
  algorithm: randomStarterValue(),
  speed: randomStarterValue(),
  stress: randomStarterValue(),
  teamwork: randomStarterValue(),
  english: randomStarterValue(),
  math: randomStarterValue(),
  dp: 0,
  graph: 0,
  dataStructure: 0,
  string: 0,
  search: 0,
  greedy: randomStarterValue(),
  geometry: randomStarterValue()
});

function App() {
  const [gameState, setGameState] = useState({
    isRunning: false,
    isPaused: false,
    month: 1, // 当前月份 (1-48)
    monthlyAP: 30, // 每月行动点
    remainingAP: 30, // 剩余行动点
    balance: INITIAL_BALANCE, // 余额（金钱）
    san: INITIAL_SAN, // SAN值 (理智值)
    rating: 0, // Rating
    gpa: 3.0, // GPA
    attributes: createBaseAttributes(),
    playerContests: 0,
    playerProblems: 0,
    selectedTraits: [], // 已选择的特性
    pendingEvents: [],
    resolvedEvents: [],
    worldFlags: {},
    eventGraph: {},
    activeContest: null,
    contestTimeRemaining: 0
  });

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showTraitDialog, setShowTraitDialog] = useState(false);
  const [traitsSelected, setTraitsSelected] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [showContestResult, setShowContestResult] = useState(false);
  const [contestOutcome, setContestOutcome] = useState(null);

  // 添加日志
  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setLogs(prev => [...prev, { id: Date.now(), time, message, type }]);
  };

  // 活动定义（外部数据模块提供）
  const activities = ACTIVITIES;

  // 执行活动
  const executeActivity = (activityId) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    // 检查AP是否足够
    if (gameState.remainingAP < activity.cost) {
      addLog(`❌ 行动点不足！需要 ${activity.cost} AP，剩余 ${gameState.remainingAP} AP`, 'error');
      return;
    }

    // 检查游戏是否结束
    if (gameState.month > 48) {
      addLog('❌ 游戏已结束！', 'error');
      return;
    }

    // 执行活动效果
    const effects = activity.effects(gameState);

    // 处理特殊动作：启动比赛
    if (effects.specialAction === 'START_CONTEST') {
      if (gameState.activeContest) {
        addLog('⚠️ 已有正在进行的比赛', 'warning');
        return;
      }

      const contestConfig = activity.contestConfig;
      if (!contestConfig) {
        addLog('❌ 比赛配置错误', 'error');
        return;
      }

      const session = createContestSession(contestConfig);
      addLog(`🏁 开始${session.name}（${session.problems.length} 题，${session.durationMinutes} 分钟）`, 'info');

      setGameState(prev => ({
        ...prev,
        remainingAP: Math.max(0, prev.remainingAP - activity.cost),
        activeContest: session,
        contestTimeRemaining: session.timeRemaining
      }));
      return;
    }

    // 记录日志
    if (effects.log) {
      addLog(effects.log, effects.logType || 'info');
    }

    setGameState(prev => {
      const updatedAttributes = applyAttributeChanges(prev.attributes, effects.attributeChanges);
      const baseRemainingAP = Math.max(0, prev.remainingAP - activity.cost);
      let nextRemainingAP = Math.min(prev.monthlyAP, baseRemainingAP);
      if (effects.apBonus !== undefined) {
        nextRemainingAP = Math.max(0, Math.min(prev.monthlyAP, nextRemainingAP + effects.apBonus));
      }

      const getFieldValue = (field, deltaField) => {
        if (effects[field] !== undefined) return effects[field];
        if (effects[deltaField] !== undefined) return prev[field] + effects[deltaField];
        return prev[field];
      };

      const nextState = {
        ...prev,
        remainingAP: nextRemainingAP,
        playerContests: getFieldValue('playerContests', 'playerContestsDelta'),
        playerProblems: getFieldValue('playerProblems', 'playerProblemsDelta'),
        attributes: updatedAttributes
      };

      if (effects.balance !== undefined) {
        nextState.balance = effects.balance;
      } else if (effects.balanceDelta !== undefined) {
        nextState.balance = Math.max(0, prev.balance + effects.balanceDelta);
      }

      if (effects.san !== undefined) {
        nextState.san = Math.max(0, effects.san);
      } else if (effects.sanDelta !== undefined) {
        nextState.san = Math.max(0, prev.san + effects.sanDelta);
      }

      if (effects.rating !== undefined) {
        nextState.rating = effects.rating;
      } else if (effects.ratingDelta !== undefined) {
        nextState.rating = prev.rating + effects.ratingDelta;
      }

      if (effects.gpa !== undefined) {
        nextState.gpa = clampGPA(effects.gpa);
      } else if (effects.gpaDelta !== undefined) {
        nextState.gpa = clampGPA(prev.gpa + effects.gpaDelta);
      }

      return nextState;
    });
  };

  // 比赛：开始一场模拟赛
  const startContest = () => {
    if (gameState.remainingAP < 10) {
      addLog('❌ 行动点不足！开始比赛需要 10 AP', 'error');
      return;
    }
    if (gameState.activeContest) {
      addLog('⚠️ 已有正在进行的比赛', 'warning');
      return;
    }

    const session = createContestSession();
    addLog(`🏁 开始Codeforces Div.2 比赛（${session.problems.length} 题，${session.durationMinutes} 分钟）`, 'info');
    setGameState(prev => ({
      ...prev,
      remainingAP: Math.max(0, prev.remainingAP - 10),
      activeContest: session,
      contestTimeRemaining: session.timeRemaining
    }));
  };

  const finishContest = (force = false) => {
    setGameState(prev => {
      const session = prev.activeContest;
      if (!session) return prev;

      const outcome = calculateContestOutcome(session, prev.contestTimeRemaining, prev.rating);

      addLog(`📊 比赛结束：解出 ${outcome.solved}/${outcome.total} 题，用时 ${outcome.timeUsed} 分钟`, 'success');

      // 展示结算窗口，等待用户确认后再应用结算
      setContestOutcome(outcome);
      setShowContestResult(true);

      return {
        ...prev,
        activeContest: null,
        contestTimeRemaining: 0
      };
    });
  };

  // 尝试比赛题目
  const attemptContestProblem = (problemId) => {
    setGameState(prev => {
      const session = prev.activeContest;
      if (!session) return prev;
      if (prev.contestTimeRemaining <= 0) return prev;

      const problem = session.problems.find(p => p.id === problemId);
      if (!problem || problem.status === 'solved') return prev;

      if (session.isOrdered) {
        const blocked = session.problems.some(p => p.order < problem.order && p.status !== 'solved');
        if (blocked) return prev;
      }

      const attempt = evaluateAttempt(problem, prev.attributes);

      const updatedProblems = session.problems.map(p => {
        if (p.id !== problemId) return p;
        return {
          ...p,
          status: attempt.success ? 'solved' : 'attempted',
          attempts: (p.attempts || 0) + 1
        };
      });

      const timeRemaining = Math.max(0, prev.contestTimeRemaining - attempt.timeCost);
      const attemptLog = {
        problemId,
        success: attempt.success,
        timeCost: attempt.timeCost,
        weakestAttr: attempt.weakestAttr
      };

      const nextSession = {
        ...session,
        problems: updatedProblems,
        attempts: [...(session.attempts || []), attemptLog],
        timeRemaining
      };

      const solvedAll = updatedProblems.every(p => p.status === 'solved');
      const shouldFinish = solvedAll || timeRemaining <= 0;

      const baseState = {
        ...prev,
        activeContest: nextSession,
        contestTimeRemaining: timeRemaining,
        playerProblems: attempt.success ? prev.playerProblems + 1 : prev.playerProblems
      };

      addLog(`🧩 尝试 ${problem.title}：${attempt.success ? '通过' : '未通过'}，耗时 ${attempt.timeCost} 分钟`, attempt.success ? 'success' : 'warning');

      if (shouldFinish) {
        const outcome = calculateContestOutcome(nextSession, timeRemaining, prev.rating);
        addLog(`📊 比赛结束：解出 ${outcome.solved}/${outcome.total} 题，用时 ${outcome.timeUsed} 分钟`, 'success');

        // 展示结算窗口，等待用户确认后再应用结算
        setContestOutcome(outcome);
        setShowContestResult(true);

        return {
          ...baseState,
          activeContest: null,
          contestTimeRemaining: 0
        };
      }

      return baseState;
    });
  };

  // 推进到下一月
  const advanceMonth = () => {
    const newMonth = gameState.month + 1;

    // 检查游戏是否结束
    if (newMonth > 48) {
      addLog(`🎓 大学四年结束！比赛次数：${gameState.playerContests}，解题数：${gameState.playerProblems}`, 'success');
      setGameState(prev => ({
        ...prev,
        month: newMonth,
        isRunning: false
      }));
      return;
    }

    // 生成当月事件并重置行动点
    const events = scheduleMonthlyEvents(gameState, newMonth);
    addLog(`📅 进入大学 ${Math.ceil(newMonth / 12)} 年 ${((newMonth - 1) % 12) + 1} 月（待处理事件 ${events.length}）`, 'info');

    setGameState(prev => ({
      ...prev,
      month: newMonth,
      remainingAP: prev.monthlyAP,
      pendingEvents: events,
      resolvedEvents: []
    }));
  };

  // 开始游戏
  const startGame = () => {
    if (!traitsSelected) {
      // 如果特性还未选择，显示对话框
      setShowTraitDialog(true);
    } else {
      // 如果特性已选择，直接开始游戏
      setGameState(prev => ({
        ...prev,
        isRunning: true,
        isPaused: false
      }));
      addLog('🎮 游戏继续！', 'info');
    }
  };

  // 暂停/继续游戏
  const togglePause = () => {
    const newPausedState = !gameState.isPaused;
    addLog(newPausedState ? '⏸️ 游戏已暂停' : '▶️ 游戏继续', 'info');
    setGameState(prev => ({
      ...prev,
      isPaused: newPausedState
    }));
  };

  // 重置游戏
  const resetGame = () => {
    if (confirm('确定要重置游戏吗？所有进度将被清除！')) {
      setGameState({
        isRunning: false,
        isPaused: false,
        month: 1,
        monthlyAP: 30,
        remainingAP: 30,
        balance: INITIAL_BALANCE,
        san: INITIAL_SAN,
        rating: 0,
        gpa: 4.0,
        attributes: createBaseAttributes(),
        playerContests: 0,
        playerProblems: 0,
        selectedTraits: [],
        pendingEvents: [],
        resolvedEvents: [],
        worldFlags: {},
        eventGraph: {},
        activeContest: null,
        contestTimeRemaining: 0
      });
      setTraitsSelected(false);
      setLogs([]);
      addLog('🔄 游戏已重置', 'warning');
    }
  };

  // 确认特性选择
  const handleTraitConfirm = (selectedTraitIds) => {
    // 初始属性全为0
    const baseAttributes = createBaseAttributes();

    // 应用特性效果
    const { attributes, sanPenalty, moneyPenalty } = applyTraitEffects(selectedTraitIds, baseAttributes);

    setGameState(prev => ({
      ...prev,
      attributes: attributes,
      san: Math.max(0, INITIAL_SAN - sanPenalty),
      balance: Math.max(0, INITIAL_BALANCE - moneyPenalty),
      selectedTraits: selectedTraitIds,
      isRunning: true,
      isPaused: false,
      month: 1,
      remainingAP: 30,
      pendingEvents: scheduleMonthlyEvents(prev, 1),
      resolvedEvents: [],
      worldFlags: {},
      eventGraph: {},
      activeContest: null,
      contestTimeRemaining: 0
    }));
    setShowTraitDialog(false);
    setTraitsSelected(true);
    setNotification('🎮 游戏开始！你现在是大学一年级的学生，开始你的ACM之旅吧！');
  };

  // 事件处理：打开事件对话框
  const openEventDialog = (eventId) => {
    const ev = (gameState.pendingEvents || []).find(e => e.id === eventId);
    if (!ev) return;
    setCurrentEvent(ev);
    setShowEventDialog(true);
  };

  // 事件选择应用
  const applyEventChoice = (eventId, choiceId) => {
    const ev = (gameState.pendingEvents || []).find(e => e.id === eventId);
    if (!ev) return;
    const choice = ev.choices.find(c => c.id === choiceId);
    if (!choice) return;
    const effects = choice.effects || {};
    const setFlags = choice.setFlags || {};

    // 处理特殊动作：启动比赛
    if (choice.specialAction === 'START_CONTEST') {
      if (gameState.remainingAP < 10) {
        addLog('❌ 行动点不足！参加比赛需要 10 AP', 'error');
        return;
      }
      if (gameState.activeContest) {
        addLog('⚠️ 已有正在进行的比赛', 'warning');
        return;
      }

      const session = createContestSession();
      addLog(`🏁 开始Codeforces比赛（${session.problems.length} 题，${session.durationMinutes} 分钟）`, 'info');

      setGameState(prev => ({
        ...prev,
        remainingAP: Math.max(0, prev.remainingAP - 10),
        activeContest: session,
        contestTimeRemaining: session.timeRemaining,
        pendingEvents: (prev.pendingEvents || []).filter(e => e.id !== eventId)
      }));

      setShowEventDialog(false);
      setCurrentEvent(null);
      return;
    }

    // 记录日志
    addLog(`🗳️ 事件处理：${ev.title} → ${choice.label}`, 'info');

    setGameState(prev => {
      const updatedAttributes = applyAttributeChanges(prev.attributes, effects.attributeChanges);

      const getFieldValue = (field, deltaField) => {
        if (effects[field] !== undefined) return effects[field];
        if (effects[deltaField] !== undefined) return prev[field] + effects[deltaField];
        return prev[field];
      };

      const nextState = {
        ...prev,
        remainingAP: Math.min(prev.monthlyAP, Math.max(0, prev.remainingAP + (effects.apBonus || 0))),
        playerContests: getFieldValue('playerContests', 'playerContestsDelta'),
        playerProblems: getFieldValue('playerProblems', 'playerProblemsDelta'),
        attributes: updatedAttributes
      };

      if (effects.balance !== undefined) {
        nextState.balance = effects.balance;
      } else if (effects.balanceDelta !== undefined) {
        nextState.balance = Math.max(0, prev.balance + effects.balanceDelta);
      }

      if (effects.san !== undefined) {
        nextState.san = Math.max(0, effects.san);
      } else if (effects.sanDelta !== undefined) {
        nextState.san = Math.max(0, prev.san + effects.sanDelta);
      }

      if (effects.rating !== undefined) {
        nextState.rating = effects.rating;
      } else if (effects.ratingDelta !== undefined) {
        nextState.rating = prev.rating + effects.ratingDelta;
      }

      if (effects.gpa !== undefined) {
        nextState.gpa = clampGPA(effects.gpa);
      } else if (effects.gpaDelta !== undefined) {
        nextState.gpa = clampGPA(prev.gpa + effects.gpaDelta);
      }

      // 更新 flags
      nextState.worldFlags = { ...(prev.worldFlags || {}), ...setFlags };

      // 从 pendingEvents 移除该事件，追加到 resolvedEvents
      const remaining = (prev.pendingEvents || []).filter(e => e.id !== eventId);
      const resolvedItem = { id: ev.id, choiceId, time: Date.now() };
      nextState.pendingEvents = remaining;
      nextState.resolvedEvents = [...(prev.resolvedEvents || []), resolvedItem];

      return nextState;
    });

    setShowEventDialog(false);
    setCurrentEvent(null);
  };

  return (
    <div className="container">
      <header>
        <h1>🏆 ACMer选手模拟器</h1>
        <p className="subtitle">体验编程竞赛选手的生活</p>
      </header>

      <div className="app-layout">
        <PlayerPanel
          attributes={gameState.attributes}
          balance={gameState.balance}
          remainingAP={gameState.remainingAP}
          monthlyAP={gameState.monthlyAP}
          san={gameState.san}
          rating={gameState.rating}
          gpa={gameState.gpa}
        />

        <main>
          <GameControls
            gameState={gameState}
            onStart={startGame}
            onTogglePause={togglePause}
            onReset={resetGame}
            onAdvanceMonth={advanceMonth}
          />

          <LogPanel logs={logs} />

          <EventPanel
            pendingEvents={gameState.pendingEvents || []}
            onOpenEvent={openEventDialog}
            canAdvance={(gameState.pendingEvents || []).length === 0}
          />

          {gameState.activeContest && (
            <ContestInProgress
              contest={gameState.activeContest}
              timeRemaining={gameState.contestTimeRemaining}
              onAttempt={attemptContestProblem}
              onFinish={() => finishContest(true)}
            />
          )}

          <ActivityPanel
            activities={activities}
            remainingAP={gameState.remainingAP}
            onExecuteActivity={executeActivity}
            isRunning={gameState.isRunning}
            isPaused={gameState.isPaused}
            gameEnded={gameState.month > 48}
          />
        </main>
      </div>

      <footer>
        <p>© 2025 ACMer选手模拟器</p>
      </footer>

      {notification && (
        <Notification
          message={notification}
          onClose={() => setNotification(null)}
        />
      )}

      {showTraitDialog && !traitsSelected && (
        <TraitSelectionDialog
          onConfirm={handleTraitConfirm}
        />
      )}

      {showEventDialog && currentEvent && (
        <EventDialog
          event={currentEvent}
          onSelectChoice={applyEventChoice}
          onClose={() => { setShowEventDialog(false); setCurrentEvent(null); }}
        />
      )}

      {showContestResult && contestOutcome && (
        <ContestResultDialog
          outcome={contestOutcome}
          onConfirm={() => {
            // 应用结算
            setGameState(prev => ({
              ...prev,
              rating: contestOutcome.isRated && contestOutcome.ratingSource === 'cf'
                ? prev.rating + contestOutcome.ratingDelta
                : prev.rating,
              san: Math.max(0, prev.san + contestOutcome.sanDelta),
              playerContests: prev.playerContests + 1
            }));
            setShowContestResult(false);
            setContestOutcome(null);
          }}
          onClose={() => { setShowContestResult(false); setContestOutcome(null); }}
        />
      )}
    </div>
  );
}

export default App;

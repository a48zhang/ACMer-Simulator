import { useState } from 'react'
import GameControls from './components/GameControls'
import PlayerPanel from './components/PlayerPanel'
import GlobalStatistics from './components/GlobalStatistics'
import Notification from './components/Notification'
import TraitSelectionDialog from './components/TraitSelectionDialog'
import ActivityPanel from './components/ActivityPanel'
import LogPanel from './components/LogPanel'
import { applyTraitEffects } from './data/traits'
import { ACTIVITIES } from './data/activities'

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
    gpa: 4.0, // GPA
    attributes: createBaseAttributes(),
    playerScore: 0,
    playerContests: 0,
    playerProblems: 0,
    selectedTraits: [] // 已选择的特性
  });

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showTraitDialog, setShowTraitDialog] = useState(false);
  const [traitsSelected, setTraitsSelected] = useState(false);
  const [logs, setLogs] = useState([]);

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
        playerScore: getFieldValue('playerScore', 'playerScoreDelta'),
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

  // 推进到下一月
  const advanceMonth = () => {
    const newMonth = gameState.month + 1;

    // 检查游戏是否结束
    if (newMonth > 48) {
      addLog(`🎓 大学四年结束！最终分数：${gameState.playerScore}，比赛次数：${gameState.playerContests}，解题数：${gameState.playerProblems}`, 'success');
      setGameState(prev => ({
        ...prev,
        month: newMonth,
        isRunning: false
      }));
      return;
    }

    // 重置行动点
    addLog(`📅 进入大学 ${Math.ceil(newMonth / 12)} 年 ${((newMonth - 1) % 12) + 1} 月`, 'info');

    setGameState(prev => ({
      ...prev,
      month: newMonth,
      remainingAP: prev.monthlyAP
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
        rating: 1500,
        gpa: 4.0,
        attributes: createBaseAttributes(),
        playerScore: 0,
        playerContests: 0,
        playerProblems: 0,
        selectedTraits: []
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
    const { attributes, sanPenalty } = applyTraitEffects(selectedTraitIds, baseAttributes);

    setGameState(prev => ({
      ...prev,
      attributes: attributes,
      san: Math.max(0, INITIAL_SAN - sanPenalty),
      selectedTraits: selectedTraitIds,
      isRunning: true,
      isPaused: false,
      month: 1,
      remainingAP: 30
    }));
    setShowTraitDialog(false);
    setTraitsSelected(true);
    setNotification('🎮 游戏开始！你现在是大学一年级的学生，开始你的ACM之旅吧！');
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
    </div>
  );
}

export default App;

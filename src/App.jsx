import { useState } from 'react'
import GameControls from './components/GameControls'
import PlayerPanel from './components/PlayerPanel'
import GlobalStatistics from './components/GlobalStatistics'
import Notification from './components/Notification'
import AttributeDialog from './components/AttributeDialog'
import ActivityPanel from './components/ActivityPanel'

// 游戏常量
const ATTRIBUTE_MULTIPLIERS = {
  // 通用属性
  CODING: 10,
  ALGORITHM: 12,
  SPEED: 8,
  STRESS: 6,
  TEAMWORK: 7,
  ENGLISH: 5,
  // 专业属性
  MATH: 15,
  DP: 13,
  GRAPH: 13,
  DATA_STRUCTURE: 13,
  STRING: 12,
  SEARCH: 12,
  GREEDY: 11,
  GEOMETRY: 14
};

const MAX_ATTRIBUTE_VALUE = 10;
const SUCCESS_RATE_DIVISOR = 40;

function App() {
  const [gameState, setGameState] = useState({
    isRunning: false,
    isPaused: false,
    month: 1, // 当前月份 (1-48)
    monthlyAP: 30, // 每月行动点
    remainingAP: 30, // 剩余行动点
    availablePoints: 20,
    attributes: {
      // 通用属性
      coding: 0,
      algorithm: 0,
      speed: 0,
      stress: 0,
      teamwork: 0,
      english: 0,
      // 专业属性
      math: 0,
      dp: 0,
      graph: 0,
      dataStructure: 0,
      string: 0,
      search: 0,
      greedy: 0,
      geometry: 0
    },
    playerScore: 0,
    playerContests: 0,
    playerProblems: 0
  });

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showAttributeDialog, setShowAttributeDialog] = useState(false);
  const [attributesAllocated, setAttributesAllocated] = useState(false);

  // 活动定义
  const activities = [
    {
      id: 'practice',
      name: '刷题',
      cost: 5,
      description: '进行日常刷题训练，提升解题能力',
      effects: (state) => {
        // 每次尝试8-12次解题
        const attempts = Math.floor(Math.random() * 5) + 8;
        let solved = 0;
        let scoreGain = 0;
        for (let i = 0; i < attempts; i++) {
          if (solveProblem(state.attributes)) {
            solved++;
            scoreGain += 5;
          }
        }
        return {
          playerProblems: state.playerProblems + solved,
          playerScore: state.playerScore + scoreGain,
          notification: `📚 刷题训练完成！解决了 ${solved}/${attempts} 道题，获得 ${scoreGain} 分！`
        };
      },
      repeatable: true
    },
    {
      id: 'algorithm_training',
      name: '算法训练',
      cost: 8,
      description: '进行专项算法训练，提升算法能力',
      effects: (state) => {
        const scoreGain = Math.floor(Math.random() * 30) + 20;
        return {
          playerScore: state.playerScore + scoreGain,
          notification: `🧮 算法训练完成！获得 ${scoreGain} 分提升！`
        };
      },
      repeatable: true
    },
    {
      id: 'mock_contest',
      name: '模拟赛',
      cost: 12,
      description: '参加模拟比赛，全面锻炼比赛能力',
      effects: (state) => {
        const contestScore = participateInContest(state.attributes);
        return {
          playerContests: state.playerContests + 1,
          playerScore: state.playerScore + contestScore,
          notification: `🏆 参加了一场模拟赛！获得 ${contestScore} 分！`
        };
      },
      repeatable: true
    },
    {
      id: 'rest',
      name: '休息',
      cost: 3,
      description: '放松休息，恢复状态',
      effects: (state) => {
        return {
          notification: `😌 休息了一段时间，精神状态恢复！`
        };
      },
      repeatable: true
    }
  ];

  // 参加比赛
  const participateInContest = (attributes) => {
    const baseScore = 100;
    // 通用属性
    const codingBonus = attributes.coding * ATTRIBUTE_MULTIPLIERS.CODING;
    const algorithmBonus = attributes.algorithm * ATTRIBUTE_MULTIPLIERS.ALGORITHM;
    const speedBonus = attributes.speed * ATTRIBUTE_MULTIPLIERS.SPEED;
    const stressBonus = attributes.stress * ATTRIBUTE_MULTIPLIERS.STRESS;
    const teamworkBonus = attributes.teamwork * ATTRIBUTE_MULTIPLIERS.TEAMWORK;
    const englishBonus = attributes.english * ATTRIBUTE_MULTIPLIERS.ENGLISH;
    // 专业属性
    const mathBonus = attributes.math * ATTRIBUTE_MULTIPLIERS.MATH;
    const dpBonus = attributes.dp * ATTRIBUTE_MULTIPLIERS.DP;
    const graphBonus = attributes.graph * ATTRIBUTE_MULTIPLIERS.GRAPH;
    const dataStructureBonus = attributes.dataStructure * ATTRIBUTE_MULTIPLIERS.DATA_STRUCTURE;
    const stringBonus = attributes.string * ATTRIBUTE_MULTIPLIERS.STRING;
    const searchBonus = attributes.search * ATTRIBUTE_MULTIPLIERS.SEARCH;
    const greedyBonus = attributes.greedy * ATTRIBUTE_MULTIPLIERS.GREEDY;
    const geometryBonus = attributes.geometry * ATTRIBUTE_MULTIPLIERS.GEOMETRY;

    return baseScore + codingBonus + algorithmBonus +
      speedBonus + stressBonus + teamworkBonus + englishBonus +
      mathBonus + dpBonus + graphBonus + dataStructureBonus +
      stringBonus + searchBonus + greedyBonus + geometryBonus +
      Math.floor(Math.random() * 50);
  };

  // 解题
  const solveProblem = (attributes) => {
    const successRate = (attributes.coding + attributes.algorithm + 
      attributes.math + attributes.dp + attributes.graph + attributes.dataStructure +
      attributes.string + attributes.search + attributes.greedy + attributes.geometry) / SUCCESS_RATE_DIVISOR;
    return Math.random() < successRate;
  };

  // 执行活动
  const executeActivity = (activityId) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    setGameState(prev => {
      // 检查AP是否足够
      if (prev.remainingAP < activity.cost) {
        setNotification(`❌ 行动点不足！需要 ${activity.cost} AP，剩余 ${prev.remainingAP} AP`);
        return prev;
      }

      // 检查游戏是否结束
      if (prev.month > 48) {
        setNotification('❌ 游戏已结束！');
        return prev;
      }

      // 执行活动效果
      const effects = activity.effects(prev);
      
      // 显示通知
      if (effects.notification) {
        setNotification(effects.notification);
      }

      // 返回更新后的状态
      return {
        ...prev,
        remainingAP: prev.remainingAP - activity.cost,
        playerScore: effects.playerScore !== undefined ? effects.playerScore : prev.playerScore,
        playerContests: effects.playerContests !== undefined ? effects.playerContests : prev.playerContests,
        playerProblems: effects.playerProblems !== undefined ? effects.playerProblems : prev.playerProblems
      };
    });
  };

  // 推进到下一月
  const advanceMonth = () => {
    setGameState(prev => {
      const newMonth = prev.month + 1;
      
      // 检查游戏是否结束
      if (newMonth > 48) {
        setNotification(`🎓 大学四年结束！最终分数：${prev.playerScore}，比赛次数：${prev.playerContests}，解题数：${prev.playerProblems}`);
        return {
          ...prev,
          month: newMonth,
          isRunning: false
        };
      }

      // 重置行动点
      setNotification(`📅 进入大学 ${Math.ceil(newMonth / 12)} 年 ${((newMonth - 1) % 12) + 1} 月`);
      
      return {
        ...prev,
        month: newMonth,
        remainingAP: prev.monthlyAP
      };
    });
  };

  // 开始游戏
  const startGame = () => {
    if (!attributesAllocated) {
      // 如果属性还未分配，显示对话框
      setShowAttributeDialog(true);
    } else {
      // 如果属性已分配，直接开始游戏
      setGameState(prev => ({
        ...prev,
        isRunning: true,
        isPaused: false
      }));
    }
  };

  // 暂停/继续游戏
  const togglePause = () => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
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
        availablePoints: 20,
        attributes: {
          // 通用属性
          coding: 0,
          algorithm: 0,
          speed: 0,
          stress: 0,
          teamwork: 0,
          english: 0,
          // 专业属性
          math: 0,
          dp: 0,
          graph: 0,
          dataStructure: 0,
          string: 0,
          search: 0,
          greedy: 0,
          geometry: 0
        },
        playerScore: 0,
        playerContests: 0,
        playerProblems: 0
      });
      setAttributesAllocated(false);
    }
  };

  // 增加属性点
  const increaseAttribute = (attr) => {
    setGameState(prev => {
      if (prev.availablePoints > 0 && prev.attributes[attr] < MAX_ATTRIBUTE_VALUE) {
        return {
          ...prev,
          availablePoints: prev.availablePoints - 1,
          attributes: {
            ...prev.attributes,
            [attr]: prev.attributes[attr] + 1
          }
        };
      }
      return prev;
    });
  };

  // 确认属性分配
  const handleAttributeConfirm = (allocatedAttributes) => {
    setGameState(prev => ({
      ...prev,
      attributes: allocatedAttributes,
      availablePoints: 0,
      isRunning: true,
      isPaused: false,
      month: 1,
      remainingAP: 30
    }));
    setShowAttributeDialog(false);
    setAttributesAllocated(true);
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
          score={gameState.playerScore}
          contests={gameState.playerContests}
          problems={gameState.playerProblems}
          leaderboardData={leaderboardData}
        />

        <main>
          <GameControls
            gameState={gameState}
            onStart={startGame}
            onTogglePause={togglePause}
            onReset={resetGame}
            onAdvanceMonth={advanceMonth}
          />

          <ActivityPanel
            activities={activities}
            remainingAP={gameState.remainingAP}
            onExecuteActivity={executeActivity}
            isRunning={gameState.isRunning}
            isPaused={gameState.isPaused}
            gameEnded={gameState.month > 48}
          />

          <GlobalStatistics
            leaderboardData={leaderboardData}
            playerScore={gameState.playerScore}
          />
        </main>
      </div>

      <footer>
        <p>© 2024 ACMer选手模拟器 | 让每个人都能体验XCPC的乐趣</p>
      </footer>

      {notification && (
        <Notification
          message={notification}
          onClose={() => setNotification(null)}
        />
      )}

      {showAttributeDialog && !attributesAllocated && (
        <AttributeDialog
          onConfirm={handleAttributeConfirm}
          initialPoints={20}
          maxValue={MAX_ATTRIBUTE_VALUE}
        />
      )}
    </div>
  );
}

export default App;

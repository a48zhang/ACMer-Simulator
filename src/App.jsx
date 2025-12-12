import { useState, useEffect } from 'react'
import GameControls from './components/GameControls'
import AttributeAllocation from './components/AttributeAllocation'
import GlobalStatistics from './components/GlobalStatistics'
import PlayerStatus from './components/PlayerStatus'
import Notification from './components/Notification'

// 游戏常量
const ATTRIBUTE_MULTIPLIERS = {
  CODING: 10,
  ALGORITHM: 12,
  SPEED: 8,
  STRESS: 6,
  TEAMWORK: 7
};

const MAX_ATTRIBUTE_VALUE = 10;
const SUCCESS_RATE_DIVISOR = 20;

function App() {
  const [gameState, setGameState] = useState({
    isRunning: false,
    isPaused: false,
    gameTime: 0,
    availablePoints: 10,
    attributes: {
      coding: 0,
      algorithm: 0,
      speed: 0,
      stress: 0,
      teamwork: 0
    },
    playerScore: 0,
    playerContests: 0,
    playerProblems: 0
  });

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [notification, setNotification] = useState(null);

  // 游戏循环
  useEffect(() => {
    if (!gameState.isRunning || gameState.isPaused) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        const newTime = prev.gameTime + 1;
        let newScore = prev.playerScore;
        let newContests = prev.playerContests;
        let newProblems = prev.playerProblems;
        let message = null;

        // 每5天参加一次比赛
        if (newTime % 5 === 0) {
          const contestScore = participateInContest(prev.attributes);
          newScore += contestScore;
          newContests += 1;
          message = `🏆 参加了一场比赛！获得 ${contestScore} 分！`;
        }

        // 每天解题
        const problemSolved = solveProblem(prev.attributes);
        if (problemSolved) {
          newProblems += 1;
          newScore += 5;
        }

        if (message) {
          setNotification(message);
        }

        return {
          ...prev,
          gameTime: newTime,
          playerScore: newScore,
          playerContests: newContests,
          playerProblems: newProblems
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.isRunning, gameState.isPaused]);

  // 参加比赛
  const participateInContest = (attributes) => {
    const baseScore = 100;
    const codingBonus = attributes.coding * ATTRIBUTE_MULTIPLIERS.CODING;
    const algorithmBonus = attributes.algorithm * ATTRIBUTE_MULTIPLIERS.ALGORITHM;
    const speedBonus = attributes.speed * ATTRIBUTE_MULTIPLIERS.SPEED;
    const stressBonus = attributes.stress * ATTRIBUTE_MULTIPLIERS.STRESS;
    const teamworkBonus = attributes.teamwork * ATTRIBUTE_MULTIPLIERS.TEAMWORK;

    return baseScore + codingBonus + algorithmBonus +
      speedBonus + stressBonus + teamworkBonus +
      Math.floor(Math.random() * 50);
  };

  // 解题
  const solveProblem = (attributes) => {
    const successRate = (attributes.coding + attributes.algorithm) / SUCCESS_RATE_DIVISOR;
    return Math.random() < successRate;
  };

  // 开始游戏
  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false
    }));
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
        gameTime: 0,
        availablePoints: 10,
        attributes: {
          coding: 0,
          algorithm: 0,
          speed: 0,
          stress: 0,
          teamwork: 0
        },
        playerScore: 0,
        playerContests: 0,
        playerProblems: 0
      });
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

  // 减少属性点
  const decreaseAttribute = (attr) => {
    setGameState(prev => {
      if (prev.attributes[attr] > 0) {
        return {
          ...prev,
          availablePoints: prev.availablePoints + 1,
          attributes: {
            ...prev.attributes,
            [attr]: prev.attributes[attr] - 1
          }
        };
      }
      return prev;
    });
  };

  return (
    <div className="container">
      <header>
        <h1>🏆 ACMer选手模拟器</h1>
        <p className="subtitle">体验编程竞赛选手的生活</p>
      </header>

      <main>
        <GameControls
          gameState={gameState}
          onStart={startGame}
          onTogglePause={togglePause}
          onReset={resetGame}
        />

        <AttributeAllocation
          attributes={gameState.attributes}
          availablePoints={gameState.availablePoints}
          onIncrease={increaseAttribute}
          onDecrease={decreaseAttribute}
        />

        <GlobalStatistics
          leaderboardData={leaderboardData}
          playerScore={gameState.playerScore}
        />

        <PlayerStatus
          score={gameState.playerScore}
          contests={gameState.playerContests}
          problems={gameState.playerProblems}
          leaderboardData={leaderboardData}
        />
      </main>

      <footer>
        <p>© 2024 ACMer选手模拟器 | 让每个人都能体验XCPC的乐趣</p>
      </footer>

      {notification && (
        <Notification
          message={notification}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default App;

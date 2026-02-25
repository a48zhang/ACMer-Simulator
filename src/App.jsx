import { useState } from 'react'
import GameControls from './components/GameControls'
import PlayerPanel from './components/PlayerPanel'
import GlobalStatistics from './components/GlobalStatistics'
import Notification from './components/Notification'
import TraitSelectionDialog from './components/TraitSelectionDialog'
import TeammateSelectionDialog from './components/TeammateSelectionDialog'
import ActivityPanel from './components/ActivityPanel'
import EventPanel from './components/EventPanel'
import EventDialog from './components/EventDialog'
import ContestInProgress from './components/ContestInProgress'
import ContestResultDialog from './components/ContestResultDialog'
import ConfirmDialog from './components/ConfirmDialog'
import GameOverDialog from './components/GameOverDialog'
import LogPanel from './components/LogPanel'
import IntroPanel from './components/IntroPanel'
import TraitSelectionPanel from './components/TraitSelectionPanel'
import PracticeContestSelectionDialog from './components/PracticeContestSelectionDialog'
import { applyTraitEffects } from './data/traits'
import { ACTIVITIES } from './data/activities'
import { scheduleMonthlyEvents } from './data/events'
import { createContestSession, evaluateAttempt, calculateContestOutcome, readProblem, thinkProblem, codeProblem, debugProblem } from './data/contests'

// 游戏常量
const MAX_ATTRIBUTE_VALUE = 10;
const INITIAL_SAN = 100;
const INITIAL_BALANCE = 3000;
const MIN_GPA = 0;
const MAX_GPA = 4.0;
const INITIAL_GPA = 3.2;
const START_MONTH = 1; // 游戏从第1个月开始（大一9月）
const END_MONTH = 46; // 游戏在第46个月结束（大四6月，即第五年6月）

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
    month: START_MONTH, // 当前月份 (从9开始，大一9月)
    monthlyAP: 30, // 每月行动点
    remainingAP: 30, // 剩余行动点
    balance: INITIAL_BALANCE, // 余额（金钱）
    monthlyAllowance: 1500, // 每月家里打的生活费（固定值，可被事件改变）
    san: INITIAL_SAN, // SAN值 (理智值)
    rating: 0, // Rating
    gpa: INITIAL_GPA, // GPA (初始3.2)
    attributes: createBaseAttributes(),
    playerContests: 0,
    playerProblems: 0,
    selectedTraits: [], // 已选择的特性
    pendingEvents: [],
    resolvedEvents: [],
    worldFlags: {},
    eventGraph: {},
    activeContest: null,
    contestTimeRemaining: 0,
    teammates: [], // 队友列表
    selectedTeam: null, // 当前选择的队伍
    buffs: { // Buff系统
      failedCourses: 0, // 挂科次数
      academicWarnings: 0 // 学业警告次数
    }
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
  const [showTeammateDialog, setShowTeammateDialog] = useState(false);
  const [showPracticeContestDialog, setShowPracticeContestDialog] = useState(false);
  const [pendingEventChoice, setPendingEventChoice] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null); // { message, onConfirm }
  const [gameOverReason, setGameOverReason] = useState(null); // null | 'graduation' | string (dismissal reason)
  const [gamePhase, setGamePhase] = useState('intro'); // 'intro' | 'traitSelection' | 'playing'

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
    if (gameState.month > END_MONTH) {
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

    // 处理特殊动作：打开练习赛选择对话框
    if (effects.specialAction === 'OPEN_PRACTICE_CONTEST_DIALOG') {
      setShowPracticeContestDialog(true);
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

      // 处理setFlags
      if (effects.setFlags) {
        nextState.worldFlags = { ...(prev.worldFlags || {}), ...effects.setFlags };
      }

      if (effects.balance !== undefined) {
        nextState.balance = effects.balance;
      } else if (effects.balanceDelta !== undefined) {
        nextState.balance = Math.max(0, prev.balance + effects.balanceDelta);
      }

      if (effects.san !== undefined) {
        nextState.san = clampValue(effects.san, 0, INITIAL_SAN);
      } else if (effects.sanDelta !== undefined) {
        nextState.san = clampValue(prev.san + effects.sanDelta, 0, INITIAL_SAN);
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



  const finishContest = (force = false) => {
    const session = gameState.activeContest;
    if (!session) return;

    const outcome = calculateContestOutcome(session, gameState.contestTimeRemaining, gameState.rating);
    addLog(`📊 比赛结束：解出 ${outcome.solved}/${outcome.total} 题，用时 ${outcome.timeUsed} 分钟`, 'success');
    
    setContestOutcome(outcome);
    setShowContestResult(true);
    
    setGameState(prev => ({
      ...prev,
      activeContest: null,
      contestTimeRemaining: 0
    }));
  };

  // 读题阶段
  const readContestProblem = (problemId) => {
    const session = gameState.activeContest;
    if (!session) return;
    if (gameState.contestTimeRemaining <= 0) return;

    const problem = session.problems.find(p => p.id === problemId);
    if (!problem || problem.status !== 'pending') return;

    const readResult = readProblem(problem, gameState.attributes);
    addLog(`📖 阅读题目 ${problem.letter}：耗时 ${readResult.readTime} 分钟，揭露标签 ${readResult.tags.join('、')}`, 'info');

    const timeRemaining = Math.max(0, gameState.contestTimeRemaining - readResult.readTime);

    const updatedProblems = session.problems.map(p => {
      if (p.id !== problemId) return p;
      return {
        ...p,
        status: 'coding',
        revealedInfo: readResult
      };
    });

    const nextSession = {
      ...session,
      problems: updatedProblems,
      timeRemaining
    };

    const solvedAll = updatedProblems.every(p => p.status === 'solved');
    const shouldFinish = solvedAll || timeRemaining <= 0;

    if (shouldFinish) {
      const outcome = calculateContestOutcome(nextSession, timeRemaining, gameState.rating);
      addLog(`📊 比赛结束：解出 ${outcome.solved}/${outcome.total} 题，用时 ${outcome.timeUsed} 分钟`, 'success');
      setContestOutcome(outcome);
      setShowContestResult(true);
      
      setGameState(prev => ({
        ...prev,
        activeContest: null,
        contestTimeRemaining: 0
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        activeContest: nextSession,
        contestTimeRemaining: timeRemaining
      }));
    }
  };

  // 思考阶段
  const thinkContestProblem = (problemId) => {
    const session = gameState.activeContest;
    if (!session) return;
    if (gameState.contestTimeRemaining <= 0) return;

    const problem = session.problems.find(p => p.id === problemId);
    if (!problem) return;
    if (problem.status !== 'coding' && problem.status !== 'submitted_fail') return;
    if (problem.thinkBonus >= 2) return; // 最多2次思考加成

    const thinkResult = thinkProblem(problem, gameState.attributes);
    addLog(`🧠 思考题目 ${problem.letter}：耗时 ${thinkResult.thinkTime} 分钟`, 'info');

    const timeRemaining = Math.max(0, gameState.contestTimeRemaining - thinkResult.thinkTime);

    const updatedProblems = session.problems.map(p => {
      if (p.id !== problemId) return p;
      const updatedProblem = {
        ...p,
        thinkBonus: thinkResult.newThinkBonus
      };
      if (thinkResult.newTags && problem.revealedInfo) {
        updatedProblem.revealedInfo = {
          ...problem.revealedInfo,
          tags: thinkResult.newTags
        };
      }
      return updatedProblem;
    });

    const nextSession = {
      ...session,
      problems: updatedProblems,
      timeRemaining
    };

    const solvedAll = updatedProblems.every(p => p.status === 'solved');
    const shouldFinish = solvedAll || timeRemaining <= 0;

    if (shouldFinish) {
      const outcome = calculateContestOutcome(nextSession, timeRemaining, gameState.rating);
      addLog(`📊 比赛结束：解出 ${outcome.solved}/${outcome.total} 题，用时 ${outcome.timeUsed} 分钟`, 'success');
      setContestOutcome(outcome);
      setShowContestResult(true);
      
      setGameState(prev => ({
        ...prev,
        activeContest: null,
        contestTimeRemaining: 0
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        activeContest: nextSession,
        contestTimeRemaining: timeRemaining
      }));
    }
  };

  // 写代码阶段
  const codeContestProblem = (problemId) => {
    const session = gameState.activeContest;
    if (!session) return;
    if (gameState.contestTimeRemaining <= 0) return;

    const problem = session.problems.find(p => p.id === problemId);
    if (!problem) return;
    if (problem.status !== 'coding' && problem.status !== 'submitted_fail') return;
    if (problem.hasWrittenCode) return;

    const codeResult = codeProblem(problem, gameState.attributes);
    addLog(`💻 写代码题目 ${problem.letter}：耗时 ${codeResult.codeTime} 分钟`, 'info');

    const timeRemaining = Math.max(0, gameState.contestTimeRemaining - codeResult.codeTime);

    const updatedProblems = session.problems.map(p => {
      if (p.id !== problemId) return p;
      return {
        ...p,
        hasWrittenCode: true,
        hasBug: codeResult.hasBug
      };
    });

    const nextSession = {
      ...session,
      problems: updatedProblems,
      timeRemaining
    };

    const solvedAll = updatedProblems.every(p => p.status === 'solved');
    const shouldFinish = solvedAll || timeRemaining <= 0;

    if (shouldFinish) {
      const outcome = calculateContestOutcome(nextSession, timeRemaining, gameState.rating);
      addLog(`📊 比赛结束：解出 ${outcome.solved}/${outcome.total} 题，用时 ${outcome.timeUsed} 分钟`, 'success');
      setContestOutcome(outcome);
      setShowContestResult(true);
      
      setGameState(prev => ({
        ...prev,
        activeContest: null,
        contestTimeRemaining: 0
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        activeContest: nextSession,
        contestTimeRemaining: timeRemaining
      }));
    }
  };

  // 对拍阶段
  const debugContestProblem = (problemId) => {
    const session = gameState.activeContest;
    if (!session) return;
    if (gameState.contestTimeRemaining <= 0) return;

    const problem = session.problems.find(p => p.id === problemId);
    if (!problem) return;
    if (problem.status !== 'coding' && problem.status !== 'submitted_fail') return;

    const debugResult = debugProblem(problem, gameState.attributes);
    
    if (debugResult.foundBug) {
      addLog(`🔍 对拍题目 ${problem.letter}：耗时 ${debugResult.debugTime} 分钟，发现了bug！需要重新写代码`, 'success');
    } else if (debugResult.bonusIncrease > 0) {
      addLog(`🔍 对拍题目 ${problem.letter}：耗时 ${debugResult.debugTime} 分钟，获得额外加成`, 'info');
    } else {
      addLog(`🔍 对拍题目 ${problem.letter}：耗时 ${debugResult.debugTime} 分钟，未发现异常`, 'info');
    }

    const timeRemaining = Math.max(0, gameState.contestTimeRemaining - debugResult.debugTime);

    const updatedProblems = session.problems.map(p => {
      if (p.id !== problemId) return p;
      return {
        ...p,
        debugBonus: debugResult.newDebugBonus,
        bugFound: p.bugFound || debugResult.foundBug,
        thinkBonus: debugResult.bonusIncrease > 0 ? p.thinkBonus + debugResult.bonusIncrease : p.thinkBonus,
        hasBug: debugResult.foundBug ? false : p.hasBug,
        hasWrittenCode: debugResult.foundBug ? false : p.hasWrittenCode
      };
    });

    const nextSession = {
      ...session,
      problems: updatedProblems,
      timeRemaining
    };

    const solvedAll = updatedProblems.every(p => p.status === 'solved');
    const shouldFinish = solvedAll || timeRemaining <= 0;

    if (shouldFinish) {
      const outcome = calculateContestOutcome(nextSession, timeRemaining, gameState.rating);
      addLog(`📊 比赛结束：解出 ${outcome.solved}/${outcome.total} 题，用时 ${outcome.timeUsed} 分钟`, 'success');
      setContestOutcome(outcome);
      setShowContestResult(true);
      
      setGameState(prev => ({
        ...prev,
        activeContest: null,
        contestTimeRemaining: 0
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        activeContest: nextSession,
        contestTimeRemaining: timeRemaining
      }));
    }
  };

  // 尝试比赛题目
  const attemptContestProblem = (problemId) => {
    const session = gameState.activeContest;
    if (!session) return;
    if (gameState.contestTimeRemaining <= 0) return;

    const problem = session.problems.find(p => p.id === problemId);
    if (!problem || problem.status === 'solved') return;
    if (problem.status !== 'coding' && problem.status !== 'submitted_fail') return;

    if (session.isOrdered) {
      const blocked = session.problems.some(p => p.order < problem.order && p.status !== 'solved');
      if (blocked) return;
    }

    const attempt = evaluateAttempt(problem, gameState.attributes, problem.thinkBonus, problem.debugBonus || 0);

    const updatedProblems = session.problems.map(p => {
      if (p.id !== problemId) return p;
      return {
        ...p,
        status: attempt.success ? 'solved' : 'submitted_fail',
        attempts: (p.attempts || 0) + 1
      };
    });

    const timeRemaining = Math.max(0, gameState.contestTimeRemaining - attempt.timeCost);
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

    addLog(`🧩 尝试题目 ${problem.letter}：${attempt.success ? '通过' : '未通过'}，耗时 ${attempt.timeCost} 分钟`, attempt.success ? 'success' : 'warning');

    const solvedAll = updatedProblems.every(p => p.status === 'solved');
    const shouldFinish = solvedAll || timeRemaining <= 0;

    if (shouldFinish) {
      const outcome = calculateContestOutcome(nextSession, timeRemaining, gameState.rating);
      addLog(`📊 比赛结束：解出 ${outcome.solved}/${outcome.total} 题，用时 ${outcome.timeUsed} 分钟`, 'success');
      setContestOutcome(outcome);
      setShowContestResult(true);
      
      setGameState(prev => ({
        ...prev,
        activeContest: null,
        contestTimeRemaining: 0,
        playerProblems: attempt.success ? prev.playerProblems + 1 : prev.playerProblems
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        activeContest: nextSession,
        contestTimeRemaining: timeRemaining,
        playerProblems: attempt.success ? prev.playerProblems + 1 : prev.playerProblems
      }));
    }
  };

  // 推进到下一月
  const advanceMonth = () => {
    const newMonth = gameState.month + 1;

    // 检查游戏是否结束
    if (newMonth > END_MONTH) {
      addLog(`🎓 游戏结束！比赛次数：${gameState.playerContests}，解题数：${gameState.playerProblems}`, 'success');
      setGameState(prev => ({
        ...prev,
        month: newMonth,
        isRunning: false
      }));
      setGameOverReason('graduation');
      return;
    }

    // 计算本月日历月份（提前计算，用于假期判定）
    const monthsSinceStartEarly = newMonth - 1;
    const totalCalMonthEarly = 9 + monthsSinceStartEarly;
    const calendarMonthForGpa = ((totalCalMonthEarly - 1) % 12) + 1;

    // 假期月份（2月寒假、7-8月暑假）不上课、不掉GPA
    const isHolidayMonth = calendarMonthForGpa === 2 || calendarMonthForGpa === 7 || calendarMonthForGpa === 8;

    // 月度GPA扣除
    let gpaDeduction = 0;
    if (!isHolidayMonth) {
      const baseGpaDeduction = 0.05; // 每月基础扣除（已增大）
      gpaDeduction = baseGpaDeduction;
      // 如果一个月没有上课，额外扣除GPA（检查上课活动是否执行）
      const attendedClass = gameState.worldFlags?.attendedClassThisMonth || false;
      if (!attendedClass && Math.random() < 0.3) {
        gpaDeduction += 0.15; // 30%概率额外扣除平时分（已增大）
        addLog('⚠️ 本月未上课，GPA额外扣除！', 'warning');
      }
    } else {
      addLog(`🏖️ 假期月，无需上课，GPA不扣除`, 'info');
    }

    const newGpa = clampGPA(gameState.gpa - gpaDeduction);

    // 月度经济结算：家里打生活费 + 随机生活支出
    const allowance = gameState.monthlyAllowance || 1500;
    const expense = Math.floor(Math.random() * 701) + 800; // 800-1500 随机支出
    const netBalance = Math.max(0, gameState.balance + allowance - expense);
    addLog(`💰 家里打生活费 +${allowance}，本月支出 -${expense}，余额：${netBalance}`, 'info');

    // SAN=0 惩罚：下月AP减半
    const sanWasBurntOut = gameState.san <= 0;
    const baseMonthlyAP = gameState.monthlyAP;
    const nextMonthlyAP = sanWasBurntOut ? Math.floor(baseMonthlyAP / 2) : baseMonthlyAP;
    if (sanWasBurntOut) {
      addLog('😵 SAN值耗尽！本月精力大幅下降，行动点减半！', 'error');
    }

    // 生成当月事件并重置行动点
    const events = scheduleMonthlyEvents(gameState, newMonth);
    
    // 复用已计算的日历月份（上方已算出 calendarMonthForGpa）
    const calendarMonth = calendarMonthForGpa;
    
    // 计算学年（大一、大二、大三、大四）
    let academicYear;
    if (newMonth <= 4) {
      academicYear = 1;
    } else {
      const monthsAfterFirstSemester = newMonth - 5;
      const completedYears = Math.floor(monthsAfterFirstSemester / 12);
      if (calendarMonth < 9) {
        academicYear = completedYears + 1;
      } else {
        academicYear = completedYears + 2;
      }
    }
    
    addLog(`📅 进入大学 ${academicYear} 年 ${calendarMonth} 月（待处理事件 ${events.length}）`, 'info');

    setGameState(prev => ({
      ...prev,
      month: newMonth,
      gpa: newGpa,
      balance: netBalance,
      remainingAP: nextMonthlyAP,
      pendingEvents: events,
      resolvedEvents: [],
      worldFlags: { ...(prev.worldFlags || {}), attendedClassThisMonth: false } // 重置上课标记
    }));
  };

  // 开始游戏
  const startGame = () => {
    if (gamePhase === 'intro') {
      setGamePhase('traitSelection');
    } else if (gamePhase === 'traitSelection') {
      // 如果特性已选择，直接开始游戏
      setGameState(prev => ({
        ...prev,
        isRunning: true,
        isPaused: false
      }));
      addLog('🎮 游戏开始！祝你好运！', 'info');
    } else {
      // 继续游戏
      setGameState(prev => ({
        ...prev,
        isRunning: true,
        isPaused: false
      }));
      addLog('🎮 游戏继续！', 'info');
    }
  };

  // 处理特性选择确认
  const handleTraitConfirm = (selectedTraitIds) => {
    // 应用特性效果
    const { attributes, sanPenalty, moneyPenalty } = applyTraitEffects(selectedTraitIds, gameState.attributes);

    // 初始化默认队友
    const defaultTeammates = [
      {
        id: 'teammate_lu_renjia',
        name: '陆任佳',
        attributes: {
          coding: 1, algorithm: 1, speed: 1, stress: 1, teamwork: 1, english: 1,
          math: 1, dp: 1, graph: 1, dataStructure: 1, string: 1, search: 1, greedy: 1, geometry: 1
        },
        unlocked: true
      },
      {
        id: 'teammate_lu_renyi',
        name: '路仁义',
        attributes: {
          coding: 1, algorithm: 1, speed: 1, stress: 1, teamwork: 1, english: 1,
          math: 1, dp: 1, graph: 1, dataStructure: 1, string: 1, search: 1, greedy: 1, geometry: 1
        },
        unlocked: true
      }
    ];

    setGameState(prev => ({
      ...prev,
      attributes: attributes,
      san: Math.max(0, INITIAL_SAN - sanPenalty),
      balance: Math.max(0, INITIAL_BALANCE - moneyPenalty),
      selectedTraits: selectedTraitIds,
      isRunning: true,
      isPaused: false,
      month: START_MONTH,
      gpa: INITIAL_GPA,
      remainingAP: 30,
      pendingEvents: scheduleMonthlyEvents(prev, START_MONTH),
      resolvedEvents: [],
      worldFlags: {},
      eventGraph: {},
      activeContest: null,
      contestTimeRemaining: 0,
      teammates: defaultTeammates,
      selectedTeam: null,
      buffs: {
        failedCourses: 0,
        academicWarnings: 0
      }
    }));
    setTraitsSelected(true);
    setGamePhase('playing');
    setNotification('🎮 游戏开始！你现在是大学一年级的学生，开始你的ACM之旅吧！');
  };

  // 处理练习赛选择
  const handlePracticeContestSelect = (contestConfig) => {
    setShowPracticeContestDialog(false);
    
    if (gameState.activeContest) {
      addLog('⚠️ 已有正在进行的比赛', 'warning');
      return;
    }

    const activity = ACTIVITIES.find(a => a.id === 'practice_contest');
    if (!activity) return;

    const session = createContestSession(contestConfig);
    addLog(`🏁 开始${session.name}（${session.problems.length} 题，${session.durationMinutes} 分钟）`, 'info');

    setGameState(prev => ({
      ...prev,
      remainingAP: Math.max(0, prev.remainingAP - contestConfig.cost),
      activeContest: session,
      contestTimeRemaining: session.timeRemaining
    }));
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
    setConfirmDialog({
      message: '确定要重置游戏吗？所有进度将被清除！',
      onConfirm: () => {
        setConfirmDialog(null);
        setGameOverReason(null);
        setGameState({
          isRunning: false,
          isPaused: false,
          month: START_MONTH,
          monthlyAP: 30,
          remainingAP: 30,
          balance: INITIAL_BALANCE,
          monthlyAllowance: 1500,
          san: INITIAL_SAN,
          rating: 0,
          gpa: INITIAL_GPA,
          attributes: createBaseAttributes(),
          playerContests: 0,
          playerProblems: 0,
          selectedTraits: [],
          pendingEvents: [],
          resolvedEvents: [],
          worldFlags: {},
          eventGraph: {},
          activeContest: null,
          contestTimeRemaining: 0,
          teammates: [],
          selectedTeam: null,
          buffs: {
            failedCourses: 0,
            academicWarnings: 0
          }
        });
        setTraitsSelected(false);
        setLogs([]);
        addLog('🔄 游戏已重置', 'warning');
      }
    });
  };

  // 游戏结束后重新开始（无需确认）
  const handleGameOverRestart = () => {
    setGameOverReason(null);
    setGameState({
      isRunning: false,
      isPaused: false,
      month: START_MONTH,
      monthlyAP: 30,
      remainingAP: 30,
      balance: INITIAL_BALANCE,
      monthlyAllowance: 1500,
      san: INITIAL_SAN,
      rating: 0,
      gpa: INITIAL_GPA,
      attributes: createBaseAttributes(),
      playerContests: 0,
      playerProblems: 0,
      selectedTraits: [],
      pendingEvents: [],
      resolvedEvents: [],
      worldFlags: {},
      eventGraph: {},
      activeContest: null,
      contestTimeRemaining: 0,
      teammates: [],
      selectedTeam: null,
      buffs: { failedCourses: 0, academicWarnings: 0 }
    });
    setTraitsSelected(false);
    setLogs([]);
    addLog('🔄 游戏已重置', 'warning');
  };

  // 事件处理：打开事件对话框
  const openEventDialog = (eventId) => {
    const ev = (gameState.pendingEvents || []).find(e => e.id === eventId);
    if (!ev) return;
    setCurrentEvent(ev);
    setShowEventDialog(true);
  };

  // 队友选择确认
  const handleTeammateConfirm = (selectedTeammateIds) => {
    setShowTeammateDialog(false);
    
    if (pendingEventChoice) {
      const { eventId, choiceId } = pendingEventChoice;
      
      addLog(`👥 组队成功！队友：${selectedTeammateIds.map(id => {
        const tm = gameState.teammates.find(t => t.id === id);
        return tm ? tm.name : id;
      }).join('、')}`, 'success');
      
      // 继续处理事件选择
      const ev = (gameState.pendingEvents || []).find(e => e.id === eventId);
      if (!ev) { setPendingEventChoice(null); return; }
      const choice = ev.choices.find(c => c.id === choiceId);
      if (!choice) { setPendingEventChoice(null); return; }
      
      const effects = { ...(choice.effects || {}) };
      const setFlags = choice.setFlags || {};

      // 如果该选择需要启动比赛，先保存队伍并启动比赛，然后解决事件
      if (choice.specialAction === 'START_CONTEST') {
        const contestConfig = choice.contestConfig;
        if (!contestConfig) {
          addLog('❌ 比赛配置错误', 'error');
          setPendingEventChoice(null);
          return;
        }

        const session = createContestSession(contestConfig);
        addLog(`🏁 开始${session.name}（${session.problems.length} 题，${session.durationMinutes} 分钟）`, 'info');

        setGameState(prev => {
          const updatedAttributes = applyAttributeChanges(prev.attributes, effects.attributeChanges);
          const nextSan = effects.sanDelta !== undefined
            ? clampValue(prev.san + effects.sanDelta, 0, INITIAL_SAN)
            : prev.san;

          const remaining = (prev.pendingEvents || []).filter(e => e.id !== eventId);
          const resolvedItem = { id: ev.id, choiceId, time: Date.now() };

          return {
            ...prev,
            attributes: updatedAttributes,
            san: nextSan,
            selectedTeam: selectedTeammateIds,
            worldFlags: { ...(prev.worldFlags || {}), ...setFlags },
            activeContest: session,
            contestTimeRemaining: session.timeRemaining,
            pendingEvents: remaining,
            resolvedEvents: [...(prev.resolvedEvents || []), resolvedItem]
          };
        });

        setPendingEventChoice(null);
        return;
      }
      
      // 应用事件效果（无 START_CONTEST 的普通选择）
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
          attributes: updatedAttributes,
          selectedTeam: selectedTeammateIds
        };
        
        if (effects.balance !== undefined) {
          nextState.balance = effects.balance;
        } else if (effects.balanceDelta !== undefined) {
          nextState.balance = Math.max(0, prev.balance + effects.balanceDelta);
        }
        
        if (effects.san !== undefined) {
          nextState.san = clampValue(effects.san, 0, INITIAL_SAN);
        } else if (effects.sanDelta !== undefined) {
          nextState.san = clampValue(prev.san + effects.sanDelta, 0, INITIAL_SAN);
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
        
        nextState.worldFlags = { ...(prev.worldFlags || {}), ...setFlags };
        
        const remaining = (prev.pendingEvents || []).filter(e => e.id !== eventId);
        const resolvedItem = { id: ev.id, choiceId, time: Date.now() };
        nextState.pendingEvents = remaining;
        nextState.resolvedEvents = [...(prev.resolvedEvents || []), resolvedItem];
        
        return nextState;
      });
      
      setPendingEventChoice(null);
    }
  };

  // 取消队友选择
  const handleTeammateCancel = () => {
    setShowTeammateDialog(false);
    setPendingEventChoice(null);
    setShowEventDialog(true); // 返回事件对话框
  };

  // 事件选择应用
  const applyEventChoice = (eventId, choiceId) => {
    const ev = (gameState.pendingEvents || []).find(e => e.id === eventId);
    if (!ev) return;
    const choice = ev.choices.find(c => c.id === choiceId);
    if (!choice) return;

    // 检查是否需要队友选择
    if (choice.requiresTeamSelection) {
      setPendingEventChoice({ eventId, choiceId });
      setShowEventDialog(false);
      setShowTeammateDialog(true);
      return;
    }

    let effects = { ...(choice.effects || {}) };
    const setFlags = choice.setFlags || {};

    // 特殊处理：期末周GPA审核
    if (eventId === 'june_finals_week' || eventId === 'january_finals_week') {
      const currentGpa = gameState.gpa;
      const currentBuffs = gameState.buffs || { failedCourses: 0, academicWarnings: 0 };
      
      if (currentGpa < 2.5) {
        // GPA < 2.5: 获得学业警告
        const newWarnings = currentBuffs.academicWarnings + 1;
        addLog(`⚠️ 学业警告！GPA低于2.5，获得学业警告 buff（当前${newWarnings}个）`, 'error');
        
        if (newWarnings >= 2) {
          addLog(`❌ 累计2个学业警告，进入退学结局！`, 'error');
          setGameState(prev => ({
            ...prev,
            isRunning: false,
            buffs: { ...currentBuffs, academicWarnings: newWarnings }
          }));
          setShowEventDialog(false);
          setCurrentEvent(null);
          setGameOverReason(`GPA长期低于2.5，累计获得${newWarnings}次学业警告，被迫退学。`);
          return;
        }
        
        effects.buffChanges = { academicWarnings: 1 };
      } else if (currentGpa < 3.0) {
        // GPA < 3.0: 获得挂科buff
        const newFailures = currentBuffs.failedCourses + 1;
        addLog(`📉 挂科！GPA低于3.0，获得挂科 buff（当前${newFailures}个）`, 'warning');
        
        // 每3次挂科转换为1个学业警告
        if (newFailures % 3 === 0) {
          // 恰好达到3的倍数，转换为学业警告
          const newWarnings = currentBuffs.academicWarnings + 1;
          
          addLog(`⚠️ 累计3次挂科，转换为1个学业警告！（当前${newWarnings}个学业警告，0个挂科）`, 'error');
          
          if (newWarnings >= 2) {
            addLog(`❌ 累计2个学业警告，进入退学结局！`, 'error');
            setGameState(prev => ({
              ...prev,
              isRunning: false,
              buffs: { failedCourses: 0, academicWarnings: newWarnings }
            }));
            setShowEventDialog(false);
            setCurrentEvent(null);
            setGameOverReason(`GPA长期低于3.0，累计挂科${newFailures}次（转换为${newWarnings}次学业警告），被迫退学。`);
            return;
          }
          
          effects.buffChanges = { failedCourses: -currentBuffs.failedCourses, academicWarnings: 1 };
        } else {
          effects.buffChanges = { failedCourses: 1 };
        }
      } else if (currentGpa >= 3.7) {
        // GPA >= 3.7: 获得奖学金
        addLog(`🎓 优秀！GPA达到3.7以上，获得奖学金！`, 'success');
        effects.balanceDelta = 2000;
      } else {
        addLog(`✅ 期末考试通过，GPA正常`, 'info');
      }
    }

    // 处理特殊动作：启动比赛（不需要队友选择的直接参赛路径）
    if (choice.specialAction === 'START_CONTEST') {
      const contestConfig = choice.contestConfig;
      if (!contestConfig) {
        addLog('❌ 比赛配置错误', 'error');
        return;
      }
      if (gameState.activeContest) {
        addLog('⚠️ 已有正在进行的比赛', 'warning');
        return;
      }

      // 先应用事件效果（sanDelta 等）
      const session = createContestSession(contestConfig);
      addLog(`🏁 开始${session.name}（${session.problems.length} 题，${session.durationMinutes} 分钟）`, 'info');

      setGameState(prev => {
        const updatedAttributes = applyAttributeChanges(prev.attributes, effects.attributeChanges);
        const nextSan = effects.sanDelta !== undefined
          ? clampValue(prev.san + effects.sanDelta, 0, INITIAL_SAN)
          : prev.san;
        const remaining = (prev.pendingEvents || []).filter(e => e.id !== eventId);
        const resolvedItem = { id: ev.id, choiceId, time: Date.now() };
        return {
          ...prev,
          attributes: updatedAttributes,
          san: nextSan,
          worldFlags: { ...(prev.worldFlags || {}), ...setFlags },
          activeContest: session,
          contestTimeRemaining: session.timeRemaining,
          pendingEvents: remaining,
          resolvedEvents: [...(prev.resolvedEvents || []), resolvedItem]
        };
      });

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
        nextState.san = clampValue(effects.san, 0, INITIAL_SAN);
      } else if (effects.sanDelta !== undefined) {
        nextState.san = clampValue(prev.san + effects.sanDelta, 0, INITIAL_SAN);
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

      // 处理 buff 变化
      if (effects.buffChanges) {
        const currentBuffs = prev.buffs || { failedCourses: 0, academicWarnings: 0 };
        nextState.buffs = {
          failedCourses: Math.max(0, currentBuffs.failedCourses + (effects.buffChanges.failedCourses || 0)),
          academicWarnings: Math.max(0, currentBuffs.academicWarnings + (effects.buffChanges.academicWarnings || 0))
        };
      }

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
        {gamePhase === 'playing' && (
          <PlayerPanel
            attributes={gameState.attributes}
            balance={gameState.balance}
            remainingAP={gameState.remainingAP}
            monthlyAP={gameState.monthlyAP}
            san={gameState.san}
            rating={gameState.rating}
            gpa={gameState.gpa}
            buffs={gameState.buffs}
          />
        )}

        <main className={gamePhase !== 'playing' ? 'full-width' : ''}>
          {gamePhase === 'intro' && (
            <IntroPanel onStart={startGame} />
          )}

          {gamePhase === 'traitSelection' && (
            <TraitSelectionPanel onConfirm={handleTraitConfirm} />
          )}

          {gamePhase === 'playing' && (
            <div className="main-content-layout">
              <div className="main-content-left">
                <GameControls
                  gameState={gameState}
                  onStart={startGame}
                  onReset={resetGame}
                  onAdvanceMonth={advanceMonth}
                />

                {!gameState.activeContest && (
                  <EventPanel
                    pendingEvents={gameState.pendingEvents || []}
                    onOpenEvent={openEventDialog}
                    onDirectChoice={applyEventChoice}
                    canAdvance={(gameState.pendingEvents || []).length === 0}
                  />
                )}

                {gameState.activeContest && (
                  <ContestInProgress
                    contest={gameState.activeContest}
                    timeRemaining={gameState.contestTimeRemaining}
                    onAttempt={attemptContestProblem}
                    onFinish={() => finishContest(true)}
                    onRead={readContestProblem}
                    onThink={thinkContestProblem}
                    onCode={codeContestProblem}
                    onDebug={debugContestProblem}
                  />
                )}

                {!gameState.activeContest && (
                  <ActivityPanel
                    activities={activities}
                    remainingAP={gameState.remainingAP}
                    onExecuteActivity={executeActivity}
                    isRunning={gameState.isRunning}
                    isPaused={gameState.isPaused}
                    gameEnded={gameState.month > END_MONTH}
                  />
                )}
              </div>
              <LogPanel logs={logs} />
            </div>
          )}
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
              san: clampValue(prev.san + contestOutcome.sanDelta, 0, INITIAL_SAN),
              playerContests: prev.playerContests + 1
            }));
            setShowContestResult(false);
            setContestOutcome(null);
          }}
        />
      )}

      {showTeammateDialog && (
        <TeammateSelectionDialog
          teammates={gameState.teammates}
          onConfirm={handleTeammateConfirm}
          onCancel={handleTeammateCancel}
          contestName={currentEvent?.title}
        />
      )}

      {showPracticeContestDialog && (
        <PracticeContestSelectionDialog
          onSelect={handlePracticeContestSelect}
          onCancel={() => setShowPracticeContestDialog(false)}
        />
      )}

      {gameOverReason && (
        <GameOverDialog
          reason={gameOverReason}
          stats={{
            playerContests: gameState.playerContests,
            playerProblems: gameState.playerProblems,
            rating: gameState.rating,
            gpa: gameState.gpa
          }}
          onRestart={handleGameOverRestart}
        />
      )}
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}

export default App;

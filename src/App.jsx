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
  const [pendingEventChoice, setPendingEventChoice] = useState(null);

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
    if (newMonth > END_MONTH) {
      addLog(`🎓 游戏结束！比赛次数：${gameState.playerContests}，解题数：${gameState.playerProblems}`, 'success');
      setGameState(prev => ({
        ...prev,
        month: newMonth,
        isRunning: false
      }));
      return;
    }

    // 月度GPA扣除
    const monthsSinceStart = newMonth - 1;
    const startCalendarMonth = 9;
    const totalCalendarMonth = startCalendarMonth + monthsSinceStart;
    const calendarMonth = ((totalCalendarMonth - 1) % 12) + 1;
    
    // 2、7、8月为假期，不上课不会掉GPA
    const isVacation = calendarMonth === 2 || calendarMonth === 7 || calendarMonth === 8;
    
    const baseGpaDeduction = 0.05; // 每月基础扣除（增大）
    let gpaDeduction = baseGpaDeduction;
    
    // 如果一个月没有上课，额外扣除GPA（检查上课活动是否执行）
    // 但假期期间不会因为没上课而扣除GPA
    const attendedClass = gameState.worldFlags?.attendedClassThisMonth || false;
    if (!isVacation && !attendedClass && Math.random() < 0.3) {
      gpaDeduction += 0.1; // 30%概率额外扣除平时分（增大）
      addLog('⚠️ 本月未上课，GPA额外扣除！', 'warning');
    }
    
    // 假期期间不扣除基础GPA
    if (isVacation) {
      gpaDeduction = 0;
      addLog('🏖️ 假期月份，GPA不会下降', 'info');
    }

    const newGpa = clampGPA(gameState.gpa - gpaDeduction);

    // 生成当月事件并重置行动点
    const events = scheduleMonthlyEvents(gameState, newMonth);
    
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
    
    if (!isVacation || events.length > 0) {
      addLog(`📅 进入大学 ${academicYear} 年 ${calendarMonth} 月（待处理事件 ${events.length}）`, 'info');
    }

    setGameState(prev => ({
      ...prev,
      month: newMonth,
      gpa: newGpa,
      remainingAP: prev.monthlyAP,
      pendingEvents: events,
      resolvedEvents: [],
      worldFlags: { ...(prev.worldFlags || {}), attendedClassThisMonth: false } // 重置上课标记
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
        month: START_MONTH,
        monthlyAP: 30,
        remainingAP: 30,
        balance: INITIAL_BALANCE,
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
  };

  // 确认特性选择
  const handleTraitConfirm = (selectedTraitIds) => {
    // 初始属性全为0
    const baseAttributes = createBaseAttributes();

    // 应用特性效果
    const { attributes, sanPenalty, moneyPenalty } = applyTraitEffects(selectedTraitIds, baseAttributes);

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

  // 队友选择确认
  const handleTeammateConfirm = (selectedTeammateIds) => {
    setShowTeammateDialog(false);
    
    if (pendingEventChoice) {
      const { eventId, choiceId } = pendingEventChoice;
      
      // 保存选择的队友
      setGameState(prev => ({
        ...prev,
        selectedTeam: selectedTeammateIds
      }));
      
      addLog(`👥 组队成功！队友：${selectedTeammateIds.map(id => {
        const tm = gameState.teammates.find(t => t.id === id);
        return tm ? tm.name : id;
      }).join('、')}`, 'success');
      
      // 继续处理事件选择
      const ev = (gameState.pendingEvents || []).find(e => e.id === eventId);
      if (!ev) return;
      const choice = ev.choices.find(c => c.id === choiceId);
      if (!choice) return;
      
      let effects = { ...(choice.effects || {}) };
      const setFlags = choice.setFlags || {};
      
      // 应用事件效果（简化版，不再重复GPA审核逻辑）
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

    let effects = typeof choice.effects === 'function' ? choice.effects(gameState) : { ...(choice.effects || {}) };
    const setFlags = choice.setFlags || {};

    // 特殊处理：期末考试GPA审核
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
            return;
          }
          
          effects.buffChanges = { failedCourses: -currentBuffs.failedCourses, academicWarnings: 1 };
        } else {
          effects.buffChanges = { failedCourses: 1 };
        }
      } else if (currentGpa >= 3.7) {
        // GPA >= 3.7: 获得奖学金
        addLog(`🎓 优秀！GPA达到3.7以上，获得奖学金！`, 'success');
        effects.balanceDelta = 3000;
      } else {
        addLog(`✅ 期末考试通过，GPA正常`, 'info');
      }
    }

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

      // 获取比赛配置（可能是函数或静态对象）
      let contestConfig = choice.contestConfig;
      if (typeof contestConfig === 'function') {
        contestConfig = contestConfig();
      }
      
      // 如果配置不存在，使用默认配置
      if (!contestConfig) {
        contestConfig = {
          name: 'Contest',
          problemCount: [5, 7],
          durationMinutes: 120,
          difficulties: [1, 2, 3, 5, 8, 10, 15],
          isRated: false,
          ratingSource: null
        };
      }

      const session = createContestSession(contestConfig);
      addLog(`🏁 开始${session.name}（${session.problems.length} 题，${session.durationMinutes} 分钟）`, 'info');

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
            gameEnded={gameState.month > END_MONTH}
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

      {showTeammateDialog && (
        <TeammateSelectionDialog
          teammates={gameState.teammates}
          onConfirm={handleTeammateConfirm}
          onCancel={handleTeammateCancel}
          contestName={currentEvent?.title}
        />
      )}
    </div>
  );
}

export default App;

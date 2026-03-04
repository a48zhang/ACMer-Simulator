import { useState, useCallback } from 'react'
import GameControls from './components/game/GameControls'
import PlayerPanel from './components/panels/PlayerPanel'
import Notification from './components/game/Notification'
import TeammateSelectionDialog from './components/dialogs/TeammateSelectionDialog'
import ActivityPanel from './components/panels/ActivityPanel'
import EventPanel from './components/panels/EventPanel'
import EventDialog from './components/dialogs/EventDialog'
import ContestInProgress from './components/game/ContestInProgress'
import ContestResultDialog from './components/dialogs/ContestResultDialog'
import ConfirmDialog from './components/dialogs/ConfirmDialog'
import GameOverDialog from './components/dialogs/GameOverDialog'
import LogPanel from './components/panels/LogPanel'
import IntroPanel from './components/panels/IntroPanel'
import TraitSelectionPanel from './components/panels/TraitSelectionPanel'
import PracticeContestSelectionDialog from './components/dialogs/PracticeContestSelectionDialog'
import { ACTIVITIES } from './data/activities'
import {
  Container,
  Header,
  AppLayout,
  Main,
  MainContentLayout,
  Footer
} from './styles/AppStyles'

// 新模块导入
import { createInitialGameState } from './gameState'
import {
  finishContest,
  readContestProblem,
  thinkContestProblem,
  codeContestProblem,
  debugContestProblem,
  attemptContestProblem,
  executeActivity,
  advanceMonth,
  applyEventChoice,
  handleTeammateConfirm as handleTeammateConfirmLogic,
  handleTraitConfirm as handleTraitConfirmLogic,
  resetGame as resetGameLogic,
  handleGameOverRestart as handleGameOverRestartLogic,
  handlePracticeContestSelect as handlePracticeContestSelectLogic,
  applyContestResult,
  createAddLog
} from './gameLogics'
import type { GameState, LogEntry, LogicResult, Event, ContestOutcome, ContestConfig } from './types'

type GamePhase = 'intro' | 'traitSelection' | 'playing'

type ConfirmDialogState = {
  message: string
  onConfirm: () => void
} | null

function App() {
  // 游戏状态
  const [gameState, setGameState] = useState<GameState>(createInitialGameState() as GameState)
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro')
  const [gameOverReason, setGameOverReason] = useState<string | null>(null)

  // UI 状态
  const [notification, setNotification] = useState<string | null>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
  const [showContestResult, setShowContestResult] = useState(false)
  const [contestOutcome, setContestOutcome] = useState<ContestOutcome | null>(null)
  const [showTeammateDialog, setShowTeammateDialog] = useState(false)
  const [showPracticeContestDialog, setShowPracticeContestDialog] = useState(false)
  const [pendingEventChoice, setPendingEventChoice] = useState<{ eventId: string; choiceId: string } | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(null)

  // 日志
  const [logs, setLogs] = useState<LogEntry[]>([])
  const addLog = createAddLog(setLogs)
  const clearLogs = useCallback(() => setLogs([]), [])

  // ========== 辅助函数：应用逻辑结果 ==========
  const applyLogicResult = useCallback((result: LogicResult | null | undefined) => {
    if (!result) return

    // 更新游戏状态
    if (result.newState) {
      setGameState(result.newState)
    }

    // 添加日志
    if (result.logs && result.logs.length > 0) {
      result.logs.forEach((log: LogEntry) => addLog(log.message, log.type))
    }

    // 更新 UI 状态
    if (result.uiState) {
      const ui = result.uiState
      if (ui.showEventDialog !== undefined) setShowEventDialog(ui.showEventDialog)
      if (ui.currentEvent !== undefined) setCurrentEvent(ui.currentEvent ?? null)
      if (ui.showContestResult !== undefined) setShowContestResult(ui.showContestResult)
      if (ui.contestOutcome !== undefined) setContestOutcome(ui.contestOutcome ?? null)
      if (ui.showTeammateDialog !== undefined) setShowTeammateDialog(ui.showTeammateDialog)
      if (ui.showPracticeContestDialog !== undefined) setShowPracticeContestDialog(ui.showPracticeContestDialog)
      if (ui.pendingEventChoice !== undefined) setPendingEventChoice(ui.pendingEventChoice ?? null)
      if (ui.confirmDialog !== undefined) setConfirmDialog(ui.confirmDialog ?? null)
      if (ui.gameOverReason !== undefined) setGameOverReason(ui.gameOverReason ?? null)
    }

    // 游戏结束原因
    if (result.gameOverReason) {
      setGameOverReason(result.gameOverReason)
    }

    // 通知
    if (result.notification) {
      setNotification(result.notification)
    }

    // 清空日志
    if (result.clearLogs) {
      clearLogs()
    }
  }, [addLog, clearLogs])

  // ========== 游戏流程 ==========
  const startGame = useCallback(() => {
    if (gamePhase === 'intro') {
      setGamePhase('traitSelection')
    } else if (gamePhase === 'traitSelection') {
      setGameState(prev => ({ ...prev, isRunning: true, isPaused: false }))
      addLog('🎮 游戏开始！祝你好运！', 'info')
    } else {
      setGameState(prev => ({ ...prev, isRunning: true, isPaused: false }))
      addLog('🎮 游戏继续！', 'info')
    }
  }, [gamePhase, addLog])


  // ========== 包装逻辑函数 ==========
  const wrappedFinishContest = useCallback(() => {
    const result = finishContest(gameState) as LogicResult
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedReadContestProblem = useCallback((problemId: string) => {
    const result = readContestProblem(gameState, problemId) as LogicResult
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedThinkContestProblem = useCallback((problemId: string) => {
    const result = thinkContestProblem(gameState, problemId) as LogicResult
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedCodeContestProblem = useCallback((problemId: string) => {
    const result = codeContestProblem(gameState, problemId) as LogicResult
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedDebugContestProblem = useCallback((problemId: string) => {
    const result = debugContestProblem(gameState, problemId) as LogicResult
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedAttemptContestProblem = useCallback((problemId: string) => {
    const result = attemptContestProblem(gameState, problemId) as LogicResult
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedExecuteActivity = useCallback((activityId: string) => {
    const result = executeActivity(gameState, activityId) as LogicResult
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedAdvanceMonth = useCallback(() => {
    const result = advanceMonth(gameState) as LogicResult
    applyLogicResult(result)
    if (result.gameOverReason) {
      // 游戏结束时不需要改变 phase，保持 playing 显示结局
    }
  }, [gameState, applyLogicResult])

  const wrappedApplyEventChoice = useCallback((eventId: string, choiceId: string) => {
    const result = applyEventChoice(gameState, eventId, choiceId) as LogicResult
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedHandleTraitConfirm = useCallback((selectedTraitIds: string[]) => {
    const result = handleTraitConfirmLogic(gameState, selectedTraitIds) as LogicResult
    applyLogicResult(result)
    setGamePhase('playing')
  }, [gameState, applyLogicResult])

  const wrappedHandleTeammateConfirm = useCallback((selectedTeammateIds: string[]) => {
    const result = handleTeammateConfirmLogic(gameState, pendingEventChoice!, selectedTeammateIds) as LogicResult
    applyLogicResult(result)
  }, [gameState, pendingEventChoice, applyLogicResult])

  const wrappedHandleTeammateCancel = useCallback(() => {
    setShowTeammateDialog(false)
    setPendingEventChoice(null)
    setShowEventDialog(true)
  }, [])

  const wrappedResetGame = useCallback(() => {
    setConfirmDialog({
      message: '确定要退学重开吗？将退回首页重新开始！',
      onConfirm: () => {
        const result = resetGameLogic() as LogicResult
        applyLogicResult(result)
        setGamePhase('intro')
      }
    })
  }, [applyLogicResult])

  const wrappedHandleGameOverRestart = useCallback(() => {
    const result = handleGameOverRestartLogic() as LogicResult
    applyLogicResult(result)
    setGamePhase('intro')
  }, [applyLogicResult])

  const wrappedHandlePracticeContestSelect = useCallback((contestConfig: ContestConfig) => {
    const result = handlePracticeContestSelectLogic(gameState, contestConfig) as LogicResult
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedApplyContestResult = useCallback(() => {
    const result = applyContestResult(gameState, contestOutcome!) as LogicResult
    applyLogicResult(result)
  }, [gameState, contestOutcome, applyLogicResult])

  // 打开事件对话框
  const openEventDialog = useCallback((eventId: string) => {
    const ev = (gameState.pendingEvents || []).find((e: Event) => e.id === eventId)
    if (!ev) return
    setCurrentEvent(ev)
    setShowEventDialog(true)
  }, [gameState.pendingEvents])

  // UI 渲染
  return (
    <Container>
      <Header>
        <h1>🏆 ACMer选手模拟器</h1>
        <p className="subtitle">体验编程竞赛选手的生活</p>
      </Header>

      <AppLayout>
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
            onReset={wrappedResetGame}
          />
        )}

        <Main className={gamePhase !== 'playing' ? 'full-width' : ''}>
          {gamePhase === 'intro' && (
            <IntroPanel onStart={startGame} />
          )}

          {gamePhase === 'traitSelection' && (
            <TraitSelectionPanel onConfirm={wrappedHandleTraitConfirm} />
          )}

          {gamePhase === 'playing' && (
            <MainContentLayout>
              <div className="main-content-left">
                <GameControls
                  gameState={gameState}
                  onStart={startGame}
                  onReset={wrappedResetGame}
                  onAdvanceMonth={wrappedAdvanceMonth}
                />

                {!gameState.activeContest && (
                  <EventPanel
                    pendingEvents={gameState.pendingEvents || []}
                    onOpenEvent={openEventDialog}
                    onDirectChoice={wrappedApplyEventChoice}
                    canAdvance={(gameState.pendingEvents || []).length === 0}
                  />
                )}

                {gameState.activeContest && (
                  <ContestInProgress
                    contest={gameState.activeContest}
                    timeRemaining={gameState.contestTimeRemaining}
                    onAttempt={wrappedAttemptContestProblem}
                    onFinish={() => wrappedFinishContest()}
                    onRead={wrappedReadContestProblem}
                    onThink={wrappedThinkContestProblem}
                    onCode={wrappedCodeContestProblem}
                    onDebug={wrappedDebugContestProblem}
                  />
                )}

                {!gameState.activeContest && (
                  <ActivityPanel
                    activities={ACTIVITIES}
                    remainingAP={gameState.remainingAP}
                    onExecuteActivity={wrappedExecuteActivity}
                    isRunning={gameState.isRunning}
                    isPaused={gameState.isPaused}
                    gameEnded={gameState.month > 46}
                  />
                )}
              </div>
              <LogPanel logs={logs} />
            </MainContentLayout>
          )}
        </Main>
      </AppLayout>

      <Footer>
        <p>ACMer选手模拟器</p>
      </Footer>

      {notification && (
        <Notification
          message={notification}
          onClose={() => setNotification(null)}
        />
      )}

      {showEventDialog && currentEvent && (
        <EventDialog
          event={currentEvent}
          onSelectChoice={wrappedApplyEventChoice}
          onClose={() => { setShowEventDialog(false); setCurrentEvent(null); }}
        />
      )}

      {showContestResult && contestOutcome && (
        <ContestResultDialog
          outcome={contestOutcome}
          onConfirm={wrappedApplyContestResult}
        />
      )}

      {showTeammateDialog && (
        <TeammateSelectionDialog
          teammates={gameState.teammates}
          onConfirm={wrappedHandleTeammateConfirm}
          onCancel={wrappedHandleTeammateCancel}
          contestName={currentEvent?.title}
        />
      )}

      {showPracticeContestDialog && (
        <PracticeContestSelectionDialog
          onSelect={wrappedHandlePracticeContestSelect}
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
          onRestart={wrappedHandleGameOverRestart}
        />
      )}
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </Container>
  );
}

export default App

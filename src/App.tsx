import { useState, useCallback, useMemo } from 'react'
import GameControls from './components/game/GameControls'
import PlayerPanel from './components/panels/PlayerPanel'
import Notification from './components/game/Notification'
import TeammateSelectionDialog from './components/dialogs/TeammateSelectionDialog'
import ActivityPanel from './components/panels/ActivityPanel'
import EventPanel from './components/panels/EventPanel'
import EventDialog from './components/dialogs/EventDialog'
import ContestInProgress from './components/game/ContestInProgress'
import PracticeInProgress from './components/game/PracticeInProgress'
import ContestResultDialog from './components/dialogs/ContestResultDialog'
import ConfirmDialog from './components/dialogs/ConfirmDialog'
import GameOverDialog from './components/dialogs/GameOverDialog'
import LogPanel from './components/panels/LogPanel'
import IntroPanel from './components/panels/IntroPanel'
import TraitSelectionPanel from './components/panels/TraitSelectionPanel'
import PracticeContestSelectionDialog from './components/dialogs/PracticeContestSelectionDialog'
import { ACTIVITIES } from './data/activities'
import { buildPracticeOptions } from './data/practice'
import {
  Container,
  Header,
  AppLayout,
  Main,
  MainContentLayout,
  Footer
} from './styles/AppStyles'

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
  applyContestResult,
  createAddLog,
  startPracticeSession,
  finishPracticeSession,
  readPracticeProblem,
  thinkPracticeProblem,
  codePracticeProblem,
  debugPracticeProblem,
  viewPracticeEditorial,
  attemptPracticeProblem
} from './gameLogics'
import type { GameState, Event, ContestOutcome, LogicResult, PracticeOption } from './types'

type GamePhase = 'intro' | 'traitSelection' | 'playing'

interface LogEntryWithMeta {
  id: number;
  time: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface ConfirmDialogState {
  message: string;
  title?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface PendingEventChoice {
  eventId: string;
  choiceId: string;
}

function App() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState())
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro')
  const [gameOverReason, setGameOverReason] = useState<string | null>(null)

  const [notification, setNotification] = useState<string | { message: string; type: string } | null>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
  const [showContestResult, setShowContestResult] = useState(false)
  const [contestOutcome, setContestOutcome] = useState<ContestOutcome | null>(null)
  const [showTeammateDialog, setShowTeammateDialog] = useState(false)
  const [showPracticeContestDialog, setShowPracticeContestDialog] = useState(false)
  const [pendingEventChoice, setPendingEventChoice] = useState<PendingEventChoice | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null)

  const [logs, setLogs] = useState<LogEntryWithMeta[]>([])
  const addLog = createAddLog(setLogs as Parameters<typeof createAddLog>[0])
  const clearLogs = useCallback(() => setLogs([]), [])

  const applyLogicResult = useCallback((result: LogicResult | null | undefined) => {
    if (!result) return

    if (result.clearLogs) {
      clearLogs()
    }

    if (result.newState) {
      setGameState(result.newState)
    }

    if (result.logs && result.logs.length > 0) {
      result.logs.forEach(log => addLog(log.message, log.type))
    }

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

    if (result.gameOverReason) {
      setGameOverReason(result.gameOverReason)
    }

    if (result.notification) {
      setNotification(result.notification as string | { message: string; type: string })
    }
  }, [addLog, clearLogs])

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

  const wrappedFinishContest = useCallback(() => {
    const result = finishContest(gameState)
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedReadContestProblem = useCallback((problemId: string) => {
    const result = readContestProblem(gameState, problemId)
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedThinkContestProblem = useCallback((problemId: string) => {
    const result = thinkContestProblem(gameState, problemId)
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedCodeContestProblem = useCallback((problemId: string) => {
    const result = codeContestProblem(gameState, problemId)
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedDebugContestProblem = useCallback((problemId: string) => {
    const result = debugContestProblem(gameState, problemId)
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedAttemptContestProblem = useCallback((problemId: string) => {
    const result = attemptContestProblem(gameState, problemId)
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedExecuteActivity = useCallback((activityId: string) => {
    const result = executeActivity(gameState, activityId)
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedAdvanceMonth = useCallback(() => {
    const result = advanceMonth(gameState)
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedApplyEventChoice = useCallback((eventId: string, choiceId: string) => {
    const result = applyEventChoice(gameState, eventId, choiceId)
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedHandleTraitConfirm = useCallback((selectedTraitIds: string[]) => {
    const result = handleTraitConfirmLogic(gameState, selectedTraitIds)
    applyLogicResult(result)
    setGamePhase('playing')
  }, [gameState, applyLogicResult])

  const wrappedHandleTeammateConfirm = useCallback((selectedTeammateIds: string[]) => {
    const result = handleTeammateConfirmLogic(gameState, pendingEventChoice, selectedTeammateIds)
    applyLogicResult(result)
  }, [gameState, pendingEventChoice, applyLogicResult])

  const wrappedHandleTeammateCancel = useCallback(() => {
    setShowTeammateDialog(false)
    setPendingEventChoice(null)
    setShowEventDialog(false)
    setCurrentEvent(null)
  }, [])

  const wrappedResetGame = useCallback(() => {
    setConfirmDialog({
      message: '确定要退学重开吗？将退回首页重新开始！',
      onConfirm: () => {
        const result = resetGameLogic()
        applyLogicResult(result)
        setGamePhase('intro')
      }
    })
  }, [applyLogicResult])

  const wrappedHandleGameOverRestart = useCallback(() => {
    const result = handleGameOverRestartLogic()
    applyLogicResult(result)
    setGamePhase('intro')
  }, [applyLogicResult])

  const wrappedHandlePracticeContestSelect = useCallback((option: PracticeOption) => {
    const result = startPracticeSession(gameState, option)
    applyLogicResult(result)
  }, [gameState, applyLogicResult])

  const wrappedFinishPractice = useCallback(() => {
    applyLogicResult(finishPracticeSession(gameState))
  }, [gameState, applyLogicResult])

  const wrappedReadPracticeProblem = useCallback((problemId: string) => {
    applyLogicResult(readPracticeProblem(gameState, problemId))
  }, [gameState, applyLogicResult])

  const wrappedThinkPracticeProblem = useCallback((problemId: string) => {
    applyLogicResult(thinkPracticeProblem(gameState, problemId))
  }, [gameState, applyLogicResult])

  const wrappedCodePracticeProblem = useCallback((problemId: string) => {
    applyLogicResult(codePracticeProblem(gameState, problemId))
  }, [gameState, applyLogicResult])

  const wrappedDebugPracticeProblem = useCallback((problemId: string) => {
    applyLogicResult(debugPracticeProblem(gameState, problemId))
  }, [gameState, applyLogicResult])

  const wrappedViewPracticeEditorial = useCallback((problemId: string) => {
    applyLogicResult(viewPracticeEditorial(gameState, problemId))
  }, [gameState, applyLogicResult])

  const wrappedAttemptPracticeProblem = useCallback((problemId: string) => {
    applyLogicResult(attemptPracticeProblem(gameState, problemId))
  }, [gameState, applyLogicResult])

  const wrappedApplyContestResult = useCallback(() => {
    if (!contestOutcome) return;
    const result = applyContestResult(gameState, contestOutcome)
    applyLogicResult(result)
  }, [gameState, contestOutcome, applyLogicResult])

  const openEventDialog = useCallback((eventId: string) => {
    const ev = (gameState.pendingEvents || []).find(e => e.id === eventId)
    if (!ev) return
    setCurrentEvent(ev)
    setShowEventDialog(true)
  }, [gameState.pendingEvents])

  const handleEventDialogClose = useCallback(() => {
    setShowEventDialog(false)
    setCurrentEvent(null)
  }, [])

  const handleNotificationClose = useCallback(() => {
    setNotification(null)
  }, [])

  const handlePracticeContestCancel = useCallback(() => {
    setShowPracticeContestDialog(false)
  }, [])

  const handleConfirmCancel = useCallback(() => {
    setConfirmDialog(null)
  }, [])

  const handleFinishContest = useCallback(() => {
    wrappedFinishContest()
  }, [wrappedFinishContest])

  const pendingEvents = useMemo(() => gameState.pendingEvents || [], [gameState.pendingEvents])
  const practiceOptions = useMemo(() => buildPracticeOptions(gameState), [gameState])
  const canAdvance = useMemo(() => pendingEvents.length === 0, [pendingEvents.length])
  const gameEnded = useMemo(() => gameState.month > 46, [gameState.month])

  const gameOverStats = useMemo(() => ({
    playerContests: gameState.playerContests,
    playerProblems: gameState.playerProblems,
    rating: gameState.rating,
    gpa: gameState.gpa
  }), [gameState.playerContests, gameState.playerProblems, gameState.rating, gameState.gpa])

  const mainClassName = useMemo(() => {
    if (gamePhase === 'intro') return 'landing-screen'
    if (gamePhase === 'traitSelection') return 'trait-selection-screen'
    return ''
  }, [gamePhase])

  return (
    <Container>
      <Header>
        <h1>🏆 ACMer选手模拟器</h1>
        <p className="subtitle">从大一打到毕业前</p>
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

        <Main className={mainClassName}>
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

                {!gameState.activeContest && !gameState.activePractice && (
                  <EventPanel
                    pendingEvents={pendingEvents}
                    onOpenEvent={openEventDialog}
                    onDirectChoice={wrappedApplyEventChoice}
                    canAdvance={canAdvance}
                  />
                )}

                {gameState.activeContest && (
                  <ContestInProgress
                    contest={gameState.activeContest}
                    timeRemaining={gameState.contestTimeRemaining}
                    onAttempt={wrappedAttemptContestProblem}
                    onFinish={handleFinishContest}
                    onRead={wrappedReadContestProblem}
                    onThink={wrappedThinkContestProblem}
                    onCode={wrappedCodeContestProblem}
                    onDebug={wrappedDebugContestProblem}
                  />
                )}

                {gameState.activePractice && (
                  <PracticeInProgress
                    session={gameState.activePractice}
                    onRead={wrappedReadPracticeProblem}
                    onThink={wrappedThinkPracticeProblem}
                    onCode={wrappedCodePracticeProblem}
                    onDebug={wrappedDebugPracticeProblem}
                    onEditorial={wrappedViewPracticeEditorial}
                    onAttempt={wrappedAttemptPracticeProblem}
                    onFinish={wrappedFinishPractice}
                  />
                )}

                {!gameState.activeContest && !gameState.activePractice && (
                  <ActivityPanel
                    activities={ACTIVITIES}
                    remainingAP={gameState.remainingAP}
                    onExecuteActivity={wrappedExecuteActivity}
                    isRunning={gameState.isRunning}
                    isPaused={gameState.isPaused}
                    gameEnded={gameEnded}
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
          onClose={handleNotificationClose}
        />
      )}

      {showEventDialog && currentEvent && (
        <EventDialog
          event={currentEvent}
          onSelectChoice={wrappedApplyEventChoice}
          onClose={handleEventDialogClose}
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
          options={practiceOptions}
          backlogCount={gameState.practiceBacklog.length}
          onSelect={wrappedHandlePracticeContestSelect}
          onCancel={handlePracticeContestCancel}
        />
      )}

      {gameOverReason && (
        <GameOverDialog
          reason={gameOverReason}
          stats={gameOverStats}
          onRestart={wrappedHandleGameOverRestart}
        />
      )}
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={handleConfirmCancel}
        />
      )}
    </Container>
  );
}

export default App

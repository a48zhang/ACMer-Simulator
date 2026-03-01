/**
 * @typedef {Object} GameState
 * @property {boolean} isRunning - 游戏是否正在运行
 * @property {boolean} isPaused - 游戏是否暂停
 * @property {number} month - 当前月份
 * @property {number} monthlyAP - 每月行动点
 * @property {number} remainingAP - 剩余行动点
 * @property {number} balance - 余额
 * @property {number} monthlyAllowance - 每月生活费
 * @property {number} san - SAN值
 * @property {number} rating - 评级
 * @property {number} gpa - GPA
 * @property {Object} attributes - 属性对象
 * @property {number} playerContests - 参赛次数
 * @property {number} playerProblems - 解题数量
 * @property {string[]} selectedTraits - 已选择的特性
 * @property {Array} pendingEvents - 待处理事件
 * @property {Array} resolvedEvents - 已解决事件
 * @property {Object} worldFlags - 世界状态标志
 * @property {Object} eventGraph - 事件图
 * @property {Object|null} activeContest - 当前进行的比赛
 * @property {number} contestTimeRemaining - 比赛剩余时间
 * @property {Array} teammates - 队友列表
 * @property {Array|null} selectedTeam - 当前选择的队伍
 * @property {Object} buffs - Buff系统
 */

/**
 * @typedef {Object} LogEntry
 * @property {string} message - 日志消息
 * @property {string} type - 日志类型 ('info'|'success'|'warning'|'error')
 */

/**
 * @typedef {Object} UIState
 * @property {boolean} [showEventDialog]
 * @property {Object|null} [currentEvent]
 * @property {boolean} [showContestResult]
 * @property {Object|null} [contestOutcome]
 * @property {boolean} [showTeammateDialog]
 * @property {boolean} [showPracticeContestDialog]
 * @property {Object|null} [pendingEventChoice]
 * @property {Object|null} [confirmDialog]
 * @property {string|null} [gameOverReason]
 */

/**
 * @typedef {Object} LogicResult
 * @property {GameState} newState - 新的游戏状态
 * @property {LogEntry[]} logs - 要添加的日志
 * @property {UIState} uiState - UI 状态更新
 * @property {string|null} [notification] - 通知消息
 * @property {string|null} [gameOverReason] - 游戏结束原因
 * @property {boolean} [clearLogs] - 是否清空日志
 */

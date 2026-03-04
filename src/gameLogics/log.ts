/**
 * 创建添加日志的函数
 * @param setLogs - 设置日志状态的函数
 * @returns 添加日志的函数
 */
type LogType = 'info' | 'success' | 'warning' | 'error';

interface LogEntryWithMeta {
  id: number;
  time: string;
  message: string;
  type: LogType;
}

type SetLogsFunction = (updater: (prev: LogEntryWithMeta[]) => LogEntryWithMeta[]) => void;

export const createAddLog = (setLogs: SetLogsFunction) => (message: string, type: LogType = 'info') => {
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  setLogs(prev => [...prev, { id: Date.now(), time, message, type }]);
};

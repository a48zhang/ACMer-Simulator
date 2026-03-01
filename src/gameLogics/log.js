/**
 * 创建添加日志的函数
 * @param {Function} setLogs - 设置日志状态的函数
 * @returns {Function} 添加日志的函数
 */
export const createAddLog = (setLogs) => (message, type = 'info') => {
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  setLogs(prev => [...prev, { id: Date.now(), time, message, type }]);
};

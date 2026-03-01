import { MIN_GPA, MAX_GPA } from './constants';

/**
 * 将值限制在指定范围内
 * @param {number} value - 要限制的值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 限制后的值
 */
export const clampValue = (value, min, max) => Math.max(min, Math.min(max, value));

/**
 * 将GPA限制在有效范围内
 * @param {number} value - GPA值
 * @returns {number} 限制后的GPA值
 */
export const clampGPA = (value) => clampValue(value, MIN_GPA, MAX_GPA);

/**
 * 生成随机初始属性值 (0-2)
 * @returns {number} 随机值
 */
export const randomStarterValue = () => Math.floor(Math.random() * 3);

/**
 * 创建基础属性对象
 * @returns {Object} 基础属性
 */
export const createBaseAttributes = () => ({
  coding: 0,
  algorithm: randomStarterValue(),
  speed: randomStarterValue(),
  stress: randomStarterValue(),
  math: randomStarterValue(),
  dp: 0,
  graph: 0,
  dataStructure: 0,
  string: 0,
  search: 0,
  greedy: randomStarterValue(),
  geometry: randomStarterValue()
});

/**
 * 应用属性变化
 * @param {Object} currentAttributes - 当前属性
 * @param {Object} changes - 属性变化对象
 * @returns {Object} 更新后的属性
 */
export const applyAttributeChanges = (currentAttributes, changes) => {
  if (!changes) return currentAttributes;
  const updated = { ...currentAttributes };
  Object.entries(changes).forEach(([attr, delta]) => {
    if (updated[attr] === undefined) return;
    updated[attr] = Math.max(0, updated[attr] + delta);
  });
  return updated;
};

/**
 * 获取字段值的辅助函数（支持直接设置或增量变化）
 * @param {Object} effects - 效果对象
 * @param {Object} prevState - 前一个状态
 * @param {string} field - 字段名
 * @param {string} deltaField - 增量字段名
 * @returns {*} 计算后的值
 */
export const getFieldValue = (effects, prevState, field, deltaField) => {
  if (effects[field] !== undefined) return effects[field];
  if (effects[deltaField] !== undefined) return prevState[field] + effects[deltaField];
  return prevState[field];
};

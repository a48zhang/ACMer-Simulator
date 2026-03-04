import { MIN_GPA, MAX_GPA } from './constants';
import type { Attributes } from './types';

/**
 * 将值限制在指定范围内
 * @param value - 要限制的值
 * @param min - 最小值
 * @param max - 最大值
 * @returns 限制后的值
 */
export const clampValue = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * 将GPA限制在有效范围内
 * @param value - GPA值
 * @returns 限制后的GPA值
 */
export const clampGPA = (value: number): number =>
  clampValue(value, MIN_GPA, MAX_GPA);

/**
 * 生成随机初始属性值 (0-2)
 * @returns 随机值
 */
export const randomStarterValue = (): number =>
  Math.floor(Math.random() * 3);

/**
 * 创建基础属性对象
 * @returns 基础属性
 */
export const createBaseAttributes = (): Attributes => ({
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
 * @param currentAttributes - 当前属性
 * @param changes - 属性变化对象
 * @returns 更新后的属性
 */
export const applyAttributeChanges = (
  currentAttributes: Attributes,
  changes: Partial<Attributes> | undefined
): Attributes => {
  if (!changes) return currentAttributes;
  const updated = { ...currentAttributes };
  (Object.entries(changes) as [keyof Attributes, number][]).forEach(([attr, delta]) => {
    if (updated[attr] === undefined) return;
    updated[attr] = Math.max(0, updated[attr] + delta);
  });
  return updated;
};

/**
 * 获取字段值的辅助函数（支持直接设置或增量变化）
 * @param effects - 效果对象
 * @param prevState - 前一个状态
 * @param field - 字段名
 * @param deltaField - 增量字段名
 * @returns 计算后的值
 */
export const getFieldValue = <T, K extends keyof T>(
  effects: Record<string, unknown>,
  prevState: T,
  field: K,
  deltaField: string
): T[K] => {
  if (effects[field as string] !== undefined) return effects[field as string] as T[K];
  if (effects[deltaField] !== undefined) {
    return (prevState[field] as number) + (effects[deltaField] as number) as T[K];
  }
  return prevState[field];
};

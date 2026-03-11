import { MIN_GPA, MAX_GPA } from './constants';
import type { Attributes, GameState } from './types';

const ATTRIBUTE_KEYS: (keyof Attributes)[] = [
  'coding',
  'algorithm',
  'speed',
  'stress',
  'math',
  'dp',
  'graph',
  'dataStructure',
  'string',
  'search',
  'greedy',
  'geometry'
];

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
 * 获取当前月份可用的行动点上限
 * @param gameState - 当前游戏状态
 * @returns 当前月份 AP 上限
 */
export const getCurrentMonthlyAPCap = (
  gameState: Pick<GameState, 'monthlyAP' | 'san' | 'worldFlags'>
): number => {
  const storedCap = gameState.worldFlags?.monthlyAPCap;
  if (typeof storedCap === 'number') return storedCap;
  return gameState.san <= 0 ? Math.floor(gameState.monthlyAP / 2) : gameState.monthlyAP;
};

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
 * 计算比赛中生效的属性（玩家属性 + 当前选中队友属性）
 * @param gameState - 当前游戏状态
 * @returns 比赛生效属性
 */
export const getEffectiveContestAttributes = (
  gameState: Pick<GameState, 'attributes' | 'selectedTeam' | 'teammates'>
): Attributes => {
  const merged = { ...gameState.attributes };
  if (!gameState.selectedTeam?.length) return merged;

  gameState.selectedTeam.forEach((teammateId) => {
    const teammate = gameState.teammates.find(({ id }) => id === teammateId);
    if (!teammate) return;

    ATTRIBUTE_KEYS.forEach((key) => {
      merged[key] += teammate.attributes[key] ?? 0;
    });
  });

  return merged;
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

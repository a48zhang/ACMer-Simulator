import { describe, it, expect } from 'vitest';
import {
  clampValue,
  clampGPA,
  applyAttributeChanges,
  getCurrentMonthlyAPCap,
  getEffectiveContestAttributes
} from '../src/utils';

describe('工具函数', () => {
  it('clampValue应正确限制范围', () => {
    expect(clampValue(15, 0, 10)).toBe(10);
    expect(clampValue(-5, 0, 10)).toBe(0);
    expect(clampValue(5, 0, 10)).toBe(5);
  });

  it('clampValue边界值测试', () => {
    expect(clampValue(0, 0, 10)).toBe(0);
    expect(clampValue(10, 0, 10)).toBe(10);
    expect(clampValue(-0.0001, 0, 10)).toBe(0);
    expect(clampValue(10.0001, 0, 10)).toBe(10);
  });

  it('clampGPA应在0-4范围内', () => {
    expect(clampGPA(5.0)).toBe(4.0);
    expect(clampGPA(-1.0)).toBe(0);
    expect(clampGPA(3.5)).toBe(3.5);
  });

  it('clampGPA边界值测试', () => {
    expect(clampGPA(0)).toBe(0);
    expect(clampGPA(4.0)).toBe(4.0);
    expect(clampGPA(-0.1)).toBe(0);
    expect(clampGPA(4.1)).toBe(4.0);
    expect(clampGPA(2.5)).toBe(2.5);
  });

  it('applyAttributeChanges应正确应用变化', () => {
    const current = { math: 5, coding: 3 };
    const changes = { math: 2 };
    const result = applyAttributeChanges(current, changes);
    expect(result.math).toBe(7);
    expect(result.coding).toBe(3);
  });

  it('applyAttributeChanges空变化测试', () => {
    const current = { math: 5, coding: 3 };
    const result = applyAttributeChanges(current, {});
    expect(result).toEqual(current);
  });

  it('applyAttributeChanges多个变化测试', () => {
    const current = { math: 5, coding: 3, dp: 2 };
    const changes = { math: 2, coding: -1, dp: 3 };
    const result = applyAttributeChanges(current, changes);
    expect(result.math).toBe(7);
    expect(result.coding).toBe(2);
    expect(result.dp).toBe(5);
  });

  it('applyAttributeChanges属性不存在时应忽略', () => {
    const current = { math: 5 };
    const changes = { nonexistent: 10 };
    const result = applyAttributeChanges(current, changes);
    expect(result.math).toBe(5);
    expect(result.nonexistent).toBeUndefined();
  });

  it('applyAttributeChanges值为null时应返回原属性', () => {
    const current = { math: 5 };
    const result = applyAttributeChanges(current, null);
    expect(result).toBe(current);
  });

  it('getCurrentMonthlyAPCap应优先使用本月缓存上限', () => {
    const result = getCurrentMonthlyAPCap({
      monthlyAP: 30,
      san: 0,
      worldFlags: { monthlyAPCap: 15 }
    });
    expect(result).toBe(15);
  });

  it('getEffectiveContestAttributes应叠加已选队友属性', () => {
    const result = getEffectiveContestAttributes({
      attributes: {
        coding: 2,
        algorithm: 3,
        speed: 1,
        stress: 1,
        math: 0,
        dp: 0,
        graph: 0,
        dataStructure: 0,
        string: 0,
        search: 0,
        greedy: 0,
        geometry: 0
      },
      selectedTeam: ['tm1', 'tm2'],
      teammates: [
        { id: 'tm1', name: 'A', attributes: { coding: 1, graph: 2 } },
        { id: 'tm2', name: 'B', attributes: { algorithm: 2, speed: 3 } }
      ]
    });

    expect(result.coding).toBe(3);
    expect(result.algorithm).toBe(5);
    expect(result.speed).toBe(4);
    expect(result.graph).toBe(2);
  });
});

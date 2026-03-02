import { describe, it, expect } from 'vitest';
import { clampValue, clampGPA, applyAttributeChanges } from '../src/utils';

describe('工具函数', () => {
  it('clampValue应正确限制范围', () => {
    expect(clampValue(15, 0, 10)).toBe(10);
    expect(clampValue(-5, 0, 10)).toBe(0);
    expect(clampValue(5, 0, 10)).toBe(5);
  });

  it('clampGPA应在0-4范围内', () => {
    expect(clampGPA(5.0)).toBe(4.0);
    expect(clampGPA(-1.0)).toBe(0);
    expect(clampGPA(3.5)).toBe(3.5);
  });

  it('applyAttributeChanges应正确应用变化', () => {
    const current = { math: 5, coding: 3 };
    const changes = { math: 2 };
    const result = applyAttributeChanges(current, changes);
    expect(result.math).toBe(7);
    expect(result.coding).toBe(3);
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { applyTraitEffects } from '../src/data/traits';
import { createBaseAttributes } from '../src/utils';

describe('特性系统', () => {
  it('应应用特性效果', () => {
    const baseAttrs = createBaseAttributes();
    const result = applyTraitEffects(['trait_math_genius'], baseAttrs);
    expect(result.attributes.math).toBeGreaterThan(baseAttrs.math);
    expect(result.attributes.geometry).toBeGreaterThan(baseAttrs.geometry);
  });

  it('随机属性分配应有效果', () => {
    const baseAttrs = createBaseAttributes();
    const result = applyTraitEffects(['trait_noip_1'], baseAttrs);
    expect(result.attributes.dp).toBeGreaterThanOrEqual(5);
    const baseSum = Object.values(baseAttrs).reduce((a, b) => a + b, 0);
    const resultSum = Object.values(result.attributes).reduce((a, b) => a + b, 0);
    expect(resultSum).toBeGreaterThan(baseSum);
  });
});

describe('特性系统 - 稳定测试', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('随机属性分配应有可预测结果', () => {
    const baseAttrs = createBaseAttributes();
    const result = applyTraitEffects(['trait_noip_1'], baseAttrs);
    expect(result.attributes.dp).toBe(5);
    const baseSum = Object.values(baseAttrs).reduce((a, b) => a + b, 0);
    const resultSum = Object.values(result.attributes).reduce((a, b) => a + b, 0);
    expect(resultSum).toBeGreaterThan(baseSum);
  });

  it('负面特性应返回惩罚值', () => {
    const baseAttrs = createBaseAttributes();
    const result = applyTraitEffects(['trait_stress'], baseAttrs);
    expect(result.sanPenalty).toBeGreaterThan(0);
  });

  it('无特性时应返回原属性', () => {
    const baseAttrs = createBaseAttributes();
    const result = applyTraitEffects([], baseAttrs);
    expect(result.attributes).toEqual(baseAttrs);
    expect(result.sanPenalty).toBe(0);
    expect(result.moneyPenalty).toBe(0);
  });
});

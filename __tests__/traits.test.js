import { describe, it, expect } from 'vitest';
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
    expect(result.attributes.dp).toBe(5);
    // 随机分配的属性点可能导致总和变化
    const baseSum = Object.values(baseAttrs).reduce((a, b) => a + b, 0);
    const resultSum = Object.values(result.attributes).reduce((a, b) => a + b, 0);
    expect(resultSum).toBeGreaterThan(baseSum);
  });
});

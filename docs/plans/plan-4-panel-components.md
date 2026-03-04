# 计划4：Panel 组件迁移

## 目标
将 `src/components/panels/` 下的所有面板组件从 .jsx 迁移至 .tsx。

## 前置条件
- [ ] 计划2（通用组件）已完成 或 跳过
- [ ] 计划3（Dialog 组件）已完成 或 跳过

## 文件列表

### 简单 Panel（无复杂状态）
- [ ] `src/components/panels/GlobalStatistics.jsx` → `GlobalStatistics.tsx`
- [ ] `src/components/panels/IntroPanel.jsx` → `IntroPanel.tsx`
- [ ] `src/components/panels/LogPanel.jsx` → `LogPanel.tsx`
- [ ] `src/components/panels/TraitSelectionPanel.jsx` → `TraitSelectionPanel.tsx`

### 已优化的 Panel（使用 React.memo）
- [ ] `src/components/panels/PlayerPanel.jsx` → `PlayerPanel.tsx`
- [ ] `src/components/panels/ActivityPanel.jsx` → `ActivityPanel.tsx`
- [ ] `src/components/panels/EventPanel.jsx` → `EventPanel.tsx`

## 实施原则
- 保留已有的性能优化（React.memo, useMemo, useCallback）
- 使用 `src/types/index.ts` 中已定义的类型
- 保持所有 props 和回调的类型安全

## 特殊注意
- PlayerPanel/ActivityPanel/EventPanel 已经过性能优化，迁移时需保留 `memo` 包装
- 这些组件使用了 `useMemo` 和 `useCallback`，需要正确标注类型

## 类型导入
需要导入的类型：
- `Attributes`, `GameState`, `Activity`, `Event`, `LogEntry`, `Trait`
- 以及相关的回调函数类型

## 实施步骤

### 示例：PlayerPanel.tsx
```typescript
import { memo, useMemo } from 'react';
import styled from 'styled-components';
import type { Attributes } from '../../types';

interface PlayerPanelProps {
  attributes: Attributes;
  gpa: number;
  san: number;
  balance: number;
  rating: number;
  // ... 其他 props
}

const AttributeCard = memo(function AttributeCard({
  name,
  value,
  max
}: {
  name: string;
  value: number;
  max: number;
}) {
  // 组件逻辑
});

function PlayerPanel({ attributes, gpa, san, balance }: PlayerPanelProps) {
  // 使用 useMemo 时需要注意类型推断
  const attributeList = useMemo(() => {
    return [
      { key: 'algorithm' as const, name: '算法', value: attributes.algorithm, max: 100 },
      // ...
    ];
  }, [attributes]);

  // ...
}

export default memo(PlayerPanel);
```

## 验证步骤
每迁移一个组件：
1. 运行 `npm run build`
2. 在浏览器中验证面板显示正常
3. 测试交互功能（点击活动、查看事件等）
4. 运行 `npm test`

## 验收标准
- [ ] 所有 7 个 Panel 组件已迁移至 .tsx
- [ ] `tsc --noEmit` 无错误
- [ ] `npm run build` 成功
- [ ] 所有测试通过
- [ ] 面板在浏览器中正常显示和交互
- [ ] 性能优化依然有效（React.memo 被保留）

## 注意事项
- 此计划可独立执行
- 三个已优化的 Panel 是核心组件，建议仔细验证

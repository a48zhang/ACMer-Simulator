# 计划3：Dialog 组件迁移

## 目标
将 `src/components/dialogs/` 下的所有对话框组件从 .jsx 迁移至 .tsx。

## 前置条件
- [ ] 计划2（通用组件）已完成 或 跳过（允许文件共存）

## 文件列表
按依赖顺序排序：

### 基础 Dialog（无特殊依赖）
- [ ] `src/components/dialogs/ConfirmDialog.jsx` → `ConfirmDialog.tsx`
- [ ] `src/components/dialogs/GameOverDialog.jsx` → `GameOverDialog.tsx`
- [ ] `src/components/dialogs/TraitSelectionDialog.jsx` → `TraitSelectionDialog.tsx`
- [ ] `src/components/dialogs/PracticeContestSelectionDialog.jsx` → `PracticeContestSelectionDialog.tsx`

### 依赖游戏状态的 Dialog
- [ ] `src/components/dialogs/EventDialog.jsx` → `EventDialog.tsx`
- [ ] `src/components/dialogs/ContestResultDialog.jsx` → `ContestResultDialog.tsx`
- [ ] `src/components/dialogs/TeammateSelectionDialog.jsx` → `TeammateSelectionDialog.tsx`

## 实施原则
- 保持组件功能完全一致
- 使用 `src/types/index.ts` 中已定义的类型
- 保留所有现有 props 和回调
- 正确处理 optional props

## 类型导入
需要从 `../types` 导入的类型：
- `GameState`, `Event`, `Choice`, `ContestOutcome`, `Teammate`, `Trait`
- `UIState`, `LogEntry` 等

## 实施步骤

### 每个组件的迁移流程
1. 复制文件，改扩展名 `.jsx` → `.tsx`
2. 添加 Props 接口定义
3. 为所有变量、回调添加类型注解
4. 修复 TypeScript 错误
5. 验证功能正常

### 示例：ConfirmDialog.tsx
```typescript
import { useState } from 'react';
import styled from 'styled-components';

interface ConfirmDialogProps {
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const ConfirmDialog = ({
  title = '确认',
  message,
  onConfirm,
  onCancel
}: ConfirmDialogProps) => {
  // 组件逻辑保持不变
};

export default ConfirmDialog;
```

## 验证步骤
每迁移一个组件：
1. 运行 `npm run build`
2. 在浏览器中测试该 Dialog 的显示和交互
3. 运行 `npm test`

## 验收标准
- [ ] 所有 7 个 Dialog 组件已迁移至 .tsx
- [ ] `tsc --noEmit` 无错误
- [ ] `npm run build` 成功
- [ ] 所有测试通过
- [ ] 每个 Dialog 都能正常显示和交互

## 注意事项
- 此计划可独立执行，不依赖其他 Panel/Game 组件计划
- Dialog 之间大部分互不依赖，可以按任意顺序迁移

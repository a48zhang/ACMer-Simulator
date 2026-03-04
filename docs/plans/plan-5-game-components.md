# 计划5：Game 组件迁移

## 目标
将 `src/components/game/` 下的游戏相关组件从 .jsx 迁移至 .tsx。

## 前置条件
- [ ] 计划2（通用组件）已完成 或 跳过

## 文件列表
- [ ] `src/components/game/Notification.jsx` → `Notification.tsx`
- [ ] `src/components/game/PlayerStatus.jsx` → `PlayerStatus.tsx`
- [ ] `src/components/game/AttributeDialog.jsx` → `AttributeDialog.tsx`
- [ ] `src/components/game/AttributeAllocation.jsx` → `AttributeAllocation.tsx`
- [ ] `src/components/game/ContestInProgress.jsx` → `ContestInProgress.tsx`
- [ ] `src/components/game/GameControls.jsx` → `GameControls.tsx`

## 实施原则
- 使用 `src/types/index.ts` 中的类型定义
- 特别注意 `ContestSession`, `Problem` 等比赛相关类型
- 正确处理回调函数类型

## 重点组件说明

### ContestInProgress.tsx
这是最复杂的组件，依赖以下类型：
- `ContestSession`
- `Problem`
- 相关的回调函数：`onReadProblem`, `onThinkProblem`, `onCodeProblem`, `onDebugProblem`, `onAttemptProblem`, `onFinishContest`

### AttributeAllocation.tsx
需要处理：
- `Attributes` 类型
- 属性分配的回调函数

## 类型导入示例
```typescript
import type {
  GameState,
  ContestSession,
  Problem,
  Attributes
} from '../../types';

// 回调函数类型
interface ContestInProgressProps {
  contest: ContestSession;
  contestTimeRemaining: number;
  attributes: Attributes;
  onReadProblem: (problemId: string) => void;
  onThinkProblem: (problemId: string) => void;
  onCodeProblem: (problemId: string) => void;
  onDebugProblem: (problemId: string) => void;
  onAttemptProblem: (problemId: string) => void;
  onFinishContest: () => void;
}
```

## 实施步骤

1. **从简单组件开始**
   - Notification
   - PlayerStatus
   - GameControls

2. **中等复杂度组件**
   - AttributeDialog
   - AttributeAllocation

3. **复杂组件**
   - ContestInProgress（最后迁移）

## 验证步骤
每迁移一个组件：
1. 运行 `npm run build`
2. 在浏览器中测试相关功能
3. 对于 ContestInProgress，需要实际进行一场比赛来验证
4. 运行 `npm test`

## 验收标准
- [ ] 所有 6 个 Game 组件已迁移至 .tsx
- [ ] `tsc --noEmit` 无错误
- [ ] `npm run build` 成功
- [ ] 所有测试通过
- [ ] 比赛流程完整可运行
- [ ] 属性分配功能正常

## 注意事项
- 此计划可独立执行
- ContestInProgress 是核心组件，建议最后迁移并充分测试

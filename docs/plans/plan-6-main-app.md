# 计划6：主入口和 App 组件迁移

## 目标
迁移应用入口文件和主 App 组件。

## 前置条件
- [ ] 计划2-5（所有 UI 组件）已完成 或 跳过

## 文件列表
- [ ] `src/main.jsx` → `src/main.tsx`
- [ ] `src/App.jsx` → `src/App.tsx`

## 实施原则
- 这是最后一步 UI 迁移
- 需要正确导入所有已迁移的组件
- 保持状态管理逻辑不变

## main.tsx 迁移
主要变化：
- 扩展名 `.jsx` → `.tsx`
- 不需要额外类型，保持简单

## App.tsx 迁移
关键点：
- 为 `gameState` 添加 `GameState` 类型
- 为所有回调函数添加类型
- 正确导入已迁移为 `.tsx` 的子组件
- 保留所有性能优化（useCallback, memo 等）

### 类型示例
```typescript
import { useState, useCallback, useEffect } from 'react';
import type { GameState } from './types';
// 导入其他类型...

function App() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [uiState, setUiState] = useState<UIState>({});

  // 回调函数类型
  const handleActivity = useCallback((activityId: string) => {
    // ...
  }, []);

  // ...
}
```

## 验证步骤
1. 运行 `npm run build`
2. 完整测试游戏流程：
   - 开始新游戏
   - 选择特性
   - 执行活动
   - 参加比赛
   - 推进月份
   - 触发事件
3. 运行 `npm test`

## 验收标准
- [ ] `main.jsx` 已迁移为 `main.tsx`
- [ ] `App.jsx` 已迁移为 `App.tsx`
- [ ] `tsc --noEmit` 无错误
- [ ] `npm run build` 成功
- [ ] 所有测试通过
- [ ] 完整游戏流程可正常运行

## 注意事项
- 这是 UI 迁移的最后一步
- 建议在所有其他 UI 组件迁移完成后执行

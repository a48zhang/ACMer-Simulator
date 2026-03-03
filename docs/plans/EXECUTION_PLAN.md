# 剩余计划执行方案

## 执行策略

Plan E 和 F 相互独立，采用**并行执行策略**：

- **性能优化**: 可立即开始
- **TypeScript 迁移**: 分批次执行

---

## 性能优化

### 步骤 1: 组件分析
运行 React DevTools Profiler，识别高频渲染组件：

```bash
npm run dev
# 打开 Chrome DevTools → React → Profiler
```

记录：
- PlayerPanel 渲染次数
- ActivityPanel 渲染次数
- EventPanel 渲染次数
- App 组件渲染次数

### 步骤 2: 优化 PlayerPanel
文件: `src/components/panels/PlayerPanel.jsx`

改动：
- 添加 `React.memo` 包装
- 拆分 `AttributeCard` 为独立 memo 组件
- 使用 `useMemo` 缓存属性列表
- 使用 `useMemo` 缓存颜色计算

### 步骤 3: 优化 ActivityPanel
文件: `src/components/panels/ActivityPanel.jsx`

改动：
- 添加 `React.memo` 包装
- 拆分 `ActivityCard` 为独立 memo 组件
- 使用 `useCallback` 缓存事件回调
- 使用 `useMemo` 缓存活动列表

### 步骤 4: 优化 EventPanel
文件: `src/components/panels/EventPanel.jsx`

改动：
- 添加 `React.memo` 包装
- 拆分事件卡片为独立组件

### 步骤 5: 优化 App.jsx
文件: `src/App.jsx`

改动：
- 使用 `useCallback` 缓存事件处理函数
- 避免内联对象/数组作为 props
- 使用 memo 包装所有子组件

### 步骤 6: 验证优化
再次运行 Profiler，对比：
- 渲染次数减少 ≥ 30%
- 功能无退化
- 游戏运行正常

---

## TypeScript 迁移

### 前提条件
- ✅ `tsconfig.json` 已配置
- ✅ `allowJs: true` 已启用
- ✅ 测试覆盖完善

### 批次 1: 类型定义

**目标**: 建立完整的 TypeScript 类型系统

新建/修改文件:
1. `src/types/index.ts` - 核心类型定义
   - `Attributes`
   - `GameState`
   - `LogEntry`
   - `UIState`
   - `LogicResult`
   - `Trait`, `Activity`, `Event`, `Contest`

2. 从 `src/gameLogics/types.js` 迁移 JSDoc 到 TypeScript

**验证**: `npx tsc --noEmit` 无错误

---

### 批次 2: 工具模块

**目标**: 迁移无依赖的工具函数

迁移文件:
1. `src/utils.js` → `src/utils.ts`
2. `src/constants.js` → `src/constants.ts`
3. `src/config/gameBalance.js` → `src/config/gameBalance.ts`

**步骤**:
- 重命名文件扩展名
- 添加类型注解
- 更新所有导入引用
- 运行测试验证

**验证**:
- `npm test` 全部通过
- `npx tsc --noEmit` 无错误

---

### 批次 3: 数据层

**目标**: 迁移数据模块，保持导入兼容性

按顺序迁移:
1. `src/data/traits.js` → `traits.ts`
2. `src/data/activities.js` → `activities.ts`
3. `src/data/contests.js` → `contests.ts`
4. `src/data/events.js` → `events.ts`

**每文件步骤**:
1. 重命名为 `.ts`
2. 为数据添加类型注解
3. 为函数添加类型签名
4. 更新导入路径
5. 运行测试验证

**验证**:
- `npm test` 全部通过
- `npx tsc --noEmit` 无错误

---

### 批次 4: 游戏逻辑

**目标**: 迁移核心游戏逻辑模块

按顺序迁移:
1. `src/gameLogics/log.js` → `log.ts`
2. `src/gameLogics/contest.js` → `contest.ts`
3. `src/gameLogics/activity.js` → `activity.ts`
4. `src/gameLogics/month.js` → `month.ts`
5. `src/gameLogics/event.js` → `event.ts`
6. `src/gameLogics/gameFlow.js` → `gameFlow.ts`
7. `src/gameLogics/index.js` → `index.ts`

**注意**:
- `event.js` 依赖已导出的 `checkAcademicWarning` 和 `checkScholarship`
- 需要先迁移 `month.js` 再迁移 `event.js`

**验证**:
- `npm test` 全部通过
- `npx tsc --noEmit` 无错误
- 游戏可正常运行

---

### 批次 5: 状态管理

**目标**: 迁移状态管理模块

迁移:
1. `src/gameState.js` → `gameState.ts`

**验证**:
- `npm test` 全部通过
- `npx tsc --noEmit` 无错误

---

### 批次 6: UI 组件

**目标**: 迁移 React 组件

按复杂度迁移:
1. 简单组件 (无状态):
   - `src/components/common/*.js`
   - `src/styles/*.js`

2. 中等复杂度:
   - `src/components/dialogs/*.jsx`
   - `src/components/game/*.jsx`

3. 复杂组件:
   - `src/components/panels/*.jsx`
   - `src/App.jsx`

**每组件步骤**:
1. 重命名为 `.tsx`
2. 为 props 添加接口
3. 为状态添加类型
4. 修复类型错误
5. 验证渲染正常

**验证**:
- `npm run dev` 页面正常渲染
- `npx tsc --noEmit` 无错误
- 所有交互功能正常

---

### 批次 7: 清理

**目标**: 最终清理与验证

任务:
1. 删除所有 `.js` 备份文件
2. 更新 `tsconfig.json`:
   - `allowJs: false`
   - `checkJs: false`
3. 运行完整类型检查: `npx tsc --noEmit`
4. 运行完整测试: `npm test`
5. 运行完整构建: `npm run build`

**验收标准**:
- [ ] 无 `.js` 源文件剩余
- [ ] `tsc --noEmit` 零错误
- [ ] 所有测试通过
- [ ] 构建成功
- [ ] 游戏运行正常

---

## 并行执行建议

| 阶段 | 性能优化 | TypeScript 迁移 |
|------|---------|----------------|
| 1 | Profiler + PlayerPanel | 类型定义 |
| 2 | ActivityPanel + EventPanel | 工具模块 + traits/activities |
| 3 | App.jsx + 验证 | contests/events |
| 4 | (可协助测试) | gameLogics |
| 5 | (可协助测试) | gameState + 简单组件 |
| 6 | (可协助测试) | 复杂组件 |
| 7 | (可协助测试) | 清理验证 |

---

## 风险与缓解

### TypeScript 迁移引入 bug
- 每批次后运行完整测试
- 保持 Git 分支，可随时回退
- 使用 `git bisect` 定位问题

### 性能优化过度复杂
- 先测量再优化
- 每个优化独立提交
- 保持代码可读性

### 类型定义不准确
- 从 JSDoc 迁移类型
- 参考运行时数据结构
- 使用 `unknown` 逐步收窄类型

---

## 检查清单

### 性能优化
- [ ] Profiler 基准测量完成
- [ ] PlayerPanel 已优化 (memo + useMemo)
- [ ] ActivityPanel 已优化 (memo + useCallback)
- [ ] EventPanel 已优化
- [ ] App.jsx 已优化
- [ ] Profiler 验证渲染减少 ≥30%
- [ ] 所有测试通过

### TypeScript 迁移
- [ ] 类型定义完成
- [ ] utils/constants/gameBalance 迁移完成
- [ ] traits/activities/contests/events 迁移完成
- [ ] gameLogics 全部迁移完成
- [ ] gameState 迁移完成
- [ ] 所有组件迁移完成
- [ ] 清理完成，tsc 零错误
- [ ] 所有测试通过
- [ ] 构建成功

---

## 成功标准

- [ ] 性能优化完成，渲染性能提升 ≥30%
- [ ] TypeScript 迁移完成，零错误
- [ ] 所有测试通过 (74个)
- [ ] `npm run build` 成功
- [ ] 游戏可正常运行

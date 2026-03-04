# 改进计划总览

本文档包含 ACMer-Simulator 项目的剩余改进方案。

## 计划清单

| 计划 | 目标 | 状态 |
|------|------|------|
| ~~配置提取与清理~~ | 提取配置常量到独立文件 | ✅ 已完成 |
| ~~代码重构~~ | 拆分长函数，降低复杂度 | ✅ 已完成 |
| ~~测试覆盖~~ | 添加单元测试，覆盖率 >80% | ✅ 已完成 |
| ~~TypeScript基础设施~~ | 配置 tsconfig，基础类型 | ✅ 已完成 |
| ~~性能优化~~ | 减少不必要的 React 渲染 | ✅ 已完成 |
| **TypeScript 迁移** | 将所有模块迁移到 TypeScript | **进行中（部分完成）** |

## 执行策略

详细执行方案请查看: [EXECUTION_PLAN.md](./EXECUTION_PLAN.md)

### 重要提示

**两个计划不能并行执行**，因为会修改相同的组件文件！

采用**顺序执行策略**：
1. **先执行性能优化** 并合并到 main
2. **再执行 TypeScript 迁移**，包含已优化的代码

### 性能优化步骤

1. Profiler 基准测量
2. PlayerPanel 优化
3. ActivityPanel 优化
4. EventPanel 优化
5. App.jsx 优化
6. 验证性能提升 ≥30%
7. **合并到 main** (必须完成后才能开始迁移)

### TypeScript 迁移批次

在性能优化完成后开始：

1. 类型定义
2. 工具模块 (utils, constants, gameBalance)
3. 数据层 (traits, activities, contests, events)
4. 游戏逻辑
5. 状态管理
6. UI 组件 (包含已优化的代码)
7. 清理验证

## 依赖关系图

```
已完成: ┌─────────────────────────────────────────────────┐
         │  配置提取  代码重构  测试覆盖  TS基础设施        │
         └─────────────────────────────────────────────────┘

顺序:   ┌─────────────────────────────────────────────────┐
         │  性能优化 (先执行) →  TypeScript 迁移 (后执行)   │
         └─────────────────────────────────────────────────┘
```

## 快速启动

### 执行剩余计划

查看详细执行方案：

```bash
# 详细执行方案
open docs/plans/EXECUTION_PLAN.md
```

## 验收标准

### 已完成

- ✅ 配置集中管理
- ✅ 函数复杂度达标
- ✅ 测试通过 >80% 覆盖
- ✅ 性能优化 (React.memo, useMemo, useCallback)
- ✅ TypeScript 类型定义
- ✅ TypeScript 工具模块 (constants, gameBalance, utils)
- ✅ TypeScript 数据层 (traits, activities, contests)

### 待完成

- [ ] TypeScript 数据层 (events)
- [ ] TypeScript 游戏逻辑
- [ ] TypeScript 状态管理
- [ ] TypeScript UI 组件
- [ ] TypeScript 零错误
- [ ] 性能优化效果在 TypeScript 迁移后保留

## 文件位置

- 配置: `src/config/gameBalance.js`
- 类型: `src/gameLogics/types.js` (现有JSDoc)
- 测试: `__tests__/*.test.js`

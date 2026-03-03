# 改进计划总览

本文档包含 ACMer-Simulator 项目的剩余改进方案。

## 子计划清单

| 计划 | 文件名 | 目标 | 工期 | 依赖 | 状态 |
|------|--------|------|------|------|------|
| ~~**A**~~ | ~~plan-A.md~~ | 配置提取与清理 | 3天 | 无 | ✅ 已完成 |
| ~~**B**~~ | ~~plan-B.md~~ | 代码重构 | 4天 | 无 | ✅ 已完成 |
| ~~**C**~~ | ~~plan-C.md~~ | 测试覆盖 | 5天 | 无 | ✅ 已完成 |
| ~~**D**~~ | ~~plan-D.md~~ | TypeScript基础设施 | 3天 | 无 | ✅ 已完成 |
| **E** | [plan-E.md](./plan-E.md) | TypeScript迁移 | 10天 | D | 待开始 |
| **F** | [plan-F.md](./plan-F.md) | 性能优化 | 2天 | 无 | 待开始 |

## 执行方案

详细执行方案请查看: [EXECUTION_PLAN.md](./EXECUTION_PLAN.md)

### 快速摘要

**并行执行策略**:
- **Plan F (性能优化)** 可立即开始，预计 1-2 天
- **Plan E (TypeScript 迁移)** 分 7 批次执行，预计 5-7 天

### 已完成阶段

**A、B、C、D** 已完成并合并：
- **A**: 配置提取到 `src/config/gameBalance.js`
- **B**: 代码重构完成，`advanceMonth`、`processFinalsWeek` 已拆分
- **C**: 测试覆盖完成，74个测试全部通过
- **D**: TypeScript基础设施配置完成

### 剩余阶段

**Plan F (性能优化)**:
1. Profiler 基准测量
2. PlayerPanel 优化
3. ActivityPanel 优化
4. EventPanel 优化
5. App.jsx 优化
6. 验证性能提升 ≥30%

**Plan E (TypeScript 迁移)**:
- E1: 类型定义
- E2: 工具模块 (utils, constants, gameBalance)
- E3: 数据层 (traits, activities, contests, events)
- E4: 游戏逻辑
- E5: 状态管理
- E6: UI 组件
- E7: 清理验证

## 依赖关系图

```
已完成: ┌─────────────────────────────────────────────────┐
         │  A:配置提取  B:代码重构  C:测试覆盖  D:TS基础   │
         └─────────────────────────────────────────────────┘

并行:   ┌─────────────────────────────────────────────────┐
         │  F:性能优化 (立即开始)                           │
         └─────────────────────────────────────────────────┘
         ┌─────────────────────────────────────────────────┐
         │  E: TypeScript 迁移 (分7批次)                    │
         │  E1→E2→E3→E4→E5→E6→E7                           │
         └─────────────────────────────────────────────────┘
```

## 快速启动

### 执行剩余计划

查看详细执行方案：

```bash
# 详细执行方案
open docs/plans/EXECUTION_PLAN.md

# 计划E（TypeScript迁移）
open docs/plans/plan-E.md

# 计划F（性能优化）
open docs/plans/plan-F.md
```

## 验收标准

### 已完成

- ✅ 配置集中管理（A完成）
- ✅ 函数复杂度达标（B完成）
- ✅ 测试通过 >80% 覆盖（C完成）

### 待完成

- [ ] TypeScript 零错误（E完成）
- [ ] 性能改善 >30%（F完成）

## 文件位置

- 配置: `src/config/gameBalance.js`（计划A创建）
- 类型: `src/gameLogics/types.js`（现有JSDoc）
- 测试: `__tests__/*.test.js`（计划C创建）

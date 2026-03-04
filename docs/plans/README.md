# TypeScript 迁移计划总览

本文档包含 ACMer-Simulator 项目剩余的 TypeScript 迁移计划。所有计划相互独立，可按任意顺序执行。

## 已完成进度

| 阶段 | 状态 |
|------|------|
| 性能优化 | ✅ 已完成 |
| 类型定义 | ✅ 已完成 |
| 工具模块迁移 | ✅ 已完成 |
| 数据层迁移 | ✅ 已完成 |
| 游戏逻辑迁移 | ✅ 已完成 |
| 状态管理迁移 | ✅ 已完成 |

---

## 剩余计划（互不依赖）

所有以下计划相互独立，可以按任意顺序执行。

| 计划 | 文件 | 目标 |
|------|------|------|
| **计划1** | [plan-1-cleanup-old-js.md](./plan-1-cleanup-old-js.md) | 删除已迁移的旧 .js 文件 |
| **计划2** | [plan-2-common-components.md](./plan-2-common-components.md) | 通用组件迁移 (Button, Card, Layout) |
| **计划3** | [plan-3-dialog-components.md](./plan-3-dialog-components.md) | Dialog 组件迁移 (7个文件) |
| **计划4** | [plan-4-panel-components.md](./plan-4-panel-components.md) | Panel 组件迁移 (7个文件，含已优化的组件) |
| **计划5** | [plan-5-game-components.md](./plan-5-game-components.md) | Game 组件迁移 (6个文件) |
| **计划6** | [plan-6-main-app.md](./plan-6-main-app.md) | 主入口和 App 组件迁移 |
| **计划7** | [plan-7-final-cleanup.md](./plan-7-final-cleanup.md) | 最终清理 (allowJs=false) |

---

## 计划依赖关系图

```
所有计划相互独立，无依赖关系：

┌─────────────────────────────────────────────────────────────┐
│  计划1: 清理旧 .js文件                                       │
│  计划2: 通用组件 ─┐                                         │
│  计划3: Dialog 组件 │                                         │
│  计划4: Panel 组件  ├─> 可独立执行，互不影响                 │
│  计划5: Game 组件   │                                         │
│  计划6: 主入口/App  ─┘                                         │
│  计划7: 最终清理 (需等其他UI计划完成后)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 推荐执行顺序

虽然计划互不依赖，但推荐按以下顺序执行：

1. **计划1** - 先清理旧文件，避免混淆
2. **计划2 → 计划3 → 计划4 → 计划5** - 按组件复杂度递增
3. **计划6** - 主应用迁移
4. **计划7** - 最终清理

---

## 当前状态

- ✅ 74 个测试全部通过
- ✅ 构建正常 (`npm run build`)
- ✅ 核心模块已迁移至 TypeScript
- ⏳ UI 组件待迁移
- ⏳ `allowJs: true` (仍允许 .js 文件)

---

## 快速开始

选择任意计划开始执行：

```bash
# 查看计划1 (清理旧文件)
cat docs/plans/plan-1-cleanup-old-js.md

# 查看计划2 (通用组件)
cat docs/plans/plan-2-common-components.md

# 以此类推...
```

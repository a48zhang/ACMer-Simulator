# TypeScript 迁移验证计划总览

本文档描述每个迁移计划完成后的验证步骤和验收标准。

---

## 通用验证步骤（所有计划适用）

每个计划完成后都需要执行以下验证：

### 1. 类型检查
```bash
npx tsc --noEmit
```
**验收标准**: 无 TypeScript 错误

### 2. 构建验证
```bash
npm run build
```
**验收标准**: 构建成功，无错误

### 3. 测试验证
```bash
npm test
```
**验收标准**: 所有 74 个测试通过

### 4. 功能验证
在浏览器中手动测试：
- 游戏可以正常启动
- 特性选择可以正常进行
- 活动可以执行
- 月份可以推进

---

## 各计划的专项验证

### 计划1：清理旧 .js 文件验证

#### 文件系统验证
```bash
# 确认以下文件已删除
ls -la src/constants.js
ls -la src/utils.js
ls -la src/gameState.js
ls -la src/config/gameBalance.js
ls -la src/data/traits.js
ls -la src/data/activities.js
ls -la src/data/contests.js
ls -la src/data/events.js
ls -la src/gameLogics/*.js
```
**验收标准**: 上述文件不存在

#### 导入验证
检查所有导入路径是否正确引用 .ts 文件：
```bash
# 搜索可能引用旧 .js 文件的地方
grep -r "\.js'" src --include="*.ts" --include="*.tsx"
grep -r '\.js"' src --include="*.ts" --include="*.tsx"
```
**验收标准**: 无显式引用 .js 文件的导入

---

### 计划2：通用组件验证

#### 渲染验证
在浏览器中验证：
- [ ] Button 组件在多个地方正常显示
- [ ] Card 组件在多个地方正常显示
- [ ] Layout 组件正常工作，页面布局正确

#### 交互验证
- [ ] Button 点击事件正常响应
- [ ] Button disabled 状态正常显示

#### 快照验证（如果有）
如果有组件快照测试，确保快照通过。

---

### 计划3：Dialog 组件验证

#### Dialog 显示验证
逐个测试每个 Dialog：

| Dialog | 触发方式 | 验证项 |
|--------|----------|--------|
| ConfirmDialog | 点击重置游戏 | 显示标题、消息、确认/取消按钮 |
| GameOverDialog | 游戏结束时 | 显示游戏结束原因、重新开始按钮 |
| TraitSelectionDialog | 开始新游戏 | 显示特性列表、选择/取消选择、确认 |
| PracticeContestSelectionDialog | 点击练习赛活动 | 显示比赛选项列表 |
| EventDialog | 触发事件时 | 显示事件标题、描述、选项按钮 |
| ContestResultDialog | 比赛结束后 | 显示比赛结果、排名变化、确认按钮 |
| TeammateSelectionDialog | 需要组队时 | 显示队友列表、复选框、确认 |

#### 交互验证
- [ ] 所有 Dialog 的按钮点击正常工作
- [ ]  Dialog 可以正常打开和关闭
- [ ]  Dialog 内的表单输入正常（如果有）

---

### 计划4：Panel 组件验证

#### Panel 显示验证

| Panel | 位置 | 验证项 |
|-------|------|--------|
| GlobalStatistics | 统计面板 | 显示所有统计数据 |
| IntroPanel | 开始界面 | 显示介绍内容、开始按钮 |
| LogPanel | 日志面板 | 显示日志列表、滚动正常 |
| TraitSelectionPanel | 特性选择 | 显示特性卡片、选择交互 |
| PlayerPanel | 左侧 | 显示属性条、GPA、SAN、余额 |
| ActivityPanel | 中间 | 显示活动列表、AP 消耗显示 |
| EventPanel | 右侧 | 显示事件列表 |

#### 性能验证（重点）
由于 PlayerPanel/ActivityPanel/EventPanel 已优化，需要验证：
- 使用 React DevTools Profiler
- 验证组件只在 props 变化时重渲染
- 验证 memo 包装依然有效

#### 交互验证
- [ ] 活动点击正常执行
- [ ] 事件点击正常打开 Dialog
- [ ] 日志滚动正常
- [ ] 属性条动画正常（如果有）

---

### 计划5：Game 组件验证

#### 组件功能验证

| 组件 | 验证场景 |
|------|----------|
| Notification | 通知弹出、自动消失 |
| PlayerStatus | 显示玩家状态信息 |
| AttributeDialog | 属性分配弹窗、滑块交互 |
| AttributeAllocation | 属性点分配、预览计算 |
| ContestInProgress | **完整比赛流程测试** |
| GameControls | 游戏控制按钮（推进月份等） |

#### 比赛流程完整验证（重点）
这是最重要的验证：
1. 开始一场练习赛
2. 验证题目列表显示
3. 执行读题操作 - 验证时间减少
4. 执行思考操作 - 验证时间减少
5. 执行写代码操作 - 验证时间减少
6. 执行对拍操作 - 验证时间减少
7. 执行提交操作 - 验证通过/失败状态
8. 完成比赛 - 验证结果 Dialog 显示

---

### 计划6：主入口和 App 验证

#### 完整流程验证
执行完整游戏流程：
1. 打开应用 - 验证 IntroPanel 显示
2. 点击开始游戏 - 验证 TraitSelectionDialog 显示
3. 选择特性并确认 - 验证游戏开始
4. 执行多个活动 - 验证状态更新
5. 参加一场比赛 - 验证比赛流程
6. 推进多个月份 - 验证事件触发
7. 触发游戏结束 - 验证 GameOverDialog 显示
8. 重新开始 - 验证状态重置

#### 状态管理验证
- [ ] 游戏状态正确保存和更新
- [ ] 日志正确追加
- [ ] UI 状态正确同步

---

### 计划7：最终清理验证

#### TypeScript 严格验证
```bash
npx tsc --noEmit --strict
```
**验收标准**: 零错误

#### 无 .js 文件验证
```bash
# 检查 src 下是否还有业务逻辑的 .js/.jsx 文件
find src -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v styles/
```
**验收标准**: 只有样式文件可以是 .js（如果选择不迁移样式）

#### allowJs 验证
检查 `tsconfig.json`:
```json
{
  "compilerOptions": {
    "allowJs": false
  }
}
```

#### 完整回归测试
执行完整游戏流程多次，确保一切正常。

---

## 端到端完整测试脚本

可以使用以下步骤进行完整回归测试：

```bash
# 1. 类型检查
npx tsc --noEmit

# 2. 构建
npm run build

# 3. 测试
npm test

# 4. 手动测试清单
# - [ ] 新游戏流程
# - [ ] 特性选择
# - [ ] 执行各种活动
# - [ ] 参加比赛
# - [ ] 推进月份
# - [ ] 触发事件
# - [ ] 游戏结束
# - [ ] 重新开始
```

---

## 验证检查清单模板

每个计划完成后，复制并填写以下清单：

```markdown
## [计划名称] 验证清单

### 通用验证
- [ ] `npx tsc --noEmit` 无错误
- [ ] `npm run build` 成功
- [ ] `npm test` 全部 74 个测试通过

### 专项验证
- [ ] （填写专项验证项）

### 功能验证
- [ ] 游戏可以正常启动
- [ ] 特性选择正常
- [ ] 活动可以执行
- [ ] 月份可以推进

### 结果
**验收状态**: ✅ 通过 / ❌ 未通过
**测试日期**: YYYY-MM-DD
**测试者**: 姓名
```

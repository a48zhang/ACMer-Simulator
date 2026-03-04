# 计划4 验证清单：Panel 组件迁移

## 文件迁移验证
- [ ] `GlobalStatistics.jsx` → `GlobalStatistics.tsx`
- [ ] `IntroPanel.jsx` → `IntroPanel.tsx`
- [ ] `LogPanel.jsx` → `LogPanel.tsx`
- [ ] `TraitSelectionPanel.jsx` → `TraitSelectionPanel.tsx`
- [ ] `PlayerPanel.jsx` → `PlayerPanel.tsx` (已优化)
- [ ] `ActivityPanel.jsx` → `ActivityPanel.tsx` (已优化)
- [ ] `EventPanel.jsx` → `EventPanel.tsx` (已优化)

## 通用验证
- [ ] `npx tsc --noEmit` 无错误
- [ ] `npm run build` 成功
- [ ] `npm test` 全部 74 个测试通过

## 各 Panel 验证

### GlobalStatistics
- [ ] 统计面板正常显示
- [ ] 统计数据正确

### IntroPanel
- [ ] 介绍面板正常显示
- [ ] 开始按钮工作正常

### LogPanel
- [ ] 日志列表正常显示
- [ ] 日志滚动正常
- [ ] 新日志正确追加

### TraitSelectionPanel
- [ ] 特性卡片正常显示
- [ ] 特性选择交互正常
- [ ] 特性描述显示正确

### PlayerPanel (重点)
- [ ] 属性条正常显示
- [ ] GPA 显示正确
- [ ] SAN 显示正确
- [ ] 余额显示正确
- [ ] **性能验证**: React.memo 依然有效，仅在 props 变化时重渲染

### ActivityPanel (重点)
- [ ] 活动列表正常显示
- [ ] AP 消耗显示正确
- [ ] 活动点击正常执行
- [ ] **性能验证**: React.memo 依然有效

### EventPanel (重点)
- [ ] 事件列表正常显示
- [ ] 事件点击正常打开 Dialog
- [ ] **性能验证**: React.memo 依然有效

## 功能验证
- [ ] 完整游戏流程可正常运行

---
**验证状态**: ⏳ 待验证 / ✅ 通过 / ❌ 未通过
**验证日期**: ____________
**验证者**: ____________

# 计划3 验证清单：Dialog 组件迁移

## 文件迁移验证
- [ ] `ConfirmDialog.jsx` → `ConfirmDialog.tsx`
- [ ] `GameOverDialog.jsx` → `GameOverDialog.tsx`
- [ ] `TraitSelectionDialog.jsx` → `TraitSelectionDialog.tsx`
- [ ] `PracticeContestSelectionDialog.jsx` → `PracticeContestSelectionDialog.tsx`
- [ ] `EventDialog.jsx` → `EventDialog.tsx`
- [ ] `ContestResultDialog.jsx` → `ContestResultDialog.tsx`
- [ ] `TeammateSelectionDialog.jsx` → `TeammateSelectionDialog.tsx`

## 通用验证
- [ ] `npx tsc --noEmit` 无错误
- [ ] `npm run build` 成功
- [ ] `npm test` 全部 74 个测试通过

## 逐个 Dialog 验证

### ConfirmDialog
- [ ] 可以正常打开
- [ ] 显示标题和消息正确
- [ ] 确认按钮点击正常
- [ ] 取消按钮点击正常

### GameOverDialog
- [ ] 可以正常打开
- [ ] 显示游戏结束原因正确
- [ ] 重新开始按钮工作正常

### TraitSelectionDialog
- [ ] 可以正常打开
- [ ] 特性列表显示正确
- [ ] 特性可以选择/取消选择
- [ ] 确认按钮工作正常

### PracticeContestSelectionDialog
- [ ] 可以正常打开
- [ ] 比赛选项列表显示正确
- [ ] 选择比赛正常

### EventDialog
- [ ] 可以正常打开
- [ ] 事件标题和描述显示正确
- [ ] 选项按钮显示正确
- [ ] 点击选项正常

### ContestResultDialog
- [ ] 可以正常打开
- [ ] 比赛结果显示正确
- [ ] 排名变化显示正确
- [ ] 确认按钮工作正常

### TeammateSelectionDialog
- [ ] 可以正常打开
- [ ] 队友列表显示正确
- [ ] 复选框可以勾选
- [ ] 确认按钮工作正常

---
**验证状态**: ⏳ 待验证 / ✅ 通过 / ❌ 未通过
**验证日期**: ____________
**验证者**: ____________

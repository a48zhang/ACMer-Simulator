# 计划5 验证清单：Game 组件迁移

## 文件迁移验证
- [ ] `Notification.jsx` → `Notification.tsx`
- [ ] `PlayerStatus.jsx` → `PlayerStatus.tsx`
- [ ] `AttributeDialog.jsx` → `AttributeDialog.tsx`
- [ ] `AttributeAllocation.jsx` → `AttributeAllocation.tsx`
- [ ] `ContestInProgress.jsx` → `ContestInProgress.tsx` (重点)
- [ ] `GameControls.jsx` → `GameControls.tsx`

## 通用验证
- [ ] `npx tsc --noEmit` 无错误
- [ ] `npm run build` 成功
- [ ] `npm test` 全部 74 个测试通过

## 各组件验证

### Notification
- [ ] 通知可以正常弹出
- [ ] 通知自动消失工作正常
- [ ] 通知样式正确

### PlayerStatus
- [ ] 玩家状态信息正确显示
- [ ] 状态更新时正确重渲染

### AttributeDialog
- [ ] 属性分配弹窗正常打开
- [ ] 滑块交互正常
- [ ] 确认/取消按钮工作正常

### AttributeAllocation
- [ ] 属性点分配计算正确
- [ ] 预览显示正确
- [ ] 剩余点数计算正确

### ContestInProgress (重中之重!)
#### 完整比赛流程测试
- [ ] 比赛界面正常显示
- [ ] 题目列表正确显示
- [ ] 比赛倒计时正常减少
- [ ] **读题操作**: 点击读题按钮，时间减少，题目状态变化
- [ ] **思考操作**: 点击思考按钮，时间减少
- [ ] **写代码操作**: 点击写代码按钮，时间减少
- [ ] **对拍操作**: 点击对拍按钮，时间减少
- [ ] **提交操作**: 点击提交按钮，显示通过/失败
- [ ] 题目状态正确更新
- [ ] **完成比赛**: 点击完成按钮，正常退出比赛

### GameControls
- [ ] 游戏控制按钮正常显示
- [ ] 推进月份按钮工作正常
- [ ] 其他控制按钮工作正常

---
**验证状态**: ⏳ 待验证 / ✅ 通过 / ❌ 未通过
**验证日期**: ____________
**验证者**: ____________

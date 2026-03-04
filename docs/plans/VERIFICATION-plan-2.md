# 计划2 验证清单：通用组件迁移

## 文件迁移验证
- [ ] `src/components/common/Button.js` → `Button.tsx`
- [ ] `src/components/common/Card.js` → `Card.tsx`
- [ ] `src/components/common/Layout.js` → `Layout.tsx`

## 通用验证
- [ ] `npx tsc --noEmit` 无错误
- [ ] `npm run build` 成功
- [ ] `npm test` 全部 74 个测试通过

## Button 组件验证
- [ ] Button 在页面中正常显示
- [ ] Button 点击事件正常响应
- [ ] Button disabled 状态显示正确
- [ ] Button 不同 variant 样式正确

## Card 组件验证
- [ ] Card 在页面中正常显示
- [ ] Card padding 样式正确
- [ ] Card shadow 样式正确

## Layout 组件验证
- [ ] 页面布局正常
- [ ] 响应式布局工作正常（如果有）

## 功能验证
- [ ] 游戏可以正常启动
- [ ] 特性选择正常
- [ ] 活动可以执行

---
**验证状态**: ⏳ 待验证 / ✅ 通过 / ❌ 未通过
**验证日期**: ____________
**验证者**: ____________

# 计划1 验证清单：清理旧 .js 文件

## 执行前备份
- [ ] 已提交当前状态，便于回退

## 文件删除验证

### 根目录文件
- [ ] `src/constants.js` 已删除
- [ ] `src/utils.js` 已删除
- [ ] `src/gameState.js` 已删除

### 配置文件
- [ ] `src/config/gameBalance.js` 已删除

### 数据层文件
- [ ] `src/data/traits.js` 已删除
- [ ] `src/data/activities.js` 已删除
- [ ] `src/data/contests.js` 已删除
- [ ] `src/data/events.js` 已删除

### 游戏逻辑文件
- [ ] `src/gameLogics/types.js` 已删除
- [ ] `src/gameLogics/log.js` 已删除
- [ ] `src/gameLogics/contest.js` 已删除
- [ ] `src/gameLogics/activity.js` 已删除
- [ ] `src/gameLogics/month.js` 已删除
- [ ] `src/gameLogics/event.js` 已删除
- [ ] `src/gameLogics/gameFlow.js` 已删除
- [ ] `src/gameLogics/index.js` 已删除

## 通用验证
- [ ] `npx tsc --noEmit` 无错误
- [ ] `npm run build` 成功
- [ ] `npm test` 全部 74 个测试通过

## 功能验证
- [ ] 游戏可以正常启动
- [ ] 特性选择正常
- [ ] 活动可以执行
- [ ] 月份可以推进
- [ ] 比赛可以进行

## 导入验证
- [ ] 没有显式引用 `.js` 扩展名的导入语句

---
**验证状态**: ⏳ 待验证 / ✅ 通过 / ❌ 未通过
**验证日期**: ____________
**验证者**: ____________

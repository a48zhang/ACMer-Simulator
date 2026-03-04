# 计划1：清理已迁移的旧 .js 文件

## 目标
删除已经完成 TypeScript 迁移的旧 .js 文件，避免混淆。

## 前置条件
- ✅ 已完成 TypeScript 迁移的核心模块
- ✅ 所有测试通过 (`npm test`)
- ✅ 构建成功 (`npm run build`)

## 文件列表
以下文件已迁移至 .ts，可以安全删除：

### 根目录文件
- [ ] `src/constants.js`
- [ ] `src/utils.js`
- [ ] `src/gameState.js`

### 配置文件
- [ ] `src/config/gameBalance.js`

### 数据层文件
- [ ] `src/data/traits.js`
- [ ] `src/data/activities.js`
- [ ] `src/data/contests.js`
- [ ] `src/data/events.js`

### 游戏逻辑文件
- [ ] `src/gameLogics/types.js`
- [ ] `src/gameLogics/log.js`
- [ ] `src/gameLogics/contest.js`
- [ ] `src/gameLogics/activity.js`
- [ ] `src/gameLogics/month.js`
- [ ] `src/gameLogics/event.js`
- [ ] `src/gameLogics/gameFlow.js`
- [ ] `src/gameLogics/index.js`

## 实施步骤

1. **备份当前状态**
   ```bash
   git status
   git add -u
   git commit -m "backup before deleting old .js files"
   ```

2. **批量删除文件**
   ```bash
   rm src/constants.js src/utils.js src/gameState.js
   rm src/config/gameBalance.js
   rm src/data/traits.js src/data/activities.js src/data/contests.js src/data/events.js
   rm src/gameLogics/types.js src/gameLogics/log.js src/gameLogics/contest.js
   rm src/gameLogics/activity.js src/gameLogics/month.js src/gameLogics/event.js
   rm src/gameLogics/gameFlow.js src/gameLogics/index.js
   ```

3. **验证**
   - [ ] 运行 `npm run build` - 确保构建成功
   - [ ] 运行 `npm test` - 确保所有测试通过
   - [ ] 手动测试游戏功能 - 确保运行正常

4. **提交更改**
   ```bash
   git add -u
   git commit -m "cleanup: 删除已迁移的旧 .js 文件"
   ```

## 验收标准
- [ ] 上述所有 .js 文件已删除
- [ ] `npm run build` 成功
- [ ] `npm test` 全部 74 个测试通过
- [ ] 游戏可以正常运行

## 风险提示
- 此操作不可逆，请确保先提交备份
- 如果发现问题，可以使用 `git checkout <commit> -- <file>` 恢复单个文件

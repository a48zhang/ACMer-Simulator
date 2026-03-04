# 计划7：最终清理和配置

## 目标
完成 TypeScript 迁移的最终步骤，关闭 allowJs，清理所有剩余的 .js/.jsx 文件。

## 前置条件
- [ ] 计划1-6 全部完成
- [ ] 所有 .js/.jsx 文件都已迁移至 .ts/.tsx

## 实施步骤

### 步骤1：检查是否有遗漏的 .js/.jsx 文件
```bash
# 查找所有剩余的 .js/.jsx 文件（排除 node_modules）
find src -name "*.js" -o -name "*.jsx" | grep -v node_modules
```

### 步骤2：迁移样式文件（可选）
以下文件可以保持 .js 格式，也可以迁移为 .ts：
- `src/styles/GlobalStyles.js`
- `src/styles/theme.js`
- `src/styles/AppStyles.js`

**建议**：样式文件可以保持 .js，因为它们主要是 styled-components 的样式定义，类型收益不大。

### 步骤3：修改 tsconfig.json
将 `allowJs` 从 `true` 改为 `false`：

```json
{
  "compilerOptions": {
    "allowJs": false,
    // ... 其他配置保持不变
  }
}
```

### 步骤4：完全验证
1. 运行 `tsc --noEmit` - 应该无错误
2. 运行 `npm run build` - 构建成功
3. 运行 `npm test` - 所有测试通过
4. 完整游戏流程测试

### 步骤5：提交最终更改
```bash
git add tsconfig.json
git add -u  # 添加所有修改和删除
git commit -m "Complete TypeScript migration: allowJs=false"
```

## 验收标准
- [ ] `src/` 目录下没有业务逻辑的 .js/.jsx 文件（样式文件可选）
- [ ] `tsconfig.json` 中 `allowJs: false`
- [ ] `tsc --noEmit` 零错误
- [ ] `npm run build` 成功
- [ ] `npm test` 全部 74 个测试通过
- [ ] 完整游戏流程正常运行

## 回退方案
如果遇到问题，可以临时回退：
```bash
# 恢复 allowJs=true
git checkout HEAD~1 -- tsconfig.json

# 或者恢复被删除的 .js 文件
git checkout <commit> -- src/file.js
```

## 迁移完成标志
当此计划完成时，项目 TypeScript 迁移全部完成！

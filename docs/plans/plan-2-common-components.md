# 计划2：通用组件迁移

## 目标
将 `src/components/common/` 下的通用组件从 .js 迁移至 .tsx。

## 前置条件
- [ ] 计划1 已完成（清理旧 .js 文件）或跳过（保持文件共存）

## 文件列表
- [ ] `src/components/common/Button.js` → `Button.tsx`
- [ ] `src/components/common/Card.js` → `Card.tsx`
- [ ] `src/components/common/Layout.js` → `Layout.tsx`

## 实施原则
- 保持组件功能完全一致
- 添加类型定义
- 保持 styled-components 的使用方式
- 保留所有现有 props

## 实施步骤

### 步骤1：迁移 Button.js

**文件**: `src/components/common/Button.tsx`

添加类型定义：
- Props 接口：包含 `children`, `onClick`, `disabled`, `variant`, `size` 等
- 导出默认组件

### 步骤2：迁移 Card.js

**文件**: `src/components/common/Card.tsx`

添加类型定义：
- Props 接口：包含 `children`, `padding`, `shadow` 等
- 导出默认组件

### 步骤3：迁移 Layout.js

**文件**: `src/components/common/Layout.tsx`

添加类型定义：
- Props 接口：包含 `children`
- 导出默认组件

## 验证步骤
每迁移一个文件后：
1. 运行 `npm run build` - 确保无类型错误
2. 检查浏览器 - 确保组件正常渲染
3. 运行 `npm test` - 确保测试通过

## 验收标准
- [ ] 所有三个通用组件已迁移至 .tsx
- [ ] `tsc --noEmit` 无错误
- [ ] `npm run build` 成功
- [ ] 所有测试通过
- [ ] 组件在浏览器中正常显示和交互

## 注意事项
- 此计划与其他 UI 组件迁移计划互不依赖
- 可以独立执行，不影响其他功能

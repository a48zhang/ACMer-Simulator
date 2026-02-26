# Styled-Components 全面重构计划

## 当前状态

**记录时间**: 2026-02-25
**当前Commit Hash**: c0fa728c9814f26c3bf71e46b59d5264ed94a8bb
**恢复点**: 如果需要回滚，使用 `git reset --hard c0fa728c9814f26c3bf71e46b59d5264ed94a8bb`

---

## 项目当前状态分析

### 组件清单 (23个)

#### Dialogs (7个)
- ConfirmDialog.jsx
- ContestResultDialog.jsx
- EventDialog.jsx
- GameOverDialog.jsx
- PracticeContestSelectionDialog.jsx
- TeammateSelectionDialog.jsx
- TraitSelectionDialog.jsx

#### Game (6个)
- AttributeAllocation.jsx
- AttributeDialog.jsx
- ContestInProgress.jsx
- GameControls.jsx
- Notification.jsx
- PlayerStatus.jsx

#### Panels (7个)
- ActivityPanel.jsx
- EventPanel.jsx
- GlobalStatistics.jsx
- IntroPanel.jsx
- LogPanel.jsx
- PlayerPanel.jsx
- TraitSelectionPanel.jsx

### CSS统计
- 文件: src/index.css
- 行数: 2015行

---

## 重构策略

### 阶段1: 基础设施准备
- [x] 创建主题文件 `src/styles/theme.js`
- [x] 创建全局样式 `src/styles/GlobalStyles.js`
- [x] 创建通用组件目录 `src/components/common/`
- [x] 安装验证: 确保styled-components正常工作

### 阶段2: 基础组件重构
- [x] Button组件
- [x] 布局组件 (Container, Header, Main, Footer)
- [ ] 基础卡片组件
- [ ] 提交: `git commit -m "refactor: 基础通用组件styled-components重构"`

### 阶段3: 面板组件重构 (按优先级)
- [x] LogPanel (最简单)
- [x] 提交: `git commit -m "refactor: LogPanel styled-components重构"`
- [x] PlayerPanel (中等复杂度)
- [x] 提交: `git commit -m "refactor: PlayerPanel styled-components重构"`
- [x] ActivityPanel
- [x] 提交: `git commit -m "refactor: ActivityPanel styled-components重构"`
- [x] IntroPanel
- [x] 提交: `git commit -m "refactor: IntroPanel styled-components重构"`
- [x] TraitSelectionPanel
- [x] 提交: `git commit -m "refactor: TraitSelectionPanel styled-components重构"`
- [x] EventPanel
- [x] 提交: `git commit -m "refactor: EventPanel styled-components重构"`
- [ ] GlobalStatistics
- [ ] 提交: `git commit -m "refactor: GlobalStatistics styled-components重构"`

### 阶段4: 对话框组件重构
- [x] ConfirmDialog
- [x] 提交: `git commit -m "refactor: ConfirmDialog styled-components重构"`
- [x] Notification
- [x] 提交: `git commit -m "refactor: Notification styled-components重构"`
- [x] ContestResultDialog
- [x] 提交: `git commit -m "refactor: ContestResultDialog styled-components重构"`
- [ ] TeammateSelectionDialog
- [ ] 提交: `git commit -m "refactor: TeammateSelectionDialog styled-components重构"`
- [ ] TraitSelectionDialog
- [ ] 提交: `git commit -m "refactor: TraitSelectionDialog styled-components重构"`
- [ ] EventDialog
- [ ] 提交: `git commit -m "refactor: EventDialog styled-components重构"`
- [ ] PracticeContestSelectionDialog
- [ ] 提交: `git commit -m "refactor: PracticeContestSelectionDialog styled-components重构"`
- [ ] GameOverDialog
- [ ] 提交: `git commit -m "refactor: GameOverDialog styled-components重构"`

### 阶段5: 游戏相关组件重构
- [ ] GameControls
- [ ] 提交: `git commit -m "refactor: GameControls styled-components重构"`
- [ ] PlayerStatus
- [ ] 提交: `git commit -m "refactor: PlayerStatus styled-components重构"`
- [ ] AttributeDialog
- [ ] 提交: `git commit -m "refactor: AttributeDialog styled-components重构"`
- [ ] AttributeAllocation
- [ ] 提交: `git commit -m "refactor: AttributeAllocation styled-components重构"`
- [ ] ContestInProgress (最复杂)
- [ ] 提交: `git commit -m "refactor: ContestInProgress styled-components重构"`

### 阶段6: 核心文件重构
- [ ] App.jsx (最后重构)
- [ ] 提交: `git commit -m "refactor: App.jsx styled-components重构"`
- [ ] 删除 index.css
- [ ] 提交: `git commit -m "refactor: 删除index.css，完成styled-components迁移"`
- [ ] 更新 main.jsx
- [ ] 最终验证测试

---

## 风险识别与应对

### 风险1: UI一致性
**问题**: 重构过程中可能出现细微视觉差异
**应对**: 每个组件重构后立即进行视觉对比，截图对比

### 风险2: 样式优先级冲突
**问题**: styled-components的className可能与遗留CSS冲突
**应对**: 逐个组件迁移，每个组件完成后立即验证，必要时使用!important或调整specificity

### 风险3: 条件类名转换
**问题**: 如`.player-panel.collapsed`需要转换为props
**应对**: 使用styled-components的`attrs`和`props`来处理动态样式

### 风险4: 工作量巨大
**问题**: 23个组件 + 2000行CSS
**应对**: 分阶段进行，每完成一个阶段就提交一次，保持可恢复性

---

## 技术实现方案

### 主题系统设计
```javascript
// src/styles/theme.js
export const theme = {
  colors: {
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    secondary: '#10b981',
    secondaryHover: '#059669',
    danger: '#ef4444',
    dangerHover: '#dc2626',
    warning: '#f59e0b',
    background: '#f3f4f6',
    surface: '#ffffff',
    textMain: '#111827',
    textSecondary: '#4b5563',
    border: '#e5e7eb',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  }
};
```

### 通用组件设计
```javascript
// src/components/common/Button.js
import styled from 'styled-components';

export const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: ${props => props.theme.radius.md};
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  transition: all 0.15s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${props => props.variant === 'primary' && `
    background-color: ${props.theme.colors.primary};
    color: white;
    
    &:hover:not(:disabled) {
      background-color: ${props.theme.colors.primaryHover};
    }
  `}

  ${props => props.variant === 'secondary' && `
    background-color: ${props.theme.colors.secondary};
    color: white;
    
    &:hover:not(:disabled) {
      background-color: ${props.theme.colors.secondaryHover};
    }
  `}

  ${props => props.size === 'sm' && `
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  `}
`;
```

---

## 预期成果

1. ✅ 更好的代码组织: 样式与组件逻辑在一起
2. ✅ 更易维护: 相关代码放在一起
3. ✅ 动态样式更容易: Props驱动的样式更直观
4. ✅ 无CSS文件依赖: 单一源代码管理
5. ✅ 完全相同的UI: 零视觉差异

---

## 工作进度记录

### 当前进度
- [x] 分析当前代码库结构
- [x] 制定重构计划
- [x] 阶段1: 基础设施准备
- [x] 阶段2: Button组件
- [x] 阶段3: LogPanel组件
- [ ] 阶段3: 其他面板组件
- [ ] 阶段4: 对话框组件重构
- [ ] 阶段5: 游戏相关组件重构
- [ ] 阶段6: 核心文件重构

### Commit记录
- 起点: c0fa728c9814f26c3bf71e46b59d5264ed94a8bb
- 阶段1完成: 42fbe55 (基础设施准备)
- LogPanel+Button: e359093

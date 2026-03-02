# 子计划D：TypeScript基础设施

## 目标

配置TS环境，定义核心类型

## 实施步骤

### 步骤1：安装依赖

```bash
npm install -D typescript @types/react @types/react-dom @types/node
```

### 步骤2：创建配置

创建 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "allowJs": true,
    "checkJs": false,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/config/*": ["src/config/*"],
      "@/types/*": ["src/types/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

创建 `tsconfig.node.json`：

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.js"]
}
```

### 步骤3：定义核心类型

创建 `src/types/index.ts`：

```typescript
// ========== 游戏状态 ==========
export interface Attributes {
  coding: number;
  algorithm: number;
  speed: number;
  stress: number;
  math: number;
  dp: number;
  graph: number;
  dataStructure: number;
  string: number;
  search: number;
  greedy: number;
  geometry: number;
}

export interface Buffs {
  failedCourses: number;
  academicWarnings: number;
}

export interface WorldFlags {
  joinedClub?: boolean;
  attendedClassThisMonth?: boolean;
  [key: string]: boolean | number | undefined;
}

export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  month: number;
  monthlyAP: number;
  remainingAP: number;
  balance: number;
  monthlyAllowance: number;
  san: number;
  rating: number;
  gpa: number;
  attributes: Attributes;
  playerContests: number;
  playerProblems: number;
  selectedTraits: string[];
  pendingEvents: Event[];
  resolvedEvents: ResolvedEvent[];
  worldFlags: WorldFlags;
  eventGraph: Record<string, unknown>;
  activeContest: ContestSession | null;
  contestTimeRemaining: number;
  teammates: Teammate[];
  selectedTeam: string[] | null;
  buffs: Buffs;
}

// ========== 事件系统 ==========
export interface Choice {
  id: string;
  label: string;
  effects?: Effects;
  setFlags?: Record<string, boolean | number>;
  requiresTeamSelection?: boolean;
  specialAction?: string;
  contestConfig?: ContestConfig;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  mandatory: boolean;
  chanceToAppear?: number;
  conditions: (state: GameState) => boolean;
  choices: Choice[];
}

export interface ResolvedEvent {
  id: string;
  choiceId: string;
  time: number;
}

// ========== 效果系统 ==========
export interface Effects {
  attributeChanges?: Partial<Attributes>;
  apBonus?: number;
  sanDelta?: number;
  gpaDelta?: number;
  balanceDelta?: number;
  ratingDelta?: number;
  playerContestsDelta?: number;
  playerProblemsDelta?: number;
  buffChanges?: Partial<Buffs>;
  log?: string;
  logType?: 'info' | 'success' | 'warning' | 'error';
  setFlags?: Record<string, boolean | number>;
}

// ========== 比赛系统 ==========
export interface Problem {
  id: string;
  letter: string;
  order: number;
  difficulty: number;
  requires: Record<string, number>;
  trickiness: number;
  status: 'pending' | 'coding' | 'submitted_fail' | 'solved';
  attempts: number;
  thinkBonus: number;
  debugBonus: number;
  hasBug: boolean;
  bugFound: boolean;
  hasWrittenCode: boolean;
  revealedInfo: {
    tags: string[];
  } | null;
}

export interface AttemptLog {
  problemId: string;
  success: boolean;
  timeCost: number;
  weakestAttr: string | null;
}

export interface ContestSession {
  id: string;
  name: string;
  durationMinutes: number;
  timeRemaining: number;
  problems: Problem[];
  attempts: AttemptLog[];
  startedAt: number;
  isRated: boolean;
  ratingSource: string | null;
}

export interface ContestConfig {
  name: string;
  problemCount: number | [number, number];
  durationMinutes: number;
  difficulties?: number[];
  isRated?: boolean;
  ratingSource?: string;
}

export interface ContestOutcome {
  contestId: string;
  total: number;
  solved: number;
  attempts: number;
  ratingDelta: number;
  scoreDelta: number;
  sanDelta: number;
  timeUsed: number;
  weakAttr: string | null;
  performanceRating: number | null;
  isRated: boolean;
  ratingSource: string | null;
}

// ========== 活动系统 ==========
export interface Activity {
  id: string;
  name: string;
  cost: number;
  description: string;
  effects: (state: GameState) => ActivityResult;
  repeatable: boolean;
  contestConfig?: ContestConfig;
}

export interface ActivityResult extends Effects {
  specialAction?: string;
}

// ========== 特性系统 ==========
export interface Teammate {
  id: string;
  name: string;
  attributes: Partial<Attributes>;
}

export interface Trait {
  id: string;
  name: string;
  type: 'positive' | 'negative';
  cost: number;
  description: string;
  effects: {
    initialStats?: Partial<Attributes>;
    randomBonus?: number;
    sanPenalty?: number;
    moneyPenalty?: number;
  };
}

// ========== 日志系统 ==========
export interface LogEntry {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

// ========== UI状态 ==========
export interface UIState {
  showEventDialog?: boolean;
  currentEvent?: Event | null;
  showContestResult?: boolean;
  contestOutcome?: ContestOutcome | null;
  showTeammateDialog?: boolean;
  showPracticeContestDialog?: boolean;
  pendingEventChoice?: {
    eventId: string;
    choiceId: string;
  } | null;
  confirmDialog?: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  } | null;
}

// ========== 逻辑结果 ==========
export interface LogicResult {
  newState?: GameState;
  logs: LogEntry[];
  uiState: UIState;
  gameOverReason?: string;
  notification?: {
    message: string;
    type: string;
  };
  clearLogs?: boolean;
}

// ========== 配置类型 ==========
export interface GPAConfig {
  INITIAL: number;
  MIN: number;
  MAX: number;
  MONTHLY_DEDUCTION: number;
  ATTEND_CLASS_BONUS: number;
  SKIP_CLASS_DEDUCTION: number;
  SKIP_CLASS_PROBABILITY: number;
  HOLIDAY_MONTHS: number[];
}

export interface AcademicConfig {
  WARNING_THRESHOLD: number;
  FAILURE_THRESHOLD: number;
  SCHOLARSHIP_THRESHOLD: number;
  WARNINGS_FOR_EXPULSION: number;
  FAILURES_PER_WARNING: number;
}

export interface ActivityCosts {
  PRACTICE: number;
  PRACTICE_CONTEST: number;
  REST: number;
  LECTURE: number;
  PART_TIME_JOB: number;
  GYM: number;
}

export interface GameBalanceConfig {
  GPA_CONFIG: GPAConfig;
  ACADEMIC_CONFIG: AcademicConfig;
  ACTIVITY_COSTS: ActivityCosts;
}
```

### 步骤4：配置Vite

更新 `vite.config.js`：

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## 验收标准

- [ ] `npx tsc --noEmit` 无错误
- [ ] JS文件可正常导入TS模块
- [ ] 类型定义完整覆盖核心数据结构
- [ ] IDE中类型提示正常工作

import { createContestSession, resetProblemProgress } from './contests';
import type { GameState, PracticeOption, Problem } from '../types';

interface SheetPreset {
  id: string;
  name: string;
  description: string;
  cost: number;
  difficulties: number[];
  focusSkills: string[];
  badge: string;
}

const SHEET_PRESETS: SheetPreset[] = [
  {
    id: 'sheet_warmup',
    name: '热身题单',
    description: '4 题短练，偏思维和代码，适合日常保持手感。',
    cost: 5,
    difficulties: [1, 2, 2, 3],
    focusSkills: ['algorithm', 'coding'],
    badge: '入门'
  },
  {
    id: 'sheet_dp_graph',
    name: 'DP / 图论题单',
    description: '4 题专题练习，强化动态规划与图论建模。',
    cost: 7,
    difficulties: [2, 3, 4, 5],
    focusSkills: ['dp', 'graph'],
    badge: '专题'
  },
  {
    id: 'sheet_data_string',
    name: '数据结构 / 字符串题单',
    description: '5 题进阶训练，适合补齐实现与细节能力。',
    cost: 8,
    difficulties: [2, 3, 4, 4, 5],
    focusSkills: ['dataStructure', 'string'],
    badge: '进阶'
  }
];

function applyFocus(problem: Problem, focusSkills: string[], order: number): Problem {
  const requires = { ...problem.requires };
  focusSkills.forEach((skill, index) => {
    const floor = Math.max(1, Math.floor(problem.difficulty * (0.65 + index * 0.1)));
    requires[skill] = Math.max(requires[skill] || 0, floor);
  });

  return {
    ...problem,
    order,
    letter: String.fromCharCode(65 + order - 1),
    requires
  };
}

function buildSheetOption(preset: SheetPreset): PracticeOption {
  const session = createContestSession({
    name: preset.name,
    problemCount: preset.difficulties.length,
    durationMinutes: 120,
    difficulties: preset.difficulties,
    isRated: false
  });

  const problems = session.problems.map((problem, index) =>
    applyFocus(resetProblemProgress(problem), preset.focusSkills, index + 1)
  );

  return {
    id: preset.id,
    name: preset.name,
    description: preset.description,
    cost: preset.cost,
    mode: 'sheet',
    problems,
    badge: preset.badge
  };
}

function buildUpsolveOption(state: GameState): PracticeOption | null {
  if (!state.practiceBacklog.length) return null;

  const backlog = state.practiceBacklog
    .slice(0, 5)
    .map(({ id, contestId, contestName, problem }, index) => resetProblemProgress(problem, {
      order: index + 1,
      letter: String.fromCharCode(65 + index),
      backlogId: id,
      sourceContestId: contestId,
      sourceContestName: contestName
    }));

  return {
    id: 'upsolve_recent',
    name: '过去比赛补题',
    description: `从最近未补完的 ${state.practiceBacklog.length} 道比赛题里挑出 5 题继续做。`,
    cost: 6,
    mode: 'upsolve',
    problems: backlog,
    badge: '补题'
  };
}

export function buildPracticeOptions(state: GameState): PracticeOption[] {
  const options = SHEET_PRESETS.map(buildSheetOption);
  const upsolveOption = buildUpsolveOption(state);
  if (upsolveOption) {
    options.unshift(upsolveOption);
  }
  return options;
}

// 活动系统数据定义
// Activity system data definitions

import type { Activity, ActivityResult } from '../types';

export const ACTIVITIES: Activity[] = [
    {
        id: 'practice',
        name: '刷题',
        cost: 0,
        description: '选择题单或补题计划，进入分步刷题模式',
        effects: (): ActivityResult => ({
            specialAction: 'OPEN_PRACTICE_CONTEST_DIALOG',
            log: '📚 准备开始刷题...',
            logType: 'info'
        }),
        repeatable: true
    },
    {
        id: 'rest',
        name: '休息',
        cost: 3,
        description: '放松休息，恢复状态',
        effects: (): ActivityResult => ({
            sanDelta: 15,
            log: '😌 休息了一段时间，SAN值+15！',
            logType: 'info'
        }),
        repeatable: true
    },
    {
        id: 'goto_lecture',
        name: '上课',
        cost: 10,
        description: '猛猛学',
        effects: (): ActivityResult => ({
            sanDelta: -5,
            gpaDelta: 0.1,
            log: '📚 认真上课，GPA+0.1',
            logType: 'info',
            setFlags: { attendedClassThisMonth: true }
        }),
        repeatable: true
    },
    {
        id: 'part_time_job',
        name: '兼职送外卖',
        cost: 5,
        description: '辛苦打工换取生活费和额外资金。',
        effects: (): ActivityResult => ({
            balanceDelta: 400,
            sanDelta: -10,
            log: '🍱 兼职赚到了一些钱。',
            logType: 'warning'
        }),
        repeatable: true
    }
];

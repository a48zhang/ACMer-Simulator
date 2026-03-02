# 子计划F：性能优化

## 目标

减少不必要的React渲染，提升性能

## 实施步骤

### 步骤1：优化 PlayerPanel

修改 `src/components/panels/PlayerPanel.jsx`：

```jsx
import { memo, useMemo } from 'react';
import styled from 'styled-components';

// 拆分为独立组件
const AttributeCard = memo(function AttributeCard({ name, value, max }) {
  const percentage = (value / max) * 100;
  
  return (
    <Card>
      <CardHeader>
        <Name>{name}</Name>
        <Value>{value}</Value>
      </CardHeader>
      <ProgressBar percentage={percentage} />
    </Card>
  );
});

// 主组件使用memo
function PlayerPanel({ attributes, gpa, san, balance }) {
  // 缓存属性列表
  const attributeList = useMemo(() => {
    return [
      { key: 'algorithm', name: '算法', value: attributes.algorithm, max: 100 },
      { key: 'coding', name: '代码', value: attributes.coding, max: 100 },
      { key: 'speed', name: '速度', value: attributes.speed, max: 100 },
      { key: 'stress', name: '抗压', value: attributes.stress, max: 100 },
      { key: 'math', name: '数学', value: attributes.math, max: 100 },
      { key: 'dp', name: '动态规划', value: attributes.dp, max: 100 },
      { key: 'graph', name: '图论', value: attributes.graph, max: 100 },
    ];
  }, [attributes]);

  // 缓存GPA颜色
  const gpaColor = useMemo(() => {
    if (gpa >= 3.7) return '#10b981';
    if (gpa >= 3.0) return '#6366f1';
    if (gpa >= 2.5) return '#f59e0b';
    return '#ef4444';
  }, [gpa]);

  // 缓存SAN颜色
  const sanColor = useMemo(() => {
    if (san >= 70) return '#10b981';
    if (san >= 30) return '#f59e0b';
    return '#ef4444';
  }, [san]);

  return (
    <Panel>
      <GPAContainer color={gpaColor}>
        <span>GPA: {gpa.toFixed(2)}</span>
      </GPAContainer>
      
      <SANContainer color={sanColor}>
        <span>SAN: {san}</span>
      </SANContainer>

      <AttributesGrid>
        {attributeList.map(attr => (
          <AttributeCard key={attr.key} {...attr} />
        ))}
      </AttributesGrid>
    </Panel>
  );
}

export default memo(PlayerPanel);
```

### 步骤2：优化 ActivityPanel

修改 `src/components/panels/ActivityPanel.jsx`：

```jsx
import { memo, useMemo, useCallback } from 'react';
import { ACTIVITIES } from '../../data/activities';

const ActivityCard = memo(function ActivityCard({ activity, onSelect, canAfford }) {
  return (
    <Card onClick={() => onSelect(activity.id)} disabled={!canAfford}>
      <Name>{activity.name}</Name>
      <Cost>AP: {activity.cost}</Cost>
      <Description>{activity.description}</Description>
    </Card>
  );
});

function ActivityPanel({ remainingAP, onActivitySelect }) {
  // 缓存活动列表
  const activities = useMemo(() => ACTIVITIES, []);

  // 缓存选择回调
  const handleSelect = useCallback((activityId) => {
    onActivitySelect(activityId);
  }, [onActivitySelect]);

  return (
    <Panel>
      <Title>活动</Title>
      <Grid>
        {activities.map(activity => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onSelect={handleSelect}
            canAfford={remainingAP >= activity.cost}
          />
        ))}
      </Grid>
    </Panel>
  );
}

export default memo(ActivityPanel);
```

### 步骤3：优化 GlobalStatistics

修改 `src/components/panels/GlobalStatistics.jsx`：

```jsx
import { memo, useMemo } from 'react';

function GlobalStatistics({ leaderboardData, playerScore }) {
  // 缓存统计数据
  const stats = useMemo(() => {
    const totalPlayers = leaderboardData.length;
    
    if (totalPlayers === 0) {
      return {
        totalPlayers: 0,
        avgScore: 0,
        highScore: 0,
        avgContests: 0,
        avgPlayTime: 0,
        sortedLeaderboard: []
      };
    }

    const totalScore = leaderboardData.reduce((sum, p) => sum + p.score, 0);
    const avgScore = Math.floor(totalScore / totalPlayers);
    const highScore = Math.max(...leaderboardData.map(p => p.score));
    const totalContests = leaderboardData.reduce((sum, p) => sum + p.contests, 0);
    const avgContests = Math.floor(totalContests / totalPlayers);
    const avgPlayTime = avgContests * 5;
    
    const sortedLeaderboard = [...leaderboardData]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return {
      totalPlayers,
      avgScore,
      highScore,
      avgContests,
      avgPlayTime,
      sortedLeaderboard
    };
  }, [leaderboardData]);

  return (
    <Panel>
      <StatsSection>
        <StatItem label="总玩家数" value={stats.totalPlayers} />
        <StatItem label="平均分数" value={stats.avgScore} />
        <StatItem label="最高分" value={stats.highScore} />
        <StatItem label="平均游戏时长" value={`${stats.avgPlayTime}天`} />
      </StatsSection>
      
      <Leaderboard data={stats.sortedLeaderboard} />
    </Panel>
  );
}

const StatItem = memo(function StatItem({ label, value }) {
  return (
    <StatCard>
      <Label>{label}</Label>
      <Value>{value}</Value>
    </StatCard>
  );
});

const Leaderboard = memo(function Leaderboard({ data }) {
  return (
    <table>
      <thead>
        <tr>
          <th>排名</th>
          <th>玩家</th>
          <th>分数</th>
        </tr>
      </thead>
      <tbody>
        {data.map((player, index) => (
          <tr key={player.id || index}>
            <td>{index + 1}</td>
            <td>{player.name}</td>
            <td>{player.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});

export default memo(GlobalStatistics);
```

### 步骤4：优化 App 组件

修改 `src/App.jsx` 中状态更新逻辑：

```jsx
import { useState, useCallback, memo } from 'react';

// 使用memo包装子组件
const MemoizedPlayerPanel = memo(PlayerPanel);
const MemoizedActivityPanel = memo(ActivityPanel);
const MemoizedEventPanel = memo(EventPanel);

function App() {
  const [gameState, setGameState] = useState(createInitialGameState());

  // 优化状态更新，只更新变化的部分
  const updateGameState = useCallback((updates) => {
    setGameState(prev => {
      // 检查是否真的需要更新
      const hasChanges = Object.keys(updates).some(
        key => prev[key] !== updates[key]
      );
      
      if (!hasChanges) return prev;
      
      return { ...prev, ...updates };
    });
  }, []);

  return (
    <Container>
      <MemoizedPlayerPanel 
        attributes={gameState.attributes}
        gpa={gameState.gpa}
        san={gameState.san}
        balance={gameState.balance}
      />
      <MemoizedActivityPanel 
        remainingAP={gameState.remainingAP}
        onActivitySelect={handleActivity}
      />
      <MemoizedEventPanel 
        events={gameState.pendingEvents}
      />
    </Container>
  );
}
```

## 性能验证

使用 React DevTools Profiler 验证：

1. 打开 Chrome DevTools → React DevTools → Profiler
2. 点击 "Record"
3. 执行以下操作：
   - 切换月份
   - 选择活动
   - 查看属性面板
4. 点击 "Stop"
5. 检查：
   - 无不必要的重渲染
   - 渲染次数减少 > 30%

## 验收标准

- [ ] React DevTools Profiler 显示渲染次数减少 > 30%
- [ ] 无功能退化
- [ ] 内存占用无显著增加
- [ ] 页面响应速度无变慢

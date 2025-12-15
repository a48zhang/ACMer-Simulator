import { useState } from 'react';

function PlayerPanel({ 
  attributes, 
  score,
  contests,
  problems,
  leaderboardData 
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const generalAttributes = [
    { key: 'coding', name: '💻 编程', short: '编程' },
    { key: 'algorithm', name: '🧮 算法', short: '算法' },
    { key: 'speed', name: '🏃 速度', short: '速度' },
    { key: 'stress', name: '🧘 抗压', short: '抗压' },
    { key: 'teamwork', name: '🤝 协作', short: '协作' },
    { key: 'english', name: '🌐 英语', short: '英语' }
  ];

  const specializedAttributes = [
    { key: 'math', name: '📐 数学', short: '数学' },
    { key: 'dp', name: '🔄 DP', short: 'DP' },
    { key: 'graph', name: '🕸️ 图论', short: '图论' },
    { key: 'dataStructure', name: '🗂️ 数据结构', short: '数据' },
    { key: 'string', name: '🔤 字符串', short: '字符串' },
    { key: 'search', name: '🔍 搜索', short: '搜索' },
    { key: 'greedy', name: '💡 贪心', short: '贪心' },
    { key: 'geometry', name: '📏 几何', short: '几何' }
  ];

  const getRank = () => {
    if (leaderboardData.length === 0) {
      return '未上榜';
    }

    const sortedData = [...leaderboardData].sort((a, b) => b.score - a.score);
    let rank = sortedData.length + 1;

    for (let i = 0; i < sortedData.length; i++) {
      if (score > sortedData[i].score) {
        rank = i + 1;
        break;
      }
    }

    return rank > sortedData.length ? '未上榜' : `#${rank}`;
  };

  return (
    <aside className={`player-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="panel-toggle" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="toggle-icon">{isExpanded ? '◀' : '▶'}</span>
      </div>

      <div className="panel-content">
        {/* Player Status */}
        <div className="panel-section">
          <h3 className="panel-title">我的状态</h3>
          <div className="player-info">
            <div className="info-item">
              <span className="info-label">分数</span>
              <span className="info-value">{score.toLocaleString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">排名</span>
              <span className="info-value rank">{getRank()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">比赛</span>
              <span className="info-value">{contests}</span>
            </div>
            <div className="info-item">
              <span className="info-label">解题</span>
              <span className="info-value">{problems}</span>
            </div>
          </div>
        </div>

        {/* Attributes */}
        <div className="panel-section">
          <h3 className="panel-title">我的属性</h3>

          {/* General Attributes */}
          <div className="attr-category">
            <div className="category-label">通用</div>
            {generalAttributes.map(({ key, name, short }) => (
              <div key={key} className="attr-row-readonly">
                <span className="attr-name" title={name}>{short}</span>
                <span className="attr-val-readonly">{attributes[key]}</span>
              </div>
            ))}
          </div>

          {/* Specialized Attributes */}
          <div className="attr-category">
            <div className="category-label">专业</div>
            {specializedAttributes.map(({ key, name, short }) => (
              <div key={key} className="attr-row-readonly">
                <span className="attr-name" title={name}>{short}</span>
                <span className="attr-val-readonly">{attributes[key]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default PlayerPanel;

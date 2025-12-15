import { useState } from 'react';

function PlayerPanel({
  attributes,
  balance,
  remainingAP,
  monthlyAP,
  san,
  rating,
  gpa
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
              <span className="info-label">余额</span>
              <span className="info-value balance">¥{balance}</span>
            </div>
            <div className="info-item">
              <span className="info-label">行动点</span>
              <span className="info-value ap">{remainingAP}/{monthlyAP}</span>
            </div>
            <div className="info-item">
              <span className="info-label">SAN值</span>
              <span className="info-value san">{san}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Rating</span>
              <span className="info-value rating">{rating}</span>
            </div>
            <div className="info-item">
              <span className="info-label">GPA</span>
              <span className="info-value gpa">{gpa.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Attributes */}
        <div className="panel-section">
          <h3 className="panel-title">我的属性</h3>

          {/* General Attributes */}
          <div className="attr-category">
            <div className="category-label">通用能力</div>
            <div className="attr-grid">
              {generalAttributes.map(({ key, name, short }) => (
                <div key={key} className="attr-card">
                  <div className="attr-header">
                    <span className="attr-label" title={name}>{short}</span>
                    <span className="attr-value-text">{attributes[key]}</span>
                  </div>
                  <div className="attr-progress-bg">
                    <div
                      className="attr-progress-fill primary"
                      style={{ width: `${Math.min(attributes[key] * 10, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specialized Attributes */}
          <div className="attr-category">
            <div className="category-label">专业知识</div>
            <div className="attr-grid">
              {specializedAttributes.map(({ key, name, short }) => (
                <div key={key} className="attr-card">
                  <div className="attr-header">
                    <span className="attr-label" title={name}>{short}</span>
                    <span className="attr-value-text">{attributes[key]}</span>
                  </div>
                  <div className="attr-progress-bg">
                    <div
                      className="attr-progress-fill secondary"
                      style={{ width: `${Math.min(attributes[key] * 10, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default PlayerPanel;

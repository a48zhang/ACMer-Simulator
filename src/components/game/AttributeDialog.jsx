import { useState } from 'react';

function AttributeDialog({ onConfirm, initialPoints = 20 }) {
  const [availablePoints, setAvailablePoints] = useState(initialPoints);
  const [attributes, setAttributes] = useState({
    coding: 0,
    algorithm: 0,
    speed: 0,
    stress: 0,
    math: 0,
    dp: 0,
    graph: 0,
    dataStructure: 0,
    string: 0,
    search: 0,
    greedy: 0,
    geometry: 0
  });

  const generalAttributes = [
    { key: 'coding', name: '💻 编程能力' },
    { key: 'algorithm', name: '🧮 算法思维' },
    { key: 'speed', name: '🏃 速度' },
    { key: 'stress', name: '🧘 抗压能力' }
  ];

  const specializedAttributes = [
    { key: 'math', name: '📐 数学' },
    { key: 'dp', name: '🔄 动态规划' },
    { key: 'graph', name: '🕸️ 图论' },
    { key: 'dataStructure', name: '🗂️ 数据结构' },
    { key: 'string', name: '🔤 字符串' },
    { key: 'search', name: '🔍 搜索' },
    { key: 'greedy', name: '💡 贪心' },
    { key: 'geometry', name: '📏 计算几何' }
  ];

  const increaseAttribute = (key) => {
    if (availablePoints > 0) {
      setAttributes(prev => ({
        ...prev,
        [key]: prev[key] + 1
      }));
      setAvailablePoints(prev => prev - 1);
    }
  };

  const decreaseAttribute = (key) => {
    if (attributes[key] > 0) {
      setAttributes(prev => ({
        ...prev,
        [key]: prev[key] - 1
      }));
      setAvailablePoints(prev => prev + 1);
    }
  };

  const handleConfirm = () => {
    if (availablePoints === 0) {
      onConfirm(attributes);
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <h2 className="dialog-title">🎮 属性点分配</h2>
        <p className="dialog-subtitle">请分配你的初始属性点以开始游戏</p>
        
        <div className="dialog-points">
          <span>剩余属性点:</span>
          <span className="points-count">{availablePoints}</span>
        </div>

        <div className="dialog-content">
          {/* General Attributes */}
          <div className="dialog-category">
            <h3 className="category-title">通用属性</h3>
            <div className="attr-list">
              {generalAttributes.map(({ key, name }) => (
                <div key={key} className="dialog-attr-row">
                  <span className="dialog-attr-name">{name}</span>
                  <div className="dialog-attr-controls">
                    <button 
                      className="dialog-btn"
                      onClick={() => decreaseAttribute(key)}
                      disabled={attributes[key] === 0}
                    >
                      -
                    </button>
                    <span className="dialog-attr-val">{attributes[key]}</span>
                    <button
                      className="dialog-btn"
                      onClick={() => increaseAttribute(key)}
                      disabled={availablePoints === 0}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specialized Attributes */}
          <div className="dialog-category">
            <h3 className="category-title">专业属性</h3>
            <div className="attr-list">
              {specializedAttributes.map(({ key, name }) => (
                <div key={key} className="dialog-attr-row">
                  <span className="dialog-attr-name">{name}</span>
                  <div className="dialog-attr-controls">
                    <button 
                      className="dialog-btn"
                      onClick={() => decreaseAttribute(key)}
                      disabled={attributes[key] === 0}
                    >
                      -
                    </button>
                    <span className="dialog-attr-val">{attributes[key]}</span>
                    <button
                      className="dialog-btn"
                      onClick={() => increaseAttribute(key)}
                      disabled={availablePoints === 0}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dialog-footer">
          <button 
            className="dialog-confirm-btn"
            onClick={handleConfirm}
            disabled={availablePoints > 0}
          >
            {availablePoints > 0 ? `还有 ${availablePoints} 点未分配` : '确认并开始游戏'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AttributeDialog;

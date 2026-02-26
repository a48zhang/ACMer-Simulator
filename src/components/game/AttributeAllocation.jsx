function AttributeAllocation({ attributes, availablePoints, onIncrease, onDecrease }) {
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

  const renderAttributeGroup = (attributeList, title) => (
    <div className="attribute-group">
      <h3>{title}</h3>
      <div className="attributes-grid">
        {attributeList.map(({ key, name }) => (
          <div key={key} className="attribute-item">
            <div className="attribute-header">
              <span className="attribute-name">{name}</span>
              <span className="attribute-value">{attributes[key]}</span>
            </div>
            <div className="attribute-controls">
              <button
                className="btn-small"
                onClick={() => onDecrease(key)}
              >
                -
              </button>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${attributes[key] * 10}%` }}
                />
              </div>
              <button
                className="btn-small"
                onClick={() => onIncrease(key)}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="attributes-section">
      <h2>属性点分配</h2>
      <div className="attribute-points">
        <p>可用属性点: <span>{availablePoints}</span></p>
      </div>
      {renderAttributeGroup(generalAttributes, '通用属性')}
      {renderAttributeGroup(specializedAttributes, '专业属性')}
    </section>
  );
}

export default AttributeAllocation;

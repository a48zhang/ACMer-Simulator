function AttributeAllocation({ attributes, availablePoints, onIncrease, onDecrease }) {
  const attributeConfig = [
    { key: 'coding', name: '💻 编程能力' },
    { key: 'algorithm', name: '🧮 算法思维' },
    { key: 'speed', name: '🏃 速度' },
    { key: 'stress', name: '🧘 抗压能力' },
    { key: 'teamwork', name: '🤝 团队协作' }
  ];

  return (
    <section className="attributes-section">
      <h2>属性点分配</h2>
      <div className="attribute-points">
        <p>可用属性点: <span>{availablePoints}</span></p>
      </div>
      <div className="attributes-grid">
        {attributeConfig.map(({ key, name }) => (
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
    </section>
  );
}

export default AttributeAllocation;

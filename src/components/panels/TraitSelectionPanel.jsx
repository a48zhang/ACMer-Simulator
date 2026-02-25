import { useState } from 'react';
import { TRAITS, TRAIT_TYPES, INITIAL_TRAIT_POINTS, calculateTraitCost, isTraitSelectionValid } from '../../data/traits';

function TraitSelectionPanel({ onConfirm }) {
  const [selectedTraits, setSelectedTraits] = useState([]);
  
  const traitCost = calculateTraitCost(selectedTraits);
  const remainingTP = INITIAL_TRAIT_POINTS - traitCost;
  const canStart = isTraitSelectionValid(selectedTraits);

  const positiveTraits = TRAITS.filter(t => t.type === TRAIT_TYPES.POSITIVE);
  const negativeTraits = TRAITS.filter(t => t.type === TRAIT_TYPES.NEGATIVE);

  const toggleTrait = (traitId) => {
    setSelectedTraits(prev => {
      if (prev.includes(traitId)) {
        return prev.filter(id => id !== traitId);
      } else {
        return [...prev, traitId];
      }
    });
  };

  const handleConfirm = () => {
    if (canStart) {
      onConfirm(selectedTraits);
    }
  };

  return (
    <section className="trait-panel">
      <div className="trait-panel-header">
        <h2 className="trait-panel-title">🎭 选择你的特性</h2>
        <p className="trait-panel-subtitle">选择正面特性消耗特性点，选择负面特性获得特性点</p>
      </div>
      
      <div className="trait-panel-status">
        <div className="tp-box">
          <span className="tp-label">初始TP</span>
          <span className="tp-value">{INITIAL_TRAIT_POINTS}</span>
        </div>
        <div className="tp-arrow">→</div>
        <div className="tp-box">
          <span className="tp-label">已消耗</span>
          <span className={`tp-value ${traitCost > 0 ? 'consumed' : 'neutral'}`}>
            {traitCost > 0 ? `-${traitCost}` : traitCost < 0 ? `+${-traitCost}` : '0'}
          </span>
        </div>
        <div className="tp-arrow">=</div>
        <div className="tp-box">
          <span className="tp-label">剩余</span>
          <span className={`tp-value ${remainingTP < 0 ? 'negative' : 'positive'}`}>
            {remainingTP}
          </span>
        </div>
      </div>

      <div className="trait-panel-content">
        <div className="trait-category">
          <h3 className="category-title">
            <span className="category-icon">✨</span>
            正面特性
            <span className="category-hint">(消耗TP)</span>
          </h3>
          <div className="trait-grid">
            {positiveTraits.map(trait => {
              const isSelected = selectedTraits.includes(trait.id);
              return (
                <div
                  key={trait.id}
                  className={`trait-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleTrait(trait.id)}
                >
                  <div className="trait-card-header">
                    <span className="trait-name">{trait.name}</span>
                    <span className="trait-cost">-{trait.cost}</span>
                  </div>
                  <div className="trait-desc">{trait.description}</div>
                  {isSelected && <div className="trait-check">✓</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="trait-category">
          <h3 className="category-title negative">
            <span className="category-icon">⚠️</span>
            负面特性
            <span className="category-hint">(获得TP)</span>
          </h3>
          <div className="trait-grid">
            {negativeTraits.map(trait => {
              const isSelected = selectedTraits.includes(trait.id);
              return (
                <div
                  key={trait.id}
                  className={`trait-card ${isSelected ? 'selected' : ''} negative`}
                  onClick={() => toggleTrait(trait.id)}
                >
                  <div className="trait-card-header">
                    <span className="trait-name">{trait.name}</span>
                    <span className="trait-cost">+{-trait.cost}</span>
                  </div>
                  <div className="trait-desc">{trait.description}</div>
                  {isSelected && <div className="trait-check">✓</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="trait-panel-footer">
        <button 
          className="btn btn-primary btn-large"
          onClick={handleConfirm}
          disabled={!canStart}
        >
          {!canStart 
            ? `特性点不足！还需要 ${-remainingTP} TP` 
            : '🚀 确认并开始游戏'}
        </button>
      </div>
    </section>
  );
}

export default TraitSelectionPanel;

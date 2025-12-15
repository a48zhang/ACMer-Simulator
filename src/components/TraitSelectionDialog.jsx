import { useState } from 'react';
import { TRAITS, TRAIT_TYPES, INITIAL_TRAIT_POINTS, calculateTraitCost, isTraitSelectionValid } from '../data/traits';

function TraitSelectionDialog({ onConfirm }) {
  const [selectedTraits, setSelectedTraits] = useState([]);
  
  const traitCost = calculateTraitCost(selectedTraits);
  const remainingTP = INITIAL_TRAIT_POINTS - traitCost;
  const canStart = isTraitSelectionValid(selectedTraits);

  const positiveTraits = TRAITS.filter(t => t.type === TRAIT_TYPES.POSITIVE);
  const negativeTraits = TRAITS.filter(t => t.type === TRAIT_TYPES.NEGATIVE);

  const toggleTrait = (traitId) => {
    setSelectedTraits(prev => {
      if (prev.includes(traitId)) {
        // 取消选择
        return prev.filter(id => id !== traitId);
      } else {
        // 选择特性
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
    <div className="dialog-overlay">
      <div className="dialog-box trait-dialog">
        <h2 className="dialog-title">🎭 选择你的特性</h2>
        <p className="dialog-subtitle">选择正面特性会消耗特性点，选择负面特性会增加特性点</p>
        
        <div className="dialog-points trait-points">
          <div className="tp-info">
            <span>初始特性点 (TP):</span>
            <span className="points-count">{INITIAL_TRAIT_POINTS}</span>
          </div>
          <div className="tp-info">
            <span>已消耗:</span>
            <span className={`points-count ${traitCost > 0 ? 'consumed' : 'gained'}`}>
              {traitCost > 0 ? `-${traitCost}` : traitCost < 0 ? `+${-traitCost}` : '0'}
            </span>
          </div>
          <div className="tp-info">
            <span>剩余:</span>
            <span className={`points-count ${remainingTP < 0 ? 'negative' : 'positive'}`}>
              {remainingTP}
            </span>
          </div>
        </div>

        <div className="dialog-content trait-content">
          {/* Positive Traits */}
          <div className="dialog-category">
            <h3 className="category-title positive-title">✨ 正面特性 (消耗TP)</h3>
            <div className="trait-list">
              {positiveTraits.map(trait => {
                const isSelected = selectedTraits.includes(trait.id);
                return (
                  <div
                    key={trait.id}
                    className={`trait-card ${isSelected ? 'selected' : ''} positive`}
                    onClick={() => toggleTrait(trait.id)}
                  >
                    <div className="trait-header">
                      <span className="trait-name">{trait.name}</span>
                      <span className="trait-cost">-{trait.cost} TP</span>
                    </div>
                    <div className="trait-description">{trait.description}</div>
                    {isSelected && <div className="trait-selected-badge">✓ 已选择</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Negative Traits */}
          <div className="dialog-category">
            <h3 className="category-title negative-title">⚠️ 负面特性 (获得TP)</h3>
            <div className="trait-list">
              {negativeTraits.map(trait => {
                const isSelected = selectedTraits.includes(trait.id);
                return (
                  <div
                    key={trait.id}
                    className={`trait-card ${isSelected ? 'selected' : ''} negative`}
                    onClick={() => toggleTrait(trait.id)}
                  >
                    <div className="trait-header">
                      <span className="trait-name">{trait.name}</span>
                      <span className="trait-cost">+{-trait.cost} TP</span>
                    </div>
                    <div className="trait-description">{trait.description}</div>
                    {isSelected && <div className="trait-selected-badge">✓ 已选择</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="dialog-footer">
          <button 
            className="dialog-confirm-btn"
            onClick={handleConfirm}
            disabled={!canStart}
          >
            {!canStart 
              ? `特性点不足！还需要 ${-remainingTP} TP` 
              : '确认并开始游戏'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TraitSelectionDialog;

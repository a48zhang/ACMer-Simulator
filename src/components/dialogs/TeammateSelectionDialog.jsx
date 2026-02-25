import { useState } from 'react';

function TeammateSelectionDialog({ teammates, onConfirm, onCancel, contestName }) {
  const [selectedTeammates, setSelectedTeammates] = useState([]);

  const unlockedTeammates = teammates.filter(t => t.unlocked);
  const maxTeamSize = 3; // 包括玩家自己，需要选2个队友

  const toggleTeammate = (teammateId) => {
    setSelectedTeammates(prev => {
      if (prev.includes(teammateId)) {
        return prev.filter(id => id !== teammateId);
      } else {
        if (prev.length >= 2) {
          // 最多选2个队友
          return prev;
        }
        return [...prev, teammateId];
      }
    });
  };

  const canConfirm = selectedTeammates.length === 2;

  return (
    <div className="dialog-overlay">
      <div className="dialog-box teammate-dialog">
        <h2 className="dialog-title">👥 选择队友</h2>
        <p className="dialog-subtitle">
          {contestName ? `即将参加${contestName}，` : ''}请选择2位队友组队
        </p>
        
        <div className="teammate-selection">
          <div className="selection-status">
            已选择: {selectedTeammates.length} / 2
          </div>
          
          <div className="teammate-list">
            {unlockedTeammates.map(teammate => {
              const isSelected = selectedTeammates.includes(teammate.id);
              return (
                <div
                  key={teammate.id}
                  className={`teammate-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleTeammate(teammate.id)}
                >
                  <div className="teammate-header">
                    <span className="teammate-name">{teammate.name}</span>
                    {isSelected && <span className="selected-badge">✓</span>}
                  </div>
                  <div className="teammate-attributes">
                    <div className="attr-summary">
                      <span>💻 {teammate.attributes.coding}</span>
                      <span>🧠 {teammate.attributes.algorithm}</span>
                      <span>🏃 {teammate.attributes.speed}</span>
                      <span>🧘 {teammate.attributes.stress}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="dialog-actions">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onConfirm(selectedTeammates)}
            disabled={!canConfirm}
          >
            确认组队
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeammateSelectionDialog;

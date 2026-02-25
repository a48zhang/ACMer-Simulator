import { useState, useEffect } from 'react';

function EventDialog({ event, onSelectChoice, onClose }) {
    const [selected, setSelected] = useState(null);
    useEffect(() => { setSelected(null); }, [event?.id]);
    if (!event) return null;

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div className="dialog-box event-dialog-box" onClick={(e) => e.stopPropagation()}>
                <div className="event-dialog-header">
                    <div className="event-dialog-icon">📅</div>
                    <div>
                        <h3 className="dialog-title">{event.title}</h3>
                        <p className="dialog-subtitle">{event.description}</p>
                    </div>
                </div>

                <div className="event-dialog-content">
                    <h4 className="choices-title">请选择你的决策：</h4>
                    <div className="event-choices">
                        {event.choices.map((choice) => (
                            <label
                                key={choice.id}
                                className={`choice-card ${selected === choice.id ? 'choice-selected' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="event-choice"
                                    value={choice.id}
                                    checked={selected === choice.id}
                                    onChange={() => setSelected(choice.id)}
                                    className="choice-radio"
                                />
                                <div className="choice-content">
                                    <div className="choice-indicator"></div>
                                    <span className="choice-label">{choice.label}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="dialog-actions">
                    <button className="btn btn-secondary" onClick={onClose}>稍后处理</button>
                    <button
                        className="btn btn-primary"
                        onClick={() => selected && onSelectChoice(event.id, selected)}
                        disabled={!selected}
                    >
                        确认决策
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EventDialog;

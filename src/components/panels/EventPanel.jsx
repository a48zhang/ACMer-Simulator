import { useMemo } from 'react';

function EventPanel({ pendingEvents, onOpenEvent, onDirectChoice, canAdvance }) {
    const count = pendingEvents?.length || 0;
    const sorted = useMemo(() => pendingEvents || [], [pendingEvents]);

    if (count === 0) return null;

    return (
        <section className="event-panel">
            <div className="panel-header">
                <h2>📅 当月事件</h2>
                <span className="event-badge">{count} 待处理</span>
            </div>

            <div className="event-list">
                {sorted.map((ev) => {
                    const isSimple = ev.choices?.length === 2 &&
                        ev.choices.every(c => !c.requiresTeamSelection && !c.specialAction);
                    return (
                        <div
                            key={ev.id}
                            className="event-card"
                            onClick={isSimple ? undefined : () => onOpenEvent(ev.id)}
                            style={isSimple ? { cursor: 'default' } : undefined}
                        >
                            <div className="event-card-icon">📩</div>
                            <div className="event-card-content">
                                <div className="event-card-header">
                                    <h3 className="event-card-title">{ev.title}</h3>
                                    {ev.mandatory && <span className="tag-mandatory">必做</span>}
                                </div>
                                <p className="event-card-desc">{ev.description}</p>
                                {isSimple && (
                                    <div className="event-inline-choices">
                                        {ev.choices.map((choice) => (
                                            <button
                                                key={choice.id}
                                                className="btn-inline-choice"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDirectChoice(ev.id, choice.id);
                                                }}
                                            >
                                                {choice.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {!isSimple && (
                                <button
                                    className="btn-event-action"
                                    onClick={(e) => { e.stopPropagation(); onOpenEvent(ev.id); }}
                                >
                                    处理 →
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {!canAdvance && (
                <div className="event-block-warning">
                    ⚠️ 请先处理完所有事件才能进入下一月
                </div>
            )}
        </section>
    );
}

export default EventPanel;

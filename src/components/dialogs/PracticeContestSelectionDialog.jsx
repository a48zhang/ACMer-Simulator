// PracticeContestSelectionDialog 组件 - 选择练习赛类型
function PracticeContestSelectionDialog({ onSelect, onCancel }) {
    const contestTypes = [
        {
            id: 'cf_div2',
            name: 'Codeforces Div.2',
            description: '7-8道题目，120分钟，有Rating',
            problemCount: [7, 8],
            durationMinutes: 120,
            difficulties: [1, 2, 3, 5, 7, 8, 10, 10],
            isRated: true,
            ratingSource: 'cf',
            cost: 10
        },
        {
            id: 'cf_div3',
            name: 'Codeforces Div.3',
            description: '6-7道题目，120分钟，有Rating',
            problemCount: [6, 7],
            durationMinutes: 120,
            difficulties: [1, 1, 2, 3, 4, 5, 7],
            isRated: true,
            ratingSource: 'cf',
            cost: 10
        },
        {
            id: 'cf_div4',
            name: 'Codeforces Div.4',
            description: '5-6道题目，90分钟，有Rating',
            problemCount: [5, 6],
            durationMinutes: 90,
            difficulties: [1, 1, 1, 2, 2, 3],
            isRated: true,
            ratingSource: 'cf',
            cost: 8
        },
        {
            id: 'cf_educational',
            name: 'Educational Round',
            description: '6-7道题目，120分钟，有Rating',
            problemCount: [6, 7],
            durationMinutes: 120,
            difficulties: [1, 2, 2, 3, 4, 5, 6],
            isRated: true,
            ratingSource: 'cf',
            cost: 10
        },
        {
            id: 'atcoder_beginner',
            name: 'AtCoder Beginner',
            description: '6道题目，100分钟，有Rating',
            problemCount: 6,
            durationMinutes: 100,
            difficulties: [1, 2, 3, 4, 5, 6],
            isRated: true,
            ratingSource: 'atcoder',
            cost: 10
        },
        {
            id: 'practice_school',
            name: '校内练习赛',
            description: '4-5道题目，120分钟，无Rating',
            problemCount: [4, 5],
            durationMinutes: 120,
            difficulties: [2, 3, 4, 5, 6],
            isRated: false,
            ratingSource: null,
            cost: 8
        }
    ];

    return (
        <div className="dialog-overlay">
            <div className="dialog-box">
                <h2 className="dialog-title">🏆 选择练习赛</h2>
                <p className="dialog-subtitle">选择你要参加的练习赛类型</p>
                
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                }}>
                    {contestTypes.map(contest => (
                        <div
                            key={contest.id}
                            style={{
                                padding: '1rem',
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--background)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = 'var(--primary)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border)';
                            }}
                            onClick={() => onSelect(contest)}
                        >
                            <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                                {contest.name}
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                {contest.description}
                            </div>
                            <div style={{ 
                                fontSize: '0.875rem', 
                                fontWeight: 600, 
                                color: 'var(--primary)',
                                background: 'rgba(99, 102, 241, 0.1)',
                                padding: '0.25rem 0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                display: 'inline-block'
                            }}>
                                ⚡ {contest.cost} AP
                            </div>
                        </div>
                    ))}
                </div>

                <div className="dialog-footer">
                    <button className="btn btn-secondary" onClick={onCancel}>
                        取消
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PracticeContestSelectionDialog;

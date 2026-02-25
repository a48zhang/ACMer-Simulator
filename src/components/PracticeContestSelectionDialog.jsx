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
            <div className="dialog practice-contest-dialog">
                <div className="dialog-header">
                    <h2>🏆 选择练习赛</h2>
                    <button className="dialog-close" onClick={onCancel}>&times;</button>
                </div>
                <div className="dialog-content">
                    <p className="dialog-subtitle">选择你要参加的练习赛类型</p>
                    <div className="contest-type-grid">
                        {contestTypes.map(contest => (
                            <div
                                key={contest.id}
                                className="contest-type-card"
                                onClick={() => onSelect(contest)}
                            >
                                <div className="contest-type-name">{contest.name}</div>
                                <div className="contest-type-desc">{contest.description}</div>
                                <div className="contest-type-cost">消耗 {contest.cost} AP</div>
                            </div>
                        ))}
                    </div>
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

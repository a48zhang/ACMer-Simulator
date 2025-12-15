function ActivityPanel({ activities, remainingAP, onExecuteActivity, isRunning, isPaused, gameEnded }) {
  const canExecute = (activity) => {
    return isRunning && !isPaused && !gameEnded && remainingAP >= activity.cost;
  };

  return (
    <section className="activity-panel">
      <h2>📋 本月活动</h2>
      <div className="activity-list">
        {activities.map(activity => (
          <div key={activity.id} className="activity-card">
            <div className="activity-header">
              <h3 className="activity-name">{activity.name}</h3>
              <span className="activity-cost">{activity.cost} AP</span>
            </div>
            <p className="activity-description">{activity.description}</p>
            <button
              className="btn btn-activity"
              onClick={() => onExecuteActivity(activity.id)}
              disabled={!canExecute(activity)}
            >
              {remainingAP < activity.cost ? '行动点不足' : '执行'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ActivityPanel;

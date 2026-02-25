// 游戏介绍面板 - 初始欢迎界面
function IntroPanel({ onStart }) {
  return (
    <section className="intro-panel">
      <div className="intro-hero">
        <div className="intro-logo">🏆</div>
        <h1 className="intro-title">ACMer选手模拟器</h1>
        <p className="intro-subtitle">体验编程竞赛选手的四年大学生涯</p>
      </div>

      <div className="intro-cards">
        <div className="intro-card">
          <div className="intro-card-icon">🎮</div>
          <h3>游戏背景</h3>
          <p>你是一名计算机专业的大一新生，怀揣着成为顶尖程序设计竞赛选手的梦想。在接下来的四年里，你需要在学业、竞赛和生活之间找到平衡。</p>
        </div>

        <div className="intro-card">
          <div className="intro-card-icon">🎯</div>
          <h3>核心玩法</h3>
          <ul>
            <li><strong>选择特性：</strong>选择你的特质，影响初始能力</li>
            <li><strong>管理时间：</strong>每月合理分配行动点(AP)</li>
            <li><strong>参加比赛：</strong>参加各类编程竞赛，提升Rating</li>
            <li><strong>平衡生活：</strong>保持GPA和SAN值</li>
          </ul>
        </div>

        <div className="intro-card">
          <div className="intro-card-icon">⚡</div>
          <h3>关键提示</h3>
          <ul>
            <li>每场比赛都需要权衡收益和风险</li>
            <li>不要忽视学业，GPA过低可能导致退学</li>
            <li>保持SAN值，心理崩溃会影响表现</li>
            <li>利用队友，团队协作可以提升成绩</li>
          </ul>
        </div>
      </div>

      <div className="intro-footer">
        <button className="btn btn-primary btn-large intro-start-btn" onClick={onStart}>
          🚀 开始我的ACM之旅
        </button>
      </div>
    </section>
  );
}

export default IntroPanel;

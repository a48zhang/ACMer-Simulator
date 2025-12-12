// 游戏常量
const ATTRIBUTE_MULTIPLIERS = {
    CODING: 10,
    ALGORITHM: 12,
    SPEED: 8,
    STRESS: 6,
    TEAMWORK: 7
};

const MAX_ATTRIBUTE_VALUE = 10;
const SUCCESS_RATE_DIVISOR = 20;

// 游戏状态
let gameState = {
    isRunning: false,
    isPaused: false,
    gameTime: 0,
    availablePoints: 10,
    attributes: {
        coding: 0,
        algorithm: 0,
        speed: 0,
        stress: 0,
        teamwork: 0
    },
    playerScore: 0,
    playerContests: 0,
    playerProblems: 0
};

// 游戏定时器引用
let gameInterval = null;

// 初始化游戏
function initGame() {
    updateUI();
    updateLeaderboard();
    loadStatistics();
}

// 开始游戏
document.getElementById('startGameBtn').addEventListener('click', function() {
    if (!gameState.isRunning) {
        gameState.isRunning = true;
        gameState.isPaused = false;
        document.getElementById('statusText').textContent = '进行中';
        document.getElementById('startGameBtn').disabled = true;
        document.getElementById('pauseGameBtn').disabled = false;
        
        // 开始游戏循环
        startGameLoop();
    }
});

// 暂停游戏
document.getElementById('pauseGameBtn').addEventListener('click', function() {
    if (gameState.isRunning) {
        gameState.isPaused = !gameState.isPaused;
        if (gameState.isPaused) {
            document.getElementById('statusText').textContent = '已暂停';
            document.getElementById('pauseGameBtn').textContent = '继续游戏';
        } else {
            document.getElementById('statusText').textContent = '进行中';
            document.getElementById('pauseGameBtn').textContent = '暂停游戏';
        }
    }
});

// 重置游戏
document.getElementById('resetGameBtn').addEventListener('click', function() {
    if (confirm('确定要重置游戏吗？所有进度将被清除！')) {
        gameState = {
            isRunning: false,
            isPaused: false,
            gameTime: 0,
            availablePoints: 10,
            attributes: {
                coding: 0,
                algorithm: 0,
                speed: 0,
                stress: 0,
                teamwork: 0
            },
            playerScore: 0,
            playerContests: 0,
            playerProblems: 0
        };
        
        document.getElementById('statusText').textContent = '未开始';
        document.getElementById('startGameBtn').disabled = false;
        document.getElementById('pauseGameBtn').disabled = true;
        document.getElementById('pauseGameBtn').textContent = '暂停游戏';
        
        updateUI();
    }
});

// 增加属性点
function increaseAttribute(attr) {
    if (gameState.availablePoints > 0 && gameState.attributes[attr] < MAX_ATTRIBUTE_VALUE) {
        gameState.attributes[attr]++;
        gameState.availablePoints--;
        updateUI();
    }
}

// 减少属性点
function decreaseAttribute(attr) {
    if (gameState.attributes[attr] > 0) {
        gameState.attributes[attr]--;
        gameState.availablePoints++;
        updateUI();
    }
}

// 更新UI
function updateUI() {
    // 更新可用属性点
    document.getElementById('availablePoints').textContent = gameState.availablePoints;
    
    // 更新所有属性
    Object.keys(gameState.attributes).forEach(attr => {
        const value = gameState.attributes[attr];
        document.getElementById(attr + 'Value').textContent = value;
        document.getElementById(attr + 'Bar').style.width = (value * 10) + '%';
    });
    
    // 更新游戏时间
    document.getElementById('gameTime').textContent = gameState.gameTime;
    
    // 更新玩家状态
    document.getElementById('playerScore').textContent = gameState.playerScore;
    document.getElementById('playerContests').textContent = gameState.playerContests;
    document.getElementById('playerProblems').textContent = gameState.playerProblems;
    
    // 计算排名
    updatePlayerRank();
}

// 游戏循环
function startGameLoop() {
    // 清除之前的定时器（如果存在）
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    gameInterval = setInterval(() => {
        if (!gameState.isRunning) {
            clearInterval(gameInterval);
            gameInterval = null;
            return;
        }
        
        if (!gameState.isPaused) {
            gameState.gameTime++;
            
            // 每5天参加一次比赛
            if (gameState.gameTime % 5 === 0) {
                participateInContest();
            }
            
            // 每天解题
            solveProblem();
            
            updateUI();
        }
    }, 1000); // 每秒更新一次（加速时间）
}

// 参加比赛
function participateInContest() {
    gameState.playerContests++;
    
    // 根据属性计算比赛得分
    const baseScore = 100;
    const codingBonus = gameState.attributes.coding * ATTRIBUTE_MULTIPLIERS.CODING;
    const algorithmBonus = gameState.attributes.algorithm * ATTRIBUTE_MULTIPLIERS.ALGORITHM;
    const speedBonus = gameState.attributes.speed * ATTRIBUTE_MULTIPLIERS.SPEED;
    const stressBonus = gameState.attributes.stress * ATTRIBUTE_MULTIPLIERS.STRESS;
    const teamworkBonus = gameState.attributes.teamwork * ATTRIBUTE_MULTIPLIERS.TEAMWORK;
    
    const contestScore = baseScore + codingBonus + algorithmBonus + 
                        speedBonus + stressBonus + teamworkBonus +
                        Math.floor(Math.random() * 50); // 随机因素
    
    gameState.playerScore += contestScore;
    
    // 显示比赛通知
    showNotification('🏆 参加了一场比赛！获得 ' + contestScore + ' 分！');
}

// 解题
function solveProblem() {
    // 根据编程能力和算法思维决定是否解题成功
    const successRate = (gameState.attributes.coding + gameState.attributes.algorithm) / SUCCESS_RATE_DIVISOR;
    
    if (Math.random() < successRate) {
        gameState.playerProblems++;
        gameState.playerScore += 5;
    }
}

// 显示通知
function showNotification(message) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideIn 0.5s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 3秒后移除通知
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease';
        setTimeout(() => {
            // 检查元素是否仍然存在且有父节点
            if (notification && notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

// 排行榜数据（存储所有玩家记录）
let leaderboardData = [];

// 更新排行榜显示
function updateLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboardBody');
    
    // 如果排行榜为空，显示提示
    if (leaderboardData.length === 0) {
        leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #999;">暂无排行榜数据</td></tr>';
        return;
    }
    
    // 按分数排序
    const sortedData = [...leaderboardData].sort((a, b) => b.score - a.score).slice(0, 10);
    
    // 更新表格
    leaderboardBody.innerHTML = sortedData.map((player, index) => 
        `<tr><td>${index + 1}</td><td>${player.name}</td><td>${player.score.toLocaleString()}</td><td>${player.contests}</td></tr>`
    ).join('');
}

// 添加玩家到排行榜
function addToLeaderboard(name, score, contests) {
    leaderboardData.push({ name, score, contests });
    updateLeaderboard();
    updateGlobalStatistics();
}

// 更新玩家排名
function updatePlayerRank() {
    if (leaderboardData.length === 0) {
        document.getElementById('playerRank').textContent = '未上榜';
        return;
    }
    
    const sortedData = [...leaderboardData].sort((a, b) => b.score - a.score);
    let rank = sortedData.length + 1;
    
    for (let i = 0; i < sortedData.length; i++) {
        if (gameState.playerScore > sortedData[i].score) {
            rank = i + 1;
            break;
        }
    }
    
    document.getElementById('playerRank').textContent = rank > sortedData.length ? 
        '未上榜' : '#' + rank;
}

// 更新全局统计数据
function updateGlobalStatistics() {
    if (leaderboardData.length === 0) {
        document.getElementById('totalPlayers').textContent = '0';
        document.getElementById('avgScore').textContent = '0';
        document.getElementById('highScore').textContent = '0';
        document.getElementById('avgPlayTime').textContent = '0天';
        return;
    }
    
    // 总玩家数
    document.getElementById('totalPlayers').textContent = leaderboardData.length.toLocaleString();
    
    // 平均分数
    const avgScore = Math.floor(leaderboardData.reduce((sum, player) => sum + player.score, 0) / leaderboardData.length);
    document.getElementById('avgScore').textContent = avgScore.toLocaleString();
    
    // 最高分
    const highScore = Math.max(...leaderboardData.map(p => p.score));
    document.getElementById('highScore').textContent = highScore.toLocaleString();
    
    // 平均游戏时长（基于比赛次数估算）
    const avgContests = Math.floor(leaderboardData.reduce((sum, player) => sum + player.contests, 0) / leaderboardData.length);
    const avgDays = avgContests * 5; // 每5天一场比赛
    document.getElementById('avgPlayTime').textContent = avgDays + '天';
}

// 加载统计数据
function loadStatistics() {
    updateGlobalStatistics();
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 清理定时器
function cleanupTimers() {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', initGame);

// 页面卸载时清理定时器
window.addEventListener('beforeunload', cleanupTimers);

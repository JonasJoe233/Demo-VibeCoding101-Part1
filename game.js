// 游戏常量
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BLOCK_SIZE = 20;
const GAME_SPEED = 100;

// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏状态
let snake = [];
let food = {};
let direction = 'right';
let score = 0;
let gameLoop = null;
let isGameOver = false;

// 方向键映射
const DIRECTIONS = {
    'w': 'up',
    's': 'down',
    'a': 'left',
    'd': 'right'
};

// 初始化游戏
function initGame() {
    // 初始化蛇
    snake = [
        { x: 3, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 1 }
    ];
    direction = 'right';
    score = 0;
    isGameOver = false;
    document.getElementById('score').textContent = `得分: ${score}`;
    document.getElementById('gameOver').style.display = 'none';
    generateFood();
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, GAME_SPEED);
}

// 生成食物
function generateFood() {
    food = {
        x: Math.floor(Math.random() * (CANVAS_WIDTH / BLOCK_SIZE)),
        y: Math.floor(Math.random() * (CANVAS_HEIGHT / BLOCK_SIZE))
    };
    // 确保食物不会生成在蛇身上
    while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        food = {
            x: Math.floor(Math.random() * (CANVAS_WIDTH / BLOCK_SIZE)),
            y: Math.floor(Math.random() * (CANVAS_HEIGHT / BLOCK_SIZE))
        };
    }
}

// 游戏主循环
function gameStep() {
    if (isGameOver) return;

    // 移动蛇
    const head = { ...snake[0] };
    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // 检查是否撞墙
    if (head.x < 0 || head.x >= CANVAS_WIDTH / BLOCK_SIZE ||
        head.y < 0 || head.y >= CANVAS_HEIGHT / BLOCK_SIZE) {
        gameOver();
        return;
    }

    // 检查是否撞到自己
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById('score').textContent = `得分: ${score}`;
        generateFood();
    } else {
        snake.pop();
    }

    // 绘制游戏画面
    draw();
}

// 绘制游戏画面
function draw() {
    // 清空画布
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 绘制蛇
    ctx.fillStyle = 'green';
    snake.forEach(segment => {
        ctx.fillRect(
            segment.x * BLOCK_SIZE,
            segment.y * BLOCK_SIZE,
            BLOCK_SIZE - 1,
            BLOCK_SIZE - 1
        );
    });

    // 绘制食物
    ctx.fillStyle = 'red';
    ctx.fillRect(
        food.x * BLOCK_SIZE,
        food.y * BLOCK_SIZE,
        BLOCK_SIZE - 1,
        BLOCK_SIZE - 1
    );
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
    updateLeaderboard(score);
}

// 更新排行榜
function updateLeaderboard(score) {
    let leaderboard = JSON.parse(localStorage.getItem('snakeLeaderboard') || '[]');
    const newScore = {
        score: score,
        date: new Date().toLocaleString()
    };
    leaderboard.push(newScore);
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 3); // 只保留前三名
    localStorage.setItem('snakeLeaderboard', JSON.stringify(leaderboard));
    displayLeaderboard(leaderboard);
}

// 显示排行榜
function displayLeaderboard(leaderboard) {
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = leaderboard.map((entry, index) => `
        <div class="leaderboard-item">
            <span>第 ${index + 1} 名: ${entry.score} 分</span>
            <span>${entry.date}</span>
        </div>
    `).join('');
}

// 键盘事件监听
document.addEventListener('keydown', (event) => {
    const newDirection = DIRECTIONS[event.key.toLowerCase()];
    if (!newDirection) return;

    // 防止蛇反向移动
    const opposites = {
        'up': 'down',
        'down': 'up',
        'left': 'right',
        'right': 'left'
    };
    if (opposites[newDirection] !== direction) {
        direction = newDirection;
    }
});

// 重新开始按钮事件
document.getElementById('restartButton').addEventListener('click', initGame);

// 初始化游戏
initGame();

// 显示初始排行榜
displayLeaderboard(JSON.parse(localStorage.getItem('snakeLeaderboard') || '[]')); 
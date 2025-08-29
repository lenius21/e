const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

// DOM elements
const menu = document.getElementById("menu");
const playButton = document.getElementById("playButton");
const healthBar = document.getElementById("healthBar");
const waveCounter = document.getElementById("waveCounter");

// Game state
let gameStarted = false;
let gameOver = false;
let bullets = [];
let enemies = [];
let keys = {};
let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
let wave = 1;
let enemiesPerWave = 5;

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 15,
    speed: 5,
    health: 100,
    maxHealth: 100
};

// Start game
playButton.addEventListener("click", () => {
    gameStarted = true;
    menu.style.display = "none";
    resetGame();
});

// Input
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);
document.addEventListener("keydown", e => {
    if (e.code === "Space" && gameStarted && !gameOver) shoot();
});
canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

// Shoot
function shoot() {
    const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    bullets.push({
        x: player.x,
        y: player.y,
        radius: 5,
        speed: 7,
        dx: Math.cos(angle),
        dy: Math.sin(angle)
    });
}

// Spawn enemies
function spawnWave() {
    for (let i = 0; i < enemiesPerWave; i++) {
        enemies.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 15,
            speed: 1 + wave * 0.2
        });
    }
}

// Reset game
function resetGame() {
    bullets = [];
    enemies = [];
    keys = {};
    wave = 1;
    enemiesPerWave = 5;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.health = player.maxHealth;
    gameOver = false;
    spawnWave();
}

// Update game
function update() {
    if (!gameStarted || gameOver) return;

    // Move player
    if (keys["w"] || keys["arrowup"]) player.y -= player.speed;
    if (keys["s"] || keys["arrowdown"]) player.y += player.speed;
    if (keys["a"] || keys["arrowleft"]) player.x -= player.speed;
    if (keys["d"] || keys["arrowright"]) player.x += player.speed;

    // Keep player in bounds
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

    // Move bullets
    bullets = bullets.filter(b => {
        b.x += b.dx * b.speed;
        b.y += b.dy * b.speed;
        return b.x > 0 && b.x < canvas.width && b.y > 0 && b.y < canvas.height;
    });

    // Move enemies & check collisions
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const angle = Math.atan2(player.y - e.y, player.x - e.x);
        e.x += Math.cos(angle) * e.speed;
        e.y += Math.sin(angle) * e.speed;

        // Player hit
        if (Math.hypot(player.x - e.x, player.y - e.y) < player.radius + e.radius) {
            player.health -= 0.5;
            if (player.health <= 0) {
                player.health = 0;
                gameOver = true;
                setTimeout(() => {
                    menu.style.display = "flex";
                    gameStarted = false;
                }, 1500);
            }
        }

        // Bullet hit
        for (let j = bullets.length - 1; j >= 0; j--) {
            const b = bullets[j];
            if (Math.hypot(b.x - e.x, b.y - e.y) < e.radius + b.radius) {
                enemies.splice(i, 1);
                bullets.splice(j, 1);
                break;
            }
        }
    }

    // New wave
    if (enemies.length === 0 && !gameOver) {
        wave++;
        enemiesPerWave += 2;
        spawnWave();
    }

    // UI update
    healthBar.style.width = (player.health / player.maxHealth) * 100 + "%";
    waveCounter.textContent = "Wave: " + wave;
}

// Draw
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameStarted) return;

    // Player
    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Bullets
    ctx.fillStyle = "yellow";
    bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    // Enemies
    ctx.fillStyle = "red";
    enemies.forEach(e => {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    // Game Over text
    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("You Died!", canvas.width / 2, canvas.height / 2);
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();

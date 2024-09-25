// Constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#c44569'];

// Game variables
let canvas;
let ctx;
let gameLoop;
let board = [];
let currentPiece;
let score = 0;
let currentTheme = 'default';
let specialPowerActive = false;

// Piece shapes
const SHAPES = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1, 1], [0, 0, 1]]
];

// Initialize the game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;
    
    // Initialize the board
    for (let r = 0; r < ROWS; r++) {
        board[r] = [];
        for (let c = 0; c < COLS; c++) {
            board[r][c] = 0;
        }
    }
    
    // Start the game loop
    newPiece();
    gameLoop = setInterval(update, 1000 / 60);
    
    // Event listeners
    document.addEventListener('keydown', handleKeyPress);
}

// Create a new piece
function newPiece() {
    let randomShape = Math.floor(Math.random() * SHAPES.length);
    currentPiece = {
        shape: SHAPES[randomShape],
        color: COLORS[randomShape],
        x: Math.floor(COLS / 2) - Math.ceil(SHAPES[randomShape][0].length / 2),
        y: 0
    };
}

// Update game state
function update() {
    moveDown();
    draw();
}

// Move the current piece down
function moveDown() {
    if (!collision(0, 1)) {
        currentPiece.y++;
    } else {
        lockPiece();
        clearLines();
        newPiece();
        if (collision(0, 0)) {
            // Game over
            clearInterval(gameLoop);
            alert("Game Over! Score: " + score);
        }
    }
}

// Lock the piece in place
function lockPiece() {
    for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
            if (currentPiece.shape[r][c]) {
                board[currentPiece.y + r][currentPiece.x + c] = currentPiece.color;
            }
        }
    }
}

// Clear completed lines
function clearLines() {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell !== 0)) {
            board.splice(r, 1);
            board.unshift(Array(COLS).fill(0));
            score += 100;
            
            if (score % 1000 === 0) {
                activateSpecialPower();
            }
        }
    }
}

// Activate a special power
function activateSpecialPower() {
    specialPowerActive = true;
    setTimeout(() => {
        specialPowerActive = false;
    }, 10000);  // Power lasts for 10 seconds
}

// Check for collisions
function collision(moveX, moveY) {
    for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
            if (!currentPiece.shape[r][c]) {
                continue;
            }
            
            let newX = currentPiece.x + c + moveX;
            let newY = currentPiece.y + r + moveY;
            
            if (newX < 0 || newX >= COLS || newY >= ROWS) {
                return true;
            }
            
            if (newY < 0) {
                continue;
            }
            
            if (board[newY][newX] !== 0) {
                return true;
            }
        }
    }
    return false;
}

// Rotate the current piece
function rotate() {
    let rotated = currentPiece.shape[0].map((_, i) => 
        currentPiece.shape.map(row => row[i]).reverse()
    );
    
    if (!collision(0, 0, rotated)) {
        currentPiece.shape = rotated;
    }
}

// Handle key presses
function handleKeyPress(event) {
    switch(event.keyCode) {
        case 37: // Left arrow
            if (!collision(-1, 0)) currentPiece.x--;
            break;
        case 39: // Right arrow
            if (!collision(1, 0)) currentPiece.x++;
            break;
        case 40: // Down arrow
            moveDown();
            break;
        case 38: // Up arrow
            rotate();
            break;
    }
}

// Draw the game state
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the board
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c]) {
                drawBlock(c, r, board[r][c]);
            }
        }
    }
    
    // Draw the current piece
    for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
            if (currentPiece.shape[r][c]) {
                drawBlock(currentPiece.x + c, currentPiece.y + r, currentPiece.color);
            }
        }
    }
    
    // Draw score
    ctx.fillStyle = "#000";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 25);
    
    // Draw special power indicator
    if (specialPowerActive) {
        ctx.fillStyle = "#ff0";
        ctx.fillText("POWER ACTIVE!", 10, 50);
    }
}

// Draw a single block
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// Start the game
init();

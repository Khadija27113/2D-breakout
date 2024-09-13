let letterCPU = [
    // 'C'
    [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1]
    ],
    // 'P'
    [
        [1, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0]
    ],
    // 'U'
    [
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1]
    ]
];
//board
let board;
let boardWidth = 700;
let boardHeight =500;
let context; 

//players
let playerWidth = 80; 
let playerHeight = 20;
let playerVelocityX = 10;

let player = {
    x : boardWidth/2 - playerWidth/2,
    y : boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight,
    velocityX : playerVelocityX
}

//ball
let ballWidth = 10;
let ballHeight = 10;
let ballVelocityX = 3; 
let ballVelocityY = 2;

let ball = {
    x : boardWidth/2,
    y : boardHeight/2,
    width: ballWidth,
    height: ballHeight,
    velocityX : ballVelocityX,
    velocityY : ballVelocityY
}

//blocks
let blockArray = [];
let blockWidth = 30;
let blockHeight = 25;
let blockPadding = 5;

let blockX = 45;
let blockY = 60;

let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
let gameOver = false;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); 

    //draw initial player
    context.fillStyle="skyblue";
    context.fillRect(player.x, player.y, player.width, player.height);
    localStorage.setItem("bestScore", 0);
    bestScore=0
    document.getElementById("best-score-text").textContent = "Best Score: " + bestScore;

    requestAnimationFrame(update);
    document.addEventListener("keydown", movePlayer);
    board.addEventListener("mousemove", movePlayerWithMouse);
    board.addEventListener("touchmove", movePlayerWithTouch);

    //create blocks
    createBlocksForCPU();
    //createBlocks();
    
}
function createBlocksForCPU() {
    blockArray = [];

    // Create blocks for "C"
    createLetterBlocks(letterCPU[0], blockX, blockY);

    // Create blocks for "P"
    createLetterBlocks(letterCPU[1], blockX + 6 * (blockWidth + blockPadding), blockY);

    // Create blocks for "U"
    createLetterBlocks(letterCPU[2], blockX + 12 * (blockWidth + blockPadding), blockY);
    blockCount = blockArray.length;
}

function createLetterBlocks(letterGrid, offsetX, offsetY) {
    for (let row = 0; row < letterGrid.length; row++) {
        for (let col = 0; col < letterGrid[row].length; col++) {
            if (letterGrid[row][col] === 1) {
                let block = {
                    x: offsetX + col * (blockWidth + blockPadding),
                    y: offsetY + row * (blockHeight + blockPadding),
                    width: blockWidth,
                    height: blockHeight,
                    break: false
                };
                blockArray.push(block);
            }
        }
    }
}

function updateScore() {
    document.getElementById("score-text").textContent = "Score: " + score;
}

function drawRoundedRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y); // Move to the top-left corner, shifted by the radius
    context.lineTo(x + width - radius, y); // Draw the top edge
    context.quadraticCurveTo(x + width, y, x + width, y + radius); // Top-right corner
    context.lineTo(x + width, y + height - radius); // Right edge
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height); // Bottom-right corner
    context.lineTo(x + radius, y + height); // Bottom edge
    context.quadraticCurveTo(x, y + height, x, y + height - radius); // Bottom-left corner
    context.lineTo(x, y + radius); // Left edge
    context.quadraticCurveTo(x, y, x + radius, y); // Top-left corner
    context.closePath();
    context.fill();
}


function update() {
    requestAnimationFrame(update);
    //stop drawing
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // player
    context.fillStyle = "lightgreen";
    context.fillRect(player.x, player.y, player.width, player.height);

    // ball
    context.fillStyle = "white";
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    //bounce the ball off player paddle
    if (topCollision(ball, player) || bottomCollision(ball, player)) {
        ball.velocityY *= -1;   // flip y direction up or down
    }
    else if (leftCollision(ball, player) || rightCollision(ball,  player)) {
        ball.velocityX *= -1;   // flip x direction left or right
    }

    if (ball.y <= 0) { 
        // if ball touches top of canvas
        ball.velocityY *= -1; //reverse direction
    }
    else if (ball.x <= 0 || (ball.x + ball.width >= boardWidth)) {
        // if ball touches left or right of canvas
        ball.velocityX *= -1; //reverse direction
    }
    else if (ball.y + ball.height >= boardHeight) {
        // if ball touches bottom of canvas
        context.font = "20px sans-serif";
        context.fillText("Game Over: Press 'Space' to Restart", 80, 400);
        checkBestScore();
        gameOver = true;
    }

    //blocks
    context.fillStyle = "#19A6DB" //"skyblue";
    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        if (!block.break) {
            if (topCollision(ball, block) || bottomCollision(ball, block)) {
                block.break = true;     // block is broken
                ball.velocityY *= -1;   // flip y direction up or down
                score += 100;
                updateScore()
                blockCount -= 1;
            }
            else if (leftCollision(ball, block) || rightCollision(ball, block)) {
                block.break = true;     // block is broken
                ball.velocityX *= -1;   // flip x direction left or right
                score += 100;
                updateScore()
                blockCount -= 1;
            }
            //Drawing a rounded rectangle
            drawRoundedRect(context, block.x, block.y, block.width, block.height, 5);  // 10 is the border radius
        }
        
    }


    //next level
    if (blockCount == 0) {
        score += 100*blockRows*blockColumns; //bonus points :)
        blockRows = Math.min(blockRows + 1, blockMaxRows);
        createBlocks();
    }

    //score
    context.font = "20px sans-serif";
    context.fillText(score, 10, 25);
}

function outOfBounds(xPosition) {
    return (xPosition < 0 || xPosition + playerWidth > boardWidth);
}

function movePlayer(e) {
    if (gameOver) {
        if (e.code == "Space") {
            resetGame();
            console.log("RESET");
        }
        return;
    }
    if (e.code == "ArrowLeft") {
        // player.x -= player.velocityX;
        let nextplayerX = player.x - player.velocityX;
        if (!outOfBounds(nextplayerX)) {
            player.x = nextplayerX;
        }
    }
    else if (e.code == "ArrowRight") {
        let nextplayerX = player.x + player.velocityX;
        if (!outOfBounds(nextplayerX)) {
            player.x = nextplayerX;
        }
        // player.x += player.velocityX;    
    }
}
function movePlayerWithMouse(e) {
    if (gameOver) return;
    let rect = board.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let nextplayerX = mouseX - player.width / 2;
    if (!outOfBounds(nextplayerX)) {
        player.x = nextplayerX;
    }
}

function movePlayerWithTouch(e) {
    if (gameOver) return;
    let rect = board.getBoundingClientRect();
    let touchX = e.touches[0].clientX - rect.left;
    let nextplayerX = touchX - player.width / 2;
    if (!outOfBounds(nextplayerX)) {
        player.x = nextplayerX;
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

function topCollision(ball, block) { 
    return detectCollision(ball, block) && (ball.y + ball.height) >= block.y;
}

function bottomCollision(ball, block) { 
    return detectCollision(ball, block) && (block.y + block.height) >= ball.y;
}

function leftCollision(ball, block) { 
    return detectCollision(ball, block) && (ball.x + ball.width) >= block.x;
}

function rightCollision(ball, block) { 
    return detectCollision(ball, block) && (block.x + block.width) >= ball.x;
}

function createBlocks() {
    blockArray = []; //clear blockArray
    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            let block = {
                x : blockX + c*blockWidth + c*10, //c*10 space 10 pixels apart columns
                y : blockY + r*blockHeight + r*10, //r*10 space 10 pixels apart rows
                width : blockWidth,
                height : blockHeight,
                break : false
            }
            blockArray.push(block);
        }
    }
    blockCount = blockArray.length;
}
function checkBestScore() {
    if (score > bestScore) {
        bestScore = score; // Update best score
        localStorage.setItem("bestScore", bestScore); // Save it to localStorage

        // Update the displayed best score
        document.getElementById("best-score-text").textContent = "Best Score: " + bestScore;
    }
}

function resetGame() {
    gameOver = false;
    player = {
        x : boardWidth/2 - playerWidth/2,
        y : boardHeight - playerHeight - 5,
        width: playerWidth,
        height: playerHeight,
        velocityX : playerVelocityX
    }
    ball = {
        x : boardWidth/2,
        y : boardHeight/2,
        width: ballWidth,
        height: ballHeight,
        velocityX : ballVelocityX,
        velocityY : ballVelocityY
    }
    blockArray = [];
    blockRows = 3;
    score = 0;
    updateScore()

    //createBlocks();
    createBlocksForCPU()
}
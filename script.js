const boardEl = document.getElementById("board");
const rollBtn = document.getElementById("rollBtn");
const resetBtn = document.getElementById("resetBtn");
const statusEl = document.getElementById("status");
const messageEl = document.getElementById("message");
const diceBox1 = document.getElementById("diceBox1");
const diceBox2 = document.getElementById("diceBox2");
const winnerOverlay = document.getElementById("winnerOverlay");
const winnerNameEl = document.getElementById("winnerName");
const closeWinnerBtn = document.getElementById("closeWinnerBtn");

const CONFETTI_EMOJIS = ["🎉", "🎊", "🥳", "🎈", "⭐", "✨", "💛"];

function getDiceFaceHTML(value) {
    const positions = {
        1: [5],
        2: [3, 7],
        3: [1, 5, 9],
        4: [1, 3, 7, 9],
        5: [1, 3, 5, 7, 9],
        6: [1, 3, 4, 6, 7, 9]
    };
    let html = "";
    for (let i = 1; i <= 9; i++) {
        html += `<span class="pip ${positions[value].includes(i) ? "on" : ""}"></span>`;
    }
    return html;
}

function setDiceFace(box, value) {
    box.innerHTML = getDiceFaceHTML(value);
}

function showDiceDash(box) {
    box.innerHTML = '<span class="dash">-</span>';
}

function rollDiceAnimation(box, finalValue) {
    return new Promise((resolve) => {
        box.classList.add("rolling");
        let count = 0;
        const maxTicks = 8;
        const interval = setInterval(() => {
            count++;
            if (count >= maxTicks) {
                clearInterval(interval);
                setDiceFace(box, finalValue);
                box.classList.remove("rolling");
                resolve();
            } else {
                setDiceFace(box, Math.floor(Math.random() * 6) + 1);
            }
        }, 90);
    });
}

// ─── Snake map ─────────────────────────────────────────────────────────────
// Keys/values are BOARD positions (1–100), the numbers displayed on the cells.
// key = snake head, value = snake tail. Every head is higher than its tail,
// so a landed player always slides DOWN. Tails are intentionally NOT heads.
//
// Layout is balanced across rows with a mix of drop lengths:
//   - 90s row: endgame trap, one cell before the finish (long, 94-cell drop)
//   - 80s row: long drop (39 cells)
//   - 50s/60s rows: medium drops (23 / 25 cells)
//   - 10s/20s rows: short drops (13 / 9 cells)
const snakes = {
    99: 5, // head 99 → tail 5  (long, endgame trap)
    87: 48, // head 87 → tail 48 (long drop)
    64: 39, // head 64 → tail 39 (medium drop)
    57: 34, // head 57 → tail 34 (medium drop)
    20: 7, // head 20 → tail 7  (short drop)
    13: 4  // head 13 → tail 4  (short drop)
};

// Internal player positions are 0-indexed (0 = cell 1, 99 = cell 100),
// so we convert between board cells and array indexes.
function boardToIndex(cell) {
    return cell - 1;
}

function indexToBoard(index) {
    return index + 1;
}

// Checks whether the given board position (1–100) is a snake head and returns
// the board position the player moves to. Returns the same cell if no snake.
function checkSnake(currentPosition) {
    if (snakes[currentPosition] !== undefined) {
        return snakes[currentPosition];
    }
    return currentPosition;
}

let position_01 = 0;
let position_02 = 0;
let currentTurn = 1;
let gameOver = false;

function buildBoard() {
    boardEl.innerHTML = "";
    for (let i = 1; i <= 100; i++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.id = "cell-" + i;
        if (snakes[i] !== undefined) {
            cell.classList.add("snake");
            cell.textContent = "🐍";
        } else {
            cell.textContent = i;
        }
        boardEl.appendChild(cell);
    }
}

function placePlayers() {
    document.querySelectorAll(".marker1, .marker2").forEach((el) => el.remove());
    placeMarker(position_01, "💀", "marker1");
    placeMarker(position_02, "😎", "marker2");
}

function placeMarker(position, symbol, className) {
    const cell = document.getElementById("cell-" + (position + 1));
    if (!cell) return;
    const marker = document.createElement("span");
    marker.className = className;
    marker.textContent = symbol;
    if (position_01 === position_02 && className === "marker2") {
        marker.classList.add("shift");
    }
    cell.appendChild(marker);
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function play() {
    if (gameOver) return;
    rollBtn.disabled = true;

    const playerName = currentTurn === 1 ? "Player 1 💀" : "Player 2 😎";
    const isPlayer1 = currentTurn === 1;

    const dice = Math.floor(Math.random() * 6) + 1;
    const diceBox = isPlayer1 ? diceBox1 : diceBox2;
    await rollDiceAnimation(diceBox, dice);

    const start = isPlayer1 ? position_01 : position_02;
    let newPos = start + dice;
    if (newPos > 99) newPos = 99;

    messageEl.textContent = `${playerName} rolled ${dice}`;

    for (let step = start + 1; step <= newPos; step++) {
        await sleep(250);
        if (isPlayer1) {
            position_01 = step;
        } else {
            position_02 = step;
        }
        placePlayers();
        messageEl.textContent = `${playerName} 🎲${dice} ➜ cell ${step + 1}`;
    }

    // Check if the landed cell is a snake head and slide down if so.
    const landedCell = indexToBoard(newPos);
    const finalCell = checkSnake(landedCell);
    if (finalCell !== landedCell) {
        messageEl.textContent = `🐍 Snake! Slide down from cell ${landedCell} to cell ${finalCell}`;
        await sleep(400);
        newPos = boardToIndex(finalCell);
        if (isPlayer1) {
            position_01 = newPos;
        } else {
            position_02 = newPos;
        }
        placePlayers();
    }

    if (newPos >= 99) {
        gameOver = true;
        rollBtn.disabled = true;
        statusEl.textContent = "";
        showWinner(playerName);
        return;
    }

    currentTurn = currentTurn === 1 ? 2 : 1;
    statusEl.textContent = `It's ${currentTurn === 1 ? "Player 1 💀" : "Player 2 😎"}'s turn`;
    rollBtn.disabled = false;
}

function showWinner(playerName) {
    winnerNameEl.textContent = `${playerName} wins! 🏆`;
    winnerOverlay.classList.remove("hidden");

    for (let i = 0; i < 80; i++) {
        const piece = document.createElement("span");
        piece.className = "confetti";
        piece.textContent = CONFETTI_EMOJIS[Math.floor(Math.random() * CONFETTI_EMOJIS.length)];
        piece.style.left = Math.random() * 100 + "vw";
        piece.style.fontSize = 16 + Math.random() * 22 + "px";
        piece.style.animationDuration = 2.5 + Math.random() * 3 + "s";
        piece.style.animationDelay = Math.random() * 2 + "s";
        winnerOverlay.appendChild(piece);
    }
}

function hideWinner() {
    winnerOverlay.classList.add("hidden");
    winnerOverlay.querySelectorAll(".confetti").forEach((el) => el.remove());
    reset();
}

function reset() {
    position_01 = 0;
    position_02 = 0;
    currentTurn = 1;
    gameOver = false;
    messageEl.textContent = "";
    statusEl.textContent = "It's Player 1 💀's turn";
    showDiceDash(diceBox1);
    showDiceDash(diceBox2);
    rollBtn.disabled = false;
    buildBoard();
    placePlayers();
}

rollBtn.addEventListener("click", play);
resetBtn.addEventListener("click", reset);
closeWinnerBtn.addEventListener("click", hideWinner);

reset();
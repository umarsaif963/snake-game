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

const SNAKES = { 4: 0, 15: 9, 29: 13, 49: 37, 98: 47 };

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
        if (SNAKES[i - 1] !== undefined) {
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

function penalty(p) {
    if (SNAKES[p] !== undefined) {
        messageEl.textContent = `🐍 Snake! Move back to ${SNAKES[p] + 1}`;
        return SNAKES[p];
    }
    return p;
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

    newPos = penalty(newPos);
    if (newPos !== (isPlayer1 ? position_01 : position_02)) {
        await sleep(300);
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
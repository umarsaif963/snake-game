const boardEl = document.getElementById("board");
const rollBtn = document.getElementById("rollBtn");
const resetBtn = document.getElementById("resetBtn");
const statusEl = document.getElementById("status");
const messageEl = document.getElementById("message");
const diceBox1 = document.getElementById("diceBox1");
const diceBox2 = document.getElementById("diceBox2");

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

function play() {
    if (gameOver) return;

    const playerName = currentTurn === 1 ? "Player 1 💀" : "Player 2 😎";

    const dice = Math.floor(Math.random() * 6) + 1;
    if (currentTurn === 1) {
        diceBox1.textContent = dice;
    } else {
        diceBox2.textContent = dice;
    }
    let newPos = (currentTurn === 1 ? position_01 : position_02) + dice;
    if (newPos > 99) newPos = 99;

    messageEl.textContent = `${playerName} rolled ${dice} ➜ cell ${newPos + 1}`;
    newPos = penalty(newPos);

    if (currentTurn === 1) {
        position_01 = newPos;
    } else {
        position_02 = newPos;
    }

    placePlayers();

    if (newPos >= 99) {
        messageEl.textContent = `${playerName} wins! 🎉`;
        gameOver = true;
        rollBtn.disabled = true;
        statusEl.textContent = "";
        return;
    }

    currentTurn = currentTurn === 1 ? 2 : 1;
    statusEl.textContent = `It's ${currentTurn === 1 ? "Player 1 💀" : "Player 2 😎"}'s turn`;
}

function reset() {
    position_01 = 0;
    position_02 = 0;
    currentTurn = 1;
    gameOver = false;
    messageEl.textContent = "";
    statusEl.textContent = "It's Player 1 💀's turn";
    diceBox1.textContent = "-";
    diceBox2.textContent = "-";
    rollBtn.disabled = false;
    buildBoard();
    placePlayers();
}

rollBtn.addEventListener("click", play);
resetBtn.addEventListener("click", reset);

reset();
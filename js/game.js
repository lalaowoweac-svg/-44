document.addEventListener("DOMContentLoaded", () => {

/* =================================================
   🎮 STATE
================================================= */

const GameState = {
    IDLE: "idle",
    BUSY: "busy"
};

let gameState = GameState.IDLE;

const state = {
    firstCard: null,
    secondCard: null,
    matched: 0,
    time: 60,
    hint: 3
};

let timer = null;

/* =================================================
   🧠 GLOBAL LOCK（解決第3次鎖牌問題核心）
================================================= */

let lock = false;

function acquireLock() {
    if (lock) return false;
    lock = true;
    return true;
}

function releaseLock() {
    lock = false;
}

/* =================================================
   📦 DOM
================================================= */

const el = {
    board: document.getElementById("gameBoard"),
    time: document.getElementById("time"),
    matched: document.getElementById("matched"),

    hintBtn: document.getElementById("hintBtn"),
    hintCount: document.getElementById("hintCount"),

    homeBtn: document.getElementById("homeBtn"),
    confirmBox: document.getElementById("confirmBox"),
    cancelBtn: document.getElementById("cancelBtn"),
    confirmHome: document.getElementById("confirmHome"),

    modal: document.getElementById("modal"),
    title: document.getElementById("riceTitle"),
    intro: document.getElementById("riceIntro"),
    closeModal: document.getElementById("closeModal")
};

/* =================================================
   🚀 INIT
================================================= */

let cards = generateCards();

init();

function init() {
    renderCards();
    bindEvents();
    startTimer();
}

/* =================================================
   🔧 STATE CONTROL
================================================= */

function setState(s) {
    gameState = s;
}

/* =================================================
   🃏 RENDER
================================================= */

function renderCards() {

    el.board.innerHTML = "";

    cards.forEach(data => {

        const card = document.createElement("div");
        card.className = "card";

        card.dataset.id = data.id;
        card.dataset.type = data.type;
        card.dataset.state = "idle";

        card.innerHTML = `
            <div class="cardInner">
                <div class="front">
                    ${data.type === "image"
                        ? `<img src="${data.content}">`
                        : `<h2>${data.content}</h2>`}
                </div>
                <div class="back"></div>
            </div>
        `;

        card.addEventListener("click", () => handleFlip(card));

        el.board.appendChild(card);
    });
}

/* =================================================
   🔄 FLIP（核心修復）
================================================= */

function handleFlip(card) {

    // 🚨 全局保護（解鎖第3次壞掉）
    if (gameState !== GameState.IDLE) return;
    if (!acquireLock()) return;

    if (card.dataset.state !== "idle") {
        releaseLock();
        return;
    }

    card.dataset.state = "flipped";
    card.classList.add("flip");

    if (!state.firstCard) {
        state.firstCard = card;
        releaseLock();
        return;
    }

    state.secondCard = card;

    setState(GameState.BUSY);

    checkMatch();
}

/* =================================================
   🧠 MATCH
================================================= */

function checkMatch() {

    const a = state.firstCard;
    const b = state.secondCard;

    const isMatch =
        a.dataset.id === b.dataset.id &&
        a.dataset.type !== b.dataset.type;

    if (isMatch) onMatch(a, b);
    else onWrong(a, b);
}

/* =================================================
   ✅ MATCH FIX
================================================= */

function onMatch(a, b) {

    state.matched++;
    el.matched.textContent = state.matched;

    setTimeout(() => {

        a.dataset.state = "matched";
        b.dataset.state = "matched";
        a.classList.add("matched");
        b.classList.add("matched");

        a.style.visibility = "hidden";
        b.style.visibility = "hidden";

        showModal(a.dataset.id);

        resetPick();

        setState(GameState.IDLE);
        releaseLock(); // 🔥關鍵

        checkWin();

    }, 300);
}

/* =================================================
   ❌ WRONG FIX
================================================= */

function onWrong(a, b) {

    setTimeout(() => {

        a.classList.remove("flip");
        b.classList.remove("flip");
        a.dataset.state = "idle";
        b.dataset.state = "idle";

        resetPick();

        setState(GameState.IDLE);
        releaseLock(); // 🔥關鍵

    }, 600);
}

/* =================================================
   📖 MODAL
================================================= */

function showModal(id) {

    const rice = riceData.find(r => r.id == id);
    if (!rice) return;

    el.title.textContent = rice.name;
    el.intro.textContent = rice.intro;

    el.modal.classList.remove("hide");
}

/* =================================================
   💡 HINT（安全版）
================================================= */

function hintSystem() {

    if (state.hint <= 0) return;
    if (gameState !== GameState.IDLE) return;

    state.hint--;
    el.hintCount.textContent = state.hint;

    const aliveCards = Array.from(document.querySelectorAll(".card"))
        .filter(c => c.dataset.state === "idle");

    const map = {};

    aliveCards.forEach(c => {
        if (!map[c.dataset.id]) map[c.dataset.id] = [];
        map[c.dataset.id].push(c);
    });

    const pairs = Object.values(map).filter(g => g.length === 2);

    if (pairs.length === 0) return;

    const pair = pairs[Math.floor(Math.random() * pairs.length)];

    setState(GameState.BUSY);

    pair.forEach(c => c.classList.add("flip"));

    setTimeout(() => {

        pair.forEach(c => c.classList.remove("flip"));

        setState(GameState.IDLE);

    }, 1000);
}

/* =================================================
   ⏱ TIMER（防黑屏穩定版）
================================================= */

function startTimer() {

    timer = setInterval(() => {

        state.time--;
        el.time.textContent = state.time;

        if (state.time <= 0) {

            clearInterval(timer);

            setState(GameState.BUSY);

            document.querySelectorAll(".card").forEach(c => {
                c.style.pointerEvents = "none";
            });

            setTimeout(() => {
                window.location.href = "lose.html";
            }, 300);
        }

    }, 1000);
}

/* =================================================
   🏆 WIN
================================================= */

function checkWin() {

    const remaining = document.querySelectorAll(".card[data-state='idle']");

    if (remaining.length === 0) {

        clearInterval(timer);

        setTimeout(() => {
            window.location.href = "end.html";
        }, 800);
    }
}

/* =================================================
   🔁 RESET
================================================= */

function resetPick() {
    state.firstCard = null;
    state.secondCard = null;
}

/* =================================================
   🎧 EVENTS
================================================= */

function bindEvents() {

    el.hintBtn?.addEventListener("click", hintSystem);

    el.homeBtn?.addEventListener("click", () => {
        el.confirmBox.classList.remove("hide");
    });

    el.cancelBtn?.addEventListener("click", () => {
        el.confirmBox.classList.add("hide");
    });

    el.confirmHome?.addEventListener("click", () => {
        window.location.href = "index.html";
    });

    el.closeModal?.addEventListener("click", () => {
        el.modal.classList.add("hide");
        setState(GameState.IDLE);
        resetPick();
        releaseLock();
    });
}

});
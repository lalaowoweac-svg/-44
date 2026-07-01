// =====================
// 開始遊戲按鈕
// =====================

const startBtn = document.getElementById("startBtn");

startBtn.addEventListener("click", () => {

    // 如果之後加入 click.wav
    // new Audio("assets/audio/click.wav").play();

    document.body.style.opacity = 0;

    document.body.style.transition = "0.5s";

    setTimeout(() => {

        location.href = "game.html";

    },500);

});
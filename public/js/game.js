// ============================================================
//  game.js  —  Click Rush
//  ✅ Only loaded in:  index.html
//  Depends on:         utils.js  (must be loaded first)
// ============================================================

// ─── STATE ──────────────────────────────────────────────────
let clicks      = 0;
let timeLeft    = 60;
let gameRunning = false;
let timerInterval;


// ─── GET DOM ELEMENTS ───────────────────────────────────────

document.addEventListener("DOMContentLoaded", function () {

  const startBtn     = document.getElementById("start_button");
  const clickBtn     = document.getElementById("click_button");   // the big click button
  const scoreDisplay = document.getElementById("score_display");
  const gameMessage  = document.getElementById("game_message");
  const timerDisplay = document.getElementById("timer_display");
  const countdownEl  = document.getElementById("countdown");

  // ─── START BUTTON ──────────────────────────────────────── initated after clicking it
  if (startBtn) {
    startBtn.addEventListener("click", function () {
      startCountdown();
    });
  }

  // ─── CLICK BUTTON ────────────────────────────────────────
  if (clickBtn) {
    clickBtn.addEventListener("click", function () {
      if (!gameRunning) return;
      clicks++;
      if (scoreDisplay) scoreDisplay.textContent = clicks;
    });
  }


  // ─── COUNTDOWN (3, 2, 1 before game starts) ──────────────

  function startCountdown() {
    let count = 3;
    if (startBtn)    startBtn.style.display    = "none";
    if (countdownEl) countdownEl.style.display = "block";
    if (countdownEl) countdownEl.textContent   = count;

    const cd = setInterval(function () {
      count--;
      if (count === 0) {
        clearInterval(cd);
        if (countdownEl) countdownEl.style.display = "none";
        startGame();
      } else {
        if (countdownEl) countdownEl.textContent = count;
      }
    }, 1000);
  }


  // ─── START GAME ──────────────────────────────────────────

  function startGame() {
    clicks      = 0;
    timeLeft    = 60;
    gameRunning = true;

    if (scoreDisplay) scoreDisplay.textContent = 0;
    if (timerDisplay) timerDisplay.textContent = 60;
    if (gameMessage)  gameMessage.textContent  = "Game Started! Click as fast as you can!";
    if (clickBtn)     clickBtn.disabled        = false;

    timerInterval = setInterval(function () {
      timeLeft--;
      if (timerDisplay) timerDisplay.textContent = timeLeft;

      // Turn timer red in last 10 seconds
      if (timeLeft <= 10 && timerDisplay) {
        timerDisplay.style.color = "red";
      }

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endGame(); // endGame is async — fire-and-forget is fine here
      }
    }, 1000);
  }


  // ─── END GAME ────────────────────────────────────────────
  // NOTE: now ASYNC because it awaits getCurrentUser() from
  // utils.js, which itself does a fetch() to the backend.

  async function endGame() {
    gameRunning = false;
    if (clickBtn) clickBtn.disabled = true;
    if (startBtn) startBtn.style.display = "block";
    if (timerDisplay) timerDisplay.style.color = "";
    if (gameMessage)  gameMessage.textContent  = `⏱ Time's Up! You clicked ${clicks} times! SCORE is ${clicks} `;


    // ── OFFLINE: show best score from localStorage ──────────
    // Save score via utils.js
    /*
    saveScore(clicks);
    const best = getBestScore();
    const bestDisplay = document.getElementById("best_score");
    if (bestDisplay) bestDisplay.textContent = best;
    */

    // ✅ BACKEND MODE — getCurrentUser() is async now, must await it
    const user = await getCurrentUser();

    if (user) {
      try {
        const response = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ score: clicks })
        });

        if (!response.ok) throw new Error("Failed to save score");

        const data = await response.json();
        // data.globalRank, data.weeklyRank, data.dailyRank
        const g = document.getElementById("global_rank");
        const w = document.getElementById("weekly_rank");
        const d = document.getElementById("daily_rank");
        if (g) g.textContent = "#" + data.globalRank;
        if (w) w.textContent = "#" + data.weeklyRank;
        if (d) d.textContent = "#" + data.dailyRank;

      } catch (err) {
        console.error("Score save error:", err);
      }

    } else {
      // Guest — no session, don't POST a score, show dashes instead
      const g = document.getElementById("global_rank");
      const w = document.getElementById("weekly_rank");
      const d = document.getElementById("daily_rank");
      if (g) g.textContent = "-";
      if (w) w.textContent = "-";
      if (d) d.textContent = "-";
    }
  }

}); // end DOMContentLoaded

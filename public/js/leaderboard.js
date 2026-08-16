// ============================================================
//  leaderboard.js  —  Click Rush
//  Only loaded in:  leaderboard.html
//  Depends on:         utils.js  (must be loaded first)
// ============================================================
 
document.addEventListener("DOMContentLoaded", function () {
 
  // ─── GET DOM ELEMENTS ──────────────────────────────────────

  // Those elements only exist in index.html, not leaderboard.html
  // Each JS file should only grab elements from its OWN page
 
  const leaderboardData = document.getElementById("leaderboardData");
 
  // Correct IDs match what's in the HTML
  const btnGlobal  = document.getElementById("global");
  const btnWeekly  = document.getElementById("week");
  const btnDaily   = document.getElementById("today");
 
 
  // ─── FETCH LEADERBOARD ─────────────────────────────────────
 
  async function fetchLeaderboard(type) {
 
    if (leaderboardData) {
      leaderboardData.innerHTML = "<p>Loading...</p>";
    }
 
    // ── OFFLINE MODE (localStorage) ──────────────────────────
    // Reads all users from localStorage, sorts by best score
    // Comment this block out once your backend is ready
 
    const users = JSON.parse(localStorage.getItem("users") || "[]");
 
    let scored = users
      .filter(u => u.scores && u.scores.length > 0)
      .map(u => ({
        username: u.username,
        score: Math.max(...u.scores.map(s => s.score)),
        // For weekly/daily we filter by date
        recentScore: getRecentScore(u.scores, type)
      }));
 
    // For weekly/daily, filter out users with no recent scores
    if (type !== "global") {
      scored = scored.filter(u => u.recentScore > 0);
      scored.sort((a, b) => b.recentScore - a.recentScore);
      scored = scored.map((u, i) => ({
        rank: i + 1,
        username: u.username,
        score: u.recentScore
      }));
    } else {
      scored.sort((a, b) => b.score - a.score);
      scored = scored.map((u, i) => ({
        rank: i + 1,
        username: u.username,
        score: u.score
      }));
    }
 
    displayLeaderboard(scored);
 
 
    // ── BACKEND MODE (uncomment when server is ready) ────────
    /*
    try {
      const response = await fetch(`/api/leaderboard/${type}`, {
        credentials: "include"
      });
 
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
 
      const data = await response.json();
      displayLeaderboard(data);
 
    } catch (error) {
      console.error("Leaderboard error:", error);
      if (leaderboardData) {
        leaderboardData.innerHTML = "<p>Unable to load leaderboard. Try again.</p>";
      }
    }
    */
  }
 
 
  // ─── HELPER: get score within time window ──────────────────
 
  function getRecentScore(scores, type) {
    const now = new Date();
    let cutoff;
 
    if (type === "weekly") {
      cutoff = new Date(now - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    } else if (type === "daily") {
      cutoff = new Date(now - 24 * 60 * 60 * 1000);     // 24 hours ago
    } else {
      return Math.max(...scores.map(s => s.score));
    }
 
    const recent = scores.filter(s => new Date(s.date) >= cutoff);
    if (recent.length === 0) return 0;
    return Math.max(...recent.map(s => s.score));
  }
 
 
  // ─── DISPLAY LEADERBOARD ───────────────────────────────────
 
  function displayLeaderboard(data) {
    if (!leaderboardData) return;
 
    leaderboardData.innerHTML = "";
 
    if (data.length === 0) {
      leaderboardData.innerHTML = "<p>No scores yet. Be the first to play!</p>";
      return;
    }
 
    data.forEach(function (user) {
      // Add medal for top 3
      const medal = user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : `#${user.rank}`;
 
      leaderboardData.innerHTML += `
        <div class="leaderboard-row">
          <span class="rank">${medal}</span>
          <span class="username">${user.username}</span>
          <span class="score">${user.score}</span>
        </div>
      `;
    });
  }
 
 
  // ─── TAB BUTTON EVENTS ─────────────────────────────────────
  // ✅ Fixed: old code used  globalBtn.addEventListener  but globalBtn was never defined
 
  function setActiveTab(activeBtn) {
    [btnGlobal, btnWeekly, btnDaily].forEach(btn => {
      if (btn) btn.classList.remove("active");
    });
    if (activeBtn) activeBtn.classList.add("active");
  }
 
  if (btnGlobal) {
    btnGlobal.addEventListener("click", function () {
      setActiveTab(btnGlobal);
      fetchLeaderboard("global");
    });
  }
 
  if (btnWeekly) {
    btnWeekly.addEventListener("click", function () {
      setActiveTab(btnWeekly);
      fetchLeaderboard("weekly");
    });
  }
 
  if (btnDaily) {
    btnDaily.addEventListener("click", function () {
      setActiveTab(btnDaily);
      fetchLeaderboard("daily");
    });
  }
 
 
  // ─── DEFAULT: load global on page open ─────────────────────
  setActiveTab(btnGlobal);
  fetchLeaderboard("global");
 
}); // end DOMContentLoaded


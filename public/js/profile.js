// ============================================================
//  profile.js  —  Click Rush
// Only loaded in:  profile.html
//  Depends on:         utils.js  (must be loaded first)
// ============================================================
 
document.addEventListener("DOMContentLoaded", function () {
 
  //Protect this page — guests get sent to login
  const user = requireLogin();   // from utils.js
  if (!user) return;             // requireLogin() already redirected
 
 
  // ─── FILL IN USER INFO ─────────────────────────────────────
 
  const profileUsername = document.getElementById("profile_username");
  const profileEmail    = document.getElementById("profile_email");
  const profileHexId    = document.getElementById("profile_hexid");
  const profileBest     = document.getElementById("profile_best");
  const profileTotal    = document.getElementById("profile_total");
  const profileHistory  = document.getElementById("profile_history");
 
  if (profileUsername) profileUsername.textContent = user.username;
  if (profileEmail)    profileEmail.textContent    = user.email;
  if (profileHexId)    profileHexId.textContent    = user.hexId;
 
 
  // ─── OFFLINE: read scores from localStorage ────────────────
 
  const scores = user.scores || [];
  const best   = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;
  const total  = scores.length;
 
  if (profileBest)  profileBest.textContent  = best;
  if (profileTotal) profileTotal.textContent = total;
 
 
  // ─── SCORE HISTORY TABLE ───────────────────────────────────
 
  if (profileHistory) {
    if (scores.length === 0) {
      profileHistory.innerHTML = "<p>No games played yet. Go play!</p>";
    } else {
      // Sort newest first
      const sorted = [...scores].sort((a, b) => new Date(b.date) - new Date(a.date));
 
      profileHistory.innerHTML = sorted.map((s, i) => `
        <div class="history-row">
          <span class="history-num">${i + 1}</span>
          <span class="history-score">${s.score} clicks</span>
          <span class="history-date">${new Date(s.date).toLocaleDateString()}</span>
        </div>
      `).join("");
    }
  }
 
 
  // ── BACKEND MODE (uncomment when server is ready) ──────────
  /*
  async function loadProfile() {
    try {
      const response = await fetch("/api/profile", {
        method: "GET",
        credentials: "include"
      });
 
      if (response.status === 401) {
        // Session expired — redirect to login
        window.location.href = "login.html";
        return;
      }
 
      if (!response.ok) throw new Error("Failed to load profile");
 
      const data = await response.json();
      // data = { username, email, hexId, bestScore, totalGames, history[] }
 
      if (profileUsername) profileUsername.textContent = data.username;
      if (profileEmail)    profileEmail.textContent    = data.email;
      if (profileBest)     profileBest.textContent     = data.bestScore;
      if (profileTotal)    profileTotal.textContent    = data.totalGames;
 
      // render history...
 
    } catch (err) {
      console.error("Profile load error:", err);
    }
  }
 
  loadProfile();
  */
 
}); // end DOMContentLoaded
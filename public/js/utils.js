// ============================================================
//  utils.js  —  Click Rush
//  Contains shared functions that ALL other JS files depend on
//  Loaded FIRST on every page (before auth.js / game.js /
//  leaderboard.js / profile.js)
// ============================================================


// ─── GET CURRENT LOGGED-IN USER (BACKEND MODE) ───────────────
// Asks the server (via session cookie) who is logged in.
// Returns: a Promise that resolves to
//          { username, email, hexId, ... }  or  null if guest
// NOTE: this is now ASYNC — any code that calls it must use
//       `await getCurrentUser()` inside an `async function`.

async function getCurrentUser() {
  try {
    const response = await fetch("/api/profile", {
      credentials: "include"
    });

    if (!response.ok) return null; // not logged in / session expired

    const data = await response.json();
    return data;

  } catch (err) {
    console.error("getCurrentUser error:", err);
    return null;
  }
}


// ── OFFLINE MODE (commented out — backend handles this now) ──
/*
function getCurrentUser() {
  const raw = localStorage.getItem("currentUser");
  return raw ? JSON.parse(raw) : null;
}
*/


// ─── PROTECT A PAGE (redirect guests to login) ───────────────
// Call `await requireLogin()` at the top of game.js and
// profile.js, inside an async DOMContentLoaded handler.
// If user is not logged in → sends them to login.html

async function requireLogin() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  return user;
}


// ─── LOGOUT ───────────────────────────────────────────────────
// Called by the Logout button in the nav of every page.
// Tells the server to destroy the session, then redirects.

async function logout() {
  try {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include"
    });
  } catch (err) {
    console.error("Logout error:", err);
  }
  window.location.href = "login.html";
}


// ── OFFLINE MODE (commented out — backend handles this now) ──
/*
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}
*/


// ─── SAVE SCORE / GET BEST SCORE ─────────────────────────────
// No longer used — game.js now saves scores via POST /api/score
// and reads ranks straight from that response. Kept here only
// for reference in case you ever need an offline fallback mode.

/*
function saveScore(score) {
  const user = getCurrentUser();
  if (!user) return; // guest — don't save

  if (!user.scores) user.scores = [];
  user.scores.push({ score, date: new Date().toISOString() });

  localStorage.setItem("currentUser", JSON.stringify(user));

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const index = users.findIndex(u => u.email === user.email);
  if (index !== -1) {
    users[index] = user;
    localStorage.setItem("users", JSON.stringify(users));
  }

  console.log("✅ Score saved:", score);
}

function getBestScore() {
  const user = getCurrentUser();
  if (!user || !user.scores || user.scores.length === 0) return 0;
  return Math.max(...user.scores.map(s => s.score));
}
*/


// ─── UPDATE NAV BAR (show/hide login|logout|profile) ─────────
// Call this on every page after the DOM loads.
// NOTE: also async now since it depends on getCurrentUser().

async function updateNav() {
  const user = await getCurrentUser();

  const navLogin    = document.getElementById("nav-login");
  const navRegister = document.getElementById("nav-register");
  const navProfile  = document.getElementById("nav-profile");
  const navLogout   = document.getElementById("nav-logout");
  const navUsername = document.getElementById("nav-username");

  if (user) {
    // User is logged in
    if (navLogin)    navLogin.style.display    = "none";
    if (navRegister) navRegister.style.display = "none";
    if (navProfile)  navProfile.style.display  = "inline-block";
    if (navLogout)   navLogout.style.display   = "inline-block";
    if (navUsername) navUsername.textContent   = "👤 " + user.username;
  } else {
    // Guest
    if (navLogin)    navLogin.style.display    = "inline-block";
    if (navRegister) navRegister.style.display = "inline-block";
    if (navProfile)  navProfile.style.display  = "none";
    if (navLogout)   navLogout.style.display   = "none";
    if (navUsername) navUsername.textContent   = "";
  }
}


// updateNav is async — fire-and-forget here is fine, we don't
// need to block DOMContentLoaded on it finishing.
document.addEventListener("DOMContentLoaded", updateNav);

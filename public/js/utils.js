//  Contains shared functions that ALL other JS files depend on
// ============================================================
 
 
// ─── GET CURRENT LOGGED-IN USER ─────────────────────────────
// Call this from any page to get the user object
// Returns: { username, email, hexId, scores[] }  or  null if guest
 
function getCurrentUser() {
  const raw = localStorage.getItem("currentUser");
  return raw ? JSON.parse(raw) : null;
}
 
 
// ─── PROTECT A PAGE (redirect guests to login) ──────────────
// Call requireLogin() at the top of game.js and profile.js
// If user is not logged in → sends them to login.html
 
function requireLogin() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  return user;
}
 
 
// ─── LOGOUT ─────────────────────────────────────────────────
// Called by the Logout button in the nav of every page
 
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}
 
 
// ─── SAVE SCORE (offline — replace with fetch() later) ──────
// Called by game.js when the game ends
 
function saveScore(score) {
  const user = getCurrentUser();
  if (!user) return; // guest — don't save
 
  // Add the new score to the user's score history
  if (!user.scores) user.scores = [];
  user.scores.push({ score, date: new Date().toISOString() });
 
  // Update currentUser in localStorage
  localStorage.setItem("currentUser", JSON.stringify(user));
 
  // Also update the user inside the "users" array
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const index = users.findIndex(u => u.email === user.email);
  if (index !== -1) {
    users[index] = user;
    localStorage.setItem("users", JSON.stringify(users));
  }
 
  console.log("✅ Score saved:", score);
}
 
 
// ─── GET BEST SCORE FOR CURRENT USER ────────────────────────
 
function getBestScore() {
  const user = getCurrentUser();
  if (!user || !user.scores || user.scores.length === 0) return 0;
  return Math.max(...user.scores.map(s => s.score));
}
 
 
// ─── UPDATE NAV BAR (show/hide login|logout|profile) ────────
// Call this on every page after the DOM loads
 
function updateNav() {
  const user = getCurrentUser();
 
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
 
 
document.addEventListener("DOMContentLoaded", updateNav);
 
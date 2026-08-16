// ============================================================
//  index.js  —  Click Rush
//  ✅ Only loaded in:  index.html
//  Depends on:         utils.js  (must be loaded FIRST)
//  Works alongside:    game.js   (loaded AFTER index.js)
//
//  Purpose:
//  This file controls the PAGE LAYOUT of index.html.
//  It decides what to show based on login state,
//  handles the dark/light mode toggle, welcome message,
//  and any non-game buttons on the home page.
//
//  game.js handles ONLY the click game logic (timer, clicks, score).
// ============================================================
 
 
document.addEventListener("DOMContentLoaded", function () {
 
 
  // ─── 1. CHECK LOGIN STATE & SHOW CORRECT UI ─────────────────
  // If logged in  → show welcome message + game
  // If guest      → show guest banner with login/register prompt
 
  const user = getCurrentUser(); // from utils.js
 
  const guestBanner  = document.getElementById("guest_banner");   // shown to guests
  const userBanner   = document.getElementById("user_banner");    // shown to logged-in users
  const welcomeName  = document.getElementById("welcome_name");   // "Welcome, Aryan!"
 
  if (user) {
    // User is logged in
    if (guestBanner) guestBanner.style.display = "none";
    if (userBanner)  userBanner.style.display  = "block";
    if (welcomeName) welcomeName.textContent   = "Welcome back, " + user.username + "! 👋";
  } else {
    // Guest
    if (guestBanner) guestBanner.style.display = "block";
    if (userBanner)  userBanner.style.display  = "none";
  }
 
 
  //BACKGROUND INVERSION (Dark / Light Mode Toggle)
  // "excluding the background inversion button in the navigation"
 
  const darkModeBtn = document.getElementById("dark_mode_btn"); // your inversion button
 
  // Remember user's preference across pages
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    if (darkModeBtn) darkModeBtn.textContent = "☀️ Light Mode";
  }
 
  if (darkModeBtn) {
    darkModeBtn.addEventListener("click", function () {
      document.body.classList.toggle("dark-mode");
 
      const isDark = document.body.classList.contains("dark-mode");
      darkModeBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
 
      // Save preference so it persists when user goes to other pages
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  }
 
 
  //GUEST BANNER BUTTONS ────────────────────────────────
  // The "Login" and "Register" buttons shown to guests
  // on the home page before they play
 
  const guestLoginBtn    = document.getElementById("guest_login_btn");
  const guestRegisterBtn = document.getElementById("guest_register_btn");
 
  if (guestLoginBtn) {
    guestLoginBtn.addEventListener("click", function () {
      window.location.href = "login.html";
    });
  }
 
  if (guestRegisterBtn) {
    guestRegisterBtn.addEventListener("click", function () {
      window.location.href = "register.html";
    });
  }
 
 
  //PLAY AS GUEST BUTTON ────────────────────────────────
  // If guest clicks "Play as Guest" → just start the game
  // game.js will handle the rest (guest scores won't be saved)
 
  const playGuestBtn = document.getElementById("play_as_guest_btn");
 
  if (playGuestBtn) {
    playGuestBtn.addEventListener("click", function () {
      // Hide the guest banner so the game area is visible
      if (guestBanner) guestBanner.style.display = "none";
 
      // Show the game section
      const gameSection = document.getElementById("game_section");
      if (gameSection) gameSection.style.display = "block";
    });
  }
 
 
  // ─── 5. APPLY SAVED THEME ON EVERY PAGE ─────────────────────
  // This applies dark mode on ALL pages, not just index.html
  // (utils.js loads this automatically via DOMContentLoaded)
  // But we also handle it here for the toggle button specifically
 
}); // end DOMContentLoaded
 









// ============================================================
//  index.js  —  Click Rush
//  Only loaded in:  index.html
//  Depends on:      utils.js  (must be loaded FIRST)
//
//  Purpose:
//  Controls what index.html shows based on login state:
//   - Guest  → Register / Log In buttons + "Skip For Now"
//   - Logged in → welcome message + "Play Now" button
// ============================================================

document.addEventListener("DOMContentLoaded", async function () {

  // ─── CHECK LOGIN STATE & SHOW CORRECT UI ────────────────────.

  const user = await getCurrentUser(); // from utils.js

  const loginRegister = document.getElementById("login_register");
  const welcomeMsg     = document.getElementById("welcome_message");
  const skipSection    = document.getElementById("skip");
  const playNowSection = document.getElementById("play_now");

  if (user) {
    // Logged in
    if (loginRegister) loginRegister.style.display = "none";
    if (skipSection)   skipSection.style.display   = "none";
    if (welcomeMsg) {
      welcomeMsg.textContent = "Welcome back, " + user.username + "! 👋";
      welcomeMsg.style.display = "block";
    }
    if (playNowSection) playNowSection.style.display = "block";

  } else {
    // Guest
    if (loginRegister) loginRegister.style.display = "block";
    if (skipSection)   skipSection.style.display   = "block";
    if (welcomeMsg) {
      welcomeMsg.textContent = "";
      welcomeMsg.style.display = "none";
    }
    if (playNowSection) playNowSection.style.display = "none";
  }

}); // end DOMContentLoaded

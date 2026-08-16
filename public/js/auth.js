// ============================================================
//  auth.js  —  Click Rush  |  Login & Registration
//  ✅ BACKEND MODE — connected to Railway server
//  Depends on:  utils.js  (must be loaded first — provides logout())
// ============================================================


// ─── HELPERS ────────────────────────────────────────────────

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = message;
}

function clearError(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


// ─── REGISTRATION ───────────────────────────────────────────

const register_form = document.getElementById("register_form");

if (register_form) {
  register_form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email    = document.getElementById("email").value.trim();
    const username = document.getElementById("uname").value.trim();
    const hexId    = document.getElementById("hexId").value.trim();

    clearError("register-error");

    if (!email || !username || !hexId) {
      showError("register-error", "All fields are required.");
      return;
    }

    if (!isValidEmail(email)) {
      showError("register-error", "Enter a valid email address.");
      return;
    }

    if (hexId.length < 4) {
      showError("register-error", "HexID must be at least 4 characters.");
      return;
    }

    // ✅ BACKEND MODE — sends to Railway server
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, username, hexId })
      });

      const data = await response.json();

      if (!response.ok) {
        showError("register-error", data.message || "Registration failed.");
        return;
      }

      // NOTE: session cookie is set by the server (credentials: "include").
      // No need to store the user in localStorage — getCurrentUser() in
      // utils.js now fetches /api/profile instead of reading localStorage.
      console.log("✅ Registered:", data.user);
      window.location.href = "/";

    } catch (err) {
      console.error("Registration error:", err);
      showError("register-error", "Could not connect to server. Try again.");
    }

  });
}


// ─── LOGIN ──────────────────────────────────────────────────

const login_form = document.getElementById("login_form");

if (login_form) {
  login_form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const hexId = document.getElementById("hexId").value.trim();

    clearError("login-error");

    if (!email || !hexId) {
      showError("login-error", "Email and HexID are required.");
      return;
    }

    if (!isValidEmail(email)) {
      showError("login-error", "Enter a valid email address.");
      return;
    }

    // ✅ BACKEND MODE — sends to Railway server
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, hexId })
      });

      const data = await response.json();

      if (!response.ok) {
        showError("login-error", data.message || "Login failed.");
        return;
      }

      // NOTE: session cookie is set by the server (credentials: "include").
      // No need to store the user in localStorage — see comment above.
      console.log("✅ Logged in:", data.user);
      window.location.href = "/";

    } catch (err) {
      console.error("Login error:", err);
      showError("login-error", "Could not connect to server. Try again.");
    }

  });
}


// ─── LOGOUT ─────────────────────────────────────────────────
// Removed — logout() is now defined ONCE, in utils.js, and utils.js
// is loaded on every page (including login/register). Having it
// defined here too silently overwrote whichever one loaded second,
// with no error. Don't redefine logout() here.

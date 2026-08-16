// ============================================================
//  auth.js  —  Click Rush  |  Login & Registration
//  Works offline (localStorage) now; swap fetch() calls later
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
 
    // Stop the page from reloading
    event.preventDefault();
 
    //Get values
    const email    = document.getElementById("email").value.trim();
    const username = document.getElementById("uname").value.trim();
    const hexId    = document.getElementById("hexId").value.trim();
 
    clearError("register-error");
 
    // Validate before sending
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
 
    // Send to backend
    // ── OFFLINE MODE (localStorage) ─────────────────────────
    // Comment this block out once your backend is ready
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const alreadyExists = existingUsers.find(u => u.email === email);
 
    if (alreadyExists) {
      showError("register-error", "An account with this email already exists.");
      return;
    }
 
    const newUser = { email, username, hexId, scores: [] };
    existingUsers.push(newUser);
    localStorage.setItem("users", JSON.stringify(existingUsers));
    localStorage.setItem("currentUser", JSON.stringify(newUser));
 
    console.log("✅ Registered:", newUser);
    window.location.href = "index.html";   // redirect to game after register
 
 
    // ── BACKEND MODE (uncomment when your server is ready) ──
    /*
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, hexId })
      });
 
      const data = await response.json();
 
      if (!response.ok) {
        // Server returned an error (e.g. email already taken)
        showError("register-error", data.message || "Registration failed.");
        return;
      }
 
      // Save user to localStorage so other pages know who's logged in
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      console.log("✅ Registered:", data.user);
      window.location.href = "index.html";
 
    } catch (err) {
      console.error("Registration error:", err);
      showError("register-error", "Could not connect to server. Try again.");
    }
    */
 
  });
}
 
 
// ─── LOGIN ──────────────────────────────────────────────────
 
const login_form = document.getElementById("login_form");
 
if (login_form) {
  login_form.addEventListener("submit", async function (event) {
 
    //Stop the page from reloading
    event.preventDefault();
 
    //Get.value
    const email = document.getElementById("email").value.trim();
    const hexId = document.getElementById("hexId").value.trim();
 
    clearError("login-error");
 
    //Validate
    if (!email || !hexId) {
      showError("login-error", "Email and HexID are required.");
      return;
    }
 
    if (!isValidEmail(email)) {
      showError("login-error", "Enter a valid email address.");
      return;
    }
 
    // Check against backend / localStorage
 
    // ── OFFLINE MODE (localStorage) ─────────────────────────
    // Comment this block out once your backend is ready
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const matchedUser = users.find(u => u.email === email && u.hexId === hexId);
 
    if (!matchedUser) {
      showError("login-error", "Invalid email or HexID.");
      return;
    }
 
    localStorage.setItem("currentUser", JSON.stringify(matchedUser));
    console.log("✅ Logged in:", matchedUser);
    window.location.href = "index.html";   // redirect to game after login
 
 
    // ── BACKEND MODE (uncomment when your server is ready) ──
    /*
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",   // sends cookies for session management
        body: JSON.stringify({ email, hexId })
      });
 
      const data = await response.json();
 
      if (!response.ok) {
        showError("login-error", data.message || "Login failed.");
        return;
      }
 
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      console.log("✅ Logged in:", data.user);
      window.location.href = "index.html";
 
    } catch (err) {
      console.error("Login error:", err);
      showError("login-error", "Could not connect to server. Try again.");
    }
    */
 
  });
}
 
 
// ─── LOGOUT ─────────────────────────────────────────────────
 
function logout() {
  localStorage.removeItem("currentUser");
 
  // ── BACKEND MODE: also clear the server session ──────────
  /*
  fetch("/api/logout", { method: "POST", credentials: "include" })
    .then(() => { window.location.href = "login.html"; })
    .catch(() => { window.location.href = "login.html"; });
  */
 
  window.location.href = "login.html";
}
 
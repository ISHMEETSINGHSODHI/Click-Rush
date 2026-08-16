// ============================================================
//  server.js — Click Rush
//  Hosted entirely on Railway
//
//  This ONE server does TWO things:
//  1. Serves your HTML/CSS/JS frontend as static files
//  2. Handles all /api/* backend routes
//
//  No Netlify needed — Railway hosts everything.
// ============================================================

const express = require("express");
const session = require("express-session");
const path    = require("path");
require("dotenv").config();

const app = express();

// ─── MIDDLEWARE ─────────────────────────────────────────────
app.use(express.json());

// ✅ Serve your frontend HTML/CSS/JS files from the "public" folder
// Put all your index.html, login.html, css/, js/ inside /public
app.use(express.static(path.join(__dirname, "public")));

// Session — keeps user logged in across pages
app.use(session({
  secret: process.env.SESSION_SECRET || "clickrush_dev_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", // true on Railway (HTTPS)
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000   // 7 days
  }
}));

// ─── API ROUTES ─────────────────────────────────────────────
app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/score"));
app.use("/api", require("./routes/leaderboard"));

// ─── SERVE FRONTEND PAGES ───────────────────────────────────
// Any route that isn't /api → serve the matching HTML file
// e.g. /login → public/login.html

app.get("/login",       (req, res) => res.sendFile(path.join(__dirname, "public/login.html")));
app.get("/register",    (req, res) => res.sendFile(path.join(__dirname, "public/register.html")));
app.get("/leaderboard", (req, res) => res.sendFile(path.join(__dirname, "public/leaderboard.html")));
app.get("/profile",     (req, res) => res.sendFile(path.join(__dirname, "public/profile.html")));
app.get("/",            (req, res) => res.sendFile(path.join(__dirname, "public/index.html")));

// ─── HEALTH CHECK ───────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "Click Rush is running ✅" });
});

// ─── START ──────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Click Rush running on port ${PORT}`);
  console.log(`   Frontend: http://localhost:${PORT}`);
  console.log(`   API:      http://localhost:${PORT}/api`);
});

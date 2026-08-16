// routes/auth.js — Register, Login, Logout, Profile
// Uses MySQL instead of MongoDB

const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const db      = require("../db/connection");

// ─── REGISTER ───────────────────────────────────────────────
// POST /api/register
router.post("/register", async (req, res) => {
  try {
    const { username, email, hexId } = req.body;

    if (!username || !email || !hexId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if email or username already exists
    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ? OR username = ?",
      [email, username]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Email or username already taken." });
    }

    // Hash the hexId (password) before saving
    const hashedHexId = await bcrypt.hash(hexId, 10);

    // Insert new user into MySQL
    const [result] = await db.execute(
      "INSERT INTO users (username, email, hex_id) VALUES (?, ?, ?)",
      [username, email, hashedHexId]
    );

    // Auto login after register — save user ID in session
    req.session.userId   = result.insertId;
    req.session.username = username;
    req.session.email    = email;

    res.status(201).json({
      message: "Registered successfully",
      user: { username, email }
    });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error." });
  }
});


// ─── LOGIN ──────────────────────────────────────────────────
// POST /api/login
router.post("/login", async (req, res) => {
  try {
    const { email, hexId } = req.body;

    if (!email || !hexId) {
      return res.status(400).json({ message: "Email and HexID required." });
    }

    // Find user by email
    const [rows] = await db.execute(
      "SELECT id, username, email, hex_id FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or HexID." });
    }

    const user = rows[0];

    // Check hashed hexId
    const valid = await bcrypt.compare(hexId, user.hex_id);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or HexID." });
    }

    // Save to session
    req.session.userId   = user.id;
    req.session.username = user.username;
    req.session.email    = user.email;

    res.json({
      message: "Logged in",
      user: { username: user.username, email: user.email }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error." });
  }
});


// ─── LOGOUT ─────────────────────────────────────────────────
// POST /api/logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});


// ─── PROFILE ────────────────────────────────────────────────
// GET /api/profile
router.get("/profile", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not logged in." });
  }

  try {
    // Get user info
    const [users] = await db.execute(
      "SELECT id, username, email, created_at FROM users WHERE id = ?",
      [req.session.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = users[0];

    // Get best score
    const [bestRows] = await db.execute(
      "SELECT MAX(score) as best FROM scores WHERE user_id = ?",
      [user.id]
    );

    // Get total games played
    const [countRows] = await db.execute(
      "SELECT COUNT(*) as total FROM scores WHERE user_id = ?",
      [user.id]
    );

    // Get last 20 games history
    const [history] = await db.execute(
      "SELECT score, played_at FROM scores WHERE user_id = ? ORDER BY played_at DESC LIMIT 20",
      [user.id]
    );

    res.json({
      username:   user.username,
      email:      user.email,
      joinedAt:   user.created_at,
      bestScore:  bestRows[0].best || 0,
      totalGames: countRows[0].total,
      history
    });

  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;

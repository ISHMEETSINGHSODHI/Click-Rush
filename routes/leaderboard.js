// routes/leaderboard.js — Leaderboard queries using MySQL

const express = require("express");
const router  = express.Router();
const db      = require("../db/connection");

// GET /api/leaderboard/:type
// type = "global" | "weekly" | "daily"
router.get("/leaderboard/:type", async (req, res) => {
  try {
    const { type } = req.params;
    let rows;

    if (type === "global") {
      // Best score ever per user, top 50
      [rows] = await db.execute(`
        SELECT u.username, MAX(s.score) AS score
        FROM scores s
        JOIN users u ON s.user_id = u.id
        GROUP BY s.user_id, u.username
        ORDER BY score DESC
        LIMIT 50
      `);

    } else if (type === "weekly") {
      // Best score in last 7 days per user
      [rows] = await db.execute(`
        SELECT u.username, MAX(s.score) AS score
        FROM scores s
        JOIN users u ON s.user_id = u.id
        WHERE s.played_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY s.user_id, u.username
        ORDER BY score DESC
        LIMIT 50
      `);

    } else if (type === "daily") {
      // Best score in last 24 hours per user
      [rows] = await db.execute(`
        SELECT u.username, MAX(s.score) AS score
        FROM scores s
        JOIN users u ON s.user_id = u.id
        WHERE s.played_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
        GROUP BY s.user_id, u.username
        ORDER BY score DESC
        LIMIT 50
      `);

    } else {
      return res.status(400).json({ message: "Invalid leaderboard type." });
    }

    // Add rank numbers
    const leaderboard = rows.map((row, i) => ({
      rank:     i + 1,
      username: row.username,
      score:    row.score
    }));

    res.json(leaderboard);

  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;

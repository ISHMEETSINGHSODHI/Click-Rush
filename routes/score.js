// routes/score.js — Save score + return ranks from MySQL

const express = require("express");
const router  = express.Router();
const db      = require("../db/connection");

// POST /api/score
router.post("/score", async (req, res) => {

  if (!req.session.userId) {
    return res.status(401).json({ message: "Not logged in." });
  }

  try {
    const { score } = req.body;

    if (typeof score !== "number" || score < 0) {
      return res.status(400).json({ message: "Invalid score." });
    }

    // Insert score into MySQL scores table
    await db.execute(
      "INSERT INTO scores (user_id, score) VALUES (?, ?)",
      [req.session.userId, score]
    );

    // ── GLOBAL RANK ─────────────────────────────────────────
    // Count how many users have a higher best score than this user
    const [globalRows] = await db.execute(`
      SELECT COUNT(*) + 1 AS rank
      FROM (
        SELECT user_id, MAX(score) AS best
        FROM scores
        GROUP BY user_id
      ) AS bests
      WHERE best > (
        SELECT MAX(score) FROM scores WHERE user_id = ?
      )
    `, [req.session.userId]);

    const globalRank = globalRows[0].rank;

    // ── WEEKLY RANK ──────────────────────────────────────────
    const [weeklyRows] = await db.execute(`
      SELECT COUNT(*) + 1 AS rank
      FROM (
        SELECT user_id, MAX(score) AS best
        FROM scores
        WHERE played_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY user_id
      ) AS bests
      WHERE best > (
        SELECT MAX(score) FROM scores
        WHERE user_id = ?
        AND played_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      )
    `, [req.session.userId]);

    const weeklyRank = weeklyRows[0].rank || "-";

    // ── DAILY RANK ───────────────────────────────────────────
    const [dailyRows] = await db.execute(`
      SELECT COUNT(*) + 1 AS rank
      FROM (
        SELECT user_id, MAX(score) AS best
        FROM scores
        WHERE played_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
        GROUP BY user_id
      ) AS bests
      WHERE best > (
        SELECT MAX(score) FROM scores
        WHERE user_id = ?
        AND played_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
      )
    `, [req.session.userId]);

    const dailyRank = dailyRows[0].rank || "-";

    res.json({ message: "Score saved", score, globalRank, weeklyRank, dailyRank });

  } catch (err) {
    console.error("Score error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;

-- ============================================================
--  schema.sql — Click Rush MySQL Database
--  Run this on Railway MySQL to create all tables
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  email      VARCHAR(100) NOT NULL UNIQUE,
  hex_id     VARCHAR(255) NOT NULL,          -- hashed password
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scores table (one row per game played)
CREATE TABLE IF NOT EXISTS scores (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  score      INT NOT NULL,
  played_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for fast leaderboard queries
CREATE INDEX idx_scores_user    ON scores(user_id);
CREATE INDEX idx_scores_played  ON scores(played_at);
CREATE INDEX idx_scores_score   ON scores(score DESC);

// db/connection.js — MySQL Connection Pool
// Uses Railway's MySQL environment variables automatically

const mysql = require("mysql2/promise");

// Railway injects these environment variables automatically
// when you add a MySQL plugin to your project
const pool = mysql.createPool({
  host:     process.env.MYSQLHOST,
  port:     process.env.MYSQLPORT,
  user:     process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,       // max 10 simultaneous DB connections
  queueLimit: 0
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log("✅ MySQL connected");
    conn.release();
  })
  .catch(err => {
    console.error("❌ MySQL connection failed:", err.message);
  });

module.exports = pool;

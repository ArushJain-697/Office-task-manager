const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: Number(process.env.MYSQLPORT || 3306),
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin','user') NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      status ENUM('pending','completed') NOT NULL DEFAULT 'pending',
      assigned_to INT NULL,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_tasks_assigned_to (assigned_to),
      INDEX idx_tasks_created_by (created_by),
      INDEX idx_tasks_status (status),
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  const adminUsername = (process.env.ADMIN_USERNAME || "").trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  if (adminUsername && adminPassword) {
    const [existing] = await pool.query("SELECT id FROM users WHERE username = ? LIMIT 1", [
      adminUsername,
    ]);
    if (existing.length === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await pool.query(
        "INSERT INTO users (username, password, role) VALUES (?, ?, 'admin')",
        [adminUsername, passwordHash]
      );
    }
  }
}

module.exports = { pool, initDatabase };
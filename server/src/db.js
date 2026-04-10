const mysql = require("mysql2/promise");

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
  async function ensureColumnExists(tableName, columnName, columnDef) {
    const [rows] = await pool.query(
      `SELECT 1
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = ?
         AND COLUMN_NAME = ?
       LIMIT 1`,
      [tableName, columnName]
    );

    if (rows.length === 0) {
      await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`);
    }
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(255),
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'sicario',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ensure role column can store the new role names.
  await pool.query(`
    ALTER TABLE users
    MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'sicario'
  `);

  // Role migration to the new vocabulary used by the app.
  await pool.query(`
    UPDATE users
    SET role = CASE
      WHEN role = 'mercenary' THEN 'fixer'
      WHEN role = 'mastermind' THEN 'sicario'
      ELSE role
    END
    WHERE role IN ('mercenary', 'mastermind')
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS newspaper_posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      author_id INT NOT NULL,
      content TEXT NOT NULL,
      image_url VARCHAR(500),
      image_public_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS post_votes (
      post_id INT NOT NULL,
      user_id INT NOT NULL,
      vote TINYINT NOT NULL,
      PRIMARY KEY (post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES newspaper_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS heists (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fixer_id INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      required_skills JSON NOT NULL,
      heading VARCHAR(200),
      subheading VARCHAR(200),
      quote TEXT,
      timeline VARCHAR(500),
      crew_details JSON,
      photos JSON,
      short_description TEXT,
      status VARCHAR(50) DEFAULT 'open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (fixer_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await ensureColumnExists("heists", "heading", "VARCHAR(200)");
  await ensureColumnExists("heists", "subheading", "VARCHAR(200)");
  await ensureColumnExists("heists", "quote", "TEXT");
  await ensureColumnExists("heists", "timeline", "VARCHAR(500)");
  await ensureColumnExists("heists", "crew_details", "JSON");
  await ensureColumnExists("heists", "photos", "JSON");
  await ensureColumnExists("heists", "short_description", "TEXT");

  await pool.query(`
    ALTER TABLE heists
    MODIFY COLUMN payout INT NOT NULL DEFAULT 0
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sicario_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      bio TEXT,
      skills JSON,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      heist_id INT NOT NULL,
      sicario_id INT NOT NULL,
      fit_score INT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_application (heist_id, sicario_id),
      FOREIGN KEY (heist_id) REFERENCES heists(id) ON DELETE CASCADE,
      FOREIGN KEY (sicario_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
}

module.exports = {
  pool,
  initDatabase,
};
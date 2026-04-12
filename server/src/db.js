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
      await pool.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${columnDef}`);
    }
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(255),
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'sicario',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'sicario'
  `);

  await pool.query(`
    UPDATE users SET role = CASE
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
      title VARCHAR(300),
      content TEXT NOT NULL,
      image_url VARCHAR(500),
      image_public_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await ensureColumnExists("newspaper_posts", "title", "VARCHAR(300)");

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

  // =============================================
  // HEISTS — New Schema (Dossier Format)
  // =============================================
  await pool.query(`
    CREATE TABLE IF NOT EXISTS heists (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fixer_id INT NOT NULL,

      -- Section A: Mission Overview
      operation_name VARCHAR(200) NOT NULL,
      place VARCHAR(200) NOT NULL,
      target VARCHAR(200) NOT NULL,
      introduction TEXT NOT NULL,
      quote TEXT,

      -- Section B: Reconnaissance
      phase1_name VARCHAR(200) NOT NULL,
      phase1_description TEXT NOT NULL,
      phase1_photo_url VARCHAR(500),
      phase1_photo_public_id VARCHAR(255),
      intel JSON NOT NULL,

      -- Section C: Execution
      execution_description TEXT NOT NULL,
      execution_photo_url VARCHAR(500),
      execution_photo_public_id VARCHAR(255),
      timeline JSON NOT NULL,

      -- Section D: Extraction
      extraction_plan TEXT NOT NULL,
      extraction_photo_url VARCHAR(500),
      extraction_photo_public_id VARCHAR(255),

      -- Section E: Crew Manifest
      crew_members JSON NOT NULL,

      status VARCHAR(50) DEFAULT 'open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (fixer_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Migrate old heists table if columns are missing (safe for existing deployments)
  await ensureColumnExists("heists", "operation_name", "VARCHAR(200) NOT NULL DEFAULT ''");
  await ensureColumnExists("heists", "place", "VARCHAR(200) NOT NULL DEFAULT ''");
  await ensureColumnExists("heists", "target", "VARCHAR(200) NOT NULL DEFAULT ''");
  await ensureColumnExists("heists", "introduction", "TEXT");
  await ensureColumnExists("heists", "quote", "TEXT");
  await ensureColumnExists("heists", "phase1_name", "VARCHAR(200)");
  await ensureColumnExists("heists", "phase1_description", "TEXT");
  await ensureColumnExists("heists", "phase1_photo_url", "VARCHAR(500)");
  await ensureColumnExists("heists", "phase1_photo_public_id", "VARCHAR(255)");
  await ensureColumnExists("heists", "intel", "JSON");
  await ensureColumnExists("heists", "execution_description", "TEXT");
  await ensureColumnExists("heists", "execution_photo_url", "VARCHAR(500)");
  await ensureColumnExists("heists", "execution_photo_public_id", "VARCHAR(255)");
  await ensureColumnExists("heists", "timeline", "JSON");
  await ensureColumnExists("heists", "extraction_plan", "TEXT");
  await ensureColumnExists("heists", "extraction_photo_url", "VARCHAR(500)");
  await ensureColumnExists("heists", "extraction_photo_public_id", "VARCHAR(255)");
  await ensureColumnExists("heists", "crew_members", "JSON");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sicario_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      name VARCHAR(200),
      title VARCHAR(200),
      height VARCHAR(50),
      weight VARCHAR(50),
      languages JSON,
      blood_group VARCHAR(10),
      clearance_level VARCHAR(100),
      about TEXT,
      skills JSON,
      photo_url VARCHAR(500),
      photo_public_id VARCHAR(255),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await ensureColumnExists("sicario_profiles", "name", "VARCHAR(200)");
  await ensureColumnExists("sicario_profiles", "title", "VARCHAR(200)");
  await ensureColumnExists("sicario_profiles", "height", "VARCHAR(50)");
  await ensureColumnExists("sicario_profiles", "weight", "VARCHAR(50)");
  await ensureColumnExists("sicario_profiles", "languages", "JSON");
  await ensureColumnExists("sicario_profiles", "blood_group", "VARCHAR(10)");
  await ensureColumnExists("sicario_profiles", "clearance_level", "VARCHAR(100)");
  await ensureColumnExists("sicario_profiles", "about", "TEXT");
  await ensureColumnExists("sicario_profiles", "photo_url", "VARCHAR(500)");
  await ensureColumnExists("sicario_profiles", "photo_public_id", "VARCHAR(255)");

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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS connections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      requester_id INT NOT NULL,
      receiver_id INT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_connection (requester_id, receiver_id),
      FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
}

module.exports = { pool, initDatabase };
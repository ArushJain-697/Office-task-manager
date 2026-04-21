const { pool } = require("../db");

exports.listUsers = async (_req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, username, role, created_at FROM users ORDER BY created_at DESC, id DESC"
    );
    return res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
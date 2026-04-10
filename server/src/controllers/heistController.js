const { pool } = require("../db");

exports.postHeist = async (req, res) => {
  try {
    const fixerId = req.user.sub;
    const { title, description, required_skills } = req.body;

    const [result] = await pool.query(
      "INSERT INTO heists (fixer_id, title, description, required_skills, status) VALUES (?, ?, ?, ?, ?)",
      [fixerId, title, description, JSON.stringify(required_skills), "open"]
    );

    return res.status(201).json({
      message: "Heist posted. Sicarios incoming.",
      heistId: result.insertId,
    });
  } catch (error) {
    console.error("Error posting heist:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMyHeists = async (req, res) => {
  try {
    const fixerId = req.user.sub;

    const [heists] = await pool.query(
      "SELECT id, title, description, required_skills, status, created_at FROM heists WHERE fixer_id = ? ORDER BY created_at DESC",
      [fixerId]
    );

    const parsed = heists.map((h) => ({
      ...h,
      required_skills: JSON.parse(h.required_skills),
    }));

    return res.json({ heists: parsed });
  } catch (error) {
    console.error("Error fetching heists:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getApplicants = async (req, res) => {
  try {
    const fixerId = req.user.sub;
    const heistId = parseInt(req.params.id);

    if (isNaN(heistId)) {
      return res.status(400).json({ message: "Invalid heist ID." });
    }

    // Make sure this heist belongs to this fixer
    const [heistRows] = await pool.query(
      "SELECT id FROM heists WHERE id = ? AND fixer_id = ? LIMIT 1",
      [heistId, fixerId]
    );
    if (heistRows.length === 0) {
      return res.status(404).json({ message: "Heist not found or not yours." });
    }

    const [applicants] = await pool.query(`
      SELECT 
        a.id AS application_id,
        a.fit_score,
        a.status,
        a.created_at,
        u.username,
        sp.bio,
        sp.skills
      FROM applications a
      JOIN users u ON a.sicario_id = u.id
      LEFT JOIN sicario_profiles sp ON sp.user_id = u.id
      WHERE a.heist_id = ?
      ORDER BY a.fit_score DESC
    `, [heistId]);

    const parsed = applicants.map((a) => ({
      ...a,
      skills: a.skills ? JSON.parse(a.skills) : [],
    }));

    return res.json({ applicants: parsed });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
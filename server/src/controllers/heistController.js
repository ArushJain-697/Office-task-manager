const { pool } = require("../db");

exports.postHeist = async (req, res) => {
  try {
    const fixerId = req.user.sub;
    const {
      heading,
      subheading,
      quote = "",
      timeline,
      crew_moneyshare,
      crew_threat_level,
      photos,
      short_description,
      payout = 0,
      required_skills,
    } = req.body;

    const title = heading;
    const descriptionParts = [
      `Subheading: ${subheading}`,
      quote ? `Quote: ${quote}` : null,
      `Timeline: ${timeline}`,
      `Crew: Moneyshare ${crew_moneyshare}, Threat Level ${crew_threat_level}`,
      `Short Description: ${short_description}`,
    ].filter(Boolean);
    const description = descriptionParts.join("\n");
    const crewDetails = {
      moneyshare: crew_moneyshare,
      threat_level: crew_threat_level,
    };

    const [result] = await pool.query(
      `INSERT INTO heists 
      (fixer_id, title, description, payout, required_skills, heading, subheading, quote, timeline, crew_details, photos, short_description, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fixerId,
        title,
        description,
        payout,
        JSON.stringify(required_skills),
        heading,
        subheading,
        quote || null,
        timeline,
        JSON.stringify(crewDetails),
        JSON.stringify(photos),
        short_description,
        "open",
      ]
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
      `SELECT 
        id, title, description, payout, required_skills, heading, subheading, quote, timeline, crew_details, photos, short_description, status, created_at 
      FROM heists 
      WHERE fixer_id = ? 
      ORDER BY created_at DESC`,
      [fixerId]
    );

    const parseMaybeJson = (value, fallback) => {
      if (value == null) return fallback;
      if (typeof value === "object") return value;
      if (typeof value !== "string") return fallback;
      try {
        return JSON.parse(value);
      } catch {
        return fallback;
      }
    };

    const parsed = heists.map((h) => ({
      ...h,
      required_skills: parseMaybeJson(h.required_skills, []),
      crew_details: parseMaybeJson(h.crew_details, null),
      photos: parseMaybeJson(h.photos, []),
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
const { pool } = require("../db");
const { uploadToCloudinary } = require("../utils/cloudinary");

exports.postHeist = async (req, res) => {
  try {
    const fixerId = req.user.sub;
    const {
      heading,
      subheading,
      quote = "",
      timeline,
      crew_threat_level,
      short_description,
      payout = 0,
      required_skills,
    } = req.body;

    let photos = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map((file) =>
          uploadToCloudinary(file.buffer, "heists")
        );
        const results = await Promise.all(uploadPromises);
        photos = results.map((r) => ({
          url: r.secure_url,
          public_id: r.public_id,
        }));
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        return res.status(502).json({ message: "Photo upload failed. Try again." });
      }
    }

    const crewDetails = { threat_level: crew_threat_level };

    const [result] = await pool.query(
      `INSERT INTO heists 
        (fixer_id, title, description, payout, required_skills, heading, subheading, quote, timeline, crew_details, photos, short_description, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fixerId,
        heading,
        short_description, // description column mein short_description daalo — clean
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
      photos,
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
        id, heading, subheading, quote, timeline, 
        payout, required_skills, crew_details, 
        photos, short_description, status, created_at 
       FROM heists 
       WHERE fixer_id = ? 
       ORDER BY created_at DESC`,
      [fixerId]
    );

    const parseMaybeJson = (value, fallback) => {
      if (value == null) return fallback;
      if (typeof value === "object") return value;
      try { return JSON.parse(value); } catch { return fallback; }
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
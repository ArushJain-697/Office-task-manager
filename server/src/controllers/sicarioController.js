const { pool } = require("../db");
const { uploadToCloudinary } = require("../utils/cloudinary");
const { sanitizeObject } = require("../utils/sanitize");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.sub;

    const [rows] = await pool.query(
      `SELECT 
        sp.name, sp.title, sp.height, sp.weight, sp.languages,
        sp.blood_group, sp.clearance_level, sp.about, sp.skills,
        sp.photo_url, u.username, u.created_at
       FROM users u
       LEFT JOIN sicario_profiles sp ON sp.user_id = u.id
       WHERE u.id = ? LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const profile = rows[0];
    const parseMaybeJson = (val, fallback) => {
      if (val == null) return fallback;
      if (typeof val === "object") return val;
      try { return JSON.parse(val); } catch { return fallback; }
    };

    return res.json({
      profile: {
        ...profile,
        skills: parseMaybeJson(profile.skills, []),
        languages: parseMaybeJson(profile.languages, []),
      }
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.sub;
    const clean = sanitizeObject(req.body);
    const {
      name, title, height, weight,
      languages, blood_group, clearance_level, about, skills,
    } = clean;

    let photo_url = null;
    let photo_public_id = null;

    if (req.file) {
      try {
        const cloudRes = await uploadToCloudinary(req.file.buffer, "profiles");
        photo_url = cloudRes.secure_url;
        photo_public_id = cloudRes.public_id;
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        return res.status(502).json({ message: "Photo upload failed. Try again." });
      }
    }

    const [existing] = await pool.query(
      "SELECT id FROM sicario_profiles WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (existing.length > 0) {
      const updatePhoto = photo_url ? ", photo_url = ?, photo_public_id = ?" : "";
      const params = [
        name ?? null, title ?? null, height ?? null, weight ?? null,
        JSON.stringify(languages ?? []),
        blood_group ?? null, clearance_level ?? null, about ?? null,
        JSON.stringify(skills ?? []),
        ...(photo_url ? [photo_url, photo_public_id] : []),
        userId,
      ];

      await pool.query(
        `UPDATE sicario_profiles SET
          name = ?, title = ?, height = ?, weight = ?,
          languages = ?, blood_group = ?, clearance_level = ?,
          about = ?, skills = ?
          ${updatePhoto}
         WHERE user_id = ?`,
        params
      );
    } else {
      await pool.query(
        `INSERT INTO sicario_profiles 
          (user_id, name, title, height, weight, languages, blood_group, clearance_level, about, skills, photo_url, photo_public_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          name ?? null, title ?? null, height ?? null, weight ?? null,
          JSON.stringify(languages ?? []),
          blood_group ?? null, clearance_level ?? null, about ?? null,
          JSON.stringify(skills ?? []),
          photo_url, photo_public_id,
        ]
      );
    }

    return res.json({ message: "Profile updated successfully." });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getHeists = async (req, res) => {
  try {
    const userId = req.user.sub;

    const [profileRows] = await pool.query(
      "SELECT skills FROM sicario_profiles WHERE user_id = ? LIMIT 1",
      [userId]
    );

    const parseMaybeJson = (value, fallback) => {
      if (value == null) return fallback;
      if (typeof value === "object") return value;
      try { return JSON.parse(value); } catch { return fallback; }
    };

    const rawSkills = profileRows.length > 0 ? parseMaybeJson(profileRows[0].skills, []) : [];
    const sicarioSkills = rawSkills.map((s) => s.toLowerCase());

    const [heists] = await pool.query(
      `SELECT 
        id, heading, subheading, quote, timeline,
        payout, required_skills, crew_details,
        photos, short_description, status, created_at
       FROM heists
       WHERE status = 'open'`
    );

    const scored = heists
      .map((h) => {
        const requiredSkills = parseMaybeJson(h.required_skills, []);
        const requiredRoles = requiredSkills.map((s) => s.role?.toLowerCase()).filter(Boolean);

        let fitScore = 0;
        if (requiredRoles.length > 0) {
          const matched = requiredRoles.filter((role) => sicarioSkills.includes(role)).length;
          fitScore = Math.round((matched / requiredRoles.length) * 100);
        }

        return {
          ...h,
          required_skills: requiredSkills,
          crew_details: parseMaybeJson(h.crew_details, null),
          photos: parseMaybeJson(h.photos, []),
          _fitScore: fitScore,
        };
      })
      .sort((a, b) => b._fitScore - a._fitScore)
      .map(({ _fitScore, ...heist }) => heist);

    return res.json({ heists: scored });
  } catch (error) {
    console.error("Error fetching heists:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.applyToHeist = async (req, res) => {
  try {
    const sicarioId = req.user.sub;
    const heistId = parseInt(req.params.heistId);

    if (isNaN(heistId)) {
      return res.status(400).json({ message: "Invalid heist ID." });
    }

    const [heistRows] = await pool.query(
      "SELECT id, required_skills FROM heists WHERE id = ? AND status = 'open' LIMIT 1",
      [heistId]
    );
    if (heistRows.length === 0) {
      return res.status(404).json({ message: "Heist not found or no longer open." });
    }

    const [existing] = await pool.query(
      "SELECT id FROM applications WHERE heist_id = ? AND sicario_id = ? LIMIT 1",
      [heistId, sicarioId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Already applied to this heist." });
    }

    const parseMaybeJson = (value, fallback) => {
      if (value == null) return fallback;
      if (typeof value === "object") return value;
      try { return JSON.parse(value); } catch { return fallback; }
    };

    const [profileRows] = await pool.query(
      "SELECT skills FROM sicario_profiles WHERE user_id = ? LIMIT 1",
      [sicarioId]
    );
    const rawSkills = profileRows.length > 0 ? parseMaybeJson(profileRows[0].skills, []) : [];
    const sicarioSkills = rawSkills.map((s) => s.toLowerCase());

    const requiredSkills = parseMaybeJson(heistRows[0].required_skills, []);
    const requiredRoles = requiredSkills.map((s) => s.role?.toLowerCase()).filter(Boolean);

    let fitScore = 0;
    if (requiredRoles.length > 0) {
      const matched = requiredRoles.filter((role) => sicarioSkills.includes(role)).length;
      fitScore = Math.round((matched / requiredRoles.length) * 100);
    }

    const [result] = await pool.query(
      "INSERT INTO applications (heist_id, sicario_id, fit_score, status) VALUES (?, ?, ?, ?)",
      [heistId, sicarioId, fitScore, "pending"]
    );

    return res.status(201).json({
      message: "Application submitted.",
      applicationId: result.insertId,
    });
  } catch (error) {
    console.error("Error applying to heist:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const sicarioId = req.user.sub;

    const [applications] = await pool.query(
      `SELECT
        a.id AS application_id,
        a.status,
        a.created_at,
        h.id AS heist_id,
        h.heading,
        h.subheading,
        h.payout,
        h.timeline,
        h.status AS heist_status
       FROM applications a
       JOIN heists h ON a.heist_id = h.id
       WHERE a.sicario_id = ?
       ORDER BY a.created_at DESC`,
      [sicarioId]
    );

    return res.json({ applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
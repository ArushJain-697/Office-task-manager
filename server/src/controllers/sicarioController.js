const { pool } = require("../db");
const { uploadToCloudinary } = require("../utils/cloudinary");
const { sanitizeObject } = require("../utils/sanitize");

const parseMaybeJson = (value, fallback) => {
  if (value == null) return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(value); } catch { return fallback; }
};

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

    const [[{ count: connection_count }]] = await pool.query(
      `SELECT COUNT(*) as count FROM connections
       WHERE (requester_id = ? OR receiver_id = ?) AND status = 'accepted'`,
      [userId, userId]
    );

    const profile = rows[0];

    return res.json({
      profile: {
        ...profile,
        skills: parseMaybeJson(profile.skills, []),
        languages: parseMaybeJson(profile.languages, []),
        connection_count,
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

    const rawSkills = profileRows.length > 0 ? parseMaybeJson(profileRows[0].skills, []) : [];
    const sicarioSkills = rawSkills.map((s) => s.toLowerCase());

    const [heists] = await pool.query(
      `SELECT 
        id, status, created_at,
        operation_name, place, target, introduction, quote,
        phase1_name, phase1_description, phase1_photo_url,
        intel,
        execution_description, execution_photo_url,
        timeline,
        extraction_plan, extraction_photo_url,
        crew_members
       FROM heists
       WHERE status = 'open'`
    );

    const scored = heists
      .map((h) => {
        const intel = parseMaybeJson(h.intel, {});
        const crew_members = parseMaybeJson(h.crew_members, []);
        const timeline = parseMaybeJson(h.timeline, []);

        const requiredJobs = crew_members
          .map((m) => m.requirements?.toLowerCase())
          .filter(Boolean);

        let fit_score = 0;
        if (requiredJobs.length > 0) {
          const matched = requiredJobs.filter((job) => sicarioSkills.includes(job)).length;
          fit_score = Math.round((matched / requiredJobs.length) * 100);
        }

        return {
          id: h.id,
          status: h.status,
          created_at: h.created_at,
          fit_score,
          section_a: {
            operation_name: h.operation_name,
            place: h.place,
            target: h.target,
            introduction: h.introduction,
            quote: h.quote,
          },
          section_b: {
            phase1_name: h.phase1_name,
            phase1_description: h.phase1_description,
            phase1_photo_url: h.phase1_photo_url,
            intel: {
              end_points_mapped: intel.end_points_mapped,
              guard_rotations: intel.guard_rotations,
              surveillance_hours: intel.surveillance_hours,
              vulnerabilities_found: intel.vulnerabilities_found,
            },
          },
          section_c: {
            execution_description: h.execution_description,
            execution_photo_url: h.execution_photo_url,
            timeline,
          },
          section_d: {
            extraction_plan: h.extraction_plan,
            extraction_photo_url: h.extraction_photo_url,
          },
          section_e: {
            crew_members,
          },
        };
      })
      .sort((a, b) => b.fit_score - a.fit_score);

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
      "SELECT id, crew_members FROM heists WHERE id = ? AND status = 'open' LIMIT 1",
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

    const [profileRows] = await pool.query(
      "SELECT skills FROM sicario_profiles WHERE user_id = ? LIMIT 1",
      [sicarioId]
    );
    const rawSkills = profileRows.length > 0 ? parseMaybeJson(profileRows[0].skills, []) : [];
    const sicarioSkills = rawSkills.map((s) => s.toLowerCase());

    const crewMembers = parseMaybeJson(heistRows[0].crew_members, []);
    const requiredJobs = crewMembers
      .map((m) => m.requirements?.toLowerCase())
      .filter(Boolean);

    let fitScore = 0;
    if (requiredJobs.length > 0) {
      const matched = requiredJobs.filter((job) => sicarioSkills.includes(job)).length;
      fitScore = Math.round((matched / requiredJobs.length) * 100);
    }

    const [result] = await pool.query(
      "INSERT INTO applications (heist_id, sicario_id, fit_score, status) VALUES (?, ?, ?, 'pending')",
      [heistId, sicarioId, fitScore]
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
        h.operation_name,
        h.place,
        h.target,
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
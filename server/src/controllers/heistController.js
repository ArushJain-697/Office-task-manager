const { pool } = require("../db");
const { uploadToCloudinary } = require("../utils/cloudinary");
const { sanitizeObject } = require("../utils/sanitize");

const parseMaybeJson = (value, fallback) => {
  if (value == null) return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(value); } catch { return fallback; }
};

// Helper to upload a single named file from req.files
async function uploadNamedPhoto(files, fieldName, folder) {
  const fileArr = files?.[fieldName];
  if (!fileArr || fileArr.length === 0) return { url: null, public_id: null };
  const cloudRes = await uploadToCloudinary(fileArr[0].buffer, folder);
  return { url: cloudRes.secure_url, public_id: cloudRes.public_id };
}

exports.postHeist = async (req, res) => {
  try {
    const fixerId = req.user.sub;
    const clean = sanitizeObject(req.body);

    const {
      // Section A
      operation_name,
      place,
      target,
      introduction,
      quote,
      // Section B
      phase1_name,
      phase1_description,
      // Section B intel
      intel_end_points_mapped,
      intel_guard_rotations,
      intel_surveillance_hours,
      intel_vulnerabilities_found,
      // Section C
      execution_description,
      timeline,
      // Section D
      extraction_plan,
      // Section E
      crew_members,
    } = clean;

    // Upload 3 named photos
    let phase1_photo_url = null, phase1_photo_public_id = null;
    let execution_photo_url = null, execution_photo_public_id = null;
    let extraction_photo_url = null, extraction_photo_public_id = null;

    try {
      const p1 = await uploadNamedPhoto(req.files, "phase1_photo", "heists");
      phase1_photo_url = p1.url;
      phase1_photo_public_id = p1.public_id;

      const ex = await uploadNamedPhoto(req.files, "execution_photo", "heists");
      execution_photo_url = ex.url;
      execution_photo_public_id = ex.public_id;

      const ext = await uploadNamedPhoto(req.files, "extraction_photo", "heists");
      extraction_photo_url = ext.url;
      extraction_photo_public_id = ext.public_id;
    } catch (uploadError) {
      console.error("Cloudinary upload failed:", uploadError);
      return res.status(502).json({ message: "Photo upload failed. Try again." });
    }

    const intel = {
      end_points_mapped: intel_end_points_mapped,
      guard_rotations: intel_guard_rotations,
      surveillance_hours: intel_surveillance_hours,
      vulnerabilities_found: intel_vulnerabilities_found,
    };

    const [result] = await pool.query(
      `INSERT INTO heists 
        (fixer_id,
         operation_name, place, target, introduction, quote,
         phase1_name, phase1_description, phase1_photo_url, phase1_photo_public_id,
         intel,
         execution_description, execution_photo_url, execution_photo_public_id,
         timeline,
         extraction_plan, extraction_photo_url, extraction_photo_public_id,
         crew_members,
         status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
      [
        fixerId,
        operation_name, place, target, introduction, quote || null,
        phase1_name, phase1_description, phase1_photo_url, phase1_photo_public_id,
        JSON.stringify(intel),
        execution_description, execution_photo_url, execution_photo_public_id,
        JSON.stringify(timeline),
        extraction_plan, extraction_photo_url, extraction_photo_public_id,
        JSON.stringify(crew_members),
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
        id, status, created_at,
        operation_name, place, target, introduction, quote,
        phase1_name, phase1_description, phase1_photo_url,
        intel,
        execution_description, execution_photo_url,
        timeline,
        extraction_plan, extraction_photo_url,
        crew_members
       FROM heists 
       WHERE fixer_id = ? 
       ORDER BY created_at DESC`,
      [fixerId]
    );

    const formatted = heists.map((h) => {
      const intel = parseMaybeJson(h.intel, {});
      const crew_members = parseMaybeJson(h.crew_members, []);
      const timeline = parseMaybeJson(h.timeline, []);

      return {
        id: h.id,
        status: h.status,
        created_at: h.created_at,
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
    });

    return res.json({ heists: formatted });
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
        u.id AS sicario_id,
        u.username,
        sp.name,
        sp.title,
        sp.about AS bio,
        sp.skills,
        sp.clearance_level,
        sp.photo_url
      FROM applications a
      JOIN users u ON a.sicario_id = u.id
      LEFT JOIN sicario_profiles sp ON sp.user_id = u.id
      WHERE a.heist_id = ?
      ORDER BY a.fit_score DESC
    `, [heistId]);

    const parsed = applicants.map((a) => ({
      ...a,
      skills: parseMaybeJson(a.skills, []),
    }));

    return res.json({ applicants: parsed });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const fixerId = req.user.sub;
    const applicationId = parseInt(req.params.applicationId);
    const { status } = req.body;

    if (isNaN(applicationId)) {
      return res.status(400).json({ message: "Invalid application ID." });
    }

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'accepted' or 'rejected'." });
    }

    const [rows] = await pool.query(
      `SELECT a.id FROM applications a
       JOIN heists h ON a.heist_id = h.id
       WHERE a.id = ? AND h.fixer_id = ? LIMIT 1`,
      [applicationId, fixerId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Application not found or not yours." });
    }

    await pool.query(
      "UPDATE applications SET status = ? WHERE id = ?",
      [status, applicationId]
    );

    return res.json({ message: `Application ${status}.` });
  } catch (error) {
    console.error("Error updating application status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
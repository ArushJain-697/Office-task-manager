const { pool } = require("../db");

const parseMaybeJson = (value, fallback) => {
  if (value == null) return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(value); } catch { return fallback; }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const viewerId = req.user.sub;
    const { username } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        u.id, u.username, u.role, u.created_at,
        sp.name, sp.title, sp.height, sp.weight,
        sp.languages, sp.blood_group, sp.clearance_level,
        sp.about, sp.skills, sp.photo_url
       FROM users u
       LEFT JOIN sicario_profiles sp ON sp.user_id = u.id
       WHERE u.username = ? LIMIT 1`,
      [username]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = rows[0];

    const [[{ count: connection_count }]] = await pool.query(
      `SELECT COUNT(*) as count FROM connections
       WHERE (requester_id = ? OR receiver_id = ?) AND status = 'accepted'`,
      [user.id, user.id]
    );

    let connection_status = "none";
    let connection_id = null;

    if (viewerId !== user.id) {
      const [connRows] = await pool.query(
        `SELECT id, status, requester_id FROM connections
         WHERE (requester_id = ? AND receiver_id = ?)
            OR (requester_id = ? AND receiver_id = ?)
         LIMIT 1`,
        [viewerId, user.id, user.id, viewerId]
      );

      if (connRows.length > 0) {
        connection_id = connRows[0].id;
        if (connRows[0].status === "accepted") {
          connection_status = "connected";
        } else if (connRows[0].status === "pending") {
          connection_status = connRows[0].requester_id === viewerId ? "sent" : "received";
        } else {
          connection_status = "declined";
        }
      }
    }

    return res.json({
      profile: {
        id: user.id,
        username: user.username,
        role: user.role,
        created_at: user.created_at,
        name: user.name,
        title: user.title,
        height: user.height,
        weight: user.weight,
        languages: parseMaybeJson(user.languages, []),
        blood_group: user.blood_group,
        clearance_level: user.clearance_level,
        about: user.about,
        skills: parseMaybeJson(user.skills, []),
        photo_url: user.photo_url,
        connection_count,
        connection_status,
        connection_id,
      }
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const viewerId = req.user.sub;

    const [users] = await pool.query(
      `SELECT 
        u.id, u.username, u.role,
        sp.name, sp.title, sp.clearance_level, sp.photo_url
       FROM users u
       LEFT JOIN sicario_profiles sp ON sp.user_id = u.id
       WHERE u.id != ?
       ORDER BY u.created_at DESC`,
      [viewerId]
    );

    // Connection status for each user
    const [connections] = await pool.query(
      `SELECT id, requester_id, receiver_id, status
       FROM connections
       WHERE requester_id = ? OR receiver_id = ?`,
      [viewerId, viewerId]
    );

    const connMap = {};
    connections.forEach((c) => {
      const otherId = c.requester_id === viewerId ? c.receiver_id : c.requester_id;
      connMap[otherId] = {
        connection_id: c.id,
        status: c.status,
        requester_id: c.requester_id,
      };
    });

    const result = users.map((u) => {
      const conn = connMap[u.id];
      let connection_status = "none";
      let connection_id = null;

      if (conn) {
        connection_id = conn.connection_id;
        if (conn.status === "accepted") {
          connection_status = "connected";
        } else if (conn.status === "pending") {
          connection_status = conn.requester_id === viewerId ? "sent" : "received";
        } else {
          connection_status = "declined";
        }
      }

      return {
        ...u,
        connection_status,
        connection_id,
      };
    });

    return res.json({ users: result });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const { pool } = require("../db");
const { sanitizeObject } = require("../utils/sanitize");

function toInt(value) {
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

exports.createTask = async (req, res) => {
  try {
    const { title, description, assigned_to } = sanitizeObject(req.body);
    const createdBy = req.user.sub;

    if (assigned_to != null) {
      const [users] = await pool.query("SELECT id FROM users WHERE id = ? LIMIT 1", [assigned_to]);
      if (users.length === 0) {
        return res.status(400).json({ message: "Assigned user does not exist." });
      }
    }

    const [result] = await pool.query(
      "INSERT INTO tasks (title, description, assigned_to, created_by) VALUES (?, ?, ?, ?)",
      [title, description || null, assigned_to ?? null, createdBy]
    );

    const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ? LIMIT 1", [
      result.insertId,
    ]);
    return res.status(201).json({ task: rows[0] });
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.listTasks = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        t.*,
        au.username AS assigned_to_username,
        cu.username AS created_by_username
       FROM tasks t
       LEFT JOIN users au ON au.id = t.assigned_to
       JOIN users cu ON cu.id = t.created_by
       ORDER BY t.created_at DESC, t.id DESC`
    );
    return res.json({ tasks: rows });
  } catch (error) {
    console.error("Error listing tasks:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.listMyTasks = async (req, res) => {
  try {
    const userId = req.user.sub;
    const [rows] = await pool.query(
      `SELECT 
        t.*,
        cu.username AS created_by_username
       FROM tasks t
       JOIN users cu ON cu.id = t.created_by
       WHERE t.assigned_to = ?
       ORDER BY t.created_at DESC, t.id DESC`,
      [userId]
    );
    return res.json({ tasks: rows });
  } catch (error) {
    console.error("Error listing my tasks:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const taskId = toInt(req.params.id);
    if (!taskId) return res.status(400).json({ message: "Invalid task id." });

    const updates = sanitizeObject(req.body);

    if (updates.assigned_to != null) {
      const [users] = await pool.query("SELECT id FROM users WHERE id = ? LIMIT 1", [
        updates.assigned_to,
      ]);
      if (users.length === 0) {
        return res.status(400).json({ message: "Assigned user does not exist." });
      }
    }

    const fields = [];
    const values = [];

    if (updates.title !== undefined) {
      fields.push("title = ?");
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push("description = ?");
      values.push(updates.description ?? null);
    }
    if (updates.status !== undefined) {
      fields.push("status = ?");
      values.push(updates.status);
    }
    if (updates.assigned_to !== undefined) {
      fields.push("assigned_to = ?");
      values.push(updates.assigned_to ?? null);
    }

    values.push(taskId);

    const [result] = await pool.query(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`, values);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Task not found." });

    const [rows] = await pool.query(
      `SELECT 
        t.*,
        au.username AS assigned_to_username,
        cu.username AS created_by_username
       FROM tasks t
       LEFT JOIN users au ON au.id = t.assigned_to
       JOIN users cu ON cu.id = t.created_by
       WHERE t.id = ? LIMIT 1`,
      [taskId]
    );
    return res.json({ task: rows[0] });
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.completeTask = async (req, res) => {
  try {
    const taskId = toInt(req.params.id);
    if (!taskId) return res.status(400).json({ message: "Invalid task id." });

    const role = req.user.role;
    const userId = req.user.sub;

    const [rows] = await pool.query("SELECT id, assigned_to, status FROM tasks WHERE id = ? LIMIT 1", [
      taskId,
    ]);
    const task = rows[0];
    if (!task) return res.status(404).json({ message: "Task not found." });

    if (role === "user" && task.assigned_to !== userId) {
      return res.status(403).json({ message: "You can only complete tasks assigned to you." });
    }

    if (task.status !== "completed") {
      await pool.query("UPDATE tasks SET status = 'completed' WHERE id = ?", [taskId]);
    }

    const [updatedRows] = await pool.query(
      `SELECT 
        t.*,
        au.username AS assigned_to_username,
        cu.username AS created_by_username
       FROM tasks t
       LEFT JOIN users au ON au.id = t.assigned_to
       JOIN users cu ON cu.id = t.created_by
       WHERE t.id = ? LIMIT 1`,
      [taskId]
    );
    return res.json({ task: updatedRows[0] });
  } catch (error) {
    console.error("Error completing task:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const taskId = toInt(req.params.id);
    if (!taskId) return res.status(400).json({ message: "Invalid task id." });

    const [result] = await pool.query("DELETE FROM tasks WHERE id = ?", [taskId]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Task not found." });

    return res.json({ message: "Task deleted" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


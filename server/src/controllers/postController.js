const { pool } = require("../db");
const { uploadToCloudinary } = require("../utils/cloudinary");

exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const authorId = req.user.sub;

    if (!authorId) {
      return res.status(401).json({ message: "Could not identify user from token." });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Content cannot be empty." });
    }

    let image_url = null;
    let image_public_id = null;

    if (req.file) {
      try {
        const cloudRes = await uploadToCloudinary(req.file.buffer);
        image_url = cloudRes.secure_url;
        image_public_id = cloudRes.public_id;
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        return res.status(502).json({ message: "Image upload failed. Try again." });
      }
    }

    const [result] = await pool.query(
      "INSERT INTO newspaper_posts (author_id, content, image_url, image_public_id) VALUES (?, ?, ?, ?)",
      [authorId, content.trim(), image_url, image_public_id]
    );

    return res.status(201).json({
      message: "Post added to the Newspaper successfully!",
      postId: result.insertId,
      image_url,
    });

  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const userId = req.user.sub;

    const [posts] = await pool.query(`
      SELECT 
        np.id,
        np.content,
        np.image_url,
        np.created_at,
        u.username AS author,
        COUNT(DISTINCT pl.user_id) AS like_count,
        MAX(CASE WHEN pl.user_id = ? THEN 1 ELSE 0 END) AS liked_by_me
      FROM newspaper_posts np
      JOIN users u ON np.author_id = u.id
      LEFT JOIN post_likes pl ON pl.post_id = np.id
      GROUP BY np.id, np.content, np.image_url, np.created_at, u.username
      ORDER BY np.created_at DESC
    `, [userId]);

    return res.json({ posts });
  } catch (error) {
    console.error("Error fetching feed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.sub;
    const postId = parseInt(req.params.id);

    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID." });
    }

    const [postRows] = await pool.query(
      "SELECT id FROM newspaper_posts WHERE id = ? LIMIT 1",
      [postId]
    );
    if (postRows.length === 0) {
      return res.status(404).json({ message: "Post not found." });
    }

    const [existing] = await pool.query(
      "SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ? LIMIT 1",
      [postId, userId]
    );

    if (existing.length > 0) {
      await pool.query(
        "DELETE FROM post_likes WHERE post_id = ? AND user_id = ?",
        [postId, userId]
      );
      return res.json({ liked: false, message: "Post unliked." });
    } else {
      await pool.query(
        "INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)",
        [postId, userId]
      );
      return res.json({ liked: true, message: "Post liked." });
    }

  } catch (error) {
    console.error("Error toggling like:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
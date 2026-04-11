const { pool } = require("../db");
const { uploadToCloudinary } = require("../utils/cloudinary");
const { sanitize } = require("../utils/sanitize");

exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const authorId = req.user.sub;

    if (!authorId) {
      return res.status(401).json({ message: "Could not identify user from token." });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Content cannot be empty." });
    }

    const cleanTitle = title ? sanitize(title.trim()) : null;
    const cleanContent = sanitize(content.trim());

    let image_url = null;
    let image_public_id = null;

    if (req.file) {
      try {
        const cloudRes = await uploadToCloudinary(req.file.buffer, "newspaper");
        image_url = cloudRes.secure_url;
        image_public_id = cloudRes.public_id;
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        return res.status(502).json({ message: "Image upload failed. Try again." });
      }
    }

    const [result] = await pool.query(
      "INSERT INTO newspaper_posts (author_id, title, content, image_url, image_public_id) VALUES (?, ?, ?, ?, ?)",
      [authorId, cleanTitle, cleanContent, image_url, image_public_id]
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
        np.title,
        np.content,
        np.image_url,
        np.created_at,
        u.username AS author,
        COALESCE(SUM(CASE WHEN pv.vote = 1 THEN 1 ELSE 0 END), 0) AS upvotes,
        COALESCE(SUM(CASE WHEN pv.vote = -1 THEN 1 ELSE 0 END), 0) AS downvotes,
        COALESCE(SUM(pv.vote), 0) AS score,
        MAX(CASE WHEN pv.user_id = ? THEN pv.vote ELSE NULL END) AS my_vote
      FROM newspaper_posts np
      JOIN users u ON np.author_id = u.id
      LEFT JOIN post_votes pv ON pv.post_id = np.id
      GROUP BY np.id, np.title, np.content, np.image_url, np.created_at, u.username
      ORDER BY np.created_at DESC
    `, [userId]);

    return res.json({ posts });
  } catch (error) {
    console.error("Error fetching feed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.castVote = async (req, res) => {
  try {
    const userId = req.user.sub;
    const postId = parseInt(req.params.id);
    const { vote } = req.body;

    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID." });
    }

    if (vote !== 1 && vote !== -1) {
      return res.status(400).json({ message: "Vote must be 1 (upvote) or -1 (downvote)." });
    }

    const [postRows] = await pool.query(
      "SELECT id FROM newspaper_posts WHERE id = ? LIMIT 1",
      [postId]
    );
    if (postRows.length === 0) {
      return res.status(404).json({ message: "Post not found." });
    }

    const [existing] = await pool.query(
      "SELECT vote FROM post_votes WHERE post_id = ? AND user_id = ? LIMIT 1",
      [postId, userId]
    );

    if (existing.length > 0) {
      if (existing[0].vote === vote) {
        await pool.query(
          "DELETE FROM post_votes WHERE post_id = ? AND user_id = ?",
          [postId, userId]
        );
        return res.json({ my_vote: null, message: "Vote removed." });
      } else {
        await pool.query(
          "UPDATE post_votes SET vote = ? WHERE post_id = ? AND user_id = ?",
          [vote, postId, userId]
        );
        return res.json({ my_vote: vote, message: "Vote updated." });
      }
    } else {
      await pool.query(
        "INSERT INTO post_votes (post_id, user_id, vote) VALUES (?, ?, ?)",
        [postId, userId, vote]
      );
      return res.json({ my_vote: vote, message: "Vote cast." });
    }
  } catch (error) {
    console.error("Error casting vote:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
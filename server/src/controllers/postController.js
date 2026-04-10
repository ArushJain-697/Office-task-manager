const { pool } = require("../db");

exports.createPost = async (req, res) => {
  try {
    const { content, image_url } = req.body;
    
    // req.user.sub requireAuth middleware se aayega (logged-in user ki ID)
    const authorId = req.user.sub; 

    if (!content) {
      return res.status(400).json({ message: "Content cannot be empty." });
    }

    const [result] = await pool.query(
      "INSERT INTO newspaper_posts (author_id, content, image_url) VALUES (?, ?, ?)",
      [authorId, content, image_url || null]
    );

    return res.status(201).json({ 
      message: "Post added to the Newspaper successfully!",
      postId: result.insertId 
    });

  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
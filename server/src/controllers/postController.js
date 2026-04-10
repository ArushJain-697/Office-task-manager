// NEW postController.js
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
    let image_public_id = null; // Mistake 1 fix

    if (req.file) {
      // Mistake 2 fix: Cloudinary error alag pakdo
      try {
        const cloudRes = await uploadToCloudinary(req.file.buffer);
        image_url = cloudRes.secure_url;
        image_public_id = cloudRes.public_id; // Mistake 1 fix: store karo
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
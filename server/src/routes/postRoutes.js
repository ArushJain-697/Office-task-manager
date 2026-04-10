const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth"); 
const postController = require("../controllers/postController");

// API URL: POST /api/posts/add
router.post("/add", requireAuth, postController.createPost);

module.exports = router;
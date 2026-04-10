const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { createPost, getFeed, toggleLike } = require("../controllers/postController");

router.get("/", requireAuth, getFeed);
router.post("/add", requireAuth, upload.single("image"), createPost);
router.post("/:id/like", requireAuth, toggleLike);

module.exports = router;
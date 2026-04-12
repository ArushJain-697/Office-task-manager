const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const { getPublicProfile, getAllUsers } = require("../controllers/userController");

router.get("/", requireAuth, getAllUsers);
router.get("/:username", requireAuth, getPublicProfile);

module.exports = router;
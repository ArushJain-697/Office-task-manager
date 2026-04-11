const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const { checkRole } = require("../middleware/checkRole");
const { validateProfile } = require("../middleware/validate");
const { uploadSingle } = require("../middleware/upload");
const { getProfile, updateProfile, getHeists } = require("../controllers/sicarioController");

router.get("/profile", requireAuth, checkRole("sicario"), getProfile);
router.put("/profile", requireAuth, checkRole("sicario"), uploadSingle, validateProfile, updateProfile);
router.get("/heists", requireAuth, checkRole("sicario"), getHeists);

module.exports = router;
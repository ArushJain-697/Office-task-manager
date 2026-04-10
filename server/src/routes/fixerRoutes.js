const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const { checkRole } = require("../middleware/checkRole");
const { validateProfile, validateHeist } = require("../middleware/validate");
const upload = require("../middleware/upload");
const { getProfile, updateProfile } = require("../controllers/sicarioController");
const { postHeist, getMyHeists, getApplicants } = require("../controllers/heistController");

router.get("/profile", requireAuth, checkRole("fixer"), getProfile);
router.put("/profile", requireAuth, checkRole("fixer"), upload.single("photo"), validateProfile, updateProfile);

router.post("/heist/add", requireAuth, checkRole("fixer"), validateHeist, postHeist);
router.get("/heists", requireAuth, checkRole("fixer"), getMyHeists);
router.get("/heist/:id/applicants", requireAuth, checkRole("fixer"), getApplicants);

module.exports = router;
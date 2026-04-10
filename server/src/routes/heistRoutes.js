const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const { checkRole } = require("../middleware/checkRole");
const { validateHeist } = require("../middleware/validate");
const { postHeist, getMyHeists, getApplicants } = require("../controllers/heistController");

router.post("/add", requireAuth, checkRole("fixer"), validateHeist, postHeist);
router.get("/", requireAuth, checkRole("fixer"), getMyHeists);
router.get("/:id/applicants", requireAuth, checkRole("fixer"), getApplicants);

module.exports = router;
const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const { checkRole } = require("../middleware/checkRole");
const { listUsers } = require("../controllers/userController");

/**
 * @openapi
 * tags:
 *   - name: Users
 *     description: User management
 *
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     summary: List users (admin)
 *     responses:
 *       200: { description: OK }
 *       403: { description: Forbidden }
 */
router.get("/", requireAuth, checkRole("admin"), listUsers);

module.exports = router;
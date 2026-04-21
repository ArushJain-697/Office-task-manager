const express = require("express");
const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required: [username, password]
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *     LoginRequest:
 *       type: object
 *       required: [username, password]
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 */

const {
  validateRegisterCredentials,
  validateLoginCredentials,
} = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const authController = require("../controllers/authController");

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User created and cookie set
 *       409:
 *         description: Username already in use
 */
router.post("/register", validateRegisterCredentials, authController.register);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and set JWT cookie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid username or password
 */
router.post("/login", validateLoginCredentials, authController.login);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and clear JWT cookie
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post("/logout", authController.logout);

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user from cookie
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Missing or invalid token
 */
router.get("/me", requireAuth, authController.me);

module.exports = router;
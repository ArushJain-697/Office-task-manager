const express = require("express");
const router = express.Router();

const { validateCredentials } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const authController = require("../controllers/authController");

router.post("/check-user", authController.checkUser);
router.post("/register", validateCredentials, authController.register);
router.post("/login", validateCredentials, authController.login);
router.post("/logout", authController.logout);

router.get("/users", requireAuth, authController.getUsers);
router.get("/me", requireAuth, authController.getMe);

module.exports = router;
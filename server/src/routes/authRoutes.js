const express = require("express");
const router = express.Router();

const {
  validateRegisterCredentials,
  validateLoginCredentials,
} = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const authController = require("../controllers/authController");

router.post("/check-user", authController.checkUser);
router.post("/register", validateRegisterCredentials, authController.register);
router.post("/login", validateLoginCredentials, authController.login);
router.post("/logout", authController.logout);

// router.get("/users", requireAuth, authController.getUsers);
router.get("/me", requireAuth, authController.getMe);

module.exports = router;
const express = require("express");
const AuthController = require("../controllers/AuthController");

const {authMiddleware} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/google-login", AuthController.googleLogin);
router.get("/info", authMiddleware, AuthController.info);

module.exports = router;

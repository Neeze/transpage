const express = require("express");
const AuthController = require("../controllers/AuthController");

const {authMiddleware} = require("../middlewares/authMiddleware");
const translateRoutes = require("./translateRoutes");

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/google-login", AuthController.googleLogin);
router.get("/info", authMiddleware, AuthController.info);
router.get("/activity-logs", authMiddleware, AuthController.getActivityLogs);

router.use('/translate', authMiddleware, translateRoutes)

module.exports = router;

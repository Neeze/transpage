const express = require("express");
const AuthController = require("../controllers/AuthController");

const {authMiddleware} = require("../middlewares/authMiddleware");
const translateRoutes = require("./translateRoutes");
const apiKeyRoutes = require("./apiKeyRoutes");
const paymentRoutes = require("./momoPaymentRoutes");
const adminRoutes = require("./adminRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/google-login", AuthController.googleLogin);
router.get("/info", authMiddleware, AuthController.info);
router.put("/update", authMiddleware, AuthController.updateInfo);
router.get("/activity-logs", authMiddleware, AuthController.getActivityLogs);

router.use('/translate', authMiddleware, translateRoutes)
router.use('/api-key', authMiddleware, apiKeyRoutes)
router.use('/payment', paymentRoutes)
router.use('/admin', adminRoutes)

module.exports = router;

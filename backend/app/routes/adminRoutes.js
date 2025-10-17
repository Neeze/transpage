const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { adminMiddleware } = require("../middlewares/adminMiddleware");
const adminDashboardController = require("../controllers/admin/adminDashboardController");

const router = express.Router();

router.get("/dashboard", authMiddleware, adminMiddleware, adminDashboardController.getDashboardStats);
router.get('/dashboard/chart', authMiddleware, adminMiddleware, adminDashboardController.getDashboardChart);
router.get("/activity", authMiddleware, adminMiddleware, adminDashboardController.getActivityLogs);

module.exports = router;

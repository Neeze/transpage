const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const {authMiddleware} = require("../middlewares/authMiddleware");

// POST /payment/create
router.get("/packages", authMiddleware, paymentController.getPackages);

router.post("/create", authMiddleware, paymentController.createPayment);

router.get("/history", authMiddleware, paymentController.getPaymentHistory);
// POST /payment/ipn
router.post("/ipn", paymentController.handleIPN);

// GET /payment/return
router.get("/return", paymentController.handleRedirect);

module.exports = router;

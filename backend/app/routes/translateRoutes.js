const express = require("express");
const multer = require("multer");
const { createTranslateJob, getTranslateStatus, downloadTranslatedFile, getOrderHistory} = require("../controllers/translateController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), createTranslateJob);
router.get("/status/:jobId", getTranslateStatus);
router.get("/download/:jobId", downloadTranslatedFile);
router.get("/history", getOrderHistory);
module.exports = router;

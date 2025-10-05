const express = require("express");
const router = express.Router();
const ApiKeyController = require("../controllers/apikeyController");

// Client tạo API key
router.post("/", ApiKeyController.createApiKey);

// Lấy danh sách API key của chính client
router.get("/", ApiKeyController.getMyApiKeys);

// Thu hồi API key
router.put("/:id/revoke", ApiKeyController.revokeMyApiKey);

// Xóa API key
router.delete("/:id", ApiKeyController.deleteMyApiKey);

module.exports = router;

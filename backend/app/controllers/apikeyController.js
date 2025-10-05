const { ApiKey, ActivityLog, User } = require("../models");
const { v4: uuidv4 } = require("uuid");

class ApiKeyController {
    // 🟢 Tạo API Key mới cho client
    static async createApiKey(req, res) {
        try {
            const { name } = req.body;
            const userId = req.user.id;

            const apiKey = await ApiKey.create({
                name,
                key: uuidv4(),
                userId,
                status: "active",
            });

            // ✏️ Ghi log
            const user = await User.findByPk(userId);
            if (user) {
                await ActivityLog.create({
                    userId,
                    action: "APIKEY_CREATE",
                    metadata: { name, key: apiKey.key },
                    pointBefore: user.points,
                    pointChange: 0,
                    pointAfter: user.points,
                });
            }

            return res.status(201).json({
                success: true,
                message: "Tạo API Key thành công",
                apiKey,
            });
        } catch (error) {
            console.error("❌ createApiKey error:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    // 📋 Lấy tất cả API Key của client (có phân trang)
    static async getMyApiKeys(req, res) {
        try {
            const userId = req.user.id;
            const page = Math.max(parseInt(req.query.page) || 1, 1);
            const pageSize = Math.min(Math.max(parseInt(req.query.pageSize) || 10, 1), 100);
            const offset = (page - 1) * pageSize;

            const { count, rows } = await ApiKey.findAndCountAll({
                where: { userId },
                attributes: ["id", "name", "key", "status", "createdAt"],
                order: [["createdAt", "DESC"]],
                limit: pageSize,
                offset,
            });

            return res.json({
                success: true,
                apiKeys: rows,
                pagination: {
                    total: count,
                    page,
                    pageSize,
                    totalPages: Math.max(1, Math.ceil(count / pageSize)),
                },
            });
        } catch (err) {
            console.error("❌ getMyApiKeys error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    // 🔒 Thu hồi API Key
    static async revokeMyApiKey(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const apiKey = await ApiKey.findOne({ where: { id, userId } });
            if (!apiKey) {
                return res.status(404).json({ error: "API Key not found" });
            }

            apiKey.status = "revoked";
            await apiKey.save();

            // ✏️ Ghi log
            const user = await User.findByPk(userId);
            if (user) {
                await ActivityLog.create({
                    userId,
                    action: "APIKEY_REVOKE",
                    metadata: { apiKeyId: apiKey.id, name: apiKey.name, key: apiKey.key },
                    pointBefore: user.points,
                    pointChange: 0,
                    pointAfter: user.points,
                });
            }

            return res.json({
                success: true,
                message: "API Key đã bị thu hồi",
                apiKey,
            });
        } catch (error) {
            console.error("❌ revokeMyApiKey error:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    // 🗑️ Xóa API Key
    static async deleteMyApiKey(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const apiKey = await ApiKey.findOne({ where: { id, userId } });
            if (!apiKey) {
                return res.status(404).json({ error: "API Key not found" });
            }

            const deletedInfo = {
                id: apiKey.id,
                name: apiKey.name,
                key: apiKey.key,
                status: apiKey.status,
            };

            await apiKey.destroy();

            // ✏️ Ghi log
            const user = await User.findByPk(userId);
            if (user) {
                await ActivityLog.create({
                    userId,
                    action: "APIKEY_DELETE",
                    metadata: deletedInfo,
                    pointBefore: user.points,
                    pointChange: 0,
                    pointAfter: user.points,
                });
            }

            return res.json({
                success: true,
                message: "API Key đã được xóa",
            });
        } catch (error) {
            console.error("❌ deleteMyApiKey error:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

module.exports = ApiKeyController;

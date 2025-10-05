const { ApiKey } = require("../models");
const { v4: uuidv4 } = require("uuid");

class ApiKeyController {
    // Tạo API Key mới cho client
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

            return res.status(201).json(apiKey);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    // Lấy tất cả API Key của client với phân trang
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
                offset
            });

            return res.json({
                apiKeys: rows,
                pagination: {
                    total: count,
                    page,
                    pageSize,
                    totalPages: Math.max(1, Math.ceil(count / pageSize)),
                },
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    // Thu hồi API Key
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

            return res.json({ message: "API Key revoked", apiKey });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    // Xóa API Key
    static async deleteMyApiKey(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const apiKey = await ApiKey.findOne({ where: { id, userId } });
            if (!apiKey) {
                return res.status(404).json({ error: "API Key not found" });
            }

            await apiKey.destroy();

            return res.json({ message: "API Key deleted" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

module.exports = ApiKeyController;

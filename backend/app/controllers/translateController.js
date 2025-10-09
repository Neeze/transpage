const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const redis = require("../../config/redis");

const Order = require("../models/Order");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");

exports.getSupportedLanguages = async (req, res) => {
    try {
        const cacheKey = "translate:supported_languages";

        // Kiểm tra cache trong Redis
        const cached = await redis.get(cacheKey);
        if (cached) {
            return res.json(JSON.parse(cached));
        }

        // Gọi API từ module.transpage.net
        const response = await axios.get("http://module.transpage.net/api/v1/pdf/supported-languages");

        if (!response.data || !response.data.languages) {
            return res.status(502).json({ error: "Invalid response from translation module" });
        }

        const data = {
            success: true,
            total: Object.keys(response.data.languages).length,
            languages: response.data.languages,
        };

        // Lưu cache trong 12 giờ (43200 giây)
        await redis.set(cacheKey, JSON.stringify(data), "EX", 43200);

        res.json(data);
    } catch (err) {
        console.error("Error fetching supported languages:", err);
        res.status(500).json({ error: "Không thể lấy danh sách ngôn ngữ hỗ trợ" });
    }
};

exports.createTranslateJob = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const userId = req.user.id;
    const jobId = uuidv4();
    const filePath = req.file.path;

    try {
        // Bảo đảm thư mục uploads tồn tại
        const uploadDir = path.resolve(__dirname, "../../uploads");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        // Tạo đơn hàng
        const order = await Order.create({
            jobId,
            userId,
            sourceLang: req.body.source_lang || "en",
            targetLang: req.body.target_lang || "vi",
            topic: req.body.topic || "general",
            outputFormat: req.body.output_format || "pdf",
            filePath,
            status: "pending",
            costPoints: 0,
        });

        // Cập nhật trạng thái ban đầu vào Redis
        await redis.set(`translate:job:${jobId}:status`, "Pending");

        // Xử lý nền
        process.nextTick(async () => {
            try {
                await order.update({ status: "processing" });
                await redis.set(`translate:job:${jobId}:status`, "Processing");

                const buffer = fs.readFileSync(filePath);
                const base64File = buffer.toString("base64");

                const response = await axios.post("http://module.transpage.net/api/v1/pdf/translate-fast/", {
                    pdf_base64: base64File,
                    source_lang: "auto",
                    target_lang: order.targetLang,
                });

                const result = response.data;

                if (result.status === "Completed") {
                    const translatedBuffer = Buffer.from(result.document_base64, "base64");

                    const outputDir = path.resolve(__dirname, "../../uploads");
                    const outputFile = path.join(outputDir, `${jobId}_translated.${order.outputFormat}`);
                    fs.writeFileSync(outputFile, translatedBuffer);

                    await order.update({
                        status: "done",
                        translatedFilePath: outputFile,
                        cost: result.api_cost_usd || order.cost,
                    });

                    // Cập nhật Redis
                    await redis.set(`translate:job:${jobId}:status`, "Completed");
                    await redis.set(`translate:job:${jobId}:result`, outputFile);

                    // Ghi log hoạt động và điểm
                    const user = await User.findByPk(userId);
                    if (user) {
                        const before = user.points;
                        const change = -order.costPoints;
                        const after = before + change;

                        await user.update({ points: after });

                        await ActivityLog.create({
                            userId,
                            action: "TRANSLATE_FILE",
                            metadata: { orderId: order.id, jobId },
                            pointBefore: before,
                            pointChange: change,
                            pointAfter: after,
                            UserId: user.id,
                        });
                    }
                } else {
                    await order.update({ status: "failed" });
                    await redis.set(`translate:job:${jobId}:status`, "Failed");
                }
            } catch (err) {
                console.error("Translation error:", err);
                await order.update({ status: "failed", errorMessage: err.message });
                await redis.set(`translate:job:${jobId}:status`, "Failed");
            }
        });

        res.json({ jobId, status: "Pending" });
    } catch (err) {
        console.error("Job create error:", err);
        res.status(500).json({ error: "Failed to create job" });
    }
};

exports.getTranslateStatus = async (req, res) => {
    const { jobId } = req.params;
    const status = await redis.get(`translate:job:${jobId}:status`);
    if (!status) return res.status(404).json({ error: "Job not found" });

    res.json({ jobId, status });
};

exports.downloadTranslatedFile = async (req, res) => {
    const { jobId } = req.params;
    const resultFile = await redis.get(`translate:job:${jobId}:result`);

    if (!resultFile || !fs.existsSync(resultFile)) {
        return res.status(404).json({ error: "Translated file not found" });
    }

    const fileName = path.basename(resultFile);
    res.download(resultFile, fileName, (err) => {
        if (err) console.error("Download error:", err);
    });
};

exports.getOrderHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (page - 1) * pageSize;

        const { count, rows } = await Order.findAndCountAll({
            where: { userId },
            order: [["createdAt", "DESC"]],
            attributes: [
                "id",
                "jobId",
                "sourceLang",
                "targetLang",
                "topic",
                "outputFormat",
                "status",
                "costPoints",
                "createdAt",
                "translatedFilePath",
            ],
            limit: pageSize,
            offset,
        });

        res.json({
            success: true,
            orders: rows,
            pagination: {
                total: count,
                page,
                pageSize,
                totalPages: Math.ceil(count / pageSize),
            },
        });
    } catch (err) {
        console.error("Get order history error:", err);
        res.status(500).json({ error: "Không thể lấy lịch sử đơn hàng" });
    }
};

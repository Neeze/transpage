const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const redis = require("../../config/redis");

const Order = require("../models/Order");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");

exports.createTranslateJob = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const userId = req.user.id; // từ authMiddleware
    const jobId = uuidv4();
    const filePath = req.file.path;

    try {
        // Tạo Order trong DB
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

        // Lưu trạng thái vào Redis cho polling
        await redis.set(`translate:job:${jobId}:status`, "Pending");

        // Xử lý nền
        process.nextTick(async () => {
            try {
                await order.update({ status: "processing" });
                await redis.set(`translate:job:${jobId}:status`, "Processing");

                const buffer = fs.readFileSync(filePath);
                const base64File = buffer.toString("base64");

                const response = await axios.post("http://127.0.0.1:8000/api/v1/pdf/translate/", {
                    pdf_base64: base64File,
                    source_lang: order.sourceLang,
                    target_lang: order.targetLang,
                });

                const result = response.data;


                if (result.status === "Completed") {
                    const translatedBuffer = Buffer.from(result.translated_pdf_base64, "base64");
                    const outputFile = path.join("uploads", `${jobId}_translated.${order.outputFormat}`);
                    fs.writeFileSync(outputFile, translatedBuffer);

                    await order.update({
                        status: "done",
                        translatedFilePath: outputFile,
                        cost: result.api_cost_usd || order.cost
                    });

                    // Trừ điểm user
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
                            UserId: user.id
                        });
                    }

                    await redis.set(`translate:job:${jobId}:status`, "Completed");
                    await redis.set(`translate:job:${jobId}:result`, outputFile);
                } else {
                    await order.update({ status: "failed" });
                    await redis.set(`translate:job:${jobId}:status`, "Failed");
                }
            } catch (err) {
                console.error("Translation error:", err);
                await order.update({ status: "failed", errorMessage: err.message });
                await redis.set(`translate:job:${jobId}:status`, "Failed");
            } finally {
                fs.unlinkSync(filePath);
                await redis.del(`translate:job:${jobId}:file`);
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
    const status = await redis.get(`translate:job:${jobId}:status`);
    const resultFile = await redis.get(`translate:job:${jobId}:result`);

    if (status !== "Completed" || !resultFile) {
        return res.status(404).json({ error: "Result not available" });
    }

    res.download(resultFile, `${jobId}_translated.pdf`, async (err) => {
        if (!err) {
            fs.unlinkSync(resultFile);
            await redis.del([
                `translate:job:${jobId}:status`,
                `translate:job:${jobId}:result`
            ]);
        }
    });
};

exports.getOrderHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        // Lấy query params page & pageSize, mặc định 1 và 10
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

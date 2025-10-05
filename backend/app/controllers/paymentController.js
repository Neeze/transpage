const { MomoClient, toExtraDataBase64, validateMomoCallback } = require("../lib/momo_capture_wallet");
const { Payment, User } = require("../models");
const { success, error } = require("../helpers/response");
const { v4: uuidv4 } = require("uuid");

const VND_TO_POINTS = process.env.VND_TO_POINTS || 1000; // 1 point = 1000 VND
const MOMO_ENDPOINT = process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn";
const MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE;
const MOMO_ACCESS_KEY = process.env.MOMO_ACCESS_KEY;
const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY;

const momoClient = new MomoClient({
    endpoint: MOMO_ENDPOINT,
    partnerCode: MOMO_PARTNER_CODE,
    accessKey: MOMO_ACCESS_KEY,
    secretKey: MOMO_SECRET_KEY,
});


exports.getPackages = async (req, res) => {
    try {
        const VND_TO_POINTS = Number(process.env.VND_TO_POINTS) || 1000; // 1 point = 1000 VND

        const PACKAGES = [
            { id: 1, label: "Gói Cơ Bản", amount: 50000, description: "Phù hợp cho người mới bắt đầu" },
            { id: 2, label: "Gói Nâng Cao", amount: 100000, description: "Phổ biến cho người dùng thường xuyên" },
            { id: 3, label: "Gói Chuyên Nghiệp", amount: 200000, description: "Dành cho người dùng cao cấp" },
            { id: 4, label: "Gói Doanh Nghiệp", amount: 500000, description: "Tối đa lợi ích cho tổ chức" },
            { id: 5, label: "Gói Test", amount: 5000, description: "Test" },
        ];

        const data = PACKAGES.map(pkg => ({
            ...pkg,
            points: Math.floor(pkg.amount / VND_TO_POINTS),
        }));

        return res.json({
            success: true,
            message: "Danh sách gói nạp MoMo",
            data,
            rate: VND_TO_POINTS, // 🟢 gửi thêm thông tin quy đổi
        });
    } catch (err) {
        console.error("❌ getPackages error:", err);
        return res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách gói nạp",
            error: err.message,
        });
    }
};

exports.createPayment = async (req, res) => {
    try {
        const { amount, orderInfo } = req.body;
        const userId = req.user?.id; // giả định middleware auth đã set req.user

        if (!userId) {
            return error(res, "Unauthorized: User not found", null, 401, req);
        }

        if (!amount || amount < 1000) {
            return error(res, "Số tiền không hợp lệ (tối thiểu 1,000 VND)", null, 400, req);
        }

        const requestId = `req-${Date.now()}`;
        const orderId = `order-${Date.now()}`;
        const redirectUrl = process.env.MOMO_REDIRECT_URL || "https://yourapp.com/payment/return";
        const ipnUrl = process.env.MOMO_IPN_URL || "https://yourapp.com/payment/ipn";
        const extraData = toExtraDataBase64({ userId });

        // Tạo bản ghi pending
        const payment = await Payment.create({
            orderId,
            requestId,
            userId,
            amount,
            points: Math.floor(amount / VND_TO_POINTS),
            orderInfo,
            status: "pending",
        });

        // Gọi API MoMo
        const momoRes = await momoClient.createPaymentCaptureWallet({
            requestId,
            orderId,
            amount,
            orderInfo,
            redirectUrl,
            ipnUrl,
            extraData,
            lang: "vi",
        });

        return success(
            res,
            "Khởi tạo thanh toán MoMo thành công",
            {
                payUrl: momoRes.payUrl,
                deeplink: momoRes.deeplink,
                qrCodeUrl: momoRes.qrCodeUrl,
                orderId,
                requestId,
            },
            200,
            req
        );
    } catch (err) {
        console.error("❌ createPayment error:", err);
        return error(res, "Tạo thanh toán thất bại", err.message, 500, req);
    }
};

exports.getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (page - 1) * pageSize;

        const { count, rows } = await Payment.findAndCountAll({
            where: { userId },
            order: [["createdAt", "DESC"]],
            attributes: [
                "id",
                "orderId",
                "requestId",
                "amount",
                "points",
                "orderInfo",
                "status",
                "payType",
                "transId",
                "message",
                "createdAt",
            ],
            limit: pageSize,
            offset,
        });

        return res.json({
            success: true,
            payments: rows,
            pagination: {
                total: count,
                page,
                pageSize,
                totalPages: Math.ceil(count / pageSize),
            },
        });
    } catch (err) {
        console.error("❌ Get payment history error:", err);
        return res.status(500).json({ error: "Không thể lấy lịch sử thanh toán" });
    }
};


exports.handleIPN = async (req, res) => {
    try {
        const validation = validateMomoCallback(req.body, {
            accessKey: MOMO_ACCESS_KEY,
            secretKey: MOMO_SECRET_KEY,
        });

        if (!validation.valid) {
            console.warn("❌ IPN Invalid:", validation.reason);
            return error(res, "IPN không hợp lệ", validation.reason, 400, req);
        }

        const data = req.body;
        const payment = await Payment.findOne({ where: { orderId: data.orderId } });
        if (!payment) {
            return error(res, "Không tìm thấy giao dịch", null, 404, req);
        }

        // Tránh xử lý lại nếu đã success hoặc failed
        if (payment.status !== "pending") {
            console.log(`⚠️ IPN bị bỏ qua (đã xử lý): ${payment.status}`);
            return success(res, "Đã ghi nhận IPN trước đó", { orderId: payment.orderId, status: payment.status }, 200, req);
        }

        payment.transId = data.transId;
        payment.resultCode = data.resultCode;
        payment.message = data.message;
        payment.payType = data.payType;
        payment.status = data.resultCode === 0 ? "success" : "failed";
        await payment.save();

        // Nếu thành công → cộng điểm user (chỉ cộng 1 lần)
        if (payment.status === "success") {
            const user = await User.findByPk(payment.userId);
            if (user) {
                user.points += payment.points;
                await user.save();
            }
        }

        console.log(`✅ IPN xử lý xong: ${payment.orderId} → ${payment.status}`);

        return success(res, "IPN xác nhận thành công", { orderId: payment.orderId, status: payment.status }, 200, req);
    } catch (err) {
        console.error("❌ handleIPN error:", err);
        return error(res, "Lỗi xử lý IPN", err.message, 500, req);
    }
};


exports.handleRedirect = async (req, res) => {
    const FRONTEND_URL =
        process.env.FRONTEND_URL + "/main/payment/result";
    try {
        const validation = validateMomoCallback(req.query, {
            accessKey: MOMO_ACCESS_KEY,
            secretKey: MOMO_SECRET_KEY,
        });

        if (!validation.valid) {
            console.warn("⚠️ Invalid MoMo signature:", validation.reason);
            return error(res, "Giao dịch không hợp lệ", validation.reason, 400, req);
        }

        const { orderId, resultCode, message } = req.query;
        const payment = await Payment.findOne({ where: { orderId } });

        if (!payment) {
            return error(res, "Không tìm thấy giao dịch", null, 404, req);
        }

        let redirectStatus = "failed";
        let redirectMessage = "Thanh toán thất bại";
        let pointsAdded = 0;
        const amountValue = payment.amount || 0;

        // ✅ Xác định trạng thái cuối dựa trên DB (đã sync qua IPN)
        if (payment.status === "success" || Number(resultCode) === 0) {
            redirectStatus = "success";
            redirectMessage = `Thanh toán thành công - Đã cộng ${payment.points} điểm`;
            pointsAdded = payment.points;
        } else if (payment.status === "failed") {
            const resultMap = {
                1001: "Người dùng hủy giao dịch",
                1005: "Thanh toán bị từ chối",
                1006: "Hết thời gian giao dịch",
                9000: "Hệ thống MoMo tạm thời gián đoạn",
            };
            redirectMessage =
                resultMap[Number(resultCode)] || payment.message || message || "Thanh toán thất bại";
        } else {
            // pending (IPN chưa đến)
            redirectStatus = "pending";
            redirectMessage = "Đang chờ xác nhận thanh toán...";
        }

        const redirectUrl =
            `${FRONTEND_URL}?status=${redirectStatus}` +
            `&orderId=${payment.orderId}` +
            `&message=${encodeURIComponent(redirectMessage)}` +
            `&points=${pointsAdded}` +
            `&amount=${amountValue}` +
            `&code=${resultCode}`;

        console.log("➡️ Redirecting user to:", redirectUrl);

        return res.redirect(302, redirectUrl);
    } catch (err) {
        console.error("❌ handleRedirect error:", err);
        const failUrl = `${FRONTEND_URL}?status=error&message=${encodeURIComponent(
            "Lỗi xử lý redirect — vui lòng thử lại sau."
        )}`;
        return res.redirect(302, failUrl);
    }
};



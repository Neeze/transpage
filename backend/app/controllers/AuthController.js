const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { User, ActivityLog } = require("../models");
const { success, error } = require("../helpers/response");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthController {
    // Đăng ký local
    async register(req, res) {
        try {
            const { username, email, password } = req.body;
            if (!password) return error(res, "Mật khẩu là bắt buộc", null, 400, req);

            const hashed = await bcrypt.hash(password, 10);
            const user = await User.create({
                username,
                email,
                password: hashed,
                role: "user",
                points: 5,
                provider: "local",
            });

            await ActivityLog.create({
                userId: user.id,
                action: "REGISTER_LOCAL",
                metadata: { message: "Người dùng đăng ký bằng email & mật khẩu", email },
                pointBefore: 0,
                pointChange: 0,
                pointAfter: 0,
            });

            const token = jwt.sign(
                { id: user.id, role: user.role, provider: user.provider },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            return success(res, "Đăng ký người dùng thành công", { token }, 201, req);
        } catch (err) {
            return error(res, "Người dùng đã tồn tại hoặc dữ liệu không hợp lệ", { chiTiet: err.message }, 400, req);
        }
    }

    // Đăng nhập local
    async login(req, res) {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return error(res, "Email hoặc mật khẩu không đúng", null, 401, req);

        if (user.provider !== "local") {
            return error(res, "Tài khoản này đăng ký bằng Google. Vui lòng dùng đăng nhập Google.", null, 400, req);
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return error(res, "Email hoặc mật khẩu không đúng", null, 401, req);

        const token = jwt.sign(
            { id: user.id, role: user.role, provider: user.provider },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        await ActivityLog.create({
            userId: user.id,
            action: "LOGIN_LOCAL",
            metadata: { message: "Người dùng đăng nhập bằng email & mật khẩu", ip: req.ip, ua: req.headers["user-agent"] },
            pointBefore: user.points,
            pointChange: 0,
            pointAfter: user.points,
        });

        return success(res, "Đăng nhập thành công", { token }, 200, req);
    }

    // Đăng nhập Google
    async googleLogin(req, res) {
        try {
            const { token } = req.body;
            if (!token) return error(res, "Thiếu token Google", null, 400, req);

            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            const { sub, email, name, picture } = payload;

            // Tìm user theo googleId
            let user = await User.findOne({ where: { googleId: sub } });

            if (!user) {
                // Check nếu email đã tồn tại nhưng là local account
                const existing = await User.findOne({ where: { email } });
                if (existing && existing.provider === "local") {
                    return error(res, "Email này đã được đăng ký bằng mật khẩu. Vui lòng đăng nhập bằng email & mật khẩu.", null, 400, req);
                }

                // Tạo mới user bằng Google
                user = await User.create({
                    username: name || email.split("@")[0],
                    email,
                    password: null,
                    role: "user",
                    points: 5,
                    provider: "google",
                    googleId: sub,
                    avatarUrl: picture,
                });

                await ActivityLog.create({
                    userId: user.id,
                    action: "REGISTER_GOOGLE",
                    metadata: { message: "Người dùng đăng ký bằng Google", email },
                    pointBefore: 0,
                    pointChange: 0,
                    pointAfter: 0,
                });
            }

            // Tạo token hệ thống
            const appToken = jwt.sign(
                { id: user.id, role: user.role, provider: user.provider },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            await ActivityLog.create({
                userId: user.id,
                action: "LOGIN_GOOGLE",
                metadata: { message: "Người dùng đăng nhập bằng Google", email },
                pointBefore: user.points,
                pointChange: 0,
                pointAfter: user.points,
            });

            return success(res, "Đăng nhập Google thành công", { token: appToken }, 200, req);
        } catch (err) {
            return error(res, "Xác thực Google thất bại", { chiTiet: err.message }, 401, req);
        }
    }

    async info(req, res) {
        try {
            // req.user được set trong authMiddleware sau khi verify JWT
            if (!req.user) {
                return error(res, "Không tìm thấy thông tin người dùng", null, 401, req);
            }

            const user = await User.findByPk(req.user.id, {
                attributes: ["id", "username", "email", "role", "points", "provider", "avatarUrl", "createdAt"],
            });

            if (!user) {
                return error(res, "Không tồn tại người dùng", null, 404, req);
            }

            return success(res, "Lấy thông tin người dùng thành công", user, 200, req);
        } catch (err) {
            return error(res, "Không thể lấy thông tin người dùng", { chiTiet: err.message }, 500, req);
        }
    }

    async updateInfo(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) return error(res, "Người dùng chưa đăng nhập", null, 401, req);

            const { username, avatarUrl, currentPassword, newPassword } = req.body;
            const user = await User.findByPk(userId);

            if (!user) return error(res, "Không tìm thấy người dùng", null, 404, req);

            // ✅ Nếu muốn đổi mật khẩu → cần xác thực password cũ (chỉ áp dụng cho local)
            if (newPassword) {
                if (user.provider !== "local") {
                    return error(res, "Tài khoản Google không thể đổi mật khẩu tại đây", null, 400, req);
                }

                if (!currentPassword) {
                    return error(res, "Vui lòng nhập mật khẩu hiện tại", null, 400, req);
                }

                const valid = await bcrypt.compare(currentPassword, user.password);
                if (!valid) {
                    return error(res, "Mật khẩu hiện tại không đúng", null, 400, req);
                }

                const hashed = await bcrypt.hash(newPassword, 10);
                user.password = hashed;
            }

            // ✅ Cập nhật các thông tin khác (nếu có)
            if (username) user.username = username;
            if (avatarUrl) user.avatarUrl = avatarUrl;

            await user.save();

            // Ghi lại log hoạt động
            await ActivityLog.create({
                userId,
                action: "UPDATE_PROFILE",
                metadata: {
                    message: "Người dùng cập nhật thông tin cá nhân",
                },
                pointBefore: user.points,
                pointChange: 0,
                pointAfter: user.points,
            });

            return success(res, "Cập nhật thông tin thành công", {
                username: user.username,
                avatarUrl: user.avatarUrl,
                provider: user.provider,
            }, 200, req);
        } catch (err) {
            console.error("❌ updateInfo error:", err);
            return error(res, "Không thể cập nhật thông tin", { chiTiet: err.message }, 500, req);
        }
    }

    async getActivityLogs (req, res) {
        try {
            const userId = req.user.id;

            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 10;
            const offset = (page - 1) * pageSize;

            const { count, rows } = await ActivityLog.findAndCountAll({
            where: { userId },
            order: [["createdAt", "DESC"]],
            limit: pageSize,
            offset,
            attributes: [
                "id",
                "action",
                "metadata",
                "pointBefore",
                "pointChange",
                "pointAfter",
                "createdAt",
            ],
        });

        res.json({
            success: true,
            logs: rows,
            pagination: {
                total: count,
                page,
                pageSize,
                totalPages: Math.ceil(count / pageSize),
            },
        });
        } catch (err) {
            console.error("Get activity logs error:", err);
            res.status(500).json({ error: "Không thể lấy lịch sử hoạt động" });
        }
    };

}


module.exports = new AuthController();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { User, ActivityLog } = require("../models");
const { success, error } = require("../helpers/response");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class UserController {
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
                points: 0,
                provider: "local",
            });

            await ActivityLog.create({
                userId: user.id,
                action: "REGISTER_LOCAL",
                metadata: { thongBao: "Người dùng đăng ký bằng email & mật khẩu", email },
                pointBefore: 0,
                pointChange: 0,
                pointAfter: 0,
            });

            return success(res, "Đăng ký người dùng thành công", {
                id: user.id,
                username: user.username,
                email: user.email,
            }, 201, req);
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
            metadata: { thongBao: "Người dùng đăng nhập bằng email & mật khẩu", ip: req.ip, ua: req.headers["user-agent"] },
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
                    points: 0,
                    provider: "google",
                    googleId: sub,
                    avatarUrl: picture,
                });

                await ActivityLog.create({
                    userId: user.id,
                    action: "REGISTER_GOOGLE",
                    metadata: { thongBao: "Người dùng đăng ký bằng Google", email },
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
                metadata: { thongBao: "Người dùng đăng nhập bằng Google", email },
                pointBefore: user.points,
                pointChange: 0,
                pointAfter: user.points,
            });

            return success(res, "Đăng nhập Google thành công", { token: appToken }, 200, req);
        } catch (err) {
            return error(res, "Xác thực Google thất bại", { chiTiet: err.message }, 401, req);
        }
    }

    // Danh sách user
    async index(req, res) {
        const users = await User.findAll({ attributes: ["id", "username", "email", "points", "role", "provider"] });
        return success(res, "Lấy danh sách người dùng thành công", users, 200, req);
    }

    // Chi tiết user
    async show(req, res) {
        const user = await User.findByPk(req.params.id, { attributes: ["id", "username", "email", "points", "role", "provider"] });
        if (!user) return error(res, "Không tìm thấy người dùng", null, 404, req);
        return success(res, "Lấy thông tin người dùng thành công", user, 200, req);
    }

    // Cập nhật user
    async update(req, res) {
        const user = await User.findByPk(req.params.id);
        if (!user) return error(res, "Không tìm thấy người dùng", null, 404, req);

        const oldPoints = user.points;
        await user.update(req.body);

        await ActivityLog.create({
            userId: user.id,
            action: "UPDATE_USER",
            metadata: { thongBao: "Cập nhật thông tin người dùng", capNhat: req.body },
            pointBefore: oldPoints,
            pointChange: user.points - oldPoints,
            pointAfter: user.points,
        });

        return success(res, "Cập nhật người dùng thành công", {
            id: user.id,
            username: user.username,
            email: user.email,
            points: user.points,
            role: user.role,
            provider: user.provider,
        }, 200, req);
    }

    // Xóa user
    async destroy(req, res) {
        const user = await User.findByPk(req.params.id);
        if (!user) return error(res, "Không tìm thấy người dùng", null, 404, req);

        await user.destroy();

        await ActivityLog.create({
            userId: user.id,
            action: "DELETE_USER",
            metadata: { thongBao: "Người dùng đã bị xóa" },
            pointBefore: user.points,
            pointChange: -user.points,
            pointAfter: 0,
        });

        return success(res, "Xóa người dùng thành công", null, 200, req);
    }
}

module.exports = new UserController();

const jwt = require("jsonwebtoken");
const { error } = require("../helpers/response");

function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header) {
        return error(res, "Không tìm thấy token xác thực", null, 401, req);
    }

    try {
        const token = header.split(" ")[1];
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        return error(res, "Token không hợp lệ hoặc đã hết hạn", { token: err.message }, 401, req);
    }
}

module.exports = { authMiddleware };

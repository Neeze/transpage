const { error } = require("../helpers/response");

function adminMiddleware(req, res, next) {
    // Check if authentication was already performed
    if (!req.user) {
        return error(res, "Người dùng chưa được xác thực", null, 401, req);
    }

    // Check user role
    if (req.user.role !== "admin") {
        return error(res, "Truy cập bị từ chối: yêu cầu quyền quản trị viên", null, 403, req);
    }

    next(); // Continue to controller
}

module.exports = { adminMiddleware };

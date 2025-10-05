function buildResponse({
   success,
   message,
   data = null,
   errors = null,
   code = 200,
   req = null
}) {
    return {
        success,
        statusCode: code,
        message,
        data,
        errors,
        meta: {
            timestamp: new Date().toISOString(),
            ...(req && {
                path: req.originalUrl,
                method: req.method,
                requestId: req.id || null, // nếu có middleware gắn requestId
            }),
        },
    };
}

function success(res, message = "Success", data = null, code = 200, req = null) {
    return res.status(code).json(
        buildResponse({ success: true, message, data, code, req })
    );
}

function error(res, message = "Error", errors = null, code = 400, req = null) {
    // errors luôn là object hoặc array, tránh string raw
    const normalizedErrors =
        typeof errors === "string" ? { detail: errors } : errors;

    return res.status(code).json(
        buildResponse({ success: false, message, errors: normalizedErrors, code, req })
    );
}

module.exports = { success, error };

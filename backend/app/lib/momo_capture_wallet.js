/**
 * momo_capture_wallet.js
 * Thư viện MoMo captureWallet - JavaScript thuần (CommonJS), 1 file duy nhất.
 * Tính năng:
 *  - Ký HMAC-SHA256 (request/response) theo chuỗi canonical quy định
 *  - Gọi API /v2/gateway/api/create (requestType=captureWallet)
 *  - Timeout >= 30s, retry/backoff cho lỗi mạng/5xx
 *  - Xác minh chữ ký response
 *  - Log tối giản (mask secrets)
 *
 * Cài đặt:
 *   npm i axios
 *
 * Sử dụng mẫu (xem cuối file):
 *   const client = new MomoClient({...});
 *   const res = await client.createPaymentCaptureWallet({...});
 */

const crypto = require("crypto");
const axios = require("axios");

// --------------------------- Utils ---------------------------

function hmacSHA256Hex(message, secretKey) {
    return crypto.createHmac("sha256", secretKey).update(message, "utf8").digest("hex");
}

function mask(str, visible = 4) {
    if (!str || typeof str !== "string") return str;
    const len = str.length;
    if (len <= visible * 2) return "*".repeat(Math.max(0, len - visible)) + str.slice(-visible);
    return str.slice(0, visible) + "*".repeat(len - visible * 2) + str.slice(-visible);
}

/**
 * Canonical chuỗi ký REQUEST theo đặc tả (sắp xếp theo a→z nhưng dùng TRÌNH TỰ CỐ ĐỊNH để an toàn triển khai).
 * accessKey, amount, extraData, ipnUrl, orderId, orderInfo, partnerCode, redirectUrl, requestId, requestType
 */
function buildRequestCanonical(params) {
    const {
        accessKey = "",
        amount = "",
        extraData = "",
        ipnUrl = "",
        orderId = "",
        orderInfo = "",
        partnerCode = "",
        redirectUrl = "",
        requestId = "",
        requestType = "",
    } = params;

    // Lưu ý: dùng giá trị raw, không URL-encode (trừ khi tài liệu triển khai nội bộ yêu cầu khác)
    return (
        `accessKey=${accessKey}` +
        `&amount=${amount}` +
        `&extraData=${extraData}` +
        `&ipnUrl=${ipnUrl}` +
        `&orderId=${orderId}` +
        `&orderInfo=${orderInfo}` +
        `&partnerCode=${partnerCode}` +
        `&redirectUrl=${redirectUrl}` +
        `&requestId=${requestId}` +
        `&requestType=${requestType}`
    );
}

/**
 * Canonical chuỗi ký RESPONSE theo đặc tả:
 * accessKey, amount, orderId, partnerCode, payUrl, requestId, responseTime, resultCode
 * (Một số tài liệu hiển thị nhầm "&payUrl=&payUrl"; triển khai thực tế: chỉ 1 lần payUrl.)
 */
function buildResponseCanonical(params) {
    const {
        accessKey = "",
        amount = "",
        orderId = "",
        partnerCode = "",
        payUrl = "",
        requestId = "",
        responseTime = "",
        resultCode = "",
    } = params;

    return (
        `accessKey=${accessKey}` +
        `&amount=${amount}` +
        `&orderId=${orderId}` +
        `&partnerCode=${partnerCode}` +
        `&payUrl=${payUrl}` +
        `&requestId=${requestId}` +
        `&responseTime=${responseTime}` +
        `&resultCode=${resultCode}`
    );
}

/**
 * Hỗ trợ encode base64 cho extraData từ object JSON (ví dụ {"username":"momo","skus":"a,b"})
 */
function toExtraDataBase64(jsonObj) {
    if (jsonObj == null) return "";
    const raw = JSON.stringify(jsonObj);
    return Buffer.from(raw, "utf8").toString("base64");
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// --------------------------- MomoClient ---------------------------

class MomoClient {
    /**
     * @param {Object} config
     * @param {string} config.endpoint - ví dụ: https://test-payment.momo.vn
     * @param {string} config.partnerCode
     * @param {string} config.accessKey
     * @param {string} config.secretKey
     * @param {number} [config.timeoutMs=35000]
     * @param {number} [config.retries=2]
     * @param {number} [config.retryBackoffMs=500]
     */
    constructor(config) {
        if (!config || !config.endpoint || !config.partnerCode || !config.accessKey || !config.secretKey) {
            throw new Error("MomoClient: Thiếu cấu hình bắt buộc (endpoint, partnerCode, accessKey, secretKey).");
        }
        this.config = {
            endpoint: config.endpoint.replace(/\/+$/, ""), // strip trailing slashes
            partnerCode: config.partnerCode,
            accessKey: config.accessKey,
            secretKey: config.secretKey,
            timeoutMs: typeof config.timeoutMs === "number" ? Math.max(config.timeoutMs, 30000) : 35000,
            retries: typeof config.retries === "number" ? config.retries : 2,
            retryBackoffMs: typeof config.retryBackoffMs === "number" ? config.retryBackoffMs : 500,
        };

        this.http = axios.create({
            baseURL: this.config.endpoint,
            timeout: this.config.timeoutMs,
            headers: { "Content-Type": "application/json" },
            // Không tự động transform encode vì chúng ta ký theo raw string đã canonical
            transformRequest: [(data) => JSON.stringify(data)],
        });
    }

    // --------------------- Public API ---------------------

    /**
     * Tạo yêu cầu captureWallet (create) để lấy payUrl/deeplink/qrCodeUrl.
     * @param {Object} payload
     * @param {string} payload.requestId - idempotency key, duy nhất mỗi request
     * @param {string} payload.orderId
     * @param {number} payload.amount - 1,000 ≤ amount ≤ 50,000,000 (VND)
     * @param {string} payload.orderInfo
     * @param {string} payload.redirectUrl
     * @param {string} payload.ipnUrl
     * @param {string} [payload.extraData] - base64 JSON (ưu tiên dùng util toExtraDataBase64)
     * @param {string} [payload.subPartnerCode]
     * @param {string} [payload.storeName]
     * @param {string} [payload.storeId]
     * @param {number} [payload.orderGroupId]
     * @param {Array<Object>} [payload.items]
     * @param {Object} [payload.deliveryInfo]
     * @param {Object} [payload.userInfo]
     * @param {string} [payload.referenceId]
     * @param {boolean} [payload.autoCapture] - default true tại MoMo
     * @param {"vi"|"en"} [payload.lang]
     */
    async createPaymentCaptureWallet(payload) {
        this.#validateCreatePayload(payload);

        const requestType = "captureWallet";
        const body = {
            partnerCode: this.config.partnerCode,
            requestId: String(payload.requestId),
            orderId: String(payload.orderId),
            amount: Number(payload.amount),
            orderInfo: String(payload.orderInfo),
            redirectUrl: String(payload.redirectUrl),
            ipnUrl: String(payload.ipnUrl),
            requestType,
            // Optional:
            subPartnerCode: payload.subPartnerCode,
            storeName: payload.storeName,
            storeId: payload.storeId,
            orderGroupId: payload.orderGroupId,
            extraData: payload.extraData || "",
            items: payload.items,
            deliveryInfo: payload.deliveryInfo,
            userInfo: payload.userInfo,
            referenceId: payload.referenceId,
            autoCapture: payload.autoCapture,
            lang: payload.lang,
        };

        // Ký chữ ký request theo canonical quy định
        const canonical = buildRequestCanonical({
            accessKey: this.config.accessKey,
            amount: body.amount,
            extraData: body.extraData || "",
            ipnUrl: body.ipnUrl,
            orderId: body.orderId,
            orderInfo: body.orderInfo,
            partnerCode: body.partnerCode,
            redirectUrl: body.redirectUrl,
            requestId: body.requestId,
            requestType: body.requestType,
        });
        const signature = hmacSHA256Hex(canonical, this.config.secretKey);
        body.signature = signature;

        this.#logDebug("Request canonical (masked): " + this.#maskCanonical(canonical));
        this.#logInfo(`createPaymentCaptureWallet -> orderId=${body.orderId}, requestId=${body.requestId}, amount=${body.amount}`);

        const urlPath = "/v2/gateway/api/create";
        const res = await this.#postWithRetry(urlPath, body);

        // Xác minh chữ ký response (nếu có signature)
        if (res && res.data && typeof res.data === "object" && res.data.signature) {
            const r = res.data;
            const respCanonical = buildResponseCanonical({
                accessKey: this.config.accessKey,
                amount: r.amount ?? "",
                orderId: r.orderId ?? "",
                partnerCode: r.partnerCode ?? "",
                payUrl: r.payUrl ?? "",
                requestId: r.requestId ?? "",
                responseTime: r.responseTime ?? "",
                resultCode: r.resultCode ?? "",
            });
            const expected = hmacSHA256Hex(respCanonical, this.config.secretKey);
            const ok = this.timingSafeEqualHex(expected, r.signature);
            if (!ok) {
                this.#logWarn("Response signature verification FAILED.");
                throw new Error("MoMo response signature invalid.");
            }
        } else {
            this.#logWarn("Response missing signature; skipping verification.");
        }

        // Kiểm tra business result
        const resultCode = res?.data?.resultCode;
        if (typeof resultCode === "number" && resultCode !== 0) {
            const message = res?.data?.message || "MoMo returned non-zero resultCode";
            this.#logWarn(`MoMo resultCode=${resultCode}, message="${message}"`);
        }

        return res?.data;
    }

    /**
     * Timing-safe so sánh chữ ký hex.
     */
    timingSafeEqualHex(a, b) {
        if (typeof a !== "string" || typeof b !== "string") return false;
        const ba = Buffer.from(a, "hex");
        const bb = Buffer.from(b, "hex");
        if (ba.length !== bb.length) return false;
        return crypto.timingSafeEqual(ba, bb);
    }

    // --------------------- Private helpers ---------------------

    #validateCreatePayload(p) {
        const required = ["requestId", "orderId", "amount", "orderInfo", "redirectUrl", "ipnUrl"];
        for (const k of required) {
            if (p[k] === undefined || p[k] === null || p[k] === "") {
                throw new Error(`createPaymentCaptureWallet: Thiếu trường bắt buộc "${k}".`);
            }
        }
        if (typeof p.amount !== "number" || !Number.isFinite(p.amount)) {
            throw new Error("createPaymentCaptureWallet: amount phải là số.");
        }
        if (p.amount < 1000 || p.amount > 50000000) {
            throw new Error("createPaymentCaptureWallet: amount phải trong khoảng [1,000; 50,000,000] VND.");
        }
    }

    async #postWithRetry(path, body) {
        const url = this.config.endpoint + path;
        const maxAttempts = 1 + Math.max(0, this.config.retries);
        let attempt = 0;
        let lastErr;

        while (attempt < maxAttempts) {
            try {
                attempt++;
                const resp = await this.http.post(url, body);
                return resp;
            } catch (err) {
                lastErr = err;
                const status = err?.response?.status;
                const retriable =
                    !status || (status >= 500 && status <= 599); // network/5xx thì retry
                this.#logWarn(
                    `POST ${path} attempt ${attempt}/${maxAttempts} failed: ${
                        status || err.code || err.message
                    }`
                );

                if (attempt >= maxAttempts || !retriable) {
                    break;
                }
                const delay = this.config.retryBackoffMs * attempt;
                await sleep(delay);
            }
        }
        throw lastErr || new Error(`Request failed after ${maxAttempts} attempts`);
    }

    #maskCanonical(canonical) {
        // Mask accessKey, partnerCode nếu có mặt trong chuỗi
        const masked = canonical
            .replace(/accessKey=([^&]+)/, (_, v) => `accessKey=${mask(v)}`)
            .replace(/partnerCode=([^&]+)/, (_, v) => `partnerCode=${mask(v)}`);
        return masked;
    }

    #logInfo(msg) {
        console.log(`[MoMo][INFO] ${msg}`);
    }
    #logWarn(msg) {
        console.warn(`[MoMo][WARN] ${msg}`);
    }
    #logDebug(msg) {
        // Có thể bật/tắt theo ENV
        if (process.env.MOMO_DEBUG === "1") console.debug(`[MoMo][DEBUG] ${msg}`);
    }
}

/**
 * Kiểm tra hợp lệ dữ liệu redirectUrl hoặc IPN từ MoMo.
 * Dành cho server-side validation.
 */

function buildIpnCanonical(params, accessKey) {
    const {
        amount = "",
        extraData = "",
        message = "",
        orderId = "",
        orderInfo = "",
        orderType = "",
        partnerCode = "",
        payType = "",
        requestId = "",
        responseTime = "",
        resultCode = "",
        transId = "",
    } = params;
    return (
        `accessKey=${accessKey}` +
        `&amount=${amount}` +
        `&extraData=${extraData}` +
        `&message=${message}` +
        `&orderId=${orderId}` +
        `&orderInfo=${orderInfo}` +
        `&orderType=${orderType}` +
        `&partnerCode=${partnerCode}` +
        `&payType=${payType}` +
        `&requestId=${requestId}` +
        `&responseTime=${responseTime}` +
        `&resultCode=${resultCode}` +
        `&transId=${transId}`
    );
}

/**
 * ✅ Validate redirectUrl query hoặc body IPN từ MoMo.
 * @param {Object} momoData - object chứa các trường từ MoMo (req.query hoặc req.body)
 * @param {Object} options - { accessKey, secretKey }
 * @returns {{ valid: boolean, reason?: string }}
 */
function validateMomoCallback(query, { accessKey, secretKey }) {
    try {
        const {
            amount,
            extraData,
            message,
            orderId,
            orderInfo,
            orderType,
            partnerCode,
            payType = "",
            requestId,
            responseTime,
            resultCode,
            transId,
            signature,
        } = query;

        const rawSignature =
            `accessKey=${accessKey}` +
            `&amount=${amount}` +
            `&extraData=${extraData || ""}` +
            `&message=${message || ""}` +
            `&orderId=${orderId}` +
            `&orderInfo=${orderInfo}` +
            `&orderType=${orderType}` +
            `&partnerCode=${partnerCode}` +
            `&payType=${payType}` +
            `&requestId=${requestId}` +
            `&responseTime=${responseTime}` +
            `&resultCode=${resultCode}` +
            `&transId=${transId}`;

        const crypto = require("crypto");
        const computed = crypto
            .createHmac("sha256", secretKey)
            .update(rawSignature)
            .digest("hex");

        const valid = computed === signature;
        return valid
            ? { valid: true }
            : { valid: false, reason: "Invalid signature" };
    } catch (err) {
        return { valid: false, reason: err.message };
    }
}

/**
 * ✅ Validate redirectUrl (truyền từ req.query) – thường giống IPN.
 * @param {Object} query - req.query từ redirect URL của MoMo
 * @param {Object} options - { accessKey, secretKey }
 */
function validateRedirectParams(query, { accessKey, secretKey }) {
    return validateMomoCallback(query, { accessKey, secretKey });
}

module.exports = {
    MomoClient,
    toExtraDataBase64,
    // Các hàm dưới đây export để test/kiểm thử nếu cần
    _internals: {
        hmacSHA256Hex,
        buildRequestCanonical,
        buildResponseCanonical,
    },
    validateMomoCallback,
    validateRedirectParams
};

/**
 * Ví dụ sử dụng (chạy riêng):
 *
 * (async () => {
 *   const client = new MomoClient({
 *     endpoint: process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn",
 *     partnerCode: process.env.MOMO_PARTNER_CODE || "yourPartner",
 *     accessKey: process.env.MOMO_ACCESS_KEY || "yourAccess",
 *     secretKey: process.env.MOMO_SECRET_KEY || "yourSecret",
 *     timeoutMs: 35000,
 *     retries: 2,
 *     retryBackoffMs: 600,
 *   });
 *
 *   const extra = toExtraDataBase64({ username: "momo", skus: "value1,value2" });
 *
 *   const res = await client.createPaymentCaptureWallet({
 *     requestId: "req-" + Date.now(),
 *     orderId: "order-" + Date.now(),
 *     amount: 100000, // 100,000 VND
 *     orderInfo: "Thanh toan don hang #123",
 *     redirectUrl: "https://merchant.example.com/return",
 *     ipnUrl: "https://merchant.example.com/ipn",
 *     extraData: extra,
 *     lang: "vi",
 *     // autoCapture: true,
 *     // items: [...],
 *     // userInfo: {...},
 *   });
 *
 *   console.log("MoMo response:", res);
 * })().catch(console.error);
 */

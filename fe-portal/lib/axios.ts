import axios from "axios";

// ✅ Lấy BASE URL từ biến môi trường
const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL + "/api";

const api = axios.create({
    baseURL,
    timeout: 30000,
});

// ✅ Interceptor gửi token Authorization
api.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Interceptor xử lý lỗi 401 → logout
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window !== "undefined" && error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/auth";
        }
        return Promise.reject(error);
    }
);

export default api;

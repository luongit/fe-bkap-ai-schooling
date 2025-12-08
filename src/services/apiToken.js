import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "",
  withCredentials: true
});

// GỬI TOKEN TRƯỚC REQUEST
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

// XỬ LÝ TOKEN HẾT HẠN
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // --- KIỂM TRA 401 ---
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const remember = localStorage.getItem("rememberMe") === "true";
      const refreshToken = localStorage.getItem("refreshToken");

      //  CASE 1: No REMEMBER → không refresh → logout
      if (!remember) {
        toast.warning("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/auth/login";
        return Promise.reject(error);
      }

      //  CASE 2: Tick REMEMBER → refresh token
      if (remember && refreshToken) {
        try {
          const res = await axios.post(
            `${process.env.REACT_APP_API_URL}/auth/refresh`,
            { refreshToken },
            { headers: { "Content-Type": "application/json" } }
          );

          if (res.data.accessToken) {
            // Lưu token mới
            localStorage.setItem("token", res.data.accessToken);
            localStorage.setItem("refreshToken", res.data.refreshToken);

            // Retry request cũ
            originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;

            toast.info("Phiên đăng nhập đã được làm mới !");
            return api(originalRequest);
          }
        } catch (refreshError) {
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

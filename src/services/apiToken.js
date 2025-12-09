import axios from "axios";
import { toast } from "react-toastify";

// Backend URL mặc định
const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // gửi cookie refresh_token
});

// Trước mỗi request → gắn accessToken
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

// Xử lý token hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;


    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        // Gọi refresh → backend tự dùng refresh_token trong cookie
        const res = await axios.post(`${API_URL}/auth/refresh`, {}, {
          withCredentials: true,
        });

        const newToken = res.data.accessToken;
        if (newToken) {
          localStorage.setItem("token", newToken);
          original.headers.Authorization = `Bearer ${newToken}`;

          return api(original);
        }

      } catch (e) {
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");

        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

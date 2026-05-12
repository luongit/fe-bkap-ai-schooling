import axios from "axios";
import { toast } from "react-toastify";

// Backend URL mặc định
const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // gửi cookie refresh_token
});

/**
 * Lấy token từ localStorage (hỗ trợ cả dạng string và object user)
 */
const getToken = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const userObj = JSON.parse(userStr);
      const t = userObj.accessToken || userObj.token;
      if (t) return t;
    } catch (e) {}
  }

  const tokenStr = localStorage.getItem("token");
  if (tokenStr) {
    try {
      const tokenObj = JSON.parse(tokenStr);
      return tokenObj.accessToken || tokenObj.token || tokenStr;
    } catch (e) {
      return tokenStr;
    }
  }

  return localStorage.getItem("access_token") || "";
};

/**
 * Cập nhật lại token mới vào localStorage
 */
const updateLocalToken = (newToken) => {
  localStorage.setItem("token", newToken);
  
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const userObj = JSON.parse(userStr);
      userObj.accessToken = newToken; // Đồng bộ vào user object
      localStorage.setItem("user", JSON.stringify(userObj));
    } catch (e) {}
  }
};

// Trước mỗi request → gắn accessToken
api.interceptors.request.use((config) => {
  const token = getToken();
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

        const newToken = res.data.accessToken || res.data.token;
        if (newToken) {
          updateLocalToken(newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }

      } catch (e) {
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");

        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

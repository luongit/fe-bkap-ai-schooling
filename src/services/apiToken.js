import axios from "axios";
import { toast } from "react-toastify";


const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});


// GẮN ACCESS TOKEN TỰ ĐỘNG TRƯỚC MỖI REQUEST

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // 👈 FE dùng key "token"
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


//  XỬ LÝ TOKEN HẾT HẠN (401) → TỰ ĐỘNG REFRESH

api.interceptors.response.use(
  (response) => response, //  OK -> Trả về luôn
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 mà chưa retry thì thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        toast.warning("⚠️ Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        localStorage.clear();
        window.location.href = "/auth/login";
        return Promise.reject(error);
      }

      try {

        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/refresh`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        if (res.data.accessToken) {

          localStorage.setItem("token", res.data.accessToken);
          localStorage.setItem("refreshToken", res.data.refreshToken);

          // Gắn token mới vào request cũ và gửi lại
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          toast.info("🔄 Phiên đăng nhập đã được làm mới tự động vui lòng tải lại trang");
          return api(originalRequest);
        } else {
          throw new Error("Không nhận được token mới từ server");
        }
      } catch (refreshError) {
        //  Refresh thất bại -> đăng xuất
        console.error("Lỗi refresh token:", refreshError);
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        localStorage.clear();
        window.location.href = "/auth/login";
      }
    }

    // Nếu lỗi khác hoặc refresh thất bại -> reject
    return Promise.reject(error);
  }
);

export default api;

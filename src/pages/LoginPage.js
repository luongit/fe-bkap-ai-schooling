import { useState, useEffect } from "react";
import { login } from "../services/authService";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  // Detect môi trường
  const isLocal = window.location.hostname === "localhost";

  // Backend URL tương ứng DEV / PROD
  const GOOGLE_LOGIN_URL = isLocal
    ? "http://localhost:8080/api/auth/google"
    : "https://bkapai.vn/api/auth/google";

  // API me để lấy user info sau khi login Google
  const API_ME = isLocal
    ? "http://localhost:8080/api/auth/me"
    : "https://bkapai.vn/api/auth/me";

  // =============================
  // Xử lý login thủ công
  // =============================
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await login(identifier, password, rememberMe);

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("username", data.username);
      localStorage.setItem("user", JSON.stringify(data));

      window.location.href = "/";
    } catch (error) {
      setError("Sai tài khoản hoặc mật khẩu");
    }
  };

  // =============================
  // Nhận token từ Google Redirect
  // =============================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);

      fetch(API_ME, {
        headers: { Authorization: "Bearer " + token },
      })
        .then((res) => res.json())
        .then((user) => {
          localStorage.setItem("username", user.username);
          localStorage.setItem("email", user.email);
          localStorage.setItem("userId", user.id);
          localStorage.setItem("user", JSON.stringify(user));

          window.location.href = "/";
        })
        .catch(() => setError("Lỗi đăng nhập Google"));
    }
  }, []);

  // =============================
  // Xử lý nút Login Google
  // =============================
  const handleGoogleLogin = () => {
    window.location.href = GOOGLE_LOGIN_URL;
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Email hoặc Username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <label className="flex items-center mb-4 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="mr-2"
          />
          Ghi nhớ đăng nhập
        </label>

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Đăng nhập
        </button>

        <div className="my-4 text-center text-gray-500">Hoặc</div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 flex items-center justify-center gap-2"
        >
          <i className="fab fa-google"></i> Đăng nhập bằng Google
        </button>
      </form>
    </div>
  );
}

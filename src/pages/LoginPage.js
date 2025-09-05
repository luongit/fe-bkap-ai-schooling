import { useState } from "react";
import { login } from "../services/authService";

export default function LoginPage(){
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const data = await login(identifier, password);

    // Lưu token + user info vào localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);       
    localStorage.setItem("username", data.username); // tiện cho Header
    localStorage.setItem("user", JSON.stringify(data));

    window.location.href = "/";
  } catch (error) {
    setError("Sai tài khoản hoặc mật khẩu");
  }
};

    return (
         <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow-md w-96"
      >
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

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Đăng nhập
        </button>
      </form>
    </div>
    );
}
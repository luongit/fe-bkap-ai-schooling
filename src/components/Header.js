import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy thông tin từ localStorage
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("username");

    if (token) {
      setIsLoggedIn(true);
      if (user) setUsername(user);
    }
  }, []);

  const handleLogout = () => {
    // Xóa thông tin đăng nhập
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");

    // Xóa dữ liệu chat tạm thời
    sessionStorage.removeItem("chatHistory");
    sessionStorage.removeItem("sessionId");

    setIsLoggedIn(false);
    navigate("/");
    window.location.reload(); // reload để cập nhật header ngay
  };

  return (
    <header className="header">
      <button className="burger" id="burger" aria-label="Mở menu">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M4 7h16M4 12h12M4 17h16"
            stroke="#4b5563"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="title">AI Spark - đồng hành cùng bạn</div>
      <div className="actions">
        {!isLoggedIn ? (
          <>
            <Link to="/login" className="btn">
              Đăng nhập
            </Link>
            <Link to="/register" className="btn primary">
              Tạo tài khoản miễn phí
            </Link>
          </>
        ) : (
          <>
            <Link to="/profile" className="btn">
              Tài khoản của bạn 
            </Link>
            <button className="btn primary" onClick={handleLogout}>
              Đăng xuất
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;

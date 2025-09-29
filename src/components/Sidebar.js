
import { useEffect, useState } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import {
  FiMessageCircle,
  FiSearch,
  FiBookOpen,
  FiEdit3,
  FiPlus,
  FiDownload,
  FiClock,
  FiHelpCircle,
  FiLogIn,
  FiUserPlus,
  FiLogOut,
  FiUser,
  FiChevronDown,
} from "react-icons/fi";
import "./css/Sidebar.css";

const API_URL = process.env.REACT_APP_API_URL || "";

function Sidebar({ className }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const { sessionId } = useParams();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("username");
    if (token) {
      setIsLoggedIn(true);
      if (user) setUsername(user);
    }
  }, []);

  const fetchSessions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/conversations/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setSessions(data);
      } else {
        console.warn("Data is not an array:", data);
        setSessions([]);
      }
    } catch (err) {
      console.error("Load sessions error:", err);
      toast.error("Không thể tải lịch sử. Vui lòng thử lại sau!");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    window.addEventListener("sessionUpdated", fetchSessions);
    window.addEventListener("writingSessionUpdated", fetchSessions);
    return () => {
      window.removeEventListener("sessionUpdated", fetchSessions);
      window.removeEventListener("writingSessionUpdated", fetchSessions);
    };
  }, []);

  const startNewChat = () => {
    sessionStorage.removeItem("chatHistory");
    sessionStorage.removeItem("sessionId");
    window.dispatchEvent(new Event("newChat"));
    navigate("/");
  };

  const deleteSession = async (sessionId) => {
    if (!window.confirm("Xác nhận xóa cuộc trò chuyện này?")) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/conversations/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        toast.success("Đã xóa cuộc trò chuyện!");
        fetchSessions();
        window.dispatchEvent(new Event("sessionUpdated"));
        window.dispatchEvent(new Event("writingSessionUpdated"));
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (err) {
      console.error("Delete session error:", err);
      toast.error("Lỗi khi xóa, vui lòng thử lại!");
    }
  };

  const showComingSoon = () => {
    const toastId = "comingSoon";
    if (!toast.isActive(toastId)) {
      toast.info("Tính năng đang được phát triển, mời bạn quay lại sau!", {
        toastId,
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    sessionStorage.removeItem("chatHistory");
    sessionStorage.removeItem("sessionId");
    sessionStorage.removeItem("writingHistory");
    sessionStorage.removeItem("writingSessionId");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("userLoggedOut"));
    navigate("/");
  };

  return (
    <aside className={`sidebar ${className}`}>
      <div className="side-head">
        <Link to="/" className="logo">
          AI
        </Link>
        <div>
          <div className="brand-name">Schooling Hub</div>
          <div className="small-name">Học tập thông minh</div>
        </div>
      </div>

      <nav className="side-list">
        <button
          onClick={startNewChat}
          className="side-item w-full text-left flex items-center gap-2"
        >
          <span className="relative">
            <HiOutlineChatAlt2 className="sidebar-icon" />
          </span>
          <span>Chat mới</span>
        </button>
        <button
          onClick={showComingSoon}
          className="side-item w-full text-left"
        >
          <FiSearch className="sidebar-icon" />
          <span>Tìm kiếm AI</span>
        </button>
        <button
          onClick={showComingSoon}
          className="side-item w-full text-left"
        >
          <FiBookOpen className="sidebar-icon" />
          <span>Giải bài tập</span>
        </button>
        <NavLink
          to="/writing"
          onClick={() => {
            sessionStorage.removeItem("writingHistory");
            sessionStorage.removeItem("writingSessionId");
            window.dispatchEvent(new Event("newWriting"));
          }}
          className={({ isActive }) =>
            `side-item w-full text-left flex items-center gap-2 ${isActive ? "bg-gray-200 text-gray-800 font-semibold" : ""
            }`
          }
        >
          <FiEdit3 className="sidebar-icon" />
          <span>Viết văn AI</span>
        </NavLink>

        <button
          onClick={showComingSoon}
          className="side-item w-full text-left"
        >
          <FiMessageCircle className="sidebar-icon" />
          <span>Trợ Lý Ảo</span>
        </button>
        <button
          onClick={showComingSoon}
          className="side-item w-full text-left"
        >
          <FiPlus className="sidebar-icon" />
          <span>Thêm công cụ</span>
        </button>
        <button
          onClick={showComingSoon}
          className="side-item w-full text-left"
        >
          <FiDownload className="sidebar-icon" />
          <span>Tải ứng dụng</span>
        </button>
      </nav>

      <div className="side-note">Lịch sử</div>
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="side-item w-full text-left flex justify-between"
      >
        <div className="flex items-center gap-2">
          <FiClock className="sidebar-icon" />
          <span>Xem lịch sử</span>
        </div>
        <FiChevronDown className="sidebar-icon" />
      </button>
      {showHistory && (
        <ul className="side-list mt-2 pl-6">
          {loading ? (
            <li className="side-item text-gray-400 italic">Đang tải...</li>
          ) : sessions.length > 0 ? (
            sessions.map((s) => (
              <li key={s.sessionId} className="side-item relative">
                <NavLink
                  to={`/chat/${s.sessionId}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2 flex-1 overflow-hidden px-2 py-1 rounded-md transition ${isActive ? "bg-gray-200 text-gray-800 font-semibold" : "text-gray-700 hover:bg-gray-100 hover:text-gray-800"
                    }`
                  }
                >
                  <span className="truncate max-w-[150px]">
                    {s.previewMessage || s.sessionId}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
                    {s.updatedAt
                      ? new Date(s.updatedAt).toLocaleDateString("vi-VN")
                      : ""}
                  </span>
                </NavLink>
              </li>
            ))
          ) : (
            <li className="side-item text-gray-400 italic">Chưa có lịch sử chat</li>
          )}
        </ul>
      )}

      <div className="side-note">Khác</div>
      <button
        onClick={showComingSoon}
        className="side-item w-full text-left"
      >
        <FiHelpCircle className="sidebar-icon" />
        <span>Trợ giúp</span>
      </button>

      <div className="mt-auto pt-4">
        <div className="side-note">Tài khoản</div>
        {!isLoggedIn ? (
          <>
            <a
              href="/auth/login"
              className="side-item w-full text-left flex items-center space-x-2"
            >
              <FiLogIn className="sidebar-icon" />
              <span>Đăng nhập</span>
            </a>
            <Link
              to="/register"
              className="side-item w-full text-left flex items-center space-x-2"
            >
              <FiUserPlus className="sidebar-icon" />
              <span>Tạo tài khoản</span>
            </Link>
            {/* <Link
              to="/login"
              className="side-item w-full text-left flex items-center space-x-2"
            >
              <FiUserPlus className="sidebar-icon" />
              <span>Tạo tài khoản</span>
            </Link> */}
          </>
        ) : (
          <>
            <Link
              to="/profile"
              className="side-item w-full text-left flex items-center space-x-2"
            >
              <FiUser className="sidebar-icon" />
              <span>Hồ sơ</span>
            </Link>
            <button
              onClick={handleLogout}
              className="side-item w-full text-left flex items-center space-x-2 text-red-500 hover:text-red-600"
            >
              <FiLogOut className="sidebar-icon" />
              <span>Đăng xuất</span>
            </button>
          </>
        )}
      </div>
      <ToastContainer />
    </aside>
  );
}

export default Sidebar;

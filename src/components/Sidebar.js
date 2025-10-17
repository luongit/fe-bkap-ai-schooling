import { useEffect, useState } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
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
  FiLogIn,
  FiUserPlus,
  FiLogOut,
  FiUser,
  FiChevronDown,
  FiChevronLeft,
  FiMoreVertical,
  FiTrash2,
  FiImage,
  FiVideo,
} from "react-icons/fi";
import "./css/Sidebar.css";
import "../style/chat.css";

const API_URL = process.env.REACT_APP_API_URL || "";

function Sidebar({ className, isOpen, onToggleSidebar }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showSessionMenu, setShowSessionMenu] = useState({});
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const { sessionId } = useParams();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 920);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("username");
    if (token) {
      setIsLoggedIn(true);
      if (user) setUsername(user);
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    setShowMenu(false);
    setShowToolsMenu(false);
    setShowSessionMenu({});
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 920;
      setIsMobile(mobile);
      if (mobile) setShowHistory(true); // Luôn hiển thị lịch sử trên mobile
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
      if (!isMobile) {
        toast.error("Không thể tải lịch sử. Vui lòng thử lại sau!", {
          toastId: "fetchSessionsError",
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      }
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
    if (isMobile && typeof onToggleSidebar === "function") onToggleSidebar();
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
        if (!isMobile) {
          toast.success("Đã xóa cuộc trò chuyện!", {
            toastId: `deleteSessionSuccess_${sessionId}`,
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
        }
        fetchSessions();
        window.dispatchEvent(new Event("sessionUpdated"));
        window.dispatchEvent(new Event("writingSessionUpdated"));
        setShowSessionMenu((prev) => ({ ...prev, [sessionId]: false }));
        if (isMobile && typeof onToggleSidebar === "function") onToggleSidebar();
        navigate("/");
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (err) {
      console.error("Delete session error:", err);
      if (!isMobile) {
        toast.error("Lỗi khi xóa, vui lòng thử lại!", {
          toastId: `deleteSessionError_${sessionId}`,
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      }
    }
  };

  const showComingSoon = () => {
    const toastId = "comingSoon";
    if (!toast.isActive(toastId) && !isMobile) {
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
    sessionStorage.removeItem("imageHistory");
    sessionStorage.removeItem("videoHistory");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("userLoggedOut"));
    window.location.href = "/";
    setShowMenu(false);
    if (isMobile && typeof onToggleSidebar === "function") onToggleSidebar();
  };

  const renderIconOnly = (Icon, text) => {
    return (
      <div className="flex flex-col items-center gap-1">
        <Icon className="sidebar-icon" />
        {isCollapsed ? null : <span className="text-xs">{text}</span>}
      </div>
    );
  };

  const renderNavItem = (Icon, label, onClick) => (
    <button
      onClick={() => {
        onClick();
        if (isMobile && typeof onToggleSidebar === "function") onToggleSidebar();
      }}
      className={`side-item w-full flex items-center gap-2 ${isCollapsed ? "justify-center" : ""}`}
    >
      <Icon className="sidebar-icon" />
      {!isCollapsed && <span className="text-sm">{label}</span>}
    </button>
  );

  const startNewImageGeneration = () => {
    sessionStorage.removeItem("imageHistory");
    window.dispatchEvent(new Event("newImageGeneration"));
    navigate("/generate-image");
    if (isMobile && typeof onToggleSidebar === "function") onToggleSidebar();
  };

  const startNewVideoGeneration = () => {
    sessionStorage.removeItem("videoHistory");
    window.dispatchEvent(new Event("newVideoGeneration"));
    navigate("/generate-video");
    if (isMobile && typeof onToggleSidebar === "function") onToggleSidebar();
  };

  return (
    <>
      <button
        className={`sidebar-dragbars ${isOpen ? "open" : ""}`}
        onClick={() => {
          console.log("Dragbars clicked, calling onToggleSidebar");
          if (typeof onToggleSidebar === "function") onToggleSidebar();
        }}
      >
        <div className="bar top"></div>
        <div className="bar bottom"></div>
      </button>
      <div className={`sidebar-overlay ${isOpen ? "show" : ""}`} onClick={() => {
        if (typeof onToggleSidebar === "function") onToggleSidebar();
      }}></div>
      <aside className={`sidebar ${className} ${isOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}>
        <div className="logo-container" onClick={() => {
          navigate("/");
          if (isMobile && typeof onToggleSidebar === "function") onToggleSidebar();
        }}>
          <img src="/logo.jpg" alt="Logo" className="logo-img" />
          {!isCollapsed && <span className="logo-text">BKAP</span>}
        </div>
        <nav className="side-list">
          {renderNavItem(HiOutlineChatAlt2, "Chat mới", startNewChat)}
          <NavLink
            to="/writing"
            onClick={() => {
              sessionStorage.removeItem("writingHistory");
              sessionStorage.removeItem("writingSessionId");
              window.dispatchEvent(new Event("newWriting"));
              if (isMobile && typeof onToggleSidebar === "function") onToggleSidebar();
            }}
            className={({ isActive }) =>
              `side-item w-full flex items-center gap-2 transition-all duration-200 ${
                isActive ? "bg-gray-200 text-gray-800 font-semibold" : ""
              } ${isCollapsed ? "justify-center" : "justify-start"}`
            }
          >
            <FiEdit3 className="sidebar-icon" />
            {!isCollapsed && <span className="text-sm">Viết văn AI</span>}
          </NavLink>
          {renderNavItem(FiSearch, "Tìm kiếm AI", showComingSoon)}
          {renderNavItem(FiBookOpen, "Giải bài tập", showComingSoon)}
          {renderNavItem(FiMessageCircle, "Trợ Lý Ảo", showComingSoon)}
          <div
            className="side-item w-full flex items-center gap-2 relative"
            onMouseEnter={() => !isMobile && !isCollapsed && setShowToolsMenu(true)}
            onMouseLeave={() => !isMobile && !isCollapsed && setShowToolsMenu(false)}
            onClick={() => isMobile && !isCollapsed && setShowToolsMenu(!showToolsMenu)}
          >
            <FiPlus className="sidebar-icon" />
            {!isCollapsed && <span className="text-sm">Thêm công cụ</span>}
            {!isCollapsed && showToolsMenu && (
              <div className={`tools-menu ${showToolsMenu ? "show" : ""}`}>
                <div className="tools-menu-header">Tất cả công cụ</div>
                <div className="tools-menu-items">
                  <NavLink
                    to="/generate-image"
                    onClick={() => {
                      startNewImageGeneration();
                      setShowToolsMenu(false);
                      if (isMobile && typeof onToggleSidebar === "function") onToggleSidebar();
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2 py-1 rounded-md transition ${
                        isActive ? "bg-gray-200 text-gray-800 font-semibold" : "text-gray-700 hover:bg-gray-100 hover:text-gray-800"
                      }`
                    }
                  >
                    <FiImage className="sidebar-icon w-4 h-4" />
                    <span>Tạo Ảnh AI</span>
                  </NavLink>
                  <NavLink
                    to="/generate-video"
                    onClick={() => {
                      startNewVideoGeneration();
                      setShowToolsMenu(false);
                      if (isMobile && typeof onToggleSidebar === "function") onToggleSidebar();
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2 py-1 rounded-md transition ${
                        isActive ? "bg-gray-200 text-gray-800 font-semibold" : "text-gray-700 hover:bg-gray-100 hover:text-gray-800"
                      }`
                    }
                  >
                    <FiVideo className="sidebar-icon w-4 h-4" />
                    <span>Tạo Video AI</span>
                  </NavLink>
                </div>
              </div>
            )}
          </div>
          {renderNavItem(FiDownload, "Tải ứng dụng", showComingSoon)}
        </nav>
        {!isCollapsed && (
          <>
            <div className="side-note">Lịch sử</div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="side-item w-full text-left flex justify-between"
            >
              <div className="flex items-center gap-2">
                <FiClock className="sidebar-icon" />
                <span>Xem lịch sử</span>
              </div>
              <FiChevronDown
                className={`sidebar-icon transition-transform ${showHistory ? "rotate-180" : ""}`}
              />
            </button>
            {showHistory && (
              <ul className={`history-list ${showHistory ? "show" : ""}`}>
                {loading ? (
                  <li className="side-item text-gray-400 italic">Đang tải...</li>
                ) : sessions.length > 0 ? (
                  sessions.map((s) => (
                    <li key={s.sessionId} className="side-item relative">
                      <NavLink
                        to={`/chat/${s.sessionId}`}
                        onClick={() => {
                          if (isMobile && typeof onToggleSidebar === "function") onToggleSidebar();
                        }}
                        className={({ isActive }) =>
                          `flex items-center gap-2 flex-1 overflow-hidden px-2 py-1 rounded-md transition ${
                            isActive ? "bg-gray-200 text-gray-800 font-semibold" : "text-gray-700 hover:bg-gray-100 hover:text-gray-800"
                          }`
                        }
                      >
                        <span className="truncate max-w-[150px]">
                          {s.previewMessage || s.sessionId}
                        </span>
                        <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
                          {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString("vi-VN") : ""}
                        </span>
                      </NavLink>
                      <button
                        onClick={() =>
                          setShowSessionMenu((prev) => ({
                            ...prev,
                            [s.sessionId]: !prev[s.sessionId],
                          }))
                        }
                        className="absolute right-2 text-gray-500 hover:text-gray-700"
                      >
                        <FiMoreVertical className="sidebar-icon w-4 h-4" />
                      </button>
                      {showSessionMenu[s.sessionId] && (
                        <div className="session-menu">
                          <button
                            onClick={() => deleteSession(s.sessionId)}
                            className="flex items-center gap-2 text-red-500 hover:text-red-700 px-2 py-1 rounded"
                          >
                            <FiTrash2 className="sidebar-icon w-4 h-4" />
                            <span>Xóa đoạn chat</span>
                          </button>
                        </div>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="side-item text-gray-400 italic">Chưa có lịch sử chat</li>
                )}
              </ul>
            )}
          </>
        )}
        <div className="mt-auto pt-4">
          {!isCollapsed && <div className="side-note">Tài khoản</div>}
          {!isLoggedIn ? (
            <>
              {renderNavItem(FiLogIn, "Đăng nhập", () => navigate("/auth/login"))}
              <a
                href="https://bkapai.vn/register"
                className={`side-item w-full flex items-center gap-2 ${isCollapsed ? "justify-center" : ""}`}
                onClick={() => {
                  if (isMobile && typeof onToggleSidebar === "function") onToggleSidebar();
                }}
              >
                <FiUserPlus className="sidebar-icon" />
                {!isCollapsed && <span className="text-sm">Tạo tài khoản</span>}
              </a>
            </>
          ) : (
            <div className="account-section flex flex-col items-center gap-2">
              <div className="account-row flex items-center gap-2 w-full">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className={`side-item flex items-center gap-2 transition-all duration-200 ${isCollapsed ? "justify-center" : "justify-start"} relative`}
                >
                  <div className="avatar">
                    <FiUser className="sidebar-icon" />
                  </div>
                  {!isCollapsed && (
                    <span className="text-sm truncate max-w-[120px]">{username || "User"}</span>
                  )}
                </button>
                {!isCollapsed && (
                  <button
                    onClick={toggleSidebar}
                    className="collapse-toggle w-8 h-8 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
                    title="Thu gọn sidebar"
                  >
                    <FiChevronLeft className="sidebar-icon w-4 h-4" />
                  </button>
                )}
              </div>
              {isCollapsed && (
                <button
                  onClick={toggleSidebar}
                  className="collapse-toggle w-8 h-8 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center mt-2"
                  title="Mở sidebar"
                >
                  <FiChevronLeft className="sidebar-icon w-4 h-4 rotate-180" />
                </button>
              )}
              {showMenu && (
                <div className="menu-dropdown show">
                  <ul>
                    <li>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 w-full hover:bg-gray-100 px-4 py-2"
                        onClick={() => {
                          setShowMenu(false);
                          if (isMobile && typeof onToggleSidebar === "function") onToggleSidebar();
                        }}
                      >
                        Xem profile
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowMenu(false);
                        }}
                        className="flex items-center gap-2 w-full hover:bg-gray-100 px-4 py-2 text-left"
                      >
                        Đăng xuất
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
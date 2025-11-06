import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, NavLink, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import {
  FiMessageCircle,
  FiBookOpen,
  FiEdit3,
  FiPlus,
  FiDownload,
  FiClock,
  FiHelpCircle,
  FiLogIn,
  FiUserPlus,
  FiUser,
  FiChevronDown,
  FiChevronLeft,
  FiMoreVertical,
  FiTrash2,
  FiImage,
  FiVideo,
  FiAward,
  FiFeather,
  FiStar,
  FiTool,
} from "react-icons/fi";
import "./css/Sidebar.css";
import "../style/chat.css";
import api from "../services/apiToken";

function Sidebar({ className, isOpen, onToggleSidebar }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // ✅ Chỉ cho phép mở duy nhất 1 menu "3 chấm" tại một thời điểm
  const [openMenuId, setOpenMenuId] = useState(null);

  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const { sessionId } = useParams();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 920);

  // nhóm mở/đóng cho sidebar gọn theo cụm
  const [openGroups, setOpenGroups] = useState({
    chat: true,
    creative: false,
    contest: false,
    tools: false,
  });

  const toggleGroup = (key) =>
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  // kiểm tra login bằng accessToken
  useEffect(() => {
    const accessToken =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    const user = localStorage.getItem("username");
    if (accessToken) {
      setIsLoggedIn(true);
      if (user) setUsername(user);
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    setShowMenu(false);
    setOpenMenuId(null);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 920);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // fetch sessions bằng axios instance
  const fetchSessions = async () => {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const res = await api.get("/conversations/sessions");
      const data = res.data;
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load sessions error:", err);
      if (!isMobile) {
        toast.error("Không thể tải lịch sử. Vui lòng thử lại sau!");
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
  };

  // Xóa session bằng axios instance (có refresh token auto)
  const deleteSession = async (id) => {
    if (!window.confirm("Xác nhận xóa cuộc trò chuyện này?")) return;
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (!token) return;

    try {
      await api.delete(`/conversations/${id}`);
      toast.success("Đã xóa cuộc trò chuyện!");
      // cập nhật UI tại chỗ
      setSessions((prev) => prev.filter((x) => x.sessionId !== id));
      setOpenMenuId(null); // ✅ đóng mọi menu khác ngay khi xóa
      window.dispatchEvent(new Event("sessionUpdated"));
      window.dispatchEvent(new Event("writingSessionUpdated"));

      if (window.innerWidth <= 920 && typeof onToggleSidebar === "function") {
        onToggleSidebar();
      }
      if (sessionId === id) navigate("/");
    } catch (err) {
      console.error("Delete session error:", err);
      toast.error("Lỗi khi xóa, vui lòng thử lại!");
    }
  };

  const showComingSoon = () => {
    if (!isMobile) {
      toast.info("Tính năng đang được phát triển, mời bạn quay lại sau!");
    }
  };

  // logout xóa luôn refresh token
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    sessionStorage.removeItem("chatHistory");
    sessionStorage.removeItem("sessionId");
    sessionStorage.removeItem("writingHistory");
    sessionStorage.removeItem("writingSessionId");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("userLoggedOut"));
    window.location.href = "/";
    setShowMenu(false);
  };

  // Item con: chữ bé (text-xs), icon nhỏ hơn (w-4 h-4), padding gọn
  const renderNavItem = (Icon, label, onClick) => (
    <button
      onClick={() => {
        onClick();
        if (typeof onToggleSidebar === "function") onToggleSidebar();
      }}
      className={`side-item w-full flex items-center gap-2 ${
        isCollapsed ? "justify-center" : ""
      } px-2 py-1.5`}
    >
      <Icon className="sidebar-icon w-4 h-4" />
      {!isCollapsed && <span className="text-xs">{label}</span>}
    </button>
  );

  const startNewImageGeneration = () => {
    sessionStorage.removeItem("imageHistory");
    window.dispatchEvent(new Event("newImageGeneration"));
    navigate("/generate-image");
  };

  // Đóng menu khi click ra ngoài
  const containerRef = useRef(null);
  useEffect(() => {
    const onDocClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // Component nhóm (accordion) — giữ tiêu đề nhóm rõ ràng (text-sm)
  const Group = ({ icon: Icon, title, open, onToggle, children }) => (
    <div className="mb-2">
      <button
        className={`side-item w-full flex items-center justify-between ${
          isCollapsed ? "justify-center" : ""
        }`}
        onClick={() => {
          if (isCollapsed) {
            setIsCollapsed(false);
          } else {
            onToggle();
          }
        }}
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <Icon className="sidebar-icon" />
          {!isCollapsed && <span className="text-sm font-medium">{title}</span>}
        </div>
        {!isCollapsed && (
          <FiChevronDown
            className={`sidebar-icon transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </button>
      {open && !isCollapsed && <div className="mt-1 pl-3">{children}</div>}
    </div>
  );

  return (
    <aside
      ref={containerRef}
      className={`sidebar ${className} ${isCollapsed ? "collapsed" : ""}`}
    >
      <div className="side-head">
        <Link to="/" className="logo robot-logo">
          <svg
            width="40"
            height="40"
            viewBox="0 0 80 80"
            xmlns="http://www.w3.org/2000/svg"
            className="robot-head-svg"
          >
            <defs>
              <linearGradient id="robotGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#7e22ce" />
              </linearGradient>
            </defs>

            <circle cx="40" cy="40" r="28" fill="url(#robotGradient)" />
            <circle cx="32" cy="36" r="5" fill="#fff" />
            <circle cx="32" cy="36" r="2" fill="#7e22ce" />
            <circle cx="48" cy="36" r="5" fill="#fff" />
            <circle cx="48" cy="36" r="2" fill="#7e22ce" />
            <rect x="30" y="50" width="20" height="5" rx="2.5" fill="#f5f3ff" opacity="0.9" />
            <rect x="38" y="10" width="4" height="10" fill="#a855f7" rx="2" />
            <circle cx="40" cy="8" r="3" fill="#ef4444" />
          </svg>
        </Link>

        {!isCollapsed && (
          <div>
            <div className="brand-name">BKAP AI</div>
            <div className="small-name">Học tập thông minh</div>
          </div>
        )}
      </div>

      {/* NAV: cụm thu gọn */}
      <nav className="side-list">
        {/* Cụm: Trò chuyện & Học tập */}
        <Group
          icon={HiOutlineChatAlt2}
          title="Trò chuyện & Học tập"
          open={openGroups.chat}
          onToggle={() => toggleGroup("chat")}
        >
          {renderNavItem(FiMessageCircle, "Chat mới", startNewChat)}
          {renderNavItem(FiBookOpen, "Giải bài tập", showComingSoon)}
        </Group>

        {/* Cụm: Sáng tạo AI */}
        <Group
          icon={FiEdit3}
          title="Sáng tạo AI"
          open={openGroups.creative}
          onToggle={() => toggleGroup("creative")}
        >
          <NavLink
            to="/writing"
            onClick={() => {
              sessionStorage.removeItem("writingHistory");
              sessionStorage.removeItem("writingSessionId");
              window.dispatchEvent(new Event("newWriting"));
              if (typeof onToggleSidebar === "function") onToggleSidebar();
            }}
            className={({ isActive }) =>
              `side-item w-full flex items-center gap-2 transition-all duration-200 ${
                isActive ? "bg-gray-200 text-gray-800 font-semibold" : ""
              } px-2 py-1.5`
            }
          >
            <FiFeather className="sidebar-icon w-4 h-4" />
            <span className="text-xs">Viết văn AI</span>
          </NavLink>

          <NavLink
            to="/generate-image"
            onClick={() => {
              startNewImageGeneration();
              if (typeof onToggleSidebar === "function") onToggleSidebar();
            }}
            className={({ isActive }) =>
              `side-item w-full flex items-center gap-2 transition-all duration-200 ${
                isActive ? "bg-gray-200 text-gray-800 font-semibold" : ""
              } px-2 py-1.5`
            }
          >
            <FiImage className="sidebar-icon w-4 h-4" />
            <span className="text-xs">Tạo Ảnh AI</span>
          </NavLink>

          <NavLink
            to="/generate-video"
            onClick={() => {
              startNewImageGeneration();
              if (typeof onToggleSidebar === "function") onToggleSidebar();
            }}
            className={({ isActive }) =>
              `side-item w-full flex items-center gap-2 transition-all duration-200 ${
                isActive ? "bg-gray-200 text-gray-800 font-semibold" : ""
              } px-2 py-1.5`
            }
          >
            <FiVideo className="sidebar-icon w-4 h-4" />
            <span className="text-xs">Tạo Video AI</span>
          </NavLink>
        </Group>

        {/* Cụm: Cuộc thi */}
        <Group
          icon={FiAward}
          title="Cuộc thi"
          open={openGroups.contest}
          onToggle={() => toggleGroup("contest")}
        >
          <NavLink
            to="/journalism"
            onClick={() => {
              if (typeof onToggleSidebar === "function") onToggleSidebar();
            }}
            className={({ isActive }) =>
              `side-item w-full flex items-center gap-2 transition-all duration-200 ${
                isActive
                  ? "bg-gray-200 text-gray-800 font-semibold"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-800"
              } px-2 py-1.5`
            }
          >
            <FiStar className="sidebar-icon w-4 h-4" />
            <span className="text-xs">Cuộc thi AI</span>
          </NavLink>
        </Group>

        {/* Cụm: Công cụ khác */}
        <Group
          icon={FiPlus}
          title="Công cụ khác"
          open={openGroups.tools}
          onToggle={() => toggleGroup("tools")}
        >
          {renderNavItem(FiTool, "Thêm công cụ", showComingSoon)}
          {renderNavItem(FiDownload, "Tải ứng dụng", showComingSoon)}
        </Group>
      </nav>

      {/* Lịch sử (accordion gọn) */}
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
              className={`sidebar-icon transition-transform ${
                showHistory ? "rotate-180" : ""
              }`}
            />
          </button>
          {showHistory && (
            <ul className={`history-list ${showHistory ? "show" : ""}`}>
              {loading ? (
                <li className="side-item text-gray-400 italic">Đang tải...</li>
              ) : sessions.length > 0 ? (
                sessions.map((s) => {
                  const opened = openMenuId === s.sessionId;
                  return (
                    <li key={s.sessionId} className="side-item relative">
                      <NavLink
                        to={`/chat/${s.sessionId}`}
                        onClick={() =>
                          typeof onToggleSidebar === "function" &&
                          onToggleSidebar()
                        }
                        className={({ isActive }) =>
                          `flex items-center gap-2 flex-1 overflow-hidden px-2 py-1 rounded-md transition ${
                            isActive
                              ? "bg-gray-200 text-gray-800 font-semibold"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-800"
                          }`
                        }
                      >
                        <span className="truncate max-w-[150px] text-xs">
                          {s.previewMessage || s.sessionId}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-auto whitespace-nowrap">
                          {s.updatedAt
                            ? new Date(s.updatedAt).toLocaleDateString("vi-VN")
                            : ""}
                        </span>
                      </NavLink>

                      {/* Nút 3 chấm */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId((prev) =>
                            prev === s.sessionId ? null : s.sessionId
                          ); // ✅ chỉ mở một menu
                        }}
                        className="absolute right-2 text-gray-500 hover:text-gray-700"
                        aria-haspopup="menu"
                        aria-expanded={opened}
                        title="Tùy chọn"
                      >
                        <FiMoreVertical className="sidebar-icon w-4 h-4" />
                      </button>

                      {/* Menu xóa (chỉ hiện cho item đang mở) */}
                      {opened && (
                        <div
                          className="absolute right-8 top-full mt-1 bg-white border border-gray-200 shadow-lg rounded-md z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => deleteSession(s.sessionId)}
                            className="flex items-center gap-2 text-red-500 hover:text-red-700 text-xs px-3 py-1.5 w-full hover:bg-gray-50 rounded-md transition"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            <span>Xóa đoạn chat</span>
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })
              ) : (
                <li className="side-item text-gray-400 italic">
                  Chưa có lịch sử chat
                </li>
              )}
            </ul>
          )}

          <div className="side-note">Khác</div>
          <button onClick={showComingSoon} className="side-item w-full text-left">
            <FiHelpCircle className="sidebar-icon" />
            <span>Trợ giúp</span>
          </button>
        </>
      )}

      <div className="mt-auto pt-4">
        {!isCollapsed && <div className="side-note">Tài khoản</div>}
        {!isLoggedIn ? (
          <>
            {renderNavItem(FiLogIn, "Đăng nhập", () => navigate("/auth/login"))}
            <a
              href="https://bkapai.vn/register"
              className={`side-item w-full flex items-center gap-2 ${
                isCollapsed ? "justify-center" : ""
              }`}
              onClick={() => {
                if (typeof onToggleSidebar === "function") {
                  onToggleSidebar();
                }
              }}
            >
              <FiUserPlus className="sidebar-icon w-4 h-4" />
              {!isCollapsed && <span className="text-xs">Tạo tài khoản</span>}
            </a>
          </>
        ) : (
          <div className="account-section flex flex-col items-center gap-2">
            <div className="account-row flex items-center gap-2 w-full">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`side-item flex items-center gap-2 transition-all duration-200 ${
                  isCollapsed ? "justify-center" : "justify-start"
                } relative`}
              >
                <div className="avatar">
                  <FiUser className="sidebar-icon" />
                </div>
                {!isCollapsed && (
                  <span className="text-xs truncate max-w-[120px]">
                    {username || ""}
                  </span>
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
                      onClick={() => setShowMenu(false)}
                    >
                      <span className="text-xs">Xem profile</span>
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
                      <span className="text-xs">Đăng xuất</span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, NavLink, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import CreditModal from "../components/CreditModal";
import {
  FiMessageCircle,
  FiBookOpen,
  FiEdit3,
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
  FiLogOut,
  FiCreditCard,
} from "react-icons/fi";
import "./css/Sidebar.css";
import "../style/chat.css";
import api from "../services/apiToken";

function Sidebar({ className, isOpen, onToggleSidebar }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [remainingCredit, setRemainingCredit] = useState(null);
  const [creditError, setCreditError] = useState("");
  const [profile, setProfile] = useState(null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditHistory, setCreditHistory] = useState([]);
  const [loadingCreditHistory, setLoadingCreditHistory] = useState(false);
  const { sessionId } = useParams();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 920);
  const [openGroups, setOpenGroups] = useState({
    chat: true,
    creative: true,
    contest: true,
    tools: true,
  });

  const fetchCredit = async (showToast = false) => {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await api.get("/user/credits");
      setRemainingCredit(res.data.credit);
      setCreditError("");
      if (showToast && res.data.credit === 0) {
        toast.error("Đã hết credit, vui lòng mua thêm");
      }
    } catch {
      setCreditError("Không tải được credit");
    }
  };

  const toggleGroup = (key) =>
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    const user = localStorage.getItem("username");
    if (token) {
      setIsLoggedIn(true);
      if (user) setUsername(user);
    }
  }, []);

  useEffect(() => {
    fetchCredit();
    fetchProfile();
  }, [isLoggedIn]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;

      if (newState) {
        document.body.classList.add("sidebar-collapsed");
      } else {
        document.body.classList.remove("sidebar-collapsed");
      }

      return newState;
    });

    setShowMenu(false);
    setOpenMenuId(null);
  };


  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth <= 920);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const fetchSessions = async () => {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get("/conversations/sessions");
      setSessions(Array.isArray(res.data) ? res.data : []);
    } catch {
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

  const deleteSession = async (id) => {
    if (!window.confirm("Xác nhận xóa cuộc trò chuyện này?")) return;
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (!token) return;
    try {
      await api.delete(`/conversations/${id}`);
      setSessions((prev) => prev.filter((s) => s.sessionId !== id));
      setOpenMenuId(null);
      window.dispatchEvent(new Event("sessionUpdated"));
      window.dispatchEvent(new Event("writingSessionUpdated"));
      if (isMobile && typeof onToggleSidebar === "function") onToggleSidebar();
      if (sessionId === id) navigate("/");
    } catch { }
  };

  const showComingSoon = () => {
    if (!isMobile) toast.info("Tính năng đang phát triển");
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile");
      setProfile(res.data);
      if (process.env.REACT_APP_ENV === "dev") {
        console.log("Profile nhận được:", res.data);
      }
    } catch (err) {
      console.error("Không lấy được profile:", err);
    }
  };



  const renderNavItem = (Icon, label, onClick) => (
    <button
      onClick={() => {
        onClick();
        if (typeof onToggleSidebar === "function") onToggleSidebar();
      }}
      className={`side-item w-full flex items-center gap-2 px-2 py-1.5 ${isCollapsed ? "justify-center" : ""
        }`}
    >
      <Icon className="sidebar-icon w-4 h-4" />
      {!isCollapsed && (
        <span className="text-base font-normal">{label}</span>
      )}
    </button>
  );

  const containerRef = useRef(null);
  const accountMenuRef = useRef(null);

  useEffect(() => {
    const click = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, []);

  useEffect(() => {
    const outside = (e) => {
      if (showMenu) {
        if (
          accountMenuRef.current &&
          !accountMenuRef.current.contains(e.target) &&
          !e.target.closest(".account-menu-toggle")
        ) {
          setShowMenu(false);
        }
      }
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [showMenu]);

  const Group = ({ icon: Icon, title, open, onToggle, children }) => (
    <div className="mb-2">
      <button
        className={`side-item w-full flex items-center justify-between ${isCollapsed ? "justify-center" : ""
          }`}
        onClick={() => {
          if (isCollapsed) setIsCollapsed(false);
          else onToggle();
        }}
      >
        <div className="flex items-center gap-2">
          <Icon className="sidebar-icon" />
          {!isCollapsed && (
            <span className="text-base font-bold">{title}</span>
          )}
        </div>
        {!isCollapsed && (
          <FiChevronDown
            className={`sidebar-icon ${open ? "rotate-180" : ""}`}
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

      <Link to="/" className="side-head flex items-center gap-3 px-2 py-2">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
          <img
            src="/logo.jpg"
            alt="logo"
            className="w-full h-full object-cover"
          />
        </div>

        {!isCollapsed && (
          <div className="leading-tight">
            <div className="brand-name text-lg font-extrabold text-blue-600 tracking-tight">
              BKAP AI
            </div>
            <div className="small-name text-base text-gray-500 font-normal">
              Học tập thông minh
            </div>
          </div>
        )}
      </Link>


      <div className="sidebar-main">
        <nav className="side-list">
          <Group
            icon={HiOutlineChatAlt2}
            title="Trò Chuyện"
            open={openGroups.chat}
            onToggle={() => toggleGroup("chat")}
          >
            {renderNavItem(FiMessageCircle, "Đoạn chat mới", startNewChat)}
            {renderNavItem(FiBookOpen, "Hướng dẫn bài tập", showComingSoon)}
            {renderNavItem(FiFeather, "Học viết văn bằng AI", () => {
              sessionStorage.removeItem("writingHistory");
              sessionStorage.removeItem("writingSessionId");
              window.dispatchEvent(new Event("newWriting"));
              navigate("/writing");
            })}
          </Group>

          <Group
            icon={FiEdit3}
            title="Sáng tạo AI"
            open={openGroups.creative}
            onToggle={() => toggleGroup("creative")}
          >
            <NavLink
              to="/generate-image"
              onClick={() => {
                sessionStorage.removeItem("imageHistory");
                window.dispatchEvent(new Event("newImageGeneration"));
                if (typeof onToggleSidebar === "function") onToggleSidebar();
              }}
              className={({ isActive }) =>
                `side-item w-full flex items-center gap-2 px-2 py-1.5 ${isActive ? "bg-gray-200 text-gray-900 font-semibold" : ""
                }`
              }
            >
              <FiImage className="sidebar-icon w-4 h-4" />
              {!isCollapsed && (
                <span className="text-base font-normal">Sáng tạo ảnh AI</span>
              )}
            </NavLink>

            <NavLink
              to="/generate-video"
              onClick={() => {
                sessionStorage.removeItem("imageHistory");
                window.dispatchEvent(new Event("newImageGeneration"));
                if (typeof onToggleSidebar === "function") onToggleSidebar();
              }}
              className={({ isActive }) =>
                `side-item w-full flex items-center gap-2 px-2 py-1.5 ${isActive ? "bg-gray-200 text-gray-900 font-semibold" : ""
                }`
              }
            >
              <FiVideo className="sidebar-icon w-4 h-4" />
              {!isCollapsed && (
                <span className="text-base font-normal">Tạo Video</span>
              )}
            </NavLink>

            <NavLink
              to="/library"
              onClick={() => {
                if (typeof onToggleSidebar === "function") onToggleSidebar();
              }}
              className={({ isActive }) =>
                `side-item w-full flex items-center gap-2 px-2 py-1.5 ${isActive ? "bg-gray-200 text-gray-900 font-semibold" : ""
                }`
              }
            >
              <FiImage className="sidebar-icon w-4 h-4" />
              {!isCollapsed && (
                <span className="text-base font-normal">Thư viện của tôi</span>
              )}
            </NavLink>

          </Group>

          <NavLink
            to={isCollapsed ? null : "/journalism"}
            onClick={(e) => {
              if (isCollapsed) {
                e.preventDefault();
                setIsCollapsed(false);
                return;
              }
              if (typeof onToggleSidebar === "function") onToggleSidebar();
            }}
            className={() =>
              `mb-2 side-item w-full flex items-center gap-2 justify-between ${isCollapsed ? "justify-center" : ""
              }`
            }
          >
            <div className="flex items-center gap-2">
              <FiAward className="sidebar-icon" />
              {!isCollapsed && (
                <span className="text-base font-bold">Cuộc thi</span>
              )}
            </div>
          </NavLink>

        </nav>


        {!isCollapsed && (
          <div className="history-wrapper">
            <div className="side-note text-base">Lịch sử</div>
            <ul className="history-scroll">
              {loading ? (
                <li className="side-item text-gray-400 italic text-base">
                  Đang tải...
                </li>
              ) : sessions.length > 0 ? (
                sessions.map((s) => {
                  const opened = openMenuId === s.sessionId;
                  return (
                    <li key={s.sessionId} className="side-item relative">
                      <NavLink
                        to={`/chat/${s.sessionId}`}
                        onClick={() => {
                          if (typeof onToggleSidebar === "function")
                            onToggleSidebar();
                        }}
                        className={({ isActive }) =>
                          `flex items-center gap-2 flex-1 overflow-hidden px-2 py-1 rounded-md transition ${isActive
                            ? "bg-gray-200 text-gray-900 font-semibold"
                            : "text-gray-700 hover:bg-gray-100"
                          }`
                        }
                      >
                        <span className="truncate max-w-[150px] text-base font-normal">
                          {s.previewMessage || s.sessionId}
                        </span>
                        <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
                          {s.updatedAt
                            ? new Date(s.updatedAt).toLocaleDateString("vi-VN")
                            : ""}
                        </span>
                      </NavLink>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId((prev) =>
                            prev === s.sessionId ? null : s.sessionId
                          );
                        }}
                        className="absolute right-2 text-gray-500 hover:text-gray-700"
                      >
                        <FiMoreVertical className="sidebar-icon w-4 h-4" />
                      </button>

                      {opened && (
                        <div className="session-menu-box">
                          <button
                            onClick={() => deleteSession(s.sessionId)}
                            className="delete-btn-history"
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
                <li className="side-item text-gray-400 italic text-base">
                  Chưa có lịch sử chat
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4">
        {!isCollapsed && <div className="side-note text-base">Tài khoản</div>}

        {!isLoggedIn ? (
          <>
            <a
              href="https://bkapai.vn/auth/login"
              className={`side-item w-full flex items-center gap-2 ${isCollapsed ? "justify-center" : ""
                }`}
              onClick={() => {
                if (typeof onToggleSidebar === "function") onToggleSidebar();
              }}
            >
              <FiLogIn className="sidebar-icon w-4 h-4" />
              {!isCollapsed && (
                <span className="text-base font-normal">Đăng Nhập</span>
              )}
            </a>

            <a
              href="https://bkapai.vn/register"
              className={`side-item w-full flex items-center gap-2 ${isCollapsed ? "justify-center" : ""
                }`}
              onClick={() => {
                if (typeof onToggleSidebar === "function") onToggleSidebar();
              }}
            >
              <FiUserPlus className="sidebar-icon w-4 h-4" />
              {!isCollapsed && (
                <span className="text-base font-normal">Tạo tài khoản</span>
              )}
            </a>
          </>
        ) : (
          <div className="account-section flex flex-col items-center gap-2">
            <div className="account-row flex items-center gap-2 w-full">
              <button
                onClick={() => {
                  if (isCollapsed) {
                    setIsCollapsed(false);
                    setShowMenu(false);
                  } else {
                    setShowMenu(prev => !prev);
                  }
                }}
                className={`side-item flex items-center gap-2 account-menu-toggle ${isCollapsed ? "justify-center" : "justify-start"
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
                  className="collapse-toggle w-8 h-8 flex items-center justify-center"
                >
                  <FiChevronLeft className="sidebar-icon w-4 h-4" />
                </button>
              )}
            </div>

            {isCollapsed && (
              <button
                onClick={toggleSidebar}
                className="collapse-toggle w-8 h-8 flex items-center justify-center mt-2"
              >
                <FiChevronLeft className="sidebar-icon w-4 h-4 rotate-180" />
              </button>
            )}

            {showMenu && (
              <div ref={accountMenuRef} className="menu-dropdown show">
                <ul>
                  <li>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 w-full px-4 py-2"
                      onClick={() => setShowMenu(false)}
                    >
                      <FiUser className="w-4 h-4 text-gray-600" />
                      <span className="text-base font-normal">
                        Thông tin cá nhân
                      </span>
                    </Link>
                  </li>

                  <li>
                    <button
                      onClick={() => {
                        setShowCreditModal(true);
                        setShowMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <FiCreditCard className="w-4 h-4 text-gray-600" />
                        <span className="text-base font-normal">Số dư hiện tại</span>
                      </div>

                      <span
                        className={`ml-auto px-1 text-sm font-semibold tracking-wide 
                        ${remainingCredit === 0
                            ? "text-red-500"
                            : remainingCredit < 100
                              ? "text-orange-500"
                              : "text-emerald-600"
                          }`}
                      >
                        {remainingCredit}
                      </span>

                    </button>
                  </li>



                  <li>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-red-600"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span className="text-base font-normal">
                        Đăng xuất tài khoản
                      </span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {showCreditModal && (
        <CreditModal
          remainingCredit={remainingCredit}
          errorMessage={creditError}
          onClose={() => setShowCreditModal(false)}
          onRefresh={() => fetchCredit(true)}
          userId={profile?.userId}
          profile={profile}
        />
      )}
    </aside>
  );
}

export default Sidebar;

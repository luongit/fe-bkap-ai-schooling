import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // thêm useNavigate
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./css/Sidebar.css";

const API_URL = process.env.REACT_APP_API_URL || "";

function Sidebar() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // khởi tạo navigate

    const fetchSessions = () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        setLoading(true);
        fetch(`${API_URL}/conversations/sessions`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setSessions(data);
                } else {
                    console.error("Không phải array:", data);
                    setSessions([]);
                }
            })
            .catch(err => console.error("Load sessions error:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    useEffect(() => {
        window.addEventListener("sessionUpdated", fetchSessions);
        return () => {
            window.removeEventListener("sessionUpdated", fetchSessions);
        };
    }, []);

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
                theme: "colored"
            });
        }
    };


    const startNewChat = () => {
        sessionStorage.removeItem("chatHistory");
        sessionStorage.removeItem("sessionId");
        window.dispatchEvent(new Event("newChat"));
        navigate("/");
    };

    return (
        <aside className="sidebar" id="sidebar">
            <div className="side-head">
                <Link className="logo" to="/">AI</Link>
                <div>
                    <div className="brand-name">AI Schooling Platform</div>
                    <div className="small-name">Mạng xã hội</div>
                </div>
            </div>

            <ul className="side-list">
                <li><a className="side-item" onClick={startNewChat}>Đoạn chat mới</a></li>
                <li><a className="side-item" onClick={showComingSoon}>AI Tìm kiếm</a></li>
                <li><a className="side-item" onClick={showComingSoon}>Giải bài tập</a></li>
                <li><a className="side-item" onClick={showComingSoon}>AI Viết văn</a></li>
                <li><a className="side-item" onClick={showComingSoon}>Chat Bot</a></li>
                <li><a className="side-item" onClick={showComingSoon}>Thêm công cụ</a></li>
                <li><a className="side-item" onClick={showComingSoon}><span className="icon-dot"></span> Tải ứng dụng</a></li>
            </ul>

            <div className="side-note">Lịch sử</div>
            <ul className="side-list history-list">
                {!localStorage.getItem("token") ? (
                    <li><span className="side-item">Đăng nhập để lưu lại lịch sử</span></li>
                ) : loading ? (
                    <li><span className="side-item">Đang tải...</span></li>
                ) : sessions.length === 0 ? (
                    <li><span className="side-item">Chưa có lịch sử</span></li>
                ) : (
                    sessions.map((s) => (
                        <li key={s.sessionId}>
                            <Link className="side-item" to={`/chat/${s.sessionId}`}>
                                <span className="icon-dot"></span>
                                <span className="session-preview">
                                    {s.previewMessage || s.sessionId}
                                </span>
                            </Link>
                        </li>
                    ))
                )}
            </ul>

            <div className="side-note">Khác</div>
            <ul className="side-list">
                <li><a className="side-item" onClick={showComingSoon}><span className="icon-dot"></span> Tải ứng dụng</a></li>
            </ul>

            <div className="side-foot" onClick={showComingSoon}>
                <div className="icon-dot" ></div> Trợ giúp
            </div>

            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                limit={1}
            />
        </aside>
    );
}

export default Sidebar;

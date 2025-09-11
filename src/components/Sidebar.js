import { useEffect, useState } from "react";
import "./css/Sidebar.css";
import { Link } from "react-router-dom";


const API_URL = process.env.REACT_APP_API_URL || "";

function Sidebar({ onSelectSession }) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);

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

    return (
        <aside className="sidebar" id="sidebar">
            <div className="side-head">
                <Link className="logo" to="/">AS</Link>

                <div>
                    <div className="brand-name">AI Spark</div>
                    <div className="small-name">Mạng xã hội</div>
                </div>
            </div>

            <ul className="side-list">
                <li>
                    <a
                        className="side-item active"
                        onClick={() => {
                            sessionStorage.removeItem("chatHistory");
                            sessionStorage.removeItem("sessionId");
                            window.dispatchEvent(new Event("newChat"));
                        }}
                    >
                        AI Tìm kiếm
                    </a>
                </li>
                <li><a className="side-item" href="#">Giải bài tập</a></li>
                <li><a className="side-item" href="#">AI Viết văn</a></li>
                <li><a className="side-item" href="#">Chat Bot</a></li>
                <li><a className="side-item" href="#">Thêm công cụ</a></li>
            </ul>


            <div className="side-note">Lịch sử</div>
            <ul className="side-list history-list">
                {!localStorage.getItem("token") ? (
                    <li>
                        <span className="side-item">Đăng nhập để lưu lại lịch sử</span>
                    </li>
                ) : loading ? (
                    <li>
                        <span className="side-item">Đang tải...</span>
                    </li>
                ) : sessions.length === 0 ? (
                    <li>
                        <span className="side-item">Chưa có lịch sử</span>
                    </li>
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
                <li><a className="side-item" href="#"><span className="icon-dot"></span> Tải ứng dụng</a></li>
            </ul>

            <div className="side-foot">
                <div className="icon-dot"></div> Trợ giúp
            </div>
        </aside>
    );
}

export default Sidebar;
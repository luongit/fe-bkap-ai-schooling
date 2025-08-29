function Sidebar() {
    return (
        <aside className="sidebar" id="sidebar">
            <div className="side-head">
                <div className="logo">AS</div>
                <div>
                    <div className="brand-name">AI Spark</div>
                    <div className="small-name">Mạng xã hội</div>
                </div>
            </div>

            <ul className="side-list">
                <li><a className="side-item active" href="#"><span className="icon-dot"></span> AI Tìm kiếm</a></li>
                <li><a className="side-item" href="#"><span className="icon-dot"></span> Giải bài tập</a></li>
                <li><a className="side-item" href="#"><span className="icon-dot"></span> AI Viết văn</a></li>
                <li><a className="side-item" href="#"><span className="icon-dot"></span> Chat Bot</a></li>
                <li><a className="side-item" href="#"><span className="icon-dot"></span> Thêm công cụ</a></li>
            </ul>

            <div className="side-note">Lịch sử</div>
            <ul className="side-list">
                <li><a className="side-item" href="#"><span className="icon-dot"></span> Đăng nhập để lưu lại lịch sử</a></li>
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
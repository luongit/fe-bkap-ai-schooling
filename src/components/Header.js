function Header() {
    return (
        <header className="header">
            <button className="burger" id="burger" aria-label="Mở menu">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M4 7h16M4 12h12M4 17h16" stroke="#4b5563" stroke-width="2" stroke-linecap="round" />
                </svg>
            </button>
            <div className="title">AI Spark - đồng hành cùng bạn</div>
            <div className="promo">Tặng 6 tháng AI Pro cho thành viên • <b>Tìm hiểu ngay</b></div>
            <div className="actions">
                <button className="btn">Đăng nhập</button>
                <button className="btn primary">Tạo tài khoản miễn phí</button>
            </div>
        </header>
    );
}

export default Header;
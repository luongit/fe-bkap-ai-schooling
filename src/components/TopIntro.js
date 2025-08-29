function TopIntro() {
  return (
    <div className="topintro">
      <h1 className="hello"><span className="grad">Xin chào</span></h1>
      <p className="subtitle">AI Spark giúp bạn giải đáp mọi thắc mắc trong học tập và cập nhật kiến thức nhanh chóng.</p>

      <div className="carousel">
        <button className="nav-btn" aria-label="Trước">←</button>
        <div className="pill"><div className="thumb"></div><span>Học toán không khó</span></div>
        <div className="pill"><div className="thumb"></div><span>Toán lớp 5</span></div>
        <div className="pill"><div className="thumb"></div><span>Lịch sử lớp 7</span></div>
        <button className="nav-btn" aria-label="Sau">→</button>
      </div>

      <div className="explore">
        <a className="tag" href="#">Thông báo lịch khai giảng năm mới 2026</a>
        <a className="tag" href="#">Thực đơn ăn trưa học sinh bán trú</a>
        <a className="tag" href="#">Thời khóa biểu khối 5</a>
        <a className="tag" href="#">Thời khóa biểu khối 7</a>
      </div>
    </div>
  );
}

export default TopIntro;
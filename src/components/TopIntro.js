import React, { useState, useEffect } from 'react';
import './css/TopIntro.css';

export default function TopIntro() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const prompts = [
    { text: 'Hỏi về toán học: Giải phương trình bậc hai', icon: '🧮' },
    { text: 'Viết bài luận về biến đổi khí hậu', icon: '📝' },
    { text: 'Khám phá vũ trụ: Hố đen là gì?', icon: '🌌' },
    { text: 'Lập kế hoạch học tập hiệu quả', icon: '📅' },
  ];

  // Auto-rotate carousel every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % prompts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [prompts.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + prompts.length) % prompts.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % prompts.length);
  };

  return (
    <div className="topintro">
      <div className="robot-animation">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="robot-icon"
        >
          <circle cx="40" cy="40" r="36" fill="url(#robot-gradient)" />
          <rect x="28" y="20" width="24" height="20" rx="4" fill="#fff" />
          <circle cx="34" cy="28" r="3" fill="#60a5fa" className="eye" />
          <circle cx="46" cy="28" r="3" fill="#60a5fa" className="eye" />
          <path d="M36 48h8a2 2 0 01-2-2h-4a2 2 0 01-2 2z" fill="#60a5fa" />
          <rect x="38" y="12" width="4" height="8" fill="#fff" />
          <circle cx="40" cy="10" r="2" fill="#f87171" />
          <defs>
            <linearGradient id="robot-gradient" x1="40" y1="0" x2="40" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3b82f6" />
              <stop offset="1" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
        <div className="orbiting-particles">
          <span className="particle particle-1"></span>
          <span className="particle particle-2"></span>
          <span className="particle particle-3"></span>
        </div>
      </div>
      <div className="header-content">
        <h1 className="hello">
          <span className="grad">Khám phá AI Spark</span>
        </h1>
        <p className="subtitle">
          Người trợ lý thông minh giúp bạn học tập, sáng tạo và khám phá thế giới dễ dàng.
        </p>
      </div>
      <div className="carousel">
        <button className="nav-btn" aria-label="Trước" onClick={handlePrev}>
          ←
        </button>
        <div className="pill" key={currentIndex}>
          <span className="thumb">{prompts[currentIndex].icon}</span>
          <span>{prompts[currentIndex].text}</span>
        </div>
        <button className="nav-btn" aria-label="Sau" onClick={handleNext}>
          →
        </button>
      </div>
      <div className="explore">
        <a className="tag" href="#ask-question">
          <span className="tag-icon ask-icon">❓</span>
          Đặt câu hỏi mới
        </a>
        <a className="tag" href="#explore-topics">
          <span className="tag-icon explore-icon">🧭</span>
          Khám phá chủ đề
        </a>
        <a className="tag" href="#saved-chats">
          <span className="tag-icon chat-icon">💬</span>
          Xem lịch sử chat
        </a>
        <a className="tag" href="#learn-more">
          <span className="tag-icon learn-icon">📖</span>
          Tìm hiểu thêm
        </a>
      </div>
    </div>
  );
}
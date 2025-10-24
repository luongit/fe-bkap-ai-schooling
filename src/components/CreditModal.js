import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './css/CreditModal.css';
import { FiCreditCard, FiClock, FiZap, FiUser } from 'react-icons/fi';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";
const LOW_CREDIT_THRESHOLD = 100;

// --- Component 1: Credit Balance ---
const CreditBalanceView = ({ remainingCredit, errorMessage, onRefresh, onClose }) => (
  <div className="modal-content-area">
    <h3 className="content-title">Số dư Credit Hiện tại</h3>

    <div className={`balance-display ${remainingCredit < LOW_CREDIT_THRESHOLD ? 'low-credit' : ''}`}>
      <p className="current-balance-text">Số dư của bạn:</p>
      <strong>{remainingCredit !== null ? remainingCredit : 'Đang tải...'} credits</strong>
      {remainingCredit !== null && remainingCredit < LOW_CREDIT_THRESHOLD && (
        <p className="warning-message">⚠️ Credit của bạn đang thấp! Vui lòng mua thêm.</p>
      )}
    </div>

    {errorMessage && (
      <div className="error-section">
        <p>Lỗi tải credit: {errorMessage}</p>
        {remainingCredit !== null && <p className="cached-value-note">(Giá trị cache: {remainingCredit})</p>}
        <button className="refresh-btn" onClick={onRefresh}>Thử tải lại 🔄</button>
      </div>
    )}

    <hr className="my-4" />
    <Link to="/pricing" onClick={onClose} className="buy-credit-btn-small">
      Mua thêm credit →
    </Link>
  </div>
);

// --- Component 2: Credit History (đã tích hợp API thật) ---
const CreditHistoryView = ({ userId, token }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/credit/history/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Lỗi tải lịch sử credit");
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Lỗi lấy lịch sử:", err);
        setError("Không thể tải lịch sử giao dịch.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userId, token]);

  if (loading) return <p>Đang tải lịch sử...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (history.length === 0) return <p className="no-data">Chưa có giao dịch credit nào.</p>;

  return (
    <div className="modal-content-area">
      <h3 className="content-title">📜 Lịch sử Giao dịch Credit</h3>
      <table className="credit-history-table">
        <thead>
          <tr>
            <th>Thời gian</th>
            <th>Mô tả</th>
            <th>Thay đổi</th>
          
          </tr>
        </thead>
        <tbody>
          {history.map((t, i) => (
            <tr key={i}>
              <td>{new Date(t.timestamp || t.createdAt).toLocaleString("vi-VN")}</td>
              <td>{t.description || "-"}</td>
              <td className={t.amount < 0 ? "negative" : "positive"}>
                {t.amount > 0 ? `+${t.amount}` : `-${Math.abs(t.amount)}`}
              </td>


            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Component 3: Subscription/Plans ---
const SubscriptionView = ({ onClose }) => (
  <div className="modal-content-area">
    <h3 className="content-title">Quản lý Gói Nâng cấp</h3>
    <div className="subscription-info">
      <p>Bạn đang sử dụng: <strong>Gói Cơ Bản (Miễn phí)</strong></p>
      <p>Credit được cấp hàng ngày: <strong>100 credits</strong></p>
      <hr />
      <p>
        Để có trải nghiệm tốt hơn và credit không giới hạn, hãy nâng cấp lên gói <strong>PRO</strong>.
      </p>
      <Link to="/pricing" onClick={onClose} className="upgrade-btn">
        Xem chi tiết các Gói & Nâng cấp ngay! ✨
      </Link>
    </div>

    <h3 className="content-title mt-4">Thông tin Thanh toán</h3>
    <p className="payment-placeholder">Quản lý các giao dịch mua gói/credit đã thực hiện.</p>
  </div>
);

// --- Main Modal ---
function CreditModal({ remainingCredit, errorMessage, onClose, onRefresh, userId }) {
  const [activeTab, setActiveTab] = useState('creditBalance');
  const token = localStorage.getItem("token");

  const renderContent = () => {
    switch (activeTab) {
      case 'creditBalance':
        return (
          <CreditBalanceView
            remainingCredit={remainingCredit}
            errorMessage={errorMessage}
            onRefresh={onRefresh}
            onClose={onClose}
          />
        );
      case 'creditHistory':
        return <CreditHistoryView userId={userId} token={token} />;
      case 'subscription':
        return <SubscriptionView onClose={onClose} />;
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="credit-modal large-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>

        <div className="modal-header">
          <h2 className="modal-main-title">Credit</h2>
        </div>

        <div className="modal-body-container">
          <div className="modal-sidebar">
            <div
              className={`sidebar-item ${activeTab === 'creditBalance' ? 'active' : ''}`}
              onClick={() => setActiveTab('creditBalance')}
            >
              <FiCreditCard size={20} />
              <span>Số dư Credit</span>
            </div>
            <div
              className={`sidebar-item ${activeTab === 'creditHistory' ? 'active' : ''}`}
              onClick={() => setActiveTab('creditHistory')}
            >
              <FiClock size={20} />
              <span>Lịch sử Trừ Credit</span>
            </div>
            <div
              className={`sidebar-item ${activeTab === 'subscription' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscription')}
            >
              <FiZap size={20} />
              <span>Gói Nâng cấp</span>
            </div>
            <div className="sidebar-item disabled">
              <FiUser size={20} />
              <span>Tài khoản (Soon)</span>
            </div>
          </div>

          <div className="modal-content">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreditModal;

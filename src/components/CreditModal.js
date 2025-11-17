import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './css/CreditModal.css';
import { FiCreditCard, FiClock, FiZap, FiUser } from 'react-icons/fi';
import api from "../services/apiToken";
import { createPortal } from "react-dom";

const LOW_CREDIT_THRESHOLD = 100;

// --- Component 1: Credit Balance ---
const CreditBalanceView = ({ remainingCredit, errorMessage, onRefresh, onClose }) => (
  <div className="modal-content-area">
    <h3 className="content-title">Số dư của bạn hiện tại :</h3>

    <div className={`balance-display ${remainingCredit < LOW_CREDIT_THRESHOLD ? 'low-credit' : ''}`}>
      <strong>{remainingCredit !== null ? remainingCredit : 'Đang tải...'} credits</strong>
      {remainingCredit !== null && (
        <>
          {remainingCredit === 0 ? (
            <p className="text-red-600 font-semibold mt-2">
              Bạn đã hết credit! Vui lòng mua thêm .
            </p>
          ) : remainingCredit < LOW_CREDIT_THRESHOLD ? (
            <p className="text-orange-600 font-medium mt-2">
              Số dư của bạn sắp hết <br />
              Hãy mua thêm để có trải nghiệm tuyệt vời nhất .
            </p>
          ) : null}
        </>
      )}
    </div>

    {errorMessage && (
      <div className="error-section">
        <p>Lỗi tải số dư: {errorMessage}</p>
        {remainingCredit !== null && <p className="cached-value-note">(Giá trị đệm: {remainingCredit})</p>}
        <button className="refresh-btn" onClick={onRefresh}>Thử tải lại</button>
      </div>
    )}

    <hr className="my-4" />
    <Link
      to="/pricing"
      onClick={onClose}
      className="inline-flex items-center gap-2 px-4 py-2 mt-3
             border border-green-500 text-green-700
             hover:bg-green-50
             rounded-lg font-semibold text-sm
             transition-all duration-200"
    >
      <span>Mua thêm số dư cho tài khoản của bạn</span>
      <span className="text-green-700 text-lg">→</span>
    </Link>

  </div>
);

// --- Component 2: Credit History ---
const CreditHistoryView = ({ userId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await api.get(`/credit/history/${userId}`);
        const data = res.data;
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi lấy lịch sử:", err);
        setError("Không thể tải lịch sử giao dịch.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userId]);

  if (loading) return <p>Đang tải lịch sử...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (history.length === 0) return <p className="no-data">Chưa có giao dịch tiêu dùng nào.</p>;

  return (
    <div className="modal-content-area">
      <h3 className="content-title">Lịch sử tiêu dùng của bạn</h3>
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
    <h3 className="content-title">Quản lý các gói dịch vụ</h3>
    <div className="subscription-info">
      <p className="text-base">
        Bạn đang sử dụng:{" "}
        <strong className="font-semibold">
          Gói dịch vụ cơ bản{""}
          <span className="px-2 py-0.5 ml-1 text-green-700 bg-green-100 rounded-full text-sm font-semibold">
            Free
          </span>
        </strong>
      </p>
      <br />
      <p className="text-base">
        Muốn trải nghiệm mượt mà và số dư không giới hạn?
        <br />
        <span>Nâng cấp ngay lên gói</span>
        <span className="px-2 py-0.5 ml-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
          Premium
        </span>
      </p>

      <br />
      <Link
        to="/pricing"
        onClick={onClose}
        className="mt-3 inline-block px-4 py-2 border border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 transition font-semibold"
      >
        Xem chi tiết các gói dịch vụ
      </Link>

    </div>

    <h3 className="content-title mt-4">Thông tin thanh toán của bạn</h3>
    <p className="payment-placeholder">Quản lý các giao dịch mua gói dịch vụ và số dư đã thực hiện.</p>
  </div>
);


function CreditModal({ remainingCredit, errorMessage, onClose, onRefresh, userId, profile }) {
  const [activeTab, setActiveTab] = useState('creditBalance');

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
        return <CreditHistoryView userId={userId} />;
      case 'subscription':
        return <SubscriptionView onClose={onClose} />;
      default:
        return null;
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="credit-modal large-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>

        <div className="modal-header">
          <h2 className="modal-main-title flex items-center gap-2">
            Số dư tài khoản của :
            {profile?.fullName && (
              <span className="font-semibold text-gray-700">
                {profile.fullName}
              </span>
            )}
          </h2>


        </div>

        <div className="modal-body-container">
          <div className="modal-sidebar">
            <div
              className={`sidebar-item ${activeTab === 'creditBalance' ? 'active' : ''}`}
              onClick={() => setActiveTab('creditBalance')}
            >
              <FiCreditCard size={20} />
              <span>Số dư tài khoản</span>
            </div>

            <div
              className={`sidebar-item ${activeTab === 'creditHistory' ? 'active' : ''}`}
              onClick={() => setActiveTab('creditHistory')}
            >
              <FiClock size={20} />
              <span>Lịch sử tiêu dùng</span>
            </div>

            <div
              className={`sidebar-item ${activeTab === 'subscription' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscription')}
            >
              <FiZap size={20} />
              <span>Gói dịch vụ</span>
            </div>

            <div className="sidebar-item disabled">
              <FiUser size={20} />
              <span>Tài khoản</span>
            </div>
          </div>

          <div className="modal-content">{renderContent()}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default CreditModal;

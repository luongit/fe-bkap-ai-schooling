// CreditModal.js (Code ĐÃ CHỈNH SỬA)

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './css/CreditModal.css'; 

// Import icons
import { FiCreditCard, FiClock, FiZap, FiUser } from 'react-icons/fi';

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
        
        <hr className="my-4"/>
        <Link to="/buy-credits" onClick={onClose} className="buy-credit-btn-small">
            Mua thêm credit →
        </Link>
    </div>
);

// --- Component 2: History ---
const CreditHistoryView = () => (
    <div className="modal-content-area">
        <h3 className="content-title">Lịch sử Giao dịch Credit</h3>
        <p className="history-placeholder">
            Tại đây sẽ hiển thị chi tiết các giao dịch (cả nạp và trừ credit).
        </p>
        <div className="history-table-placeholder">
            {/* VÍ DỤ CẤU TRÚC BẢNG (sẽ cần triển khai thêm HTML/CSS) */}
            <table>
                <thead>
                    <tr><th>Thời gian</th><th>Mô tả</th><th>Biến động</th><th>Số dư</th></tr>
                </thead>
                <tbody>
                    <tr><td>13/10 09:20</td><td>Sử dụng tính năng Tạo ảnh AI</td><td>-200</td><td>9772</td></tr>
                    <tr><td>13/10 09:00</td><td>Cấp credit hàng ngày</td><td>+100</td><td>9972</td></tr>
                    <tr><td>12/10 18:30</td><td>Thực hiện chat thường</td><td>-10</td><td>9872</td></tr>
                </tbody>
            </table>
        </div>
    </div>
);

// --- Component 3: Subscription/Plans ---
const SubscriptionView = ({ onClose }) => (
    <div className="modal-content-area">
        <h3 className="content-title">Quản lý Gói Nâng cấp</h3>
        <div className="subscription-info">
            <p>Bạn đang sử dụng: **Gói Cơ Bản (Miễn phí)**</p>
            <p>Credit được cấp hàng ngày: **100 credits**</p>
            <hr/>
            <p>
                Để có trải nghiệm tốt hơn và credit không giới hạn, hãy nâng cấp lên gói **PRO**.
            </p>
            <Link to="/upgrade-plan" onClick={onClose} className="upgrade-btn">
                Xem chi tiết các Gói & Nâng cấp ngay! ✨
            </Link>
        </div>
        
        <h3 className="content-title mt-4">Thông tin Thanh toán</h3>
        <p className="payment-placeholder">Quản lý các giao dịch mua gói/credit đã thực hiện.</p>
    </div>
);


// --- Main Component ---
function CreditModal({ remainingCredit, errorMessage, onClose, onRefresh }) {
  // Đổi trạng thái ban đầu thành 'creditBalance'
  const [activeTab, setActiveTab] = useState('creditBalance'); 

  // Hàm chọn nội dung hiển thị
  const renderContent = () => {
    switch (activeTab) {
      case 'creditBalance':
        return <CreditBalanceView remainingCredit={remainingCredit} errorMessage={errorMessage} onRefresh={onRefresh} onClose={onClose} />;
      case 'creditHistory':
        return <CreditHistoryView />;
      case 'subscription':
        return <SubscriptionView onClose={onClose} />;
      default:
        return <CreditBalanceView remainingCredit={remainingCredit} errorMessage={errorMessage} onRefresh={onRefresh} onClose={onClose} />;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="credit-modal large-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        
        <div className="modal-header">
            <h2 className="modal-main-title">Quản lý Tài khoản & Credit</h2>
        </div>

        <div className="modal-body-container">
          
          {/* Menu Sidebar (ĐÃ CHỈNH SỬA) */}
          <div className="modal-sidebar">
            <div 
              className={`sidebar-item ${activeTab === 'creditBalance' ? 'active' : ''}`} 
              onClick={() => setActiveTab('creditBalance')}
            >
              <FiCreditCard size={20} />
              <span>Số dư Credit</span> {/* Mục 1 */}
            </div>
            <div 
              className={`sidebar-item ${activeTab === 'creditHistory' ? 'active' : ''}`} 
              onClick={() => setActiveTab('creditHistory')}
            >
              <FiClock size={20} />
              <span>Lịch sử Trừ Credit</span> {/* Mục 2 */}
            </div>
            <div 
              className={`sidebar-item ${activeTab === 'subscription' ? 'active' : ''}`} 
              onClick={() => setActiveTab('subscription')}
            >
              <FiZap size={20} />
              <span>Gói Nâng cấp</span> {/* Mục 3 */}
            </div>
             <div className="sidebar-item disabled">
              <FiUser size={20} />
              <span>Tài khoản (Soon)</span>
            </div>
          </div>
          
          {/* Nội dung chính */}
          <div className="modal-content">
            {renderContent()}
          </div>
        </div>

      </div>
    </div>
  );
}

export default CreditModal;
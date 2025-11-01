import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProfile } from "../services/profileService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./css/Header.css";
import CreditModal from "./CreditModal";
import api from "../services/apiToken"; // ✅ dùng axios instance có refresh

const LOW_CREDIT_THRESHOLD = 100;

function Header({ toggleSidebar }) {
  const [remainingCredit, setRemainingCredit] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [showCreditModal, setShowCreditModal] = useState(false);

  useEffect(() => {
    const checkToken = () => {
      const currentToken = localStorage.getItem("token");
      if (currentToken !== token) {
        setToken(currentToken);
        setRemainingCredit(null);
        setProfile(null);
        setErrorMessage("");
        document.body.dataset.authenticated = currentToken ? "true" : "false";
      }
    };

    const handleStorageChange = (event) => {
      if (event.key === "token") {
        checkToken();
      }
    };

    const handleLogout = () => {
      setToken(null);
      setRemainingCredit(null);
      setProfile(null);
      setErrorMessage("");
      localStorage.removeItem("hasShownCreditToast");
      document.body.dataset.authenticated = "false";
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userLoggedOut", handleLogout);
    const intervalId = setInterval(checkToken, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userLoggedOut", handleLogout);
      clearInterval(intervalId);
    };
  }, [token]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setProfile(null);
        return;
      }
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        console.error("Không lấy được profile:", err);
        setProfile(null);
      }
    };
    fetchProfile();
  }, [token]);

  // ✅ Dùng axios instance cho credit
  const fetchCredit = async (showToast = true) => {
    if (!token) {
      setRemainingCredit(null);
      setErrorMessage("");
      return;
    }
    try {
      const res = await api.get("/user/credits");
      const data = res.data;
      if (data && data.credit !== undefined) {
        setRemainingCredit(data.credit);
        setErrorMessage("");
        if (showToast && data.credit === 0 && !localStorage.getItem("hasShownCreditToast")) {
          toast.error("Đã hết credit, vui lòng mua thêm");
          localStorage.setItem("hasShownCreditToast", "true");
        }
      } else {
        setErrorMessage(data.message || "Không lấy được credit");
      }
    } catch (err) {
      console.error("Credit fetch error:", err);
      setErrorMessage("Không tải được credit");
    }
  };

  useEffect(() => {
    fetchCredit();
  }, [token]);

  useEffect(() => {
    const handleCreditUpdate = (event) => {
      const newCredit = event.detail?.remainingCredit;
      if (newCredit !== undefined) {
        setRemainingCredit(newCredit);
        setErrorMessage("");
        if (newCredit === 0 && !localStorage.getItem("hasShownCreditToast")) {
          toast.error("Đã hết credit, vui lòng mua thêm");
          localStorage.setItem("hasShownCreditToast", "true");
        }
      }
    };
    window.addEventListener("creditUpdated", handleCreditUpdate);
    return () => window.removeEventListener("creditUpdated", handleCreditUpdate);
  }, []);

  // Hàm xử lý mở/đóng Modal
  const handleCreditHeaderClick = () => {
    if (token) setShowCreditModal(true);
  };

  const handleModalClose = () => {
    setShowCreditModal(false);
  };

  // Xử lý refresh từ Modal
  const handleRefreshCredit = () => {
    setErrorMessage("Đang tải lại...");
    fetchCredit(false);
  };

  return (
    <header className="header">
      <Link to="/" className="brand">
        BACHKHOA APTECH
      </Link>
      <div className="header-right">
        {token && (
          <>
            <span className="user-info">{profile?.username || ""}</span>
            {remainingCredit !== null && (
              <div
                className={`credit-header-wrapper ${
                  remainingCredit < LOW_CREDIT_THRESHOLD ? "low-credit-warning" : ""
                }`}
                onClick={handleCreditHeaderClick}
                title="Xem chi tiết credit"
              >
                <span
                  className={`credit-display ${
                    remainingCredit === 0 ? "credit-empty" : ""
                  }`}
                >
                  💳 {remainingCredit}
                </span>
              </div>
            )}
            {errorMessage && <span className="credit-error">{errorMessage}</span>}
          </>
        )}
      </div>

      {showCreditModal && token && (
        <CreditModal
          remainingCredit={remainingCredit}
          errorMessage={errorMessage}
          onClose={handleModalClose}
          onRefresh={handleRefreshCredit}
          userId={profile?.userId}
        />
      )}
    </header>
  );
}

export default Header;

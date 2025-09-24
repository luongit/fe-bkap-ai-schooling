import { useState, useEffect } from "react";
import "./css/Header.css";
import { getProfile } from "../services/profileService";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify"; 

const API_URL = process.env.REACT_APP_API_URL || "";

function Header() {
  const [remainingCredit, setRemainingCredit] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [profile, setProfile] = useState(null);

  const token = localStorage.getItem("token");

  // Hàm check xem đã hiện toast chưa
  const hasShownToast = localStorage.getItem("hasShownCreditToast") === "true";

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        console.error("Không lấy được profile:", err);
      }
    };
    fetchProfile();
  }, [token]);

  // Fetch credit
  useEffect(() => {
    const fetchCredit = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/user/credits`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.credit !== undefined) {
          setRemainingCredit(data.credit);
          if (data.credit === 0 && !hasShownToast) {
            toast.error("Đã hết credit, vui lòng mua thêm");
            localStorage.setItem("hasShownCreditToast", "true"); // 🔒 đánh dấu đã hiện
          }
        } else {
          setErrorMessage(data.message || "Không lấy được credit");
        }
      } catch (err) {
        console.error("Credit fetch error:", err);
        setErrorMessage("Không tải được credit");
      }
    };
    fetchCredit();
  }, [token, hasShownToast]);

  // Listen for credit updates
  useEffect(() => {
    const handleCreditUpdate = (event) => {
      const newCredit = event.detail?.remainingCredit;
      if (newCredit !== undefined) {
        setRemainingCredit(newCredit);
        setErrorMessage("");
        if (newCredit === 0 && !hasShownToast) {
          toast.error("Đã hết credit, vui lòng mua thêm");
          localStorage.setItem("hasShownCreditToast", "true"); // 🔒 chỉ 1 lần duy nhất
        }
      }
    };
    window.addEventListener("creditUpdated", handleCreditUpdate);
    return () =>
      window.removeEventListener("creditUpdated", handleCreditUpdate);
  }, [hasShownToast]);

  // Logout vẫn không reset toast
  useEffect(() => {
    const handleLogout = () => {
      setRemainingCredit(null);
      setErrorMessage("");
      setProfile(null);
      // ❌ KHÔNG reset hasShownToast để toast chỉ hiện 1 lần duy nhất trên trình duyệt
    };

    window.addEventListener("userLoggedOut", handleLogout);
    return () => window.removeEventListener("userLoggedOut", handleLogout);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <h2 className="brand">BACHKHOA APTECH</h2>
      </div>

      <div className="header-right">
        <span className="user-info">
          Xin chào,{" "}
          <strong>{profile ? profile.fullName : "Người dùng"}</strong>
        </span>

        {remainingCredit !== null && (
          <span className="credit-display">💳 {remainingCredit}</span>
        )}
        {errorMessage && <span className="credit-error">{errorMessage}</span>}
      </div>
      
    </header>
    
  );
}

export default Header;

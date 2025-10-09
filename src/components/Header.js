import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./css/Header.css";
import { getProfile } from "../services/profileService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.REACT_APP_API_URL || "";

function Header({ toggleSidebar }) {
  const [remainingCredit, setRemainingCredit] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [profile, setProfile] = useState(null);

  const token = localStorage.getItem("token");
  const hasShownToast = localStorage.getItem("hasShownCreditToast") === "true";

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
    fetchCredit();
  }, [token, hasShownToast]);

  useEffect(() => {
    const handleCreditUpdate = (event) => {
      const newCredit = event.detail?.remainingCredit;
      if (newCredit !== undefined) {
        setRemainingCredit(newCredit);
        setErrorMessage("");
        if (newCredit === 0 && !hasShownToast) {
          toast.error("Đã hết credit, vui lòng mua thêm");
          localStorage.setItem("hasShownCreditToast", "true");
        }
      }
    };
    window.addEventListener("creditUpdated", handleCreditUpdate);
    return () => window.removeEventListener("creditUpdated", handleCreditUpdate);
  }, [hasShownToast]);

  return (
    <header className="header">
      <Link to="/" className="brand">
        BACHKHOA APTECH
      </Link>
      <div className="header-right">
        {token && (
          <>
            <span className="user-info"></span>
            {remainingCredit !== null && (
              <span
                className={`credit-display ${
                  remainingCredit === 0 ? "credit-empty" : ""
                }`}
              >
                💳 {remainingCredit}
              </span>
            )}
            {errorMessage && <span className="credit-error">{errorMessage}</span>}
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
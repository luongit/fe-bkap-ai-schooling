import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/apiToken";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải ít nhất 6 ký tự!");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/change-password", { oldPassword, newPassword });

      toast.success("Đổi mật khẩu thành công! Đang đăng xuất...");

      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth/login", { replace: true });
        window.location.reload();
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toast chuẩn góc trên bên phải như toàn app */}
      <ToastContainer position="top-right" autoClose={4000} />

      <div className="min-h-screen bg-gradient-to-br from-[#0ea5e9]/10 via-white to-[#38bdf8]/10 flex items-center justify-center px-4 py-12">
        
        {/* Form nhỏ gọn, thanh lịch */}
        <div className="w-full max-w-sm">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 p-8">
            
            {/* Tiêu đề nhỏ nhắn nhưng sang */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-full flex items-center justify-center shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Đổi mật khẩu</h1>
              <p className="text-sm text-gray-600 mt-2">Nhập mật khẩu mới để bảo vệ tài khoản</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Mật khẩu cũ */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu cũ</label>
                <input
                  type={showOld ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/20 transition pr-11 text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-[#0ea5e9]"
                >
                  {showOld ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Mật khẩu mới */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/20 transition pr-11 text-sm"
                  placeholder="Tối thiểu 6 ký tự"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-[#0ea5e9]"
                >
                  {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Xác nhận */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/20 transition pr-11 text-sm"
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-[#0ea5e9]"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Nút submit đẹp vừa phải */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-6 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-100 transition-all duration-200 disabled:opacity-70"
              >
                {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-6">
              Sau khi đổi, bạn sẽ được đăng xuất tự động
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
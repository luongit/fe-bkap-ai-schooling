import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProfile } from "../services/profileService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { User, Calendar, Mail, Phone, Edit3, Lock, Target, School, BookOpen, Sparkles } from "lucide-react";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        toast.success("Tải thông tin thành công!", { autoClose: 1000 });
      } catch (err) {
        console.error("Lỗi khi load profile", err);

        //  Nếu token hết hạn hoặc refresh token không hợp lệ → logout
        if (err.status === 401 || err.response?.status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
          localStorage.clear();
          window.location.href = "/auth/login";
          return;
        }

        toast.error("Không thể tải thông tin");
      } finally {
        setLoading(false);
      }

    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0ea5e9]/10 via-white to-[#38bdf8]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-6 border-[#0ea5e9] border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
          <p className="text-lg font-medium text-gray-700">Đang tải hồ sơ...</p>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0ea5e9]/10 via-white to-[#38bdf8]/10 flex items-center justify-center px-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-10 max-w-md text-center border border-white/50">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Không tìm thấy thông tin</h2>
          <p className="text-gray-600 mb-8">Vui lòng thử lại sau</p>
          <button onClick={() => window.location.reload()} className="bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition">
            Thử lại
          </button>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="min-h-screen bg-gradient-to-br from-[#0ea5e9]/10 via-white to-[#38bdf8]/10 py-12 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Tiêu đề thanh lịch */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] bg-clip-text text-transparent">
              Hồ sơ cá nhân
            </h1>
            <p className="mt-4 text-xl text-gray-700">Xin chào, <span className="font-bold text-[#0ea5e9]">{profile.fullName}</span></p>
          </div>

          {/* Card chính */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">

            {/* Header gradient + avatar */}
            <div className="bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] p-8 text-white">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-28 h-28 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center shadow-2xl ring-8 ring-white/30">
                  <User className="w-16 h-16 text-white" strokeWidth={2.5} />
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-3xl font-bold">{profile.fullName}</h2>
                  <p className="text-xl opacity-90 mt-1">@{profile.username}</p>
                  <span className="inline-block mt-4 px-6 py-2 bg-white/25 rounded-full text-sm font-medium backdrop-blur">
                    {profile.objectType === "STUDENT" && "Học sinh"}
                    {profile.objectType === "TEACHER" && "Giáo viên"}
                    {profile.objectType === "SCHOOL" && "Quản trị trường"}
                    {profile.objectType === "SYSTEM" && "Quản trị hệ thống"}
                  </span>
                </div>
              </div>
            </div>

            {/* Nội dung thông tin */}
            <div className="p-8">

              {/* Học sinh */}
              {profile.objectType === "STUDENT" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem icon={<User className="w-6 h-6" />} label="Họ và tên" value={profile.fullName} />
                  <InfoItem icon={<School className="w-6 h-6" />} label="Lớp học" value={profile.className || "Chưa xác định"} />
                  <InfoItem icon={<BookOpen className="w-6 h-6" />} label="Mã học sinh" value={profile.code || "—"} />
                  <InfoItem icon={<Calendar className="w-6 h-6" />} label="Ngày sinh" value={profile.birthdate ? new Date(profile.birthdate).toLocaleDateString("vi-VN") : "Chưa cập nhật"} />
                </div>
              )}

              {/* Giáo viên */}
              {profile.objectType === "TEACHER" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem icon={<User className="w-6 h-6" />} label="Họ và tên" value={profile.fullName} />
                  <InfoItem icon={<Mail className="w-6 h-6" />} label="Email" value={profile.email} />
                  <InfoItem icon={<School className="w-6 h-6" />} label="Lớp chủ nhiệm" value={profile.homeroom || "Chưa có"} />
                  <InfoItem icon={<Phone className="w-6 h-6" />} label="Số điện thoại" value={profile.phone || "Chưa cập nhật"} />
                </div>
              )}

              {/* Sở thích (nếu có) */}
              {profile.hobbies?.length > 0 && (
                <div className="mt-8 p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-200/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-pink-600" />
                    Sở thích & Đam mê
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {profile.hobbies.map((hobby, i) => (
                      <span key={i} className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm rounded-full font-medium shadow">
                        {hobby}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Nút hành động */}
              {(profile.objectType === "STUDENT" || profile.objectType === "TEACHER") && (
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  <ActionButton to="/profile/change-password" color="from-amber-500 to-orange-600" icon={<Lock className="w-5 h-5" />}>
                    Đổi mật khẩu
                  </ActionButton>

                  <ActionButton to="/profile/edit" color="from-[#0ea5e9] to-[#38bdf8]" icon={<Edit3 className="w-5 h-5" />}>
                    Chỉnh sửa thông tin
                  </ActionButton>

                  {profile.objectType === "STUDENT" && profile.objectId && (
                    <ActionButton to={`/students/${profile.objectId}/goals`} color="from-emerald-500 to-teal-600" icon={<Target className="w-5 h-5" />}>
                      Mục tiêu học TRENGTH
                    </ActionButton>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50/80 px-8 py-5 border-t border-gray-200/50">
              <p className="text-center text-sm text-gray-600">
                Bằng việc sử dụng hệ thống, bạn đã đồng ý với{" "}
                <a href="#" className="text-[#0ea5e9] font-medium hover:underline">Điều khoản</a> và{" "}
                <a href="#" className="text-[#0ea5e9] font-medium hover:underline">Chính sách bảo mật</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Component nhỏ để tái sử dụng
const InfoItem = ({ icon, label, value }) => (
  <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-200/50 flex items-center gap-4 hover:shadow-md transition">
    <div className="text-[#0ea5e9]">{icon}</div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const ActionButton = ({ to, color, icon, children }) => (
  <Link
    to={to}
    className={`group flex items-center gap-3 px-7 py-4 bg-gradient-to-r ${color} text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
  >
    {icon}
    {children}
  </Link>
);

export default ProfilePage;
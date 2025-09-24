import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProfile } from "../services/profileService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        toast.success("Tải thông tin thành công!");
      } catch (err) {
        console.error("Lỗi khi load profile", err);
        toast.error("Không thể tải thông tin profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-indigo-800 font-medium">
            Đang tải thông tin...
          </p>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );

  if (!profile)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Không tìm thấy profile
          </h2>
          <p className="text-gray-600 mb-6">
            Vui lòng thử lại sau hoặc liên hệ quản trị viên
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Thông tin cá nhân
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            Xem và quản lý thông tin tài khoản của bạn
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <div className="flex items-center">
              <div className="mr-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile.fullName}</h2>
                <p className="opacity-90">{profile.username}</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-6">
            {profile.objectType === "STUDENT" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Họ tên
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {profile.fullName}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Lớp đang học
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {profile.className}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Mã học sinh
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {profile.code}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Ngày sinh
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {profile.birthdate
                        ? new Date(profile.birthdate).toLocaleDateString("vi-VN")
                        : "Chưa có"}
                    </p>
                  </div>
                </div>

                {profile.hobbies?.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Sở thích
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profile.hobbies.map((hobby, index) => (
                        <span
                          key={index}
                          className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full"
                        >
                          {hobby}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {profile.objectType === "TEACHER" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Họ tên
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {profile.fullName}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Email
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {profile.email}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Lớp chủ nhiệm
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {profile.homeroom}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Số điện thoại
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {profile.phone}
                  </p>
                </div>
              </div>
            )}

            {(profile.objectType === "SCHOOL" ||
              profile.objectType === "SYSTEM") && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Admin</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {profile.fullName}
                  </p>
                </div>
              )}

            {(profile.objectType === "STUDENT" || profile.objectType === "TEACHER") && (
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/profile/edit"
                  className="inline-flex items-center bg-indigo-600 text-white py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Chỉnh sửa thông tin
                </Link>

                {profile.objectType === "STUDENT" && profile.objectId && (
                  <Link
                    to={`/students/${profile.objectId}/goals`} // Sử dụng objectId thay vì userId
                    className="inline-flex items-center bg-green-600 text-white py-3 px-8 rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6l4 2"
                      />
                    </svg>
                    Mục tiêu đề ra
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="px-8 py-5 bg-gray-50 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Bằng cách sử dụng hệ thống, bạn đồng ý với{" "}
              <a
                href="#"
                className="text-indigo-600 hover:underline font-medium"
              >
                Điều khoản sử dụng
              </a>{" "}
              và{" "}
              <a
                href="#"
                className="text-indigo-600 hover:underline font-medium"
              >
                Chính sách bảo mật
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../services/profileService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ProfileEditPage() {
  const [profile, setProfile] = useState(null);
  const [hobbies, setHobbies] = useState([]);
  const [birthdate, setBirthdate] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setEmail(data.email || "");
        setPhone(data.phone || "");
        if (data.hobbies) {
          setHobbies(data.hobbies);
          setInputValue(data.hobbies.join(", "));
        }
        if (data.birthdate) {
          setBirthdate(data.birthdate); // dạng dd/MM/yyyy hoặc yyyy-MM-dd tùy BE trả về
        }

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

  const handleSave = async () => {
    setSaving(true);
    try {
      let payload = {};
      if (profile.objectType === "STUDENT") {
        payload = { hobbies, birthdate: birthdate || null };
        
      } else if (profile.objectType === "TEACHER") {
        payload = { email, phone };
      }

      const updated = await updateProfile(payload);
      setProfile(updated);
      toast.success("Cập nhật thông tin thành công!");
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      console.error("Lỗi khi cập nhật profile", err);
      toast.error("Cập nhật thất bại. Vui lòng thử lại!");
    } finally {
      setSaving(false);
    }
  };

  const handleBlur = () => {
    const values = inputValue
      .split(",")
      .map(h => h.trim())
      .filter(h => h);
    setHobbies(values);
    setInputValue(values.join(", "));
  };

  const addHobby = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      const newHobby = inputValue.trim();
      if (!hobbies.includes(newHobby)) {
        const newHobbies = [...hobbies, newHobby];
        setHobbies(newHobbies);
        setInputValue(newHobbies.join(", "));
        toast.success("Đã thêm sở thích mới");
      } else {
        toast.info("Sở thích này đã tồn tại");
      }
      e.preventDefault();
    }
  };

  const removeHobby = (index) => {
    const newHobbies = hobbies.filter((_, i) => i !== index);
    setHobbies(newHobbies);
    setInputValue(newHobbies.join(", "));
    toast.info("Đã xóa sở thích");
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl text-indigo-800 font-medium">Đang tải thông tin...</p>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );

  if (!profile) return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy profile</h2>
        <p className="text-gray-600 mb-6">Vui lòng thử lại sau hoặc liên hệ quản trị viên</p>
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

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Chỉnh sửa thông tin
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            Cập nhật thông tin cá nhân của bạn
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{profile.fullName}</h2>
                  <p className="opacity-90 capitalize">{profile.objectType.toLowerCase()}</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="text-white bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">
            {profile.objectType === "STUDENT" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-1">Họ tên</p>
                    <p className="text-lg font-semibold text-gray-900">{profile.fullName}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-1">Lớp đang học</p>
                    <p className="text-lg font-semibold text-gray-900">{profile.className}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sở thích</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {hobbies.map((hobby, index) => (
                      <span key={index} className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                        {hobby}
                        <button
                          onClick={() => removeHobby(index)}
                          className="ml-1 text-indigo-600 hover:text-indigo-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyPress={addHobby}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Nhập sở thích, cách nhau bởi dấu phẩy hoặc nhấn Enter"
                  />
                  <p className="mt-1 text-sm text-gray-500">Nhập sở thích và nhấn Enter để thêm từng mục, hoặc phân cách bằng dấu phẩy</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                  <input
                    type="date"
                    value={birthdate ? new Date(birthdate.split("/").reverse().join("-")).toISOString().split("T")[0] : ""}
                    onChange={(e) => setBirthdate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  <p className="mt-1 text-sm text-gray-500">Chọn ngày sinh (dd/MM/yyyy)</p>
                </div>

              </>
            )}

            {profile.objectType === "TEACHER" && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Họ tên</p>
                  <p className="text-lg font-semibold text-gray-900">{profile.fullName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Nhập email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Lớp chủ nhiệm</p>
                  <p className="text-lg font-semibold text-gray-900">{profile.homeroom}</p>
                </div>
              </>
            )}

            <div className="flex justify-between pt-4">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Quay lại
              </button>

              <button
                className="flex items-center bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="px-8 py-5 bg-gray-50 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Bằng cách lưu thay đổi, bạn đồng ý với{" "}
              <a href="#" className="text-indigo-600 hover:underline font-medium">Điều khoản sử dụng</a> và{" "}
              <a href="#" className="text-indigo-600 hover:underline font-medium">Chính sách bảo mật</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileEditPage;
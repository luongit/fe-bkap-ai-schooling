import { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../services/profileService";

function ProfileEditPage() {
  const [profile, setProfile] = useState(null);
  const [hobbies, setHobbies] = useState([]);
  const [inputValue, setInputValue] = useState(""); // 👈 thêm state riêng
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile(userId);
        setProfile(data);
        setEmail(data.email || "");
        setPhone(data.phone || "");
        if (data.hobbies) {
          setHobbies(data.hobbies);
          setInputValue(data.hobbies.join(", ")); // hiển thị ban đầu
        }
      } catch (err) {
        console.error("Lỗi khi load profile", err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);

  const handleSave = async () => {
    try {
      let payload = {};
      if (profile.objectType === "STUDENT") {
        payload = { hobbies };
      } else if (profile.objectType === "TEACHER") {
        payload = { email, phone };
      }

      const updated = await updateProfile(userId, payload);
      setProfile(updated);
      alert("Cập nhật thành công!");
    } catch (err) {
      alert("Lỗi khi cập nhật profile");
    }
  };

  const handleBlur = () => {
    // Khi rời khỏi input mới parse
    const values = inputValue
      .split(",")
      .map(h => h.trim())
      .filter(h => h);
    setHobbies(values);
    setInputValue(values.join(", ")); // chuẩn hóa lại chuỗi
  };

  if (loading) return <p>Đang tải...</p>;
  if (!profile) return <p>Không tìm thấy profile</p>;

  return (
    <div>
      <h1>Chỉnh sửa thông tin</h1>

      {profile.objectType === "STUDENT" && (
        <>
          <p><b>Họ tên:</b> {profile.fullName}</p>
          <p><b>Lớp đang học:</b> {profile.className}</p>
          <p>
            <b>Sở thích:</b>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)} // cho nhập tự do
              onBlur={handleBlur} // khi mất focus mới parse
              style={{ width: "100%", padding: "6px", marginTop: "4px" }}
            />
          </p>
        </>
      )}

      {profile.objectType === "TEACHER" && (
        <>
          <p><b>Họ tên:</b> {profile.fullName}</p>
          <p>
            <b>Email:</b>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </p>
          <p>
            <b>Số điện thoại:</b>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </p>
          <p><b>Lớp chủ nhiệm:</b> {profile.homeroom}</p>
        </>
      )}

      <button className="btn primary" style={{ marginTop: "1rem", display: "inline-block" }} onClick={handleSave}>Lưu thay đổi</button>
    </div>
  );
}



export default ProfileEditPage;

import { useEffect, useState } from "react";
import { getProfile } from "../services/profileService";
import { Link } from "react-router-dom";



function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile(userId);
        setProfile(data);
      } catch (err) {
        console.error("Lỗi khi load profile", err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);

  if (loading) return <p>Đang tải...</p>;
  if (!profile) return <p>Không tìm thấy profile</p>;

  return (
    <div>
      <h1>Thông tin cá nhân</h1>

      {profile.objectType === "STUDENT" && (
        <>
          <p><b>Tài khoản:</b> {profile.username}</p>
          <p><b>Họ tên:</b> {profile.fullName}</p>
          <p><b>Lớp đang học:</b> {profile.className}</p>
          {profile.hobbies?.length > 0 && (
            <p><b>Sở thích:</b> {profile.hobbies.join(", ")}</p>
          )}
        </>
      )}

      {profile.objectType === "TEACHER" && (
        <>
          <p><b>Họ tên:</b> {profile.fullName}</p>
          <p><b>Email:</b> {profile.email}</p>
          <p><b>Lớp chủ nhiệm:</b> {profile.homeroom}</p>
          <p><b>Số điện thoại:</b> {profile.phone}</p>
        </>
      )}

      {(profile.objectType === "SCHOOL" || profile.objectType === "SYSTEM") && (
        <p><b>Admin:</b> {profile.fullName}</p>
      )}
      {(profile.objectType === "STUDENT" || profile.objectType === "TEACHER") && (
        <Link to="/profile/edit" className="btn primary" style={{ marginTop: "1rem", display: "inline-block" }}>
          Chỉnh sửa thông tin
        </Link>
      )}
    </div>
  );
}

export default ProfilePage;

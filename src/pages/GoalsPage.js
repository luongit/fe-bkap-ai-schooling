import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

function GoalsPage() {
  const { studentId } = useParams(); // lấy từ URL
  const [goals, setGoals] = useState([]);

  // form state
  const [goal, setGoal] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [style, setStyle] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [deadline, setDeadline] = useState("");

  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/student-goals/student/${studentId}`
      );
      setGoals(res.data);
    } catch (err) {
      console.error("Lỗi load mục tiêu:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        goal,
        subject,
        level,
        style,
        status,
        deadline,
      };

      if (editingId) {
        await axios.put(`${API_URL}/student-goals/${editingId}`, payload);
      } else {
        await axios.post(
          `${API_URL}/student-goals/student/${studentId}`,
          payload
        );
      }
      resetForm();
      fetchGoals();
    } catch (err) {
      console.error(
        editingId ? "Lỗi cập nhật mục tiêu:" : "Lỗi thêm mục tiêu:",
        err
      );
    }
  };

  const deleteGoal = async (id) => {
    try {
      await axios.delete(`${API_URL}/student-goals/${id}`);
      fetchGoals();
    } catch (err) {
      console.error("Lỗi xóa mục tiêu:", err);
    }
  };
   
  // Hàm chuyển status sang tiếng Việt
const getStatusLabel = (status) => {
  switch (status) {
    case "PENDING":
      return "Chưa bắt đầu";
    case "IN_PROGRESS":
      return "Đang thực hiện";
    case "DONE":
      return "Hoàn thành";
    default:
      return "Không xác định";
  }
};

  const startEdit = (g) => {
    setEditingId(g.id);
    setGoal(g.goal);
    setSubject(g.subject || "");
    setLevel(g.level || "");
    setStyle(g.style || "");
    setStatus(g.status);
    setDeadline(g.deadline ? g.deadline.split("T")[0] : "");
  };

  const resetForm = () => {
    setEditingId(null);
    setGoal("");
    setSubject("");
    setLevel("");
    setStyle("");
    setStatus("PENDING");
    setDeadline("");
  };

  useEffect(() => {
    fetchGoals();
  }, [studentId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6 text-center">
          🎯 Quản lý mục tiêu học tập
        </h1>

        {/* Form thêm/sửa mục tiêu */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Nhập mục tiêu..."
            required
          />
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Môn học (Toán, Văn, Anh...)"
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">-- Chọn mức độ --</option>
            <option value="Cơ bản">Cơ bản</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Nâng cao">Nâng cao</option>
          </select>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">-- Chọn phong cách --</option>
            <option value="Tự học">Tự học</option>
            <option value="Nhóm">Nhóm</option>
            <option value="Game-based">Game-based</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="PENDING">Chưa hoàn thành</option>
            <option value="IN_PROGRESS">Đang thực hiện</option>
            <option value="DONE">Hoàn thành</option>
          </select>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg"
            >
              {editingId ? "💾 Lưu thay đổi" : "➕ Thêm mục tiêu"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-400 text-white py-2 rounded-lg"
              >
                ❌ Hủy
              </button>
            )}
          </div>
        </form>

        {/* Danh sách mục tiêu */}
        {loading ? (
          <p className="text-center">⏳ Đang tải...</p>
        ) : goals.length === 0 ? (
          <p className="text-center">Chưa có mục tiêu nào.</p>
        ) : (
          <ul className="space-y-4">
            {goals.map((g) => (
              <li
                key={g.id}
                className="flex justify-between items-center bg-gray-50 border rounded-lg p-4"
              >
                <div>
                  <p className="font-semibold">{g.goal}</p>
                  {g.subject && <p className="text-sm">Môn học: {g.subject}</p>}
                  {g.level && <p className="text-sm">Mức độ: {g.level}</p>}
                  {g.style && <p className="text-sm">Phong cách: {g.style}</p>}
                  
                  <p className="text-sm">Trạng thái: {getStatusLabel(g.status)}</p>

                  {g.deadline && (
                    <p className="text-sm">
                      Deadline:{" "}
                      {new Date(g.deadline).toLocaleDateString("vi-VN")}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(g)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-lg"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => deleteGoal(g.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg"
                  >
                    ❌ Xóa
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default GoalsPage;

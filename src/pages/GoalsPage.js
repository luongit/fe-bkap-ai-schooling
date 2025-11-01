import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../services/apiToken"; // ✅ dùng axios instance có auto refresh

function GoalsPage() {
  const { studentId } = useParams();
  const [goals, setGoals] = useState([]);
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
      const res = await api.get(`/student-goals/student/${studentId}`);
      setGoals(res.data);
    } catch (err) {
      console.error("Lỗi load mục tiêu:", err);
      toast.error(err.response?.data?.message || "Không thể tải danh sách mục tiêu");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { goal, subject, level, style, status, deadline };

      if (editingId) {
        await api.put(`/student-goals/${editingId}`, payload);
        toast.success("Cập nhật mục tiêu thành công!");
      } else {
        await api.post(`/student-goals/student/${studentId}`, payload);
        toast.success("Thêm mục tiêu thành công!");
      }

      resetForm();
      fetchGoals();
    } catch (err) {
      console.error(editingId ? "Lỗi cập nhật mục tiêu:" : "Lỗi thêm mục tiêu:", err);
      toast.error(err.response?.data?.message || "Lỗi khi lưu mục tiêu");
    }
  };

  const deleteGoal = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa mục tiêu này?")) return;
    try {
      await api.delete(`/student-goals/${id}`);
      toast.success("Xóa mục tiêu thành công!");
      fetchGoals();
    } catch (err) {
      console.error("Lỗi xóa mục tiêu:", err);
      toast.error(err.response?.data?.message || "Lỗi khi xóa mục tiêu");
    }
  };

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
      <ToastContainer position="top-right" autoClose={3000} />
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
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Nhập mục tiêu..."
            required
          />
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Môn học (Toán, Văn, Anh...)"
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Chọn mức độ --</option>
            <option value="Cơ bản">Cơ bản</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Nâng cao">Nâng cao</option>
          </select>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Chọn phong cách --</option>
            <option value="Tự học">Tự học</option>
            <option value="Nhóm">Nhóm</option>
            <option value="Game-based">Game-based</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="PENDING">Chưa bắt đầu</option>
            <option value="IN_PROGRESS">Đang thực hiện</option>
            <option value="DONE">Hoàn thành</option>
          </select>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {editingId ? "💾 Lưu thay đổi" : "➕ Thêm mục tiêu"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition-colors"
              >
                ❌ Hủy
              </button>
            )}
          </div>
        </form>

        {/* Danh sách mục tiêu */}
        {loading ? (
          <p className="text-center text-indigo-600">⏳ Đang tải...</p>
        ) : goals.length === 0 ? (
          <p className="text-center text-gray-600">Chưa có mục tiêu nào.</p>
        ) : (
          <ul className="space-y-4">
            {goals.map((g) => (
              <li
                key={g.id}
                className="flex justify-between items-center bg-gray-50 border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="font-semibold text-gray-800">{g.goal}</p>
                  {g.subject && <p className="text-sm text-gray-600">Môn học: {g.subject}</p>}
                  {g.level && <p className="text-sm text-gray-600">Mức độ: {g.level}</p>}
                  {g.style && <p className="text-sm text-gray-600">Phong cách: {g.style}</p>}
                  <p className="text-sm text-gray-600">Trạng thái: {getStatusLabel(g.status)}</p>
                  {g.deadline && (
                    <p className="text-sm text-gray-600">
                      Deadline: {new Date(g.deadline).toLocaleDateString("vi-VN")}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(g)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => deleteGoal(g.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
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

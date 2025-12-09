import React, { useState, useEffect } from "react";
import api from "../services/apiToken";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function CreateAssistantPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => toast.error("Không tải được danh mục!"));
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Tên trợ lý không được để trống!");
    if (!categoryId) return toast.error("Bạn phải chọn danh mục!");

    setLoading(true);
    toast.loading("Đang tạo trợ lý...");

    const dto = {
      name,
      description,
      systemPrompt,
      categoryId,
      authorId: 1,
      isPublished: true,
    };

    const formData = new FormData();
    formData.append("dto", new Blob([JSON.stringify(dto)], { type: "application/json" }));
    if (avatar) formData.append("avatar", avatar);

    try {
      await api.post("/assistants", formData);

      toast.dismiss();
      toast.success("Tạo trợ lý thành công! 🎉");

      setTimeout(() => {
        navigate("/assistants");
      }, 800);
    } catch (err) {
      toast.dismiss();
      toast.error("Lỗi: Không thể tạo trợ lý!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-12 px-4 bg-gray-50 min-h-screen">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-10 border border-gray-100">

        <h1 className="text-3xl font-bold text-gray-900 mb-8">✨ Tạo trợ lý AI mới</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div>
              <label className="block font-medium mb-1">Ảnh đại diện</label>
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
            </div>

            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400">
                  Chưa có ảnh
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block mb-1 font-medium">Tên trợ lý *</label>
            <input
              className="w-full px-4 py-3 border rounded-2xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ví dụ: Bác Sĩ Tâm Lý Ấm Áp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 font-medium">Mô tả</label>
            <textarea
              className="w-full px-4 py-3 border rounded-2xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              rows="3"
              placeholder="Giới thiệu nhân vật AI..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Prompt */}
          <div>
            <label className="block mb-1 font-medium">System Prompt</label>
            <textarea
              className="w-full px-4 py-3 border rounded-2xl bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none"
              rows="5"
              placeholder={`Ví dụ: 
Bạn là một chuyên gia tư vấn tâm lý nhẹ nhàng, luôn trò chuyện thân thiện, ấm áp…`}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block mb-1 font-medium">Danh mục *</label>
            <select
              className="w-full px-4 py-3 border rounded-2xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 mt-4 rounded-2xl text-white text-lg font-semibold 
            bg-gradient-to-r from-blue-600 to-purple-600 transition shadow-lg
            ${loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
          >
            🚀 {loading ? "Đang tạo..." : "Tạo Trợ Lý AI"}
          </button>
        </form>
      </div>
    </div>
  );
}

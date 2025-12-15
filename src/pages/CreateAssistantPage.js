import React, { useState, useEffect } from "react";
import api from "../services/apiToken";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreateAssistantPage() {
  const navigate = useNavigate();

  
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [knowledgeFiles, setKnowledgeFiles] = useState([]);

  const [loading, setLoading] = useState(false);

  
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => toast.error("Không tải được danh mục!"));
  }, []);

  // ===== AVATAR =====
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  // ===== KNOWLEDGE FILES =====
  const handleKnowledgeFilesChange = (e) => {
    setKnowledgeFiles(Array.from(e.target.files));
  };

  // ===== CATEGORY =====
  const isDuplicateCategory = (name) =>
    categories.some(
      (cat) => cat.label.toLowerCase() === name.toLowerCase().trim()
    );

  const handleCreateCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return toast.error("Tên danh mục không được để trống!");
    if (isDuplicateCategory(trimmed))
      return toast.error("Danh mục này đã tồn tại!");

    setCreatingCategory(true);
    try {
      const res = await api.post("/categories/student-create", {
        name: trimmed,
      });

      setCategories((prev) => [...prev, res.data]);
      setCategoryId(res.data.id);
      toast.success(`Đã tạo danh mục "${trimmed}"`);
      setShowNewCategoryModal(false);
      setNewCategoryName("");
    } catch {
      toast.error("Không thể tạo danh mục!");
    } finally {
      setCreatingCategory(false);
    }
  };

  // ===== SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Tên trợ lý không được để trống!");
    if (!categoryId) return toast.error("Bạn phải chọn danh mục!");

    setLoading(true);
    toast.info("Đang tạo trợ lý...");

    const dto = {
      name,
      description,
      systemPrompt,
      categoryId,
      authorId: 1,
      isPublished: true,
    };

    const formData = new FormData();
    formData.append(
      "dto",
      new Blob([JSON.stringify(dto)], { type: "application/json" })
    );

    if (avatar) formData.append("avatar", avatar);

    knowledgeFiles.forEach((file) => {
      formData.append("knowledgeFiles", file);
    });

    try {
      await api.post("/assistants/create-with-files", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("🎉 Tạo trợ lý AI thành công!");
      setTimeout(() => navigate("/assistants"), 800);
    } catch {
      toast.error("❌ Không thể tạo trợ lý!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-12 px-4 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={2200} />

      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-10 border">
        <h1 className="text-3xl font-bold mb-8">✨ Tạo Trợ Lý AI</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* AVATAR */}
          <div className="flex gap-6 items-center">
            <div>
              <label className="font-medium block mb-1">Ảnh đại diện</label>
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
            </div>

            <div className="w-24 h-24 rounded-2xl border overflow-hidden">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Chưa có ảnh
                </div>
              )}
            </div>
          </div>

          {/* NAME */}
          <div>
            <label className="font-medium">Tên trợ lý *</label>
            <input
              className="w-full px-4 py-3 border rounded-2xl bg-gray-50"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="font-medium">Mô tả</label>
            <textarea
              className="w-full px-4 py-3 border rounded-2xl bg-gray-50"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* PROMPT */}
          <div>
            <label className="font-medium">System Prompt</label>
            <textarea
              className="w-full px-4 py-3 border rounded-2xl bg-gray-50"
              rows={5}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
          </div>

          {/* KNOWLEDGE FILES */}
          <div>
            <label className="font-medium">
              📚 Tài liệu kiến thức (PDF, DOCX, TXT)
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleKnowledgeFilesChange}
            />

            {knowledgeFiles.length > 0 && (
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                {knowledgeFiles.map((f, i) => (
                  <li key={i}>{f.name}</li>
                ))}
              </ul>
            )}
          </div>

          {/* CATEGORY */}
          <div>
            <label className="font-medium">Danh mục *</label>
            <select
              className="w-full px-4 py-3 border rounded-2xl bg-gray-50"
              value={categoryId}
              onChange={(e) => {
                if (e.target.value === "create-new") {
                  setShowNewCategoryModal(true);
                } else {
                  setCategoryId(e.target.value);
                }
              }}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
              <option value="create-new">➕ Tạo danh mục mới</option>
            </select>
          </div>

          {/* SUBMIT */}
          <button
            disabled={loading}
            className="w-full py-4 rounded-2xl text-white text-lg font-semibold
            bg-gradient-to-r from-blue-600 to-purple-600"
          >
            {loading ? "Đang tạo..." : "🚀 Tạo Trợ Lý AI"}
          </button>
        </form>
      </div>

      {/* CREATE CATEGORY MODAL */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">➕ Tạo danh mục</h2>

            <input
              autoFocus
              className="w-full px-4 py-3 border rounded-xl bg-gray-50"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewCategoryModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={creatingCategory}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white"
              >
                {creatingCategory ? "Đang tạo..." : "Tạo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

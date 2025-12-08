import React, { useState, useEffect } from "react";
import api from "../services/apiToken";
import { useNavigate } from "react-router-dom";

export default function CreateAssistantPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      navigate("/assistants");
    } catch (err) {
      console.error("Lỗi tạo assistant", err);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Tạo trợ lý mới</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          className="w-full px-3 py-2 border rounded"
          placeholder="Tên trợ lý"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <textarea
          className="w-full px-3 py-2 border rounded"
          placeholder="Mô tả"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <textarea
          className="w-full px-3 py-2 border rounded"
          placeholder="System Prompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
        />

        <select
          className="w-full px-3 py-2 border rounded"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">Chọn danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <input type="file" onChange={(e) => setAvatar(e.target.files[0])} />

        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
          Tạo Trợ lý
        </button>

      </form>
    </div>
  );
}

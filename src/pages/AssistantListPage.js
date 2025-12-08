import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/apiToken";

export default function AssistantListPage() {
  const [assistants, setAssistants] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadAssistants();
  }, []);

  const loadAssistants = async () => {
    try {
      const res = await api.get("/assistants");
      setAssistants(res.data);
    } catch (err) {
      console.error("Lỗi khi tải assistants", err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Danh sách Trợ lý AI</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => navigate("/assistants/create")}
        >
          + Tạo trợ lý
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {assistants.map((a) => (
          <div
            key={a.id}
            className="p-4 shadow bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
            onClick={() => navigate(`/assistants/${a.id}/chat`)}
          >
            <img
              src={a.avatarUrl || "https://via.placeholder.com/80"}
              className="w-20 h-20 mx-auto rounded-full"
            />
            <h2 className="text-center mt-3 font-bold">{a.name}</h2>
            <p className="text-center text-gray-500 text-sm">{a.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/apiToken";

export default function AssistantListPage() {
  const [assistants, setAssistants] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/assistants").then((res) => setAssistants(res.data));
  }, []);

  return (
    <div className="flex justify-center w-full">

      {/* KHUNG TRUNG TÂM */}
      <div className="w-full" style={{ maxWidth: "1100px" }}>

        <div className="p-10">

          {/* ===========================
              BANNER
          ============================ */}
          <section className="bg-white rounded-3xl p-10 shadow-md flex flex-col md:flex-row justify-between items-center mb-12">
            <div className="max-w-xl">
              <h1 className="text-4xl font-bold text-gray-900 leading-snug">
                Chatbot AI tiếng Việt miễn phí
              </h1>

              <p className="mt-4 text-gray-600 text-lg">
                Trò chuyện với hàng trăm nhân vật AI Việt Nam và idol Kpop miễn phí.
              </p>

              <button
                onClick={() => navigate("/assistants/create")}
                className="mt-6 bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition"
              >
                + Tạo nhân vật mới
              </button>
            </div>

            <div className="flex gap-3 mt-6 md:mt-0">
              {[1,2,3].map(i => (
                <div key={i} className="w-24 h-36 bg-gray-200 rounded-xl shadow-inner"></div>
              ))}
            </div>
          </section>

          {/* ===========================
              RECENT CHAT
          ============================ */}
          <h2 className="text-2xl font-semibold mb-4">Cuộc trò chuyện gần đây</h2>

          <div className="flex gap-6 overflow-x-auto mb-12 pb-3">
            {assistants.slice(0, 5).map((a) => (
              <div
                key={a.id}
                onClick={() => navigate(`/assistants/${a.id}/chat`)}
                className="min-w-[260px] bg-white rounded-2xl shadow-md p-4 cursor-pointer hover:shadow-lg transition"
              >
                <img
                  src={a.avatarUrl || "https://via.placeholder.com/120"}
                  className="w-20 h-20 rounded-full mx-auto object-cover"
                />

                <h3 className="text-center text-lg font-bold mt-3">{a.name}</h3>

                <p className="text-center text-gray-500 text-sm line-clamp-2">
                  {a.description}
                </p>

                <p className="text-center text-sm text-gray-400 mt-1 italic">
                  bởi {a.authorFullName || "Không rõ"}
                </p>
              </div>
            ))}
          </div>

          {/* ===========================
              TẤT CẢ TRỢ LÝ - 4 CARD / HÀNG
          ============================ */}
          <h2 className="text-2xl font-semibold mb-6">Tất cả nhân vật AI</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {assistants.map((a) => (
              <div
                key={a.id}
                onClick={() => navigate(`/assistants/${a.id}/chat`)}
                className="bg-white rounded-3xl shadow-md p-4 cursor-pointer hover:shadow-xl transition"
              >

                {/* Ảnh */}
                <div className="w-full aspect-[4/5] overflow-hidden rounded-2xl">
                  <img
                    src={a.avatarUrl || "https://via.placeholder.com/300"}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* TÊN */}
                <h3 className="text-lg font-bold mt-3 text-gray-900">
                  {a.name}
                </h3>

                {/* AUTHOR */}
                <p className="text-sm text-gray-500 mb-1">
                  bởi {a.authorFullName || "Không rõ"}
                </p>

                {/* DESCRIPTION */}
                <p className="text-gray-600 text-sm line-clamp-2 min-h-[40px]">
                  {a.description}
                </p>

                {/* VIEWS & USED */}
                <div className="flex justify-between items-center text-gray-600 text-sm mt-3">
                  <div className="flex items-center gap-1">
                    👁 {a.views || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    💬 {a.used || 0}
                  </div>
                </div>

                {/* BUTTON CHAT */}
                <button
                  className="mt-4 bg-blue-600 text-white rounded-full px-4 py-2 w-full hover:bg-blue-700 transition"
                >
                  Chat
                </button>
              </div>
            ))}

          </div>

        </div>
      </div>
    </div>
  );
}

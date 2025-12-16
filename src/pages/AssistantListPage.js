import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/apiToken";

export default function AssistantListPage() {
  const [allAssistants, setAllAssistants] = useState([]);
  const [recentAssistants, setRecentAssistants] = useState([]);
  const [user, setUser] = useState(null);   // ← Thêm dòng này
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Lấy user từ localStorage (đây là cách phổ biến nhất)
  useEffect(() => {
    const loggedUser = localStorage.getItem("user");
    // Tên key có thể là: "user", "authUser", "currentUser" → bạn check thử trong DevTools > Application > Local Storage
    if (loggedUser) {
      try {
        setUser(JSON.parse(loggedUser));
      } catch (e) {
        console.log("Lỗi parse user:", e);
      }
    }
  }, []);

  // Lấy danh sách tất cả + sort hot
  useEffect(() => {
    api.get("/assistants")
      .then((res) => {
        const sorted = res.data.sort((a, b) => (b.used || 0) - (a.used || 0));
        setAllAssistants(sorted);
      })
      .finally(() => setLoading(false));
  }, []);

  // Lấy lịch sử chat của user (nếu đã login)

  useEffect(() => {
    const userId = user?.id || user?.userId;
    if (!userId) {
      console.log(" user null hoặc chưa login", user);
      setRecentAssistants([]);
      return;
    }

    console.log(" Gọi API lấy conversation của user:", userId);
    api.get(`/conversations/chatbot/user/${userId}`)
      .then((res) => {
        let unique = [];
        let used = new Set();

        res.data.forEach((c) => {
          if (c.assistant && !used.has(c.assistant.id)) {
            used.add(c.assistant.id);
            unique.push(c.assistant);
          }
        });

        setRecentAssistants(unique.slice(0, 8));
      })
      .catch((err) => {
        console.error("❌ Lỗi lấy conversation:", err);
        setRecentAssistants([]);
      });

  }, [user]);


  if (loading) return <div className="flex justify-center items-center h-64 text-xl">Đang tải...</div>;

  return (
    <div className="flex justify-center w-full bg-gray-50 min-h-screen">
      <div className="w-full" style={{ maxWidth: "1100px" }}>
        <div className="p-6 md:p-10">
          {/* BANNER – giữ nguyên */}
          <section className="bg-white rounded-3xl p-8 md:p-12 shadow-lg flex flex-col md:flex-row justify-between items-center mb-12">
            <div className="max-w-xl text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Chatbot AI tiếng Việt miễn phí
              </h1>
              <p className="mt-4 text-gray-600 text-lg">
                Trò chuyện với hàng trăm nhân vật AI Việt Nam và idol Kpop miễn phí.
              </p>
              <button
                onClick={() => navigate("/assistants/create")}
                className="mt-8 bg-black text-white px-7 py-3.5 rounded-full font-medium hover:bg-gray-800 transition"
              >
                + Tạo nhân vật mới
              </button>
            </div>
            <div className="flex gap-4 mt-8 md:mt-0">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-28 h-40 bg-gray-200 rounded-2xl shadow-inner"></div>
              ))}
            </div>
          </section>

          {/* TIẾP TỤC TRÒ CHUYỆN – chỉ hiện khi đã login */}
          {user && (
            <>
              <h2 className="text-2xl font-semibold mb-5">
                {recentAssistants.length > 0 ? "Tiếp tục trò chuyện" : "Bạn chưa trò chuyện với ai"}
              </h2>
              <div className="flex gap-6 overflow-x-auto pb-4 mb-12">
                {recentAssistants.length > 0 ? (
                  recentAssistants.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => navigate(`/assistants/${a.id}/chat`)}
                      className="min-w-[260px] bg-white rounded-2xl shadow-md p-5 cursor-pointer hover:shadow-xl transition"
                    >
                      <img
                        src={a.avatarUrl || "https://via.placeholder.com/120"}
                        className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-gray-100"
                      />
                      <h3 className="text-center text-lg font-bold mt-4">{a.name}</h3>
                      <p className="text-center text-gray-500 text-sm line-clamp-2 mt-2">
                        {a.description || "Không có mô tả"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 py-10 text-center w-full">
                    Khám phá và bắt đầu trò chuyện với một AI nào đó nhé!
                  </p>
                )}
              </div>
            </>
          )}



          {/* TẤT CẢ NHÂN VẬT */}
          <h2 className="text-2xl font-semibold mb-6">Tất cả nhân vật AI</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {allAssistants.map((a) => (
              <div
                key={a.id}
                onClick={() => navigate(`/assistants/${a.id}/chat`)}
                className="bg-white rounded-3xl shadow-md overflow-hidden cursor-pointer hover:shadow-2xl transition group"
              >
                <div className="w-full aspect-[4/5] overflow-hidden">
                  <img
                    src={a.avatarUrl || "https://via.placeholder.com/300"}
                    className="w-full h-full object-cover group-hover:scale-110 transition"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold truncate">{a.name}</h3>
                  <p className="text-sm text-gray-500">
                    {a.description.length > 30
                      ? a.description.slice(0, 35) + "..."
                      : a.description}
                  </p>



                  <p className="text-sm text-gray-500">bởi {a.authorFullName || "Không rõ"}</p>
                  <div className="flex justify-between text-sm text-gray-600 mt-4">
                    {/* Mắt + views */}
                    <div className="flex items-center gap-1 text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span>{a.views?.toLocaleString() || 0}</span>
                    </div>

                    {/* Chat icon + số chat */}
                    <div className="flex items-center gap-1 text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6l-4 4V5z" />
                      </svg>
                      <span>{a.used?.toLocaleString() || 0}</span>
                    </div>
                  </div>

                  {/* Nút Chat ngay */}
                  <button className="mt-5 w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 flex items-center justify-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6l-4 4V5z" />
                    </svg>
                    Chat ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
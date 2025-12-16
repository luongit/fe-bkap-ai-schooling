
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../services/apiToken";
import { format } from "date-fns";

export default function AssistantChatPage() {
  const { assistantId } = useParams();

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const USER_ID = storedUser?.id || storedUser?.userId;
  const ACCESS_TOKEN = storedUser?.accessToken || localStorage.getItem("token");

  const [assistant, setAssistant] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const viewTrackedRef = useRef(false);



  useEffect(() => {
  async function init() {
    try {
      // 1. Lấy assistant 
      const assistantRes = await api.get(`/assistants/${assistantId}`);
      setAssistant(assistantRes.data);

      // 2. TĂNG VIEW — CHỈ 1 LẦN
      if (!viewTrackedRef.current) {
        viewTrackedRef.current = true;
        api.patch(`/assistants/${assistantId}/view`);
      }

      // 3. Lấy conversation nếu login
      if (!USER_ID) return;

      const res = await api.get(`/conversations/chatbot/user/${USER_ID}`);
      const list = res.data.filter(
        (c) => c.assistant?.id === Number(assistantId)
      );
      setConversations(list);
    } catch (err) {
      console.error("❌ Lỗi khởi tạo trang:", err);
    }
  }

  init();
}, [assistantId, USER_ID]);



  useEffect(() => {
    if (inputRef.current) {
      // Reset chiều cao về auto để tính toán lại chính xác khi xóa bớt text
      inputRef.current.style.height = "auto";
      // Đặt chiều cao mới dựa trên nội dung (tối đa khoảng 150px - 200px tùy ý)
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  /* ============================================================
        📌 MỞ CUỘC TRÒ CHUYỆN
     ============================================================ */
  const openConversation = async (id) => {
    try {
      setConversationId(id);
      const res = await api.get(`/chat/conversation/${id}`);
      setMessages(res.data);
    } catch (err) {
      console.error("❌ Lỗi load messages:", err);
    }
  };

  /* ============================================================
        ➕ TẠO CUỘC TRÒ CHUYỆN MỚI — ĐÃ SỬA ENDPOINT ĐÚNG
     ============================================================ */
  const newConversation = async () => {
    if (!USER_ID || isCreating) return;

    setIsCreating(true);
    try {
      const res = await api.post("/conversations/chatbot", {
        assistantId: Number(assistantId),
        userId: USER_ID,
      });

      const newConv = res.data;
      setConversationId(newConv.id);
      setMessages([]);
      setConversations((prev) => [newConv, ...prev]);
    } catch (err) {
      console.error("❌ Lỗi tạo cuộc trò chuyện mới:", err);
      alert("Không thể tạo cuộc trò chuyện. Vui lòng thử lại!");
    } finally {
      setIsCreating(false);
    }
  };

 
  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setIsTyping(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          conversationId,
          userId: USER_ID,
          message: userText,
        }),
      });

      if (!response.ok) throw new Error("Stream error");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.includes('"text"')) {
            try {
              const json = JSON.parse(line.replace(/^data: /, ""));
              if (json.text) {
                aiText += json.text;
                setMessages((prev) => [
                  ...prev.filter((m) => m.role !== "partial"),
                  { role: "partial", content: aiText },
                ]);
              }
            } catch { }
          }
        }
      }

      // Hoàn thành → thay partial bằng assistant message thật
      setMessages((prev) => [
        ...prev.filter((m) => m.role !== "partial"),
        { role: "assistant", content: aiText },
      ]);
    } catch (err) {
      console.error("❌ Lỗi streaming:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Xin lỗi, có lỗi xảy ra khi xử lý tin nhắn." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Có thể thêm toast ở đây sau
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };


  return (
    <div className={`flex h-screen overflow-hidden font-sans antialiased ${darkMode ? "bg-gray-950 text-white" : "bg-gray-50"} transition-colors duration-500`}>
      {/* ==================== SIDEBAR ==================== */}
      <div className={`w-80 ${darkMode ? "bg-gray-900/90 border-gray-800" : "bg-white border-gray-200"} border-r flex flex-col shadow-2xl transition-all duration-300`}>
        {/* Header */}
        <div className={`p-6 border-b ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`absolute inset-0 rounded-full ${isTyping ? "animate-ping bg-blue-400/30" : ""}`}></div>
                <img
                  src={assistant?.avatarUrl || "/avatar.png"}
                  alt={assistant?.name}
                  className="w-14 h-14 rounded-full object-cover ring-4 ring-blue-500/30 shadow-xl relative z-10"
                />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-4 border-gray-900 dark:border-gray-950 shadow-lg"></div>
              </div>
              <div>
                <h2 className="font-bold text-lg">{assistant?.name || "Đang tải..."}</h2>
                <p className="text-sm text-green-400 font-medium">Online • Sẵn sàng</p>
              </div>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-700 transition-all hover:scale-110"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* New conversation button */}
        <div className="px-4 pt-4">
          <button
            onClick={newConversation}
            disabled={isCreating}
            className={`w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-700 hover:via-blue-700 hover:to-cyan-700 text-white font-bold py-4 rounded-2xl shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3 group ${isCreating ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <span className="text-2xl group-hover:rotate-12 transition-transform">+</span>
            {isCreating ? "Đang tạo..." : "Cuộc trò chuyện mới"}
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-gray-600 dark:scrollbar-thumb-gray-700">
          {conversations.length === 0 ? (
            <div className="text-center mt-20 text-gray-500">
              <div className="text-5xl mb-4">💬</div>
              <p>Chưa có cuộc trò chuyện nào</p>
              <p className="text-sm mt-2">Bắt đầu một cuộc mới nhé!</p>
            </div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => openConversation(c.id)}
                className={`mb-3 p-4 rounded-2xl cursor-pointer transition-all duration-300 group backdrop-blur-sm ${conversationId === c.id
                  ? "bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/50 shadow-xl"
                  : "hover:bg-gray-800/50 dark:hover:bg-gray-800/70 hover:shadow-lg hover:scale-105"
                  }`}
              >
                <p className={`font-semibold truncate group-hover:text-cyan-400 transition-colors`}>
                  {c.title || "Cuộc trò chuyện mới"}
                </p>
                <p className="text-xs text-gray-400 mt-1 opacity-80">
                  {c.createdAt ? format(new Date(c.createdAt), "dd/MM • HH:mm") : "—"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ==================== MAIN CHAT ==================== */}
      <div className="flex-1 flex flex-col relative">


        {/* Trang giới thiệu - chưa chọn conversation */}
        {conversationId === null && (
          <div className="flex-1 flex flex-col justify-center items-center text-center px-8">
            <div className="relative mb-10">
              <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl"></div>
              <img
                src={assistant?.avatarUrl || "/avatar.png"}
                alt="AI"
                className="w-48 h-48 rounded-full shadow-2xl ring-8 ring-blue-500/30 object-cover relative z-10 animate-float"
              />
            </div>
            <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {assistant?.name}
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl leading-relaxed mb-12 px-6">
              {assistant?.description || "Trợ lý AI thông minh, mạnh mẽ và luôn sẵn sàng hỗ trợ bạn với mọi nhu cầu!"}
            </p>
            <button
              onClick={newConversation}
              disabled={isCreating}
              className={`bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-700 hover:via-blue-700 hover:to-cyan-700 text-white text-xl font-bold py-5 px-12 rounded-3xl shadow-2xl hover:shadow-cyan-500/40 transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 flex items-center gap-4 group ${isCreating ? "opacity-70" : ""}`}
            >
              Bắt đầu trò chuyện ngay
              <span className="text-3xl group-hover:translate-x-2 transition-transform">→</span>
            </button>
          </div>
        )}

        {/* Nội dung chat */}
        {conversationId !== null && (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
              <div className="max-w-4xl mx-auto space-y-8">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex animate-fade-in-up ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === "assistant" && (
                      <div className="flex items-start gap-5 max-w-4xl group">
                        <div className="relative flex-shrink-0">
                          <img
                            src={assistant?.avatarUrl || "/avatar.png"}
                            alt="AI"
                            className="w-11 h-11 rounded-full shadow-xl ring-4 ring-blue-500/20"
                          />
                        </div>

                        <div className={`px-8 py-6 rounded-3xl rounded-tl-none ${darkMode ? "bg-gradient-to-br from-gray-800/90 to-gray-900/90" : "bg-white"} shadow-2xl border ${darkMode ? "border-gray-700/50" : "border-gray-200"} max-w-3xl backdrop-blur-sm`}>
                          <div className="rich-response space-y-6">
                            {/* Phát hiện và xử lý danh sách đánh số 1.*, 2.*, ... với tiêu đề in đậm */}
                            {m.content.split(/\n\d+\.\s*\*\*(.*?)\*\*:/g).length > 1 ? (
                              <>
                                {m.content.split(/\n(?=\d+\.\s*\*\*.*?\*\*:)/).map((block, idx) => {
                                  const match = block.match(/^(\d+\.\s*\*\*(.*?)\*\*:\s*)([\s\S]*)/);
                                  if (!match) return <p key={idx} className="text-base leading-relaxed whitespace-pre-wrap">{block}</p>;

                                  const [, prefix, title, content] = match;

                                  return (
                                    <div key={idx} className="flex gap-4 animate-fade-in">
                                      <span className="flex-shrink-0 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                                        {prefix.replace(/\*\*.*?\*\*:/, '').trim()}
                                      </span>
                                      <div className="flex-1">
                                        <h3 className="font-bold text-lg text-cyan-400 mb-2">
                                          {title}
                                        </h3>
                                        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                          {content.trim()}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </>
                            ) : (
                              // Nếu không có định dạng đặc biệt, render bình thường
                              <div className="prose prose-sm dark:prose-invert max-w-none text-base leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                                {m.content}
                              </div>
                            )}

                            {/* Đoạn kết thúc nếu có */}
                            {m.content.includes("Để có cái nhìn chi tiết và chính xác hơn") && (
                              <p className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700 text-sm italic text-gray-600 dark:text-gray-400">
                                {m.content.split("Để có cái nhìn chi tiết và chính xác hơn")[1]}
                              </p>
                            )}
                          </div>

                          {/* Nút copy */}
                          <button
                            onClick={() => copyToClipboard(m.content)}
                            className="mt-6 flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:translate-x-1"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Sao chép toàn bộ phản hồi
                          </button>
                        </div>
                      </div>
                    )}

                    {m.role === "user" && (
                      <div className="px-7 py-5 rounded-3xl rounded-tr-none bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white shadow-2xl max-w-3xl">
                        <div className="whitespace-pre-wrap text-base leading-relaxed font-medium">
                          {m.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-start gap-5 animate-fade-in">
                    <img
                      src={assistant?.avatarUrl || "/avatar.png"}
                      alt="AI"
                      className="w-11 h-11 rounded-full shadow-xl ring-4 ring-blue-500/20"
                    />
                    <div className="px-7 py-5 rounded-3xl rounded-tl-none bg-gray-200 dark:bg-gray-800 shadow-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce animation-delay-200"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce animation-delay-400"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input area */}
            <div className={`border-t ${darkMode ? "border-gray-800 bg-gray-900/95" : "border-gray-200 bg-white/95"} backdrop-blur-md p-6 shadow-2xl`}>
              <div className="max-w-4xl mx-auto">
                <div className="flex items-end gap-4 bg-gray-100 dark:bg-gray-800/70 px-5 py-4 rounded-3xl shadow-2xl ring-2 ring-transparent focus-within:ring-blue-500/50 transition-all duration-300">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Nhập tin nhắn của bạn..."
                    rows={1}
                    className="flex-1 bg-transparent outline-none text-base placeholder-gray-500 font-medium resize-none max-h-[200px] overflow-y-auto py-2 scrollbar-hide"
                    style={{ minHeight: "24px" }}
                  />

                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isTyping}
                    className={`p-3 mb-1 rounded-2xl transition-all duration-300 transform hover:scale-110 flex-shrink-0 ${input.trim() && !isTyping
                        ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg hover:shadow-cyan-500/50"
                        : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 4L3 11l17 7-7-14z" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-4 opacity-70">
                  Trợ lý AI có thể mắc lỗi • Hãy kiểm tra thông tin quan trọng
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
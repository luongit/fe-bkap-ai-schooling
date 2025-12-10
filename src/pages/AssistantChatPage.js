import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../services/apiToken";
import { format } from "date-fns";

export default function AssistantChatPage() {
  const { assistantId } = useParams();
  const USER_ID = 1;

  const [assistant, setAssistant] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /* ============================================================
        🔥 USEEFFECT - LOAD DUY NHẤT 1 LẦN KHI CHỌN TRỢ LÝ
        Bao gồm: load assistant + load conversation list + tạo convo đầu tiên
     ============================================================ */
  useEffect(() => {
    async function init() {
      // Load assistant
      const assistantRes = await api.get(`/assistants/${assistantId}`);
      setAssistant(assistantRes.data);

      // Load conversation list
      const res = await api.get(`/conversations/user/${USER_ID}`);
      const list = res.data.filter(
        (c) => c.assistant.id === Number(assistantId)
      );

      setConversations(list);

      // Nếu chưa có conversation → tạo 1 cái duy nhất
      if (list.length === 0) {
        const newConv = await api.post("/conversations", {
          assistantId: Number(assistantId),
          userId: USER_ID,
        });

        setConversationId(newConv.data.id);
        setConversations([newConv.data]); // add vào danh sách
      }
    }

    init();
  }, [assistantId]);

  /* ============================================================
        📌 LOAD MESSAGES KHI MỞ CONVERSATION
     ============================================================ */
  const openConversation = async (id) => {
    setConversationId(id);
    const res = await api.get(`/chat/conversation/${id}`);
    setMessages(res.data);
  };

  /* ============================================================
        ➕ NEW CONVERSATION (Button)
     ============================================================ */
  const newConversation = async () => {
    const res = await api.post("/conversations", {
      assistantId: Number(assistantId),
      userId: USER_ID,
    });

    const newConv = res.data;

    setConversationId(newConv.id);
    setMessages([]);

    // Cập nhật danh sách hội thoại
    setConversations((prev) => [newConv, ...prev]);
  };

  /* ============================================================
        📨 GỬI TIN NHẮN + STREAMING
     ============================================================ */
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setIsTyping(true);

    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/chat/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          conversationId,
          userId: USER_ID,
          message: userText,
        }),
      }
    );

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
          } catch {}
        }
      }
    }

    setMessages((prev) => [
      ...prev.filter((m) => m.role !== "partial"),
      { role: "assistant", content: aiText },
    ]);

    setIsTyping(false);
  };

  /* ============================================================
        📌 AUTO SCROLL
     ============================================================ */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ============================================================
        📋 COPY TEXT
     ============================================================ */
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  /* ============================================================
        🎨 UI
     ============================================================ */
  return (
    <div
      className={`flex h-screen ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      } transition-colors duration-300`}
    >
      {/* ==================== SIDEBAR ==================== */}
      <div
        className={`w-80 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-r flex flex-col transition-colors`}
      >
        {/* Header */}
        <div
          className={`p-6 border-b ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={assistant?.avatarUrl || "/avatar.png"}
                  alt={assistant?.name}
                  className="w-14 h-14 rounded-full object-cover ring-4 ring-blue-500/20"
                />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h2
                  className={`font-bold text-lg ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {assistant?.name || "Đang tải..."}
                </h2>
                <p className="text-sm text-green-500 font-medium">
                  ● Đang hoạt động
                </p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              } transition`}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* New conversation button */}
        <div className="p-4">
          <button
            onClick={newConversation}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3.5 px-5 rounded-2xl transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Cuộc trò chuyện mới
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => openConversation(c.id)}
              className={`group mb-2 p-4 rounded-2xl cursor-pointer transition-all ${
                c.id === conversationId
                  ? darkMode
                    ? "bg-gray-700 border border-blue-500/50"
                    : "bg-blue-50 border border-blue-300"
                  : darkMode
                  ? "hover:bg-gray-700/70"
                  : "hover:bg-gray-100"
              }`}
            >
              <p
                className={`font-medium truncate ${
                  darkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {c.title || "Cuộc trò chuyện mới"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {c.createdAt
                  ? format(new Date(c.createdAt), "dd/MM/yyyy HH:mm")
                  : "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== MAIN CHAT ==================== */}
      <div className="flex-1 flex flex-col">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Greeting */}
            {messages.length === 0 && !isTyping && (
              <div className="text-center mt-20 animate-fadeIn">
                <img
                  src={assistant?.avatarUrl}
                  alt="AI"
                  className="w-28 h-28 rounded-full mx-auto mb-6 shadow-2xl ring-8 ring-blue-500/10"
                />
                <h3
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Chào bạn! Có điều gì mình có thể giúp bạn không?
                </h3>
                <p className="text-gray-500 mt-3">
                  Mình sẵn sàng trò chuyện rồi đây ✨
                </p>
              </div>
            )}

            {/* Render messages */}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                } group`}
              >
                {m.role === "assistant" && (
                  <div className="flex items-start gap-4 max-w-3xl">
                    <img
                      src={assistant?.avatarUrl}
                      alt="AI"
                      className="w-10 h-10 rounded-full shadow-lg ring-2 ring-blue-500/20"
                    />
                    <div
                      className={`px-6 py-4 rounded-3xl rounded-tl-lg ${
                        darkMode
                          ? "bg-gray-800 text-gray-100 border border-gray-700"
                          : "bg-white text-gray-800 shadow-xl border border-gray-100"
                      } relative`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {m.content}
                      </div>
                      <button
                        onClick={() => copyToClipboard(m.content)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition p-2 hover:bg-gray-200/50 rounded-lg"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                )}

                {m.role === "user" && (
                  <div className="px-6 py-4 rounded-3xl rounded-tr-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl max-w-3xl relative">
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {m.content}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-start gap-4">
                <img
                  src={assistant?.avatarUrl}
                  alt="AI"
                  className="w-10 h-10 rounded-full shadow-lg"
                />
                <div className="bg-gray-200 dark:bg-gray-700 px-5 py-4 rounded-3xl rounded-tl-lg">
                  <div className="flex gap-2">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div
          className={`border-t ${
            darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
          } p-6`}
        >
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div
                className={`flex items-center gap-4 ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                } rounded-3xl px-6 py-4 shadow-2xl transition-all ring-2 ring-transparent focus-within:ring-blue-500`}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    (e.preventDefault(), sendMessage())
                  }
                  placeholder="Nhập tin nhắn của bạn..."
                  className="flex-1 bg-transparent outline-none text-lg placeholder-gray-500"
                />

                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                  className={`relative p-3 rounded-full transition-all transform ${
                    input.trim() && !isTyping
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white scale-100 hover:scale-110 shadow-lg"
                      : "bg-gray-400 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  {input.trim() && !isTyping && (
                    <span className="absolute inset-0 rounded-full bg-white/30 animate-ping"></span>
                  )}
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500 mt-4">
              Trợ lý AI • Có thể đưa ra thông tin không chính xác
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../services/apiToken";
import { format } from "date-fns";

export default function AssistantChatPage() {
  const { assistantId } = useParams();

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const USER_ID = storedUser?.id || storedUser?.userId;

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
        🚀 KHỞI TẠO TRANG — KHÔNG TẠO CUỘC TRÒ CHUYỆN MỚI
     ============================================================ */
  useEffect(() => {
    async function init() {
      try {
        const assistantRes = await api.get(`/assistants/${assistantId}`);
        setAssistant(assistantRes.data);

        if (!USER_ID) return;

        // Load list conversation, nhưng không mở & không tạo mới!
        const res = await api.get(`/conversations/user/${USER_ID}`);
        const list = res.data.filter(
          (c) => c.assistant.id === Number(assistantId)
        );
        setConversations(list);

        // ❗ KHÔNG tự tạo conversation
        // ❗ KHÔNG tự mở conversation

      } catch (err) {
        console.error("❌ Lỗi khởi tạo:", err);
      }
    }

    init();
  }, [assistantId]);

  /* ============================================================
        📌 Load messages khi mở conversation (user click)
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
        ➕ Tạo cuộc trò chuyện mới (NGƯỜI DÙNG BẤM)
     ============================================================ */
  const newConversation = async () => {
    if (!USER_ID) return;

    const res = await api.post("/conversations", {
      assistantId: Number(assistantId),
      userId: USER_ID,
    });

    const newConv = res.data;

    setConversationId(newConv.id);
    setMessages([]);
    setConversations((prev) => [newConv, ...prev]);
  };

  /* ============================================================
        📨 Gửi tin nhắn + streaming
     ============================================================ */
  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;

    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setIsTyping(true);

    const response = await fetch(`${process.env.REACT_APP_API_URL}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storedUser?.accessToken || localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        conversationId,
        userId: USER_ID,
        message: userText,
      }),
    });

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
        📜 Auto scroll
     ============================================================ */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ============================================================
        📋 Copy text
     ============================================================ */
  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  /* ============================================================
        🎨 UI
     ============================================================ */
 return (
  <div className={`flex h-screen overflow-hidden ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50"} transition-colors duration-500`}>
    {/* ==================== SIDEBAR ==================== */}
    <div className={`w-80 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-r flex flex-col transition-all duration-300`}>
      {/* Header */}
      <div className={`p-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={assistant?.avatarUrl || "/avatar.png"}
                alt={assistant?.name}
                className="w-14 h-14 rounded-full object-cover ring-4 ring-blue-500/30 shadow-lg"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-4 border-white dark:border-gray-800"></div>
            </div>
            <div>
              <h2 className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>
                {assistant?.name || "Đang tải..."}
              </h2>
              <p className="text-sm text-green-500">Đang hoạt động</p>
            </div>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* New conversation */}
      <div className="p-4">
        <button
          onClick={newConversation}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3.5 rounded-2xl shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          + Cuộc trò chuyện mới
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
        {conversations.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">Chưa có cuộc trò chuyện nào</p>
        ) : (
          conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => openConversation(c.id)}
              className={`mb-2 p-4 rounded-2xl cursor-pointer transition-all duration-200 group ${
                conversationId === c.id
                  ? darkMode
                    ? "bg-gray-700"
                    : "bg-blue-50"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <p className={`font-medium truncate ${darkMode ? "text-gray-100" : "text-gray-800"} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>
                {c.title || "Cuộc trò chuyện mới"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {c.createdAt ? format(new Date(c.createdAt), "dd/MM/yyyy HH:mm") : "—"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>

    {/* ==================== MAIN CHAT ==================== */}
    <div className="flex-1 flex flex-col">
      {/* Trang giới thiệu */}
      {conversationId === null && (
        <div className="flex-1 flex flex-col justify-center items-center text-center px-8 animate-fade-in">
          <div className="relative mb-8">
            <img
              src={assistant?.avatarUrl || "/avatar.png"}
              alt="AI"
              className="w-40 h-40 rounded-full shadow-2xl ring-8 ring-blue-500/20 object-cover"
            />
            <div className="absolute inset-0 rounded-full animate-ping bg-blue-500 opacity-10"></div>
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
            {assistant?.name}
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed mb-10">
            {assistant?.description || "Trợ lý AI thông minh, sẵn sàng hỗ trợ bạn với mọi câu hỏi!"}
          </p>
          <button
            onClick={newConversation}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg font-semibold py-4 px-10 rounded-2xl shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105"
          >
            Bắt đầu cuộc trò chuyện →
          </button>
        </div>
      )}

      {/* Chat khi đã có conversation */}
      {conversationId !== null && (
        <>
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            <div className="max-w-4xl mx-auto space-y-8">

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex animate-fade-in ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.role === "assistant" && (
                    <div className="flex items-start gap-4 max-w-3xl">
                      <img
                        src={assistant?.avatarUrl || "/avatar.png"}
                        alt="AI"
                        className="w-10 h-10 rounded-full shadow-md flex-shrink-0"
                      />
                      <div className={`px-6 py-4 rounded-3xl rounded-tl-none ${darkMode ? "bg-gray-700 text-white" : "bg-white"} shadow-lg`}>
                        <div className="whitespace-pre-wrap text-base leading-relaxed">{m.content}</div>
                        <button
                          onClick={() => copyToClipboard(m.content)}
                          className="mt-3 text-xs text-blue-500 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Sao chép
                        </button>
                      </div>
                    </div>
                  )}

                  {m.role === "user" && (
                    <div className="px-6 py-4 rounded-3xl rounded-tr-none bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg max-w-3xl">
                      <div className="whitespace-pre-wrap text-base leading-relaxed">{m.content}</div>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-start gap-4 animate-fade-in">
                  <img
                    src={assistant?.avatarUrl || "/avatar.png"}
                    alt="AI"
                    className="w-10 h-10 rounded-full shadow-md"
                  />
                  <div className="px-6 py-4 rounded-3xl rounded-tl-none bg-gray-200 dark:bg-gray-700 shadow-lg">
                    <div className="flex space-x-2">
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
          <div className={`border-t ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} p-6`}>
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-700 px-6 py-4 rounded-3xl shadow-inner focus-within:ring-4 focus-within:ring-blue-500/30 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Nhập tin nhắn của bạn..."
                  className="flex-1 bg-transparent outline-none text-base placeholder-gray-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    input.trim()
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-blue-500/50"
                      : "bg-gray-400 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-7-9-7v14z" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                Nhấn Enter để gửi • Shift + Enter để xuống dòng
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  </div>
);
}

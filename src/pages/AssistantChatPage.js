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
              </div>
              <div>
                <h2 className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {assistant?.name || "Đang tải..."}
                </h2>
              </div>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* New conversation */}
        <div className="p-4">
          <button
            onClick={newConversation}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg"
          >
            + Cuộc trò chuyện mới
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => openConversation(c.id)}
              className="mb-2 p-4 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <p className={`font-medium truncate ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                {c.title || "Cuộc trò chuyện mới"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {c.createdAt ? format(new Date(c.createdAt), "dd/MM/yyyy HH:mm") : "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== MAIN CHAT ==================== */}
      <div className="flex-1 flex flex-col">
        
        {/* ======================================================
              🟦 TRANG GIỚI THIỆU — CHƯA BẮT ĐẦU CUỘC TRÒ CHUYỆN
           ====================================================== */}
        {conversationId === null && (
          <div className="flex-1 flex flex-col justify-center items-center text-center px-6">
            <img
              src={assistant?.avatarUrl}
              alt="AI"
              className="w-32 h-32 rounded-full shadow-xl mb-6 ring-4 ring-blue-500/20"
            />
            <h1 className={`text-3xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-800"}`}>
              {assistant?.name}
            </h1>
            <p className="text-gray-500 max-w-xl leading-relaxed">
              {assistant?.description || "Trợ lý AI sẵn sàng hỗ trợ bạn mọi lúc!"}
            </p>
            <button
              onClick={newConversation}
              className="mt-8 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl shadow-lg"
            >
              Bắt đầu cuộc trò chuyện →
            </button>
          </div>
        )}

        {/* ======================================================
                    CHAT UI — CHỈ HIỂN THỊ KHI ĐÃ CÓ conversationId
           ====================================================== */}
        {conversationId !== null && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-8">
              <div className="max-w-4xl mx-auto space-y-6">

                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {m.role === "assistant" && (
                      <div className="flex items-start gap-4 max-w-3xl">
                        <img
                          src={assistant?.avatarUrl}
                          alt="AI"
                          className="w-10 h-10 rounded-full shadow-lg"
                        />
                        <div
                          className={`px-6 py-4 rounded-3xl ${
                            darkMode ? "bg-gray-800 text-white" : "bg-white shadow"
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{m.content}</div>
                        </div>
                      </div>
                    )}

                    {m.role === "user" && (
                      <div className="px-6 py-4 rounded-3xl bg-blue-600 text-white shadow max-w-3xl">
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-start gap-4">
                    <img
                      src={assistant?.avatarUrl}
                      alt="AI"
                      className="w-10 h-10 rounded-full shadow-lg"
                    />
                    <div className="bg-gray-200 dark:bg-gray-700 px-5 py-4 rounded-3xl">
                      ...
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="border-t p-6 bg-white dark:bg-gray-800">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-700 px-6 py-4 rounded-3xl">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 bg-transparent outline-none"
                  />

                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className={`p-3 rounded-full ${
                      input.trim()
                        ? "bg-blue-600 text-white"
                        : "bg-gray-400 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    Gửi
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

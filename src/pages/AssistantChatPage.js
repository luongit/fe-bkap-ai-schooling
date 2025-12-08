import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/apiToken";

export default function AssistantChatPage() {
  const { assistantId } = useParams();
  const USER_ID = 1;

  const [assistant, setAssistant] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    api.get(`/assistants/${assistantId}`).then((res) => setAssistant(res.data));
    loadConversations();
  }, [assistantId]);

  const loadConversations = async () => {
    const res = await api.get(`/conversations/user/${USER_ID}`);
    // Chỉ lấy conv của trợ lý này
    setConversations(res.data.filter((c) => c.assistant.id === Number(assistantId)));
  };

  const openConversation = async (id) => {
    setConversationId(id);
    const res = await api.get(`/chat/conversation/${id}`);
    setMessages(res.data);
  };

  const newConversation = async () => {
    const res = await api.post("/conversations", {
      assistantId: Number(assistantId),
      userId: USER_ID,
    });

    setConversationId(res.data.id);
    loadConversations();
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    setMessages((m) => [...m, { role: "user", content: userText }]);
    setInput("");

    // STREAMING
    const response = await fetch(`${process.env.REACT_APP_API_URL}/chat/stream`, {
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
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let aiText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const match = chunk.match(/"text":"(.*?)"/);

      if (match?.[1]) {
        aiText += match[1];

        setMessages((prev) => [
          ...prev.filter((m) => m.role !== "partial"),
          { role: "partial", content: aiText },
        ]);
      }
    }

    setMessages((prev) => [
      ...prev.filter((m) => m.role !== "partial"),
      { role: "assistant", content: aiText },
    ]);
  };

  return (
    <div className="flex h-screen">

      {/* Sidebar */}
      <div className="w-80 bg-gray-900 text-white p-4 flex flex-col">
        {assistant && (
          <div className="text-center mb-6">
            <img
              src={assistant.avatarUrl || "https://via.placeholder.com/80"}
              className="w-20 h-20 rounded-full mx-auto"
            />
            <h2 className="font-bold mt-2">{assistant.name}</h2>
            <p className="text-gray-400 text-sm">{assistant.description}</p>
          </div>
        )}

        <button
          className="bg-blue-600 rounded py-2 mb-4"
          onClick={newConversation}
        >
          + Cuộc trò chuyện mới
        </button>

        <div className="flex-1 overflow-y-auto space-y-2">
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => openConversation(c.id)}
              className={`p-3 rounded cursor-pointer ${
                c.id === conversationId ? "bg-blue-700" : "bg-gray-700"
              }`}
            >
              {c.title}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 p-6 flex flex-col bg-gray-100">
        <div className="flex-1 overflow-y-auto space-y-3">
          {messages.map((m, i) => (
            <div key={i}>
              <b>{m.role === "user" ? "Bạn" : "AI"}:</b> {m.content}
            </div>
          ))}
        </div>

        {/* Input */}
        {conversationId && (
          <div className="flex gap-3">
            <input
              className="flex-1 border rounded px-3 py-2"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              className="bg-blue-600 text-white px-4 rounded"
              onClick={sendMessage}
            >
              Gửi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

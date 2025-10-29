import React, { useState, useEffect } from "react";

export default function AiJournalismPage() {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
  const [contests, setContests] = useState([]);
  const [activeContest, setActiveContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState("");
  const [article, setArticle] = useState("");
  const [loading, setLoading] = useState(false);
  const [grading, setGrading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" | "detail"

  // 🧩 Load user từ localStorage
  useEffect(() => {
    const info = JSON.parse(localStorage.getItem("user"));
    if (info) setUser(info);
  }, []);

  // 🧩 Load danh sách cuộc thi
  useEffect(() => {
    fetch(API_URL + "/journalism/contests")
      .then(res => res.json())
      .then(setContests)
      .catch(console.error);
  }, []);

  // 🧩 Khi chọn 1 cuộc thi → load bài đã nộp + leaderboard
  async function openContest(contest) {
    setActiveContest(contest);
    setViewMode("detail");

    // load bài viết của user hiện tại
    if (user?.id) {
      const res1 = await fetch(`${API_URL}/journalism/entries/student/${user.id}`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      const data1 = await res1.json();
      const filtered = data1.filter(e => e.contest.id === Number(contest.id));
      setEntries(filtered);
    }

    // 🏆 load leaderboard
    const res2 = await fetch(`${API_URL}/journalism/contests/${contest.id}/leaderboard`);
    const data2 = await res2.json();
    setLeaderboard(data2);
  }

  // 🧾 Nộp bài
  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !article) return alert("Nhập đầy đủ tiêu đề và nội dung!");
    if (!activeContest) return alert("Chọn một cuộc thi!");

    setLoading(true);
    const entry = {
      contest: { id: activeContest.id },
      studentId: user.id,
      title,
      article,
    };

    const res = await fetch(API_URL + "/journalism/entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(entry),
    });

    const data = await res.json();
    setLoading(false);

    if (data.id) {
      alert("✅ Nộp bài thành công!");
      setEntries(prev => [...prev, data]);
      setTitle("");
      setArticle("");
    } else alert("❌ Lỗi khi nộp bài!");
  }

  // 🤖 Chấm điểm AI
  async function handleGrade(entryId) {
    setGrading(true);
    const res = await fetch(`${API_URL}/journalism/entries/${entryId}/grade-ai`, {
      method: "POST",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });
    const data = await res.json();
    setGrading(false);
    if (data.status === "success") {
      setFeedback(data);
      setEntries(prev =>
        prev.map(e => (e.id === entryId ? { ...e, aiScore: data.score, aiFeedback: data.feedback } : e))
      );
    } else alert("❌ " + data.message);
  }

  // ==============================
  // 🔹 VIEW 1: DANH SÁCH CUỘC THI
  // ==============================
  if (viewMode === "list") {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 font-inter">
        <div className="text-center bg-gradient-to-r from-purple-700 to-fuchsia-500 text-white p-8 rounded-2xl shadow-xl mb-10">
          <h2 className="text-3xl font-bold mb-2">
            📰 Cuộc thi <span className="text-yellow-300">AI Nhà Báo Nhí</span>
          </h2>
          <p className="text-lg opacity-95">
            Cùng AI viết nên những câu chuyện sáng tạo & truyền cảm hứng ✨
          </p>
        </div>

        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5">
          {contests.map(c => (
            <div
              key={c.id}
              className="rounded-2xl p-5 border border-gray-200 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-800">{c.title}</h3>
              <p className="text-gray-600 text-sm mb-1">{c.theme}</p>
              <p className="text-gray-500 text-sm mb-3 line-clamp-3">{c.description}</p>
              <button
                onClick={() => openContest(c)}
                className="w-full py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-700 to-fuchsia-500 hover:opacity-90 transition-all"
              >
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==============================
  // 🔹 VIEW 2: TRANG CHI TIẾT CUỘC THI
  // ==============================
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 font-inter">
      {/* Nút quay lại */}
      <button
        onClick={() => setViewMode("list")}
        className="mb-5 text-purple-700 hover:underline font-semibold flex items-center gap-1"
      >
        ← Quay lại danh sách
      </button>

      {/* Banner cuộc thi */}
      <div className="bg-gradient-to-r from-purple-700 to-fuchsia-500 text-white rounded-2xl p-6 shadow-lg mb-6">
        <h2 className="text-2xl font-bold mb-2">{activeContest?.title}</h2>
        <p className="text-sm opacity-90">{activeContest?.theme}</p>
        <p className="mt-2 text-base opacity-90">{activeContest?.description}</p>
      </div>

      {/* 🏆 BẢNG XẾP HẠNG */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
        <h3 className="text-xl font-semibold mb-4">🏆 Bảng xếp hạng Top 10</h3>

        {leaderboard.length === 0 ? (
          <p className="text-gray-500 italic">Chưa có bài nào được chấm điểm.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-purple-100 text-purple-800">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Thí sinh</th>
                  <th className="px-4 py-2 text-left">Lớp</th>
                  <th className="px-4 py-2 text-left">Bài viết</th>
                  <th className="px-4 py-2 text-left">Điểm </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((item, i) => (
                  <tr
                    key={item.entryId}
                    className={`border-t ${
                      i < 3 ? "bg-yellow-50" : "hover:bg-gray-50"
                    } transition-all duration-200`}
                  >
                    <td className="px-4 py-2 font-semibold text-gray-700">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </td>
                    <td className="px-4 py-2 flex items-center gap-3">
                      <img
                        src={item.avatar || "https://cdn-icons-png.flaticon.com/512/219/219970.png"}
                        alt="avatar"
                        className="w-8 h-8 rounded-full border"
                      />
                      <span className="font-medium text-gray-800">{item.studentName}</span>
                    </td>
                    <td className="px-4 py-2 text-gray-600">{item.className || "-"}</td>
                    <td className="px-4 py-2 text-gray-700 truncate max-w-xs">{item.title}</td>
                    <td className="px-4 py-2 font-bold text-purple-700">{item.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FORM NỘP BÀI */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold text-white bg-gradient-to-r from-purple-700 to-fuchsia-500 p-3 rounded-lg mb-4">
          ✍️ Nộp bài: {activeContest?.title}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Tiêu đề bài viết..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <textarea
            rows={8}
            placeholder="Nhập nội dung bài viết..."
            value={article}
            onChange={e => setArticle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <div className="text-right">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-700 to-fuchsia-500 text-white px-5 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
            >
              {loading ? "Đang nộp..." : "📨 Nộp bài"}
            </button>
          </div>
        </form>
      </div>

      {/* DANH SÁCH BÀI ĐÃ NỘP */}
      {entries.length > 0 && (
        <div className="mt-10 bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4">📜 Bài đã nộp của bạn</h3>
          <div className="space-y-4">
            {entries.map(e => (
              <div key={e.id} className="border-b border-gray-200 pb-3">
                <p className="font-semibold text-gray-800 mb-1">🧾 {e.title}</p>
                <p className="text-gray-600 text-sm whitespace-pre-wrap mb-2">
                  {e.article.substring(0, 150)}...
                </p>
                {e.aiScore ? (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p>🎯 <strong>Điểm AI:</strong> {e.aiScore}</p>
                    <p className="italic text-gray-500">{e.aiFeedback}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleGrade(e.id)}
                    disabled={grading}
                    className="bg-gradient-to-r from-emerald-500 to-green-400 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
                  >
                    {grading ? "🤖 AI đang chấm..." : "Chấm điểm bằng AI"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FEEDBACK */}
      {feedback && (
        <div className="mt-8 bg-gray-50 border-l-4 border-purple-600 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">🔍 Kết quả chấm bài</h3>
          <p>Điểm: <strong>{feedback.score}</strong></p>
          <p>Nhận xét: {feedback.feedback}</p>
          <p>Số credit còn lại: {feedback.remainingCredit}</p>
        </div>
      )}
    </div>
  );
}

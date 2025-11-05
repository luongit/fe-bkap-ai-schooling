import React, { useState, useEffect, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import {
  Clock,
  Calendar as CalendarIcon,
  Users,
  Globe,
  Award,
  MapPin,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import api from "../services/apiToken"; // ✅ axios instance có refresh token

export default function AiJournalismPage() {
  // --------- STATE CỐT LÕI ---------
  const [contests, setContests] = useState([]);
  const [activeContest, setActiveContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState("");
  const [article, setArticle] = useState("");
  const [loading, setLoading] = useState(false);
  const [grading, setGrading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Chế độ hiển thị tổng (list | detail)
  const [viewMode, setViewMode] = useState("list");

  // --------- STATE thuộc “LIST VIEW” (bạn) ---------
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("upcoming"); // upcoming | popular | recommended

  // --------- STATE thuộc “DETAIL VIEW” (bạn của bạn) ---------
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [rubrics, setRubrics] = useState([]);
  const [activeTab, setActiveTab] = useState("submit"); // submit | my | rubric

  // --------- EFFECTS ---------
  // Lấy profile (để có studentId) – theo code của bạn mình
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/profile"); // BE trả ProfileDTO
        const me = res.data;
        setUser({
          userId: me.userId,
          studentId: me.objectId, // 👈 dùng làm studentId
          objectType: me.objectType,
          fullName: me.fullName,
          role: me.role,
        });
      } catch (e) {
        // fallback cũ nếu trước đó app lưu user ở localStorage
        const info = JSON.parse(localStorage.getItem("user"));
        if (info) setUser({ ...info, studentId: info.id });
        console.error(e);
        toast.error("Không lấy được profile, dùng thông tin tạm nếu có.");
      }
    })();
  }, []);

  // Load danh sách cuộc thi (bạn)
  useEffect(() => {
    api
      .get("/journalism/contests")
      .then((res) => setContests(res.data || []))
      .catch((err) => console.error("Lỗi load contests:", err));
  }, []);

  // Lấy rubric khi có activeContest (bạn của bạn)
  useEffect(() => {
    if (!activeContest) return;
    api
      .get(`/journalism/contests/${activeContest.id}`)
      .then((res) => setRubrics(res.data?.rubrics || []))
      .catch(() => setRubrics([]));
  }, [activeContest]);

  // --------- HELPERS (bạn của bạn) ---------
  const formatDate = (d) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("vi-VN");
    } catch {
      return d;
    }
  };

  const isContestOpen = () => {
    if (!activeContest) return true;
    const now = new Date();
    const s = activeContest.startDate ? new Date(activeContest.startDate) : null;
    const e = activeContest.endDate ? new Date(activeContest.endDate) : null;
    if (s && now < s) return false;
    if (e && now > e) return false;
    return true;
  };

  const safeParseCriteria = (val) => {
    if (!val) return null;
    if (typeof val === "object") return val;
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  };

  const wordStats = useMemo(() => {
    const t = (article || "").trim();
    const words = t ? t.split(/\s+/).length : 0;
    const chars = t.length;
    return { words, chars };
  }, [article]);

  // --------- ACTIONS (hợp nhất logic hai bên) ---------
  async function openContest(contest) {
    setActiveContest(contest);
    setViewMode("detail");
    setActiveTab("submit");
    setShowForm(true);

    try {
      // bạn của bạn dùng studentId từ profile
      if (user?.studentId) {
        const res1 = await api.get(`/journalism/entries/student/${user.studentId}`);
        const data1 = res1.data || [];
        const filtered = data1.filter((e) => e.contest?.id === Number(contest.id));
        setEntries(filtered);
        if (filtered.length > 0) setShowForm(false);
      }

      const res2 = await api.get(`/journalism/contests/${contest.id}/leaderboard`);
      setLeaderboard(res2.data || []);
    } catch (err) {
      console.error("Lỗi khi mở cuộc thi:", err);
      toast.error("Không thể tải dữ liệu cuộc thi");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !article) return toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung!");
    if (!activeContest) return toast.error("Chọn một cuộc thi!");

    setLoading(true);
    try {
      // ✅ Tương thích cả hai backend:
      // - Nếu BE tự map studentId từ token → bỏ qua field studentId
      // - Nếu BE cũ cần studentId → thêm khi có
      const entry = {
        contest: { id: activeContest.id },
        title,
        article,
      };
      if (user?.studentId) entry.studentId = user.studentId;

      const res = await api.post("/journalism/entries", entry);
      const data = res.data;

      if (data?.id) {
        toast.success("✅ Nộp bài thành công!");
        // chèn đầu danh sách (bạn của bạn)
        setEntries((prev) => {
          const withoutDup = prev.filter((e) => e.id !== data.id);
          return [data, ...withoutDup];
        });
        setTitle("");
        setArticle("");
        setShowForm(false);
        setActiveTab("my");
      } else {
        toast.error("❌ Lỗi khi nộp bài!");
      }
    } catch (err) {
      console.error("Lỗi nộp bài:", err);
      toast.error("Không thể nộp bài!");
    } finally {
      setLoading(false);
    }
  }

  async function handleGrade(entryId) {
    setGrading(true);
    try {
      const res = await api.post(`/journalism/entries/${entryId}/grade-ai`);
      const data = res.data;
      setGrading(false);

      if (data?.status === "success") {
        setFeedback(data);
        setShowModal(true);
        toast.success("🎯 Bài đã được chấm điểm!");
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entryId
              ? { ...e, aiScore: data.score, aiFeedback: data.feedback, aiCriteria: data.criteria }
              : e
          )
        );
      } else {
        toast.error("❌ " + (data?.message || "Chấm điểm không thành công"));
      }
    } catch (err) {
      console.error("Lỗi chấm điểm AI:", err);
      toast.error("Không thể chấm điểm bài này!");
      setGrading(false);
    }
  }

  // --------- COMPONENT PHỤ (bạn của bạn) ---------
  function ManualScoreButton({ entry }) {
    return (
      <button
        onClick={() =>
          toast("Chấm thủ công sẽ bật modal rubric (mẫu modal có thể thêm sau).")
        }
        className="ml-2 bg-white border border-purple-300 text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition"
      >
        ✍️ Chấm thủ công
      </button>
    );
  }

  function RubricTable({ items }) {
    if (!items?.length)
      return <p className="text-gray-500 italic">Chưa cấu hình tiêu chí cho cuộc thi này.</p>;
    const totalWeight = items.reduce((a, b) => a + Number(b.weight || 0), 0);
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-purple-50 text-purple-700">
            <tr>
              <th className="px-4 py-2 text-left">Tiêu chí</th>
              <th className="px-4 py-2 text-left">Mô tả</th>
              <th className="px-4 py-2 text-center">Trọng số</th>
              <th className="px-4 py-2 text-center">Điểm tối đa</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{r.criterion}</td>
                <td className="px-4 py-2 text-gray-600">{r.description}</td>
                <td className="px-4 py-2 text-center font-semibold">
                  {Math.round(Number(r.weight || 0) * 100)}%
                </td>
                <td className="px-4 py-2 text-center">{r.maxScore ?? 10}</td>
              </tr>
            ))}
            <tr className="bg-gray-50 border-t">
              <td className="px-4 py-2 font-medium">Tổng</td>
              <td />
              <td className="px-4 py-2 text-center font-bold">
                {Math.round(totalWeight * 100)}%
              </td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // --------- LIST VIEW (UI của bạn) ---------
  const featured = useMemo(() => (contests.length ? contests[0] : null), [contests]);

  const colorKeys = ["blue", "green", "amber", "red", "pink", "indigo", "cyan"];
  const bannerBgClass = (idx) => {
    const key = colorKeys[idx % colorKeys.length];
    const map = {
      blue: "bg-blue-600",
      green: "bg-green-600",
      amber: "bg-amber-600",
      red: "bg-red-600",
      pink: "bg-pink-600",
      indigo: "bg-indigo-600",
      cyan: "bg-cyan-600",
    };
    return map[key];
  };
  const tintClass = (idx) => {
    const key = colorKeys[idx % colorKeys.length];
    const map = {
      blue: "bg-blue-100 text-blue-500",
      green: "bg-green-100 text-green-500",
      amber: "bg-amber-100 text-amber-500",
      red: "bg-red-100 text-red-500",
      pink: "bg-pink-100 text-pink-500",
      indigo: "bg-indigo-100 text-indigo-500",
      cyan: "bg-cyan-100 text-cyan-500",
    };
    return map[key];
  };

  const filtered = useMemo(() => {
    let arr = contests || [];
    const q = query.trim().toLowerCase();
    if (q) {
      arr = arr.filter(
        (c) =>
          (c.title || "").toLowerCase().includes(q) ||
          (c.theme || "").toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q)
      );
    }
    if (tab === "popular") {
      arr = [...arr].sort(
        (a, b) => (b.description?.length || 0) - (a.description?.length || 0)
      );
    } else if (tab === "recommended") {
      arr = [...arr].sort((a, b) => Number(Boolean(b.theme)) - Number(Boolean(a.theme)));
    }
    return arr;
  }, [contests, query, tab]);

  // --------- RENDER ---------
  if (viewMode === "list") {
    return (
      <div className="min-h-screen bg-gray-50 font-inter">
        <Toaster position="top-right" />
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <section className="mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Các Cuộc Thi Học Thuật</h1>
                <p className="text-gray-500 mt-1">
                  Khám phá và tham gia các cuộc thi giáo dục hàng đầu trên toàn thế giới
                </p>
              </div>

              {/* ✅ Nút tạo cuộc thi — chỉ hiện với ADMIN / TEACHER / SYSTEM_ADMIN */}
              {["ADMIN", "TEACHER", "SYSTEM_ADMIN"].includes(user?.role) && (
                <button
                  onClick={() => (window.location.href = "ai-journalism/create")}
                  className="bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-semibold px-5 py-2 rounded-lg shadow hover:opacity-90 transition-all"
                >
                  ➕ Tạo Cuộc Thi Mới
                </button>
              )}
            </div>


            {/* Search */}
            <div className="relative">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm cuộc thi theo tên, chủ đề..."
                className="flex h-9 w-full rounded-md border border-input px-3 py-1 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500 bg-white"
              />
            </div>
          </section>

          {/* Featured */}
          {featured && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Cuộc Thi Nổi Bật</h2>

              <div className="rounded-lg overflow-hidden bg-white relative">
                <div className={`relative w-full ${bannerBgClass(0)}`}>
                  <div className="relative p-6 md:p-10 text-white">
                    {/* logo tròn nhỏ */}
                    <div className="absolute left-6 top-6 md:static md:mb-4 md:inline-block">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center">
                          <span className="text-xl md:text-2xl font-bold text-black/80">
                            {(featured.title?.[0] || "C").toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="md:pl-0 pl-20">
                      <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold border-transparent shadow bg-white/20 text-white mb-3">
                        CUỘC THI NỔI BẬT
                      </div>

                      <h2 className="text-2xl md:text-3xl font-bold mb-2">
                        {featured.title || "Cuộc thi"}
                      </h2>
                      <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
                        {featured.theme || "Chủ đề đang cập nhật"}
                      </h3>

                      <div className="text-white/90 md:text-lg mb-6 md:mb-10">
                        {featured.description ||
                          "Mô tả đang cập nhật. Hãy mở chi tiết để xem thông tin mới nhất."}
                      </div>

                      {/* Stats (fallback cứng) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-16 mt-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-6 w-6 text-white/70" />
                          <div>
                            <div className="text-white/70">Hạn đăng ký</div>
                            <div className="font-semibold">20 Tháng 6, 2025</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-6 w-6 text-white/70" />
                          <div>
                            <div className="text-white/70">Ngày diễn ra</div>
                            <div className="font-semibold">22 Tháng 6, 2025</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="h-6 w-6 text-white/70" />
                          <div>
                            <div className="text-white/70">Thí sinh</div>
                            <div className="font-semibold">1000+ thí sinh</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Globe className="h-6 w-6 text-white/70" />
                          <div>
                            <div className="text-white/70">Quy mô</div>
                            <div className="font-semibold">20+ quốc gia</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* vài ký hiệu bay nhẹ */}
                    <div className="pointer-events-none select-none">
                      <div className="absolute top-4 right-8 text-white/10 text-5xl font-serif animate-float-slow">∑</div>
                      <div className="absolute top-20 right-16 text-white/10 text-4xl font-serif animate-float-medium">π</div>
                      <div className="absolute top-10 right-32 text-white/10 text-4xl font-serif animate-float-fast">∫</div>
                    </div>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="p-6 md:p-10 bg-white">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center">
                    <div className="flex items-center gap-2 text-gray-600 flex-1">
                      <Award className="h-5 w-5" />
                      <div className="text-sm">Huy chương Vàng, Bạc + 2 giải khác</div>
                    </div>
                    <div className="flex gap-3 self-stretch md:self-auto">
                      <button
                        onClick={() => openContest(featured)}
                        className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-white shadow h-9 px-4 py-2 bg-blue-600 hover:bg-blue-700"
                      >
                        Truy cập <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Tabs + grid */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Tất Cả Cuộc Thi</h2>

              <div
                role="tablist"
                aria-orientation="horizontal"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500"
              >
                {[
                  { key: "upcoming", label: "Sắp Diễn Ra" },
                  { key: "popular", label: "Phổ Biến" },
                  { key: "recommended", label: "Đề Xuất" },
                ].map((t) => {
                  const active = tab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      data-state={active ? "active" : "inactive"}
                      onClick={() => setTab(t.key)}
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 ${active ? "bg-white text-gray-900 shadow" : "text-gray-500"
                        }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((c, idx) => (
                <div
                  key={c.id ?? idx}
                  className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden transition-all hover:shadow-md"
                >
                  {/* header */}
                  <div className="relative h-48 w-full overflow-hidden">
                    <div className={`absolute inset-0 flex items-center justify-center ${tintClass(idx)}`}>
                      <span className="text-2xl md:text-4xl font-bold text-center px-2">
                        {c.title || "Cuộc thi"}
                      </span>
                    </div>
                  </div>

                  {/* body */}
                  <div className="p-5">
                    <div className="mb-3">
                      <h3 className="font-bold truncate">{c.title || "Cuộc thi"}</h3>
                      {c.theme && (
                        <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold mt-1">
                          {c.theme}
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-3">
                      {c.description || "Mô tả đang cập nhật..."}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span>Hạn đăng ký: 20/06/2025</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{c.location || "Trực tuyến"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>1000+ thí sinh</span>
                      </div>
                    </div>
                  </div>

                  {/* footer */}
                  <div className="items-center p-6 px-5 py-4 border-t bg-gray-50 flex justify-end">
                    <button
                      onClick={() => openContest(c)}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap border border-input bg-background shadow-sm hover:bg-gray-100 h-8 rounded-md px-3 text-xs"
                    >
                      Xem chi tiết <ExternalLink className="ml-1 h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* animations */}
        <style>{`
          @keyframes floatSlow { 0%{ transform: translateY(0) } 50%{ transform: translateY(-10px) } 100%{ transform: translateY(0) } }
          @keyframes floatMedium { 0%{ transform: translateY(0) } 50%{ transform: translateY(-16px) } 100%{ transform: translateY(0) } }
          @keyframes floatFast { 0%{ transform: translateY(0) } 50%{ transform: translateY(-22px) } 100%{ transform: translateY(0) } }
          .animate-float-slow { animation: floatSlow 6s ease-in-out infinite; }
          .animate-float-medium { animation: floatMedium 4.5s ease-in-out infinite; }
          .animate-float-fast { animation: floatFast 3.5s ease-in-out infinite; }
        `}</style>
      </div >
    );
  }

  // --------- DETAIL VIEW (UI + logic của bạn của bạn) ---------
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 font-inter">
      <Toaster position="top-right" />

      <button
        onClick={() => setViewMode("list")}
        className="mb-5 text-purple-700 hover:underline font-semibold flex items-center gap-1"
      >
        ← Quay lại danh sách
      </button>

      {/* Header chi tiết */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{activeContest?.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{activeContest?.theme}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${isContestOpen() ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}
            >
              {isContestOpen() ? "Đang mở" : "Đã đóng / Chưa mở"}
            </span>
            <div className="text-sm text-gray-600">
              <span className="mr-3">
                📅 Bắt đầu: <b>{formatDate(activeContest?.startDate)}</b>
              </span>
              <span>
                Kết thúc: <b>{formatDate(activeContest?.endDate)}</b>
              </span>
            </div>
          </div>
        </div>
        {activeContest?.description && (
          <p className="mt-3 text-gray-700 leading-relaxed">{activeContest.description}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-2xl p-2 flex gap-2 mb-6">
        {[
          { key: "submit", label: "✍️ Nộp bài" },
          { key: "my", label: "📜 Bài đã nộp" },
          { key: "rubric", label: "📐 Tiêu chí chấm" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-xl font-semibold transition ${activeTab === t.key
              ? "bg-gradient-to-r from-purple-700 to-fuchsia-500 text-white"
              : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: Nộp bài */}
      <button
        onClick={() =>
          navigate(`/ai-journalism/submit?contestId=${activeContest.id}`)
        }
        className="bg-gradient-to-r from-purple-700 to-fuchsia-500 text-white px-5 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
      >
        ✍️ Nộp bài thi
      </button>

      {/* TAB: Bài đã nộp */}
      {activeTab === "my" && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">📜 Bài đã nộp của bạn</h3>
          {entries.length === 0 ? (
            <p className="text-gray-500">
              Bạn chưa có bài nào. Vào tab <b>Nộp bài</b> để gửi bài nhé.
            </p>
          ) : (
            <div className="space-y-4">
              {entries.map((e) => {
                const criteria = safeParseCriteria(e.aiCriteria);
                return (
                  <div key={e.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">🧾 {e.title}</p>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap mt-1">
                          {e.article?.length > 160 ? e.article.substring(0, 160) + "..." : e.article}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Nộp lúc: {formatDate(e.createdAt)}
                        </p>
                      </div>

                      <div className="min-w-[180px] text-right">
                        {e.aiScore ? (
                          <div className="inline-block bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-left">
                            <div className="text-xs text-gray-500">Điểm AI</div>
                            <div className="text-2xl font-extrabold text-fuchsia-600">{e.aiScore}</div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleGrade(e.id)}
                              disabled={grading}
                              className="bg-gradient-to-r from-emerald-500 to-green-400 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-60"
                            >
                              {grading ? "🤖 AI đang chấm..." : "Chấm điểm bằng AI"}
                            </button>
                            <ManualScoreButton entry={e} />
                          </div>
                        )}
                      </div>
                    </div>

                    {criteria && (
                      <div className="bg-gray-50 rounded-lg p-3 mt-3">
                        <table className="w-full text-sm mb-2 border border-gray-200 rounded-lg">
                          <tbody>
                            {Object.entries(criteria).map(([k, v]) => (
                              <tr key={k} className="border-t border-gray-100">
                                <td className="py-1 px-2 text-left text-gray-700">{k}</td>
                                <td className="py-1 px-2 text-right font-medium">{v}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {e.aiFeedback && (
                          <p className="italic text-gray-600 text-sm">{e.aiFeedback}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: Rubric */}
      {activeTab === "rubric" && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">📐 Tiêu chí chấm</h3>
          <RubricTable items={rubrics} />
          <p className="text-xs text-gray-500 mt-3">
            * Tổng trọng số nên bằng 100%. Điểm cuối có thể là trung bình giám khảo / kết hợp AI, tuỳ cấu hình.
          </p>
        </div>
      )}

      {/* MODAL KẾT QUẢ AI (căn giữa như bản chi tiết của bạn của bạn) */}
      {showModal && feedback && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-md relative animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold mb-3 text-purple-700 text-center">
              🎯 Kết quả chấm điểm
            </h3>

            <p className="text-4xl font-extrabold text-fuchsia-600 mb-4 text-center">
              {feedback.score}
            </p>

            {feedback.criteria && (
              <table className="w-full text-sm mb-4 border border-gray-200 rounded-lg">
                <tbody>
                  {Object.entries(feedback.criteria).map(([key, value]) => (
                    <tr key={key} className="border-t border-gray-100">
                      <td className="py-1 px-2 text-left text-gray-700">{key}</td>
                      <td className="py-1 px-2 text-right font-semibold">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <p className="text-gray-600 text-sm italic mb-2 text-center">
              {feedback.feedback}
            </p>

            <p className="text-gray-500 text-xs text-center">
              💰 Credit còn lại: {feedback.remainingCredit}
            </p>

            <div className="text-center mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white px-5 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  Hash,
  BadgeCheck,
  User as UserIcon,
} from "lucide-react";
import api from "../services/apiToken"; // axios instance có refresh token

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

  // --------- STATE thuộc “LIST VIEW” ---------
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("ongoing"); // upcoming | ongoing | ended

  // --------- STATE thuộc “DETAIL VIEW” ---------
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [rubrics, setRubrics] = useState([]);
  const [activeTab, setActiveTab] = useState("submit"); // submit | my | rubric

  // --------- EFFECTS ---------
  // Lấy profile (để có studentId)
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/profile"); // Backend trả ProfileDTO
        const me = res.data;
        setUser({
          userId: me.userId,
          studentId: me.objectId, // dùng làm studentId
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

  // Load danh sách cuộc thi
  useEffect(() => {
    api
      .get("/journalism/contests")
      .then((res) => {
        const sorted = (res.data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setContests(sorted);
      })
      .catch((err) => {
        console.error("Lỗi khi tải contests:", err);
        toast.error("Không thể tải danh sách cuộc thi");
      });
  }, []);



  useEffect(() => {
    if (!contests.length) return;

    const now = new Date();
    const hasOngoing = contests.some((c) => {
      const s = c.startDate ? new Date(c.startDate) : null;
      const e = c.endDate ? new Date(c.endDate) : null;
      return s && e && now >= s && now <= e;
    });

    if (!hasOngoing) {
      setTab("upcoming"); // nếu không có ongoing thì tự chuyển sang sắp diễn ra
    }
  }, [contests]);


  // Lấy rubric khi có activeContest (bạn của bạn)
  useEffect(() => {
    if (!activeContest) return;
    api
      .get(`/journalism/contests/${activeContest.id}`)
      .then((res) => {
        const data = res.data;
        const list = data?.rubrics || data?.rubricResponses || [];
        setRubrics(list);
      })
      .catch(() => setRubrics([]));
  }, [activeContest]);

  // --------- HELPERS ---------
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

  // logic kiểm tra điều kiện nộp bài 
  const getSubmitStatus = () => {
    if (!activeContest || !user) return { can: false, msg: "" };

    const now = new Date();
    const start = new Date(activeContest.startDate);
    const end = new Date(activeContest.endDate);
    const sStart = new Date(activeContest.submissionStart);
    const sEnd = new Date(activeContest.submissionEnd);

    // Nếu không phải học sinh
    if (user.role !== "STUDENT") {
      return { can: false, msg: "Tài khoản của bạn không có quyền nộp bài dự thi. Vui lòng kiểm tra lại !" };
    }

    // Cuộc thi chưa mở
    if (now < start) {
      return { can: false, msg: "Chưa tới thời gian diễn ra cuộc thi. Vui lòng kiểm tra lại !" };
    }

    // Cuộc thi đã kết thúc
    if (now > end) {
      return { can: false, msg: "Cuộc thi đã kết thúc. Vui lòng kiểm tra lại !" };
    }

    // Chưa tới thời gian nộp bài
    if (now < sStart) {
      return { can: false, msg: "Chưa tới thời gian nộp bài. Vui lòng kiểm tra thời gian nộp bài và thử lại sau !" };
    }

    // Hết thời gian nộp bài
    if (now > sEnd) {
      return { can: false, msg: "Đã hết thời gian nộp bài. Vui lòng kiểm tra lại !" };
    }

    // Mọi thứ hợp lệ 
    return { can: true, msg: "" };
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

  // --------- ACTIONS ---------
  async function openContest(contest) {
    setActiveContest(contest);
    setViewMode("detail");
    setActiveTab("submit");
    setShowForm(true);

    try {
      if (["TEACHER", "ADMIN", "SYSTEM_ADMIN"].includes(user?.role)) {
        // gọi API cho giáo viên
        const res1 = await api.get(`/journalism/entries/contest/${contest.id}`);
        setEntries(res1.data || []);
      } else if (user?.studentId) {
        // học sinh chỉ xem bài của mình
        const res1 = await api.get(`/journalism/entries/student/${user.studentId}`);
        const filtered = (res1.data || []).filter(
          (e) => e.contest?.id === Number(contest.id)
        );
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
    if (!title || !article)
      return toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung!");
    if (!activeContest) return toast.error("Chọn một cuộc thi!");

    setLoading(true);
    try {
      const entry = {
        contest: { id: activeContest.id },
        title,
        article,
      };
      if (user?.studentId) entry.studentId = user.studentId;

      const res = await api.post("/journalism/entries", entry);
      const data = res.data;

      if (data?.id) {
        toast.success("Nộp bài thành công!");
        setEntries((prev) => {
          const withoutDup = prev.filter((e) => e.id !== data.id);
          return [data, ...withoutDup];
        });
        setTitle("");
        setArticle("");
        setShowForm(false);
        setActiveTab("my");
      } else {
        toast.error("Lỗi khi nộp bài!");
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
        toast.success("🎯 Bài thi đã được chấm điểm!");
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entryId
              ? {
                ...e,
                aiScore: data.score,
                aiFeedback: data.feedback,
                aiCriteria: data.criteria,
              }
              : e
          )
        );
      } else {
        toast.error("" + (data?.message || "Chấm điểm không thành công"));
      }
    } catch (err) {
      console.error("Lỗi chấm điểm AI:", err);
      toast.error("Không thể chấm điểm bài này!");
      setGrading(false);
    }
  }

  // --------- COMPONENT PHỤ (bạn của bạn) ---------
  function ManualScoreButton({ entry, rubrics, totalScore }) {
    const [open, setOpen] = useState(false);
    const [criteria, setCriteria] = useState({});
    const [feedback, setFeedback] = useState("");
    const [files, setFiles] = useState([]);


    useEffect(() => {
      if (open) {
        api.get(`/journalism/entries/${entry.id}/submissions`)
          .then(res => setFiles(res.data || []))
          .catch(() => setFiles([]));
      }
    }, [open, entry.id]);

    // tổng điểm giáo viên đang nhập
    const total = Object.values(criteria).reduce(
      (a, b) => a + Number(b || 0),
      0
    );

    const handleSubmit = async () => {
      try {
        await api.post(`/journalism/entries/${entry.id}/grade-manual`, {
          totalScore: total,            // điểm giáo viên chấm
          feedback,
          criteriaJson: criteria,       // gửi từng tiêu chí
        });
        toast.success("Đã gửi điểm chấm thủ công!");
        setOpen(false);
      } catch (err) {
        toast.error("Chấm điểm thất bại!");
      }
    };

    // chỉ hiện cho role giáo viên/admin
    if (!["TEACHER", "ADMIN", "SYSTEM_ADMIN"].includes(user?.role)) return null;

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="ml-2 bg-white border border-purple-300 text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition"
        >
          ✍️ Chấm thủ công
        </button>

        {open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setOpen(false)}
          >
            <div
              className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 text-purple-700">
                ✍️ Chấm bài thủ công
              </h3>

              {files.length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold text-gray-700 mb-2">📎 Tệp bài nộp:</p>
                  <ul className="space-y-1">
                    {files.map((f) => (
                      <li key={f.id} className="flex items-center justify-between text-sm border-b py-1">
                        <span className="truncate w-2/3 text-gray-800">
                          {f.fileName || f.fileUrl?.split("/").pop() || "Không có tên file"}
                        </span>
                        <a
                          href={f.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:underline font-medium"
                        >
                          📂 Mở
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}


              {rubrics.map((r) => (
                <div key={r.id} className="flex items-center justify-between mb-2">
                  <label className="text-gray-700">{r.criterion}</label>
                  <input
                    type="number"
                    min="0"
                    max={r.weight || undefined}
                    step="0.5"
                    className="border rounded px-2 py-1 w-20 text-right"
                    onChange={(e) =>
                      setCriteria({ ...criteria, [r.criterion]: e.target.value })
                    }
                  />
                </div>
              ))}

              {/* Tổng điểm */}
              <div className="mt-4 text-right font-semibold text-purple-700">
                Tổng điểm hiện tại:{" "}
                <span className="text-fuchsia-600 text-lg">{total}</span>
                {typeof totalScore === "number" && (
                  <span className="text-gray-500 text-sm ml-1">/ {totalScore}</span>
                )}
              </div>

              <textarea
                placeholder="Nhận xét của giáo viên..."
                className="border rounded-lg w-full p-2 mt-3"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              ></textarea>

              <div className="text-right mt-4">
                <button
                  onClick={handleSubmit}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  Gửi điểm
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }




  function RubricTable({ items }) {
    if (!items?.length) return <p>Chưa có tiêu chí.</p>;

    // Tổng điểm tối đa = tổng weight
    const total = items.reduce((a, b) => a + Number(b.weight || 0), 0);

    return (
      <table className="min-w-full border">
        <thead className="bg-purple-50">
          <tr>
            <th>Tiêu chí</th>
            <th>Mô tả</th>
            <th>Trọng số</th>
            <th>Điểm tối đa</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => {
            const percent = Math.round((r.weight / total) * 100);

            return (
              <tr key={r.id}>
                <td>{r.criterion}</td>
                <td>{r.description}</td>

                {/* Trọng số % */}
                <td className="text-center font-semibold">{percent}%</td>

                {/* Điểm tối đa = weight */}
                <td className="text-center">{r.weight}</td>
              </tr>
            );
          })}

          <tr className="bg-gray-100 font-bold">
            <td>Tổng</td>
            <td></td>
            <td className="text-center">100%</td>
            <td className="text-center">{total}</td>
          </tr>
        </tbody>
      </table>
    );
  }

  // --------- LIST VIEW ---------
  const featured = useMemo(
    () => (contests.length ? contests[0] : null),
    [contests]
  );

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

    const now = new Date();

    if (tab === "ongoing") {
      arr = arr.filter((c) => {
        const s = c.startDate ? new Date(c.startDate) : null;
        const e = c.endDate ? new Date(c.endDate) : null;
        return s && e && now >= s && now <= e;
      });
    } else if (tab === "upcoming") {
      arr = arr.filter((c) => {
        const s = c.startDate ? new Date(c.startDate) : null;
        return s && now < s;
      });
    } else if (tab === "ended") {
      arr = arr.filter((c) => {
        const e = c.endDate ? new Date(c.endDate) : null;
        return e && now > e;
      });
    }

    // sắp xếp mới nhất lên đầu
    arr = [...arr].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
                <h1 className="text-3xl font-bold tracking-tight ml-5">
                  Các Cuộc Thi Giáo Dục
                </h1>
                <p className="text-gray-500 mt-1 ml-5">
                  Khám phá và tham gia các cuộc thi giáo dục hàng đầu Việt Nam
                </p>
              </div>

              {/* Nút tạo cuộc thi — chỉ hiện với ADMIN / TEACHER / SYSTEM_ADMIN */}
              {["ADMIN", "TEACHER", "SYSTEM_ADMIN"].includes(user?.role) && (
                <button
                  onClick={() => (window.location.href = "ai-journalism/create")}
                  className="border border-purple-500 text-purple-700 font-semibold px-5 py-2 rounded-lg hover:bg-purple-50 transition-all shadow-sm"
                >
                  + Tạo Cuộc Thi Mới
                </button>
              )}
            </div>
          </section>

          {/* Featured */}
          {featured && (
            <section className="mb-12">
              <div className="rounded-lg overflow-hidden bg-white relative">
                <div className="relative w-full h-[380px] md:h-[420px]">
                  {featured.coverUrl ? (
                    <img
                      src={featured.coverUrl}
                      alt={featured.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`absolute inset-0 ${bannerBgClass(0)}`} />
                  )}
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="relative p-6 md:p-10 text-white z-10">

                    <div className="md:pl-0 pl-20">
                      <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold border-transparent shadow bg-white/20 text-blue mb-3">
                        CUỘC THI NỔI BẬT
                      </div>

                      <h2 className="text-2xl md:text-3xl font-bold mb-2">
                        {featured.title}
                      </h2>
                      <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
                        {featured.theme}
                      </h3>

                      <div className="text-gray/100 md:text-xs">
                        {featured.description}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="p-6 md:p-10 bg-white">
                  <div className="flex flex-col gap-4 md:gap-6">

                    <div className="flex items-center gap-2 text-gray-600">
                      <Globe className="h-5 w-5" />
                      <div className="text-sm">
                        Quy mô cuộc thi : <b>Toàn lãnh thổ Việt Nam</b>
                      </div>
                    </div>


                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center">
                      <div className="flex items-center gap-2 text-gray-600 flex-1">
                        <Users className="h-5 w-5" />
                        <div className="text-sm">
                          Số lượng tham gia khoảng <b>800 - 1000</b> người
                        </div>
                      </div>
                      <div className="flex gap-3 self-stretch md:self-auto">
                        <button
                          onClick={() => openContest(featured)}
                          className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-white shadow h-9 px-4 py-2 bg-blue-700 hover:bg-blue-800 transition-colors"
                        >
                          Truy cập chi tiết cuộc thi <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Award className="h-5 w-5" />
                      <div className="text-sm">
                        Tổng : <b>{featured.totalScore} Điểm</b>
                      </div>
                    </div>



                  </div>
                </div>


              </div>
            </section>
          )}

          {/* Tabs + grid */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold ml-5">Tất Cả Cuộc Thi Hiện Tại</h2>

              <div
                role="tablist"
                aria-orientation="horizontal"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500"
              >
                {[
                  { key: "ongoing", label: "Đang Diễn Ra" },
                  { key: "upcoming", label: "Sắp Diễn Ra" },
                  { key: "ended", label: "Đã Kết Thúc" },

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
              {filtered.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-200">
                  {tab === "ongoing" && "Hiện không có cuộc thi nào đang diễn ra."}
                  {tab === "upcoming" && "Hiện chưa có cuộc thi nào sắp diễn ra."}
                  {tab === "ended" && "Chưa có cuộc thi nào đã kết thúc."}
                </div>
              ) : (
                filtered.map((c, idx) => (
                  <div
                    key={c.id ?? idx}
                    className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden transition-all hover:shadow-md"
                  >
                    {/* header */}
                    <div className="relative h-48 w-full overflow-hidden">
                      {c.coverUrl ? (
                        <img
                          src={c.coverUrl}
                          alt={c.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className={`absolute inset-0 flex items-center justify-center ${tintClass(
                            idx
                          )}`}
                        >
                          <span className="text-2xl md:text-4xl font-bold text-center px-2">
                            {c.title}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30" />
                      <div className="absolute bottom-2 left-2 text-white font-semibold drop-shadow-md">
                        {c.title}
                      </div>
                    </div>

                    {/* body */}
                    <div className="p-5">
                      <div className="mb-3 text-center">
                        <h2 className="font-bold text-lg md:text-xm text-gray-800 mb-1">
                          {c.title}
                        </h2>
                        {c.theme && (
                          <div className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-semibold mt-1">
                            <BadgeCheck className="w-3 h-3 text-blue-500" />
                            {c.theme}
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-3">
                        {c.description}
                      </p>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-gray-500" />
                          <span>Mã số cuộc thi: {c.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          <span>Cuộc thi khởi tạo vào : {formatDate(c.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          <span>
                            Ngày bắt đầu cuộc thi: <b>{formatDate(c.startDate)}</b>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          <span>
                            Ngày kết thúc cuộc thi: <b>{formatDate(c.endDate)}</b>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>
                            Thời gian nhận bài:{" "}
                            <b>
                              {formatDate(c.submissionStart)} → {" "}
                              {formatDate(c.submissionEnd)}
                            </b>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-gray-500" />
                          <span>Tổng điểm: {c.totalScore} điểm</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="flex items-center gap-1">
                            Trạng thái:
                            {c.status === "ACTIVE" && (
                              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                                Được công bố chính thức
                              </span>
                            )}
                            {c.status === "DRAFT" && (
                              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300">
                                Chưa công bố chính thức
                              </span>
                            )}
                            {c.status === "CLOSED" && (
                              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
                                Cuộc thi đã kết thúc
                              </span>
                            )}
                            {!["ACTIVE", "DRAFT", "CLOSED"].includes(c.status) && (
                              <span className="ml-1 text-gray-500">—</span>
                            )}
                          </span>
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
                ))
              )}
            </div>

          </section>
        </main>
      </div>
    );
  }

  // --------- DETAIL VIEW ---------
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
          <div className="flex items-center gap-4">
            {activeContest?.coverUrl ? (
              <img
                src={activeContest.coverUrl}
                alt={activeContest?.title}
                className="w-16 h-16 rounded-xl object-cover border"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xl">
                {(activeContest?.title?.[0] || "C").toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {activeContest?.title}
              </h2>
              {activeContest?.theme && (
                <div className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-semibold mt-1">
                  <BadgeCheck className="w-3 h-3 text-blue-500" />
                  {activeContest.theme}
                </div>
              )}

            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              {isContestOpen() ? (
                <span className=" text-sm font-semibold text-green-700 flex items-center gap-1">
                  🕓 Đang mở
                </span>
              ) : new Date() < new Date(activeContest?.startDate) ? (
                <span className="text-sm font-semibold text-yellow-700 flex items-center gap-1">
                  🕓 Chưa mở
                </span>
              ) : (
                <span className="text-sm font-semibold text-red-700 flex items-center gap-1">
                  🕓 Đã kết thúc
                </span>
              )}
            </span>


            <div className="text-sm text-gray-600">
              <span className="mr-3">
                📅 Bắt đầu: <b>{formatDate(activeContest?.startDate)}</b>
              </span>
              <span>
                📅 Kết thúc: <b>{formatDate(activeContest?.endDate)}</b>
              </span>
            </div>
          </div>
        </div>

        {/* Thông tin đầy đủ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>
              Thời gian nhận bài:{" "}
              <b>
                {formatDate(activeContest?.submissionStart)} →{" "}
                {formatDate(activeContest?.submissionEnd)}
              </b>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-gray-500" />
            <span>
              Tổng : <b>{activeContest?.totalScore} điểm</b>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-gray-500" />
            <span>Mã cuộc thi: {activeContest?.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-gray-500" />
            <span>Tạo lúc: {formatDate(activeContest?.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="flex items-center gap-1">
              Trạng thái:
              {activeContest?.status === "ACTIVE" && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                  Được công bố chính thức
                </span>
              )}
              {activeContest?.status === "DRAFT" && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300">
                  Chưa công bố chính thức
                </span>
              )}
              {activeContest?.status === "CLOSED" && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
                  Cuộc thi đã kết thúc
                </span>
              )}
              {!["ACTIVE", "DRAFT", "CLOSED"].includes(activeContest?.status) && (
                <span className="ml-1 text-gray-500">—</span>
              )}
            </span>

          </div>
        </div>

        {activeContest?.description && (
          <p className="mt-3 text-gray-700 leading-relaxed">
            {activeContest.description}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-2xl p-2 flex gap-2 mb-6">
        {[
          { key: "submit", label: "✍️ Nộp bài" },
          { key: "my", label: "📜 Bài dự thi đã nộp" },
          { key: "rubric", label: "📐 Tiêu chí chấm điểm bài dự thi" },
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
      {activeTab === "submit" && (
        <div className="mt-2 mb-6">

          {(() => {
            const check = getSubmitStatus();
            if (!check.can) {
              return (
                <div className="col-span-full text-center py-12 text-red-500 bg-white rounded-xl shadow-sm border border-gray-200">
                  {check.msg}
                </div>
              );
            }
            return (
              <button
                onClick={() =>
                  navigate(`/ai-journalism/submit?contestId=${activeContest.id}`)
                }
                className="bg-gradient-to-r from-purple-700 to-fuchsia-500 text-white px-5 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
              >
                ✍️ Nộp bài dự thi
              </button>
            );
          })()}

        </div>
      )}

      {/* TAB: Bài đã nộp */}
      {activeTab === "my" && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mt-6">
          <h3 className="text-xl font-semibold mb-4">📜 Bài đã nộp của bạn</h3>
          {entries.length === 0 ? (
            <p className="text-gray-500">
              Bạn chưa có bài dự thi nào. Vào thanh <b>Nộp bài</b> để gửi bài dự thi nhé.
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
                          {e.article?.length > 160
                            ? e.article.substring(0, 160) + "..."
                            : e.article}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Nộp lúc: {formatDate(e.createdAt)}
                        </p>
                      </div>

                      <div className="min-w-[180px] text-right">
                        {e.aiScore ? (
                          <div className="inline-block bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-left">
                            <div className="text-xs text-gray-500">Điểm AI</div>
                            <div className="text-2xl font-extrabold text-fuchsia-600">
                              {e.aiScore}
                            </div>
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
                            <ManualScoreButton
                              entry={e}
                              rubrics={rubrics}
                              totalScore={activeContest?.totalScore} // 👈 thêm dòng này
                            />
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mt-6">
          <h3 className="text-xl font-semibold mb-4">📐 Tiêu chí chấm</h3>
          <RubricTable items={rubrics} />
          <p className="text-xs text-gray-500 mt-3">
            * Tổng trọng số nên bằng 100%. Điểm cuối có thể là trung bình giám
            khảo / kết hợp AI, tuỳ cấu hình.
          </p>
        </div>
      )}

      {/* MODAL KẾT QUẢ AI */}
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
              💰Credit còn lại: {feedback.remainingCredit}
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
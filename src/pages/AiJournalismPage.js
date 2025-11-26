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
  Delete,
  BadgeCheck,
  User as UserIcon,
  FileText,        // THÊM DÒNG NÀY
  Eye,             // THÊM DÒNG NÀY
  Edit,            // THÊM DÒNG NÀY
  PenTool,         // (tùy chọn thêm nếu bạn muốn dùng icon bút đẹp hơn)
  Scale,

} from "lucide-react";
import api from "../services/apiToken"; // axios instance có refresh token
import { X } from "lucide-react"; // Thêm dòng này
import LoginRequiredBox from "../pages/LoginRequiredBox";

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
  const [viewEntry, setViewEntry] = useState(null);  // bài đang xem
  const [showEntryModal, setShowEntryModal] = useState(false); // modal xem bài
  const [activePreviewTab, setActivePreviewTab] = useState("content");
  const [previewFiles, setPreviewFiles] = useState([]);
  const [submissionFilter, setSubmissionFilter] = useState("all"); // all | ungraded | graded
  // Chế độ hiển thị tổng (list | detail)
  const [viewMode, setViewMode] = useState("list");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

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
        const res1 = await api.get(`/journalism/entries/teacher-view/${contest.id}`);
        console.log("data:", res1)

        const mapped = (res1.data || []).map(item => {
          let manualScoreObj = null;

          if (typeof item.manualScore === "number") {
            // backend trả ra điểm dạng số → convert thành object
            manualScoreObj = { totalScore: item.manualScore };
          } else if (typeof item.manualScore === "object" && item.manualScore !== null) {
            // backend trả object đầy đủ
            manualScoreObj = {
              totalScore: item.manualScore.totalScore,
              feedback: item.manualScore.feedback,
              criteria: item.manualScore.criteria,
            };
          }

          return {
            ...item,
            manualScore: manualScoreObj
          };
        });

        setEntries(mapped);
      } else if (user?.studentId) {
        // học sinh chỉ xem bài của mình
        const res1 = await api.get(`/journalism/entries/student/${user.studentId}`);
        const filtered = (res1.data || []).filter(
          (e) => e.contest?.id === Number(contest.id)
        );

        const mapped = filtered.map(e => ({
          ...e,
          studentName: user.fullName,
          code: user.code || user.username || "—",
          className: user.className || "—"
        }));

        setEntries(mapped);

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

    const maxTotal = totalScore;      // điểm tối đa cuộc thi
    const overLimit = total > maxTotal;
    const handleSubmit = async () => {
      try {
        await api.post(`/journalism/entries/${entry.id}/grade-manual`, {
          totalScore: total,
          feedback,
          criteriaJson: criteria,
        });

        toast.success("Đã gửi điểm chấm thủ công!");
        setOpen(false);

        // ⭐ UPDATE UI KHÔNG CẦN F5
        setEntries(prev =>
          prev.map(e =>
            e.id === entry.id
              ? {
                ...e,
                manualScore: {
                  totalScore: total,
                  feedback,
                  criteria: criteria,
                },
              }
              : e
          )
        );

      } catch (err) {
        toast.error("Chấm điểm thất bại!");
      }
    };




    // chỉ hiện cho role giáo viên/admin
    if (!["TEACHER", "ADMIN", "SYSTEM_ADMIN"].includes(user?.role)) return null;

    return (
      <>
        <button
          onClick={() => {
            if (new Date() > new Date(activeContest.endDate)) {
              toast.error("⛔ Cuộc thi đã kết thúc, không thể chỉnh sửa điểm!");
              return;
            }
            setOpen(true);
          }}
          className="px-5 py-2 rounded-xl font-semibold text-white 
             bg-gradient-to-r from-purple-600 to-fuchsia-500 
             hover:opacity-90 shadow-md transition"
        >
          {entry.manualScore ? "✏️ Sửa điểm" : "✍️ Chấm bài"}
        </button>


        {open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              className="modal-wide bg-white rounded-2xl shadow-2xl p-6 relative animate-fadeIn max-w-[1800px] max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Nút đóng */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ✕
              </button>

              <h3 className="text-2xl font-bold mb-6 text-center w-full text-purple-700">
                ✍️ Chấm bài thủ công
              </h3>
              <div className="grid grid-cols-12 gap-6">

                {/* LEFT: PREVIEW – CHIẾM 9/12 (≈ 75%) */}
                <div className="col-span-9 border rounded-2xl p-4 bg-gray-50 max-h-[78vh] overflow-y-auto">
                  <h4 className="text-md font-semibold mb-3">📎 Tệp bài nộp</h4>

                  {files.length === 0 && (
                    <p className="text-gray-500 italic">Không có tệp nào.</p>
                  )}


                  {files.map((f) => {
                    const url = f.fileUrl;
                    const name = f.fileName || url.split("/").pop();
                    const ext = name.split(".").pop().toLowerCase();

                    return (
                      <div key={f.id} className="mb-6">
                        <p className="font-medium mb-2 truncate">{name}</p>

                        {/* IMAGE */}
                        {["jpg", "jpeg", "png", "gif", "webp"].includes(ext) && (
                          <img
                            src={url}
                            className="w-full rounded-xl border max-h-[700px] object-contain"
                          />
                        )}

                        {/* VIDEO */}
                        {["mp4", "mov", "avi", "mkv"].includes(ext) && (
                          <video
                            controls
                            className="w-full rounded-xl border bg-black max-h-[700px]"
                          >
                            <source src={url} />
                          </video>
                        )}

                        {/* PDF */}
                        {ext === "pdf" && (
                          <iframe
                            src={url}
                            className="w-full h-[720px] rounded-xl border"
                          ></iframe>
                        )}
                        {/* PPT / PPTX */}
                        {["ppt", "pptx"].includes(ext) && (
                          <iframe
                            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
                            className="w-full h-[720px] rounded-xl border bg-white"
                          ></iframe>
                        )}
                        {/* OTHER */}
                        {!["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "avi", "mkv", "pdf"]
                          .includes(ext) && (
                            <a
                              href={url}
                              target="_blank"
                              className="text-purple-600 underline text-sm"
                            >
                              ➜ Tải file
                            </a>
                          )}
                      </div>
                    );
                  })}
                </div>

                <div className="col-span-3 border rounded-2xl p-4 bg-white max-h-[78vh] overflow-y-auto">
                  <h4 className="text-md font-semibold mb-4">📝 Chấm điểm</h4>

                  {rubrics.map((r) => (
                    <div key={r.id} className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-gray-700 font-medium">
                          {r.criterion}
                        </label>
                        <span className="text-gray-500 text-sm font-semibold">/ {r.weight}</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max={r.weight}
                        step="0.5"
                        className="border rounded-xl px-3 py-2 w-full text-right"
                        value={criteria[r.criterion] || ""}
                        onChange={(e) => {
                          let v = Number(e.target.value || 0);
                          if (v > r.weight) v = r.weight;
                          if (v < 0) v = 0;
                          setCriteria({ ...criteria, [r.criterion]: v });
                        }}
                      />
                    </div>
                  ))}

                  {/* Tổng điểm */}
                  <div className="text-right mt-4 mb-2">
                    <span className="font-semibold text-gray-700">Tổng điểm:</span>{" "}
                    <span className="text-2xl font-bold text-fuchsia-600">{total}</span>
                    <span className="text-gray-500"> / {maxTotal}</span>
                  </div>

                  {overLimit && (
                    <p className="text-red-600 font-semibold mb-2">
                      ❗ Vượt quá điểm tối đa!
                    </p>
                  )}

                  <textarea
                    placeholder="Nhận xét của giáo viên..."
                    className="border rounded-xl w-full p-3 mt-4 h-32"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  ></textarea>

                  <button
                    onClick={handleSubmit}
                    disabled={overLimit}
                    className={`w-full mt-4 py-3 rounded-xl text-white font-bold transition ${overLimit
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:opacity-90"
                      }`}
                  >
                    Gửi điểm
                  </button>
                </div>
              </div >
            </div >
          </div >
        )
        }
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

  // hàm xóa cuộc thi
  async function handleDeleteContest(contestId) {
    if (!window.confirm("Bạn có chắc chắn muốn xóa cuộc thi này không?")) return;
    try {
      await api.delete(`/journalism/contests/${contestId}`);
      toast.success("Cuộc thi đã được xóa!");
      setContests((prev) => prev.filter((c) => c.id !== contestId));
    } catch (err) {
      console.error("Lỗi khi xóa cuộc thi:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Không thể xóa cuộc thi!";
      toast.error(msg);
    }
  }


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
  // ====== HELPER: check đã chấm / chưa chấm ======
  const hasManualScore = (e) =>
    e.manualScore &&
    e.manualScore.totalScore !== undefined &&
    e.manualScore.totalScore !== null;

  const hasAiScore = (e) =>
    e.aiScore !== undefined && e.aiScore !== null; // 0 điểm vẫn được tính là đã chấm

  const isGraded = (e) => hasManualScore(e) || hasAiScore(e);
  const entriesFiltered = entries.filter((e) => {
    if (submissionFilter === "graded") return isGraded(e);
    if (submissionFilter === "ungraded") return !isGraded(e);
    return true; // all
  });


  // Tổng số trang
  const totalPages = Math.ceil(entriesFiltered.length / pageSize);

  // Lấy bài theo trang
  const pagedEntries = entriesFiltered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const token = localStorage.getItem("token");

  // Nếu chưa đăng nhập thì bắt đăng nhập trước
  if (!token) {
    return <LoginRequiredBox />;
  }

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
              {["ADMIN", "SYSTEM_ADMIN"].includes(user?.role) && (
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



                    <div className="items-center p-6 px-5 py-4 border-t bg-gray-50 flex justify-start gap-2">
                      <div className="ml-auto flex gap-2">
                        {["ADMIN", "SYSTEM_ADMIN"].includes(user?.role) && (
                          <button
                            onClick={() => handleDeleteContest(c.id)}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap 
                            border border-red-500 text-red-500 hover:bg-red-100 h-8 rounded-md px-3 text-xs"
                          >
                            Xóa cuộc thi <Delete className="ml-1 h-3 w-3" />
                          </button>
                        )}
                        {user && (["ADMIN", "SYSTEM_ADMIN"].includes(user.role) || user.userId === c.createdBy?.id) && (
                          <button
                            onClick={() => navigate(`/ai-journalism/edit/${c.id}`)}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap 
                            border border-input bg-background shadow-sm hover:bg-gray-100 
                            h-8 rounded-md px-3 text-xs"
                          >
                            Sửa cuộc thi <Edit className="ml-1 h-3 w-3" />
                          </button>
                        )}
                        <button
                          onClick={() => openContest(c)}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap 
                        border border-input bg-background shadow-sm hover:bg-gray-100 
                        h-8 rounded-md px-3 text-xs"
                        >
                          Xem chi tiết <ExternalLink className="ml-1 h-3 w-3" />
                        </button>
                      </div>
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

      {activeTab === "my" && (
        <div className="space-y-8">

          {/* HEADER SIÊU SANG XỊN MỊN */}
          <div className="flex flex-wrap items-center justify-between gap-6">

            {/* Trái: Tiêu đề + Bộ lọc cao cấp */}
            <div className="flex items-center gap-8">

              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                {["TEACHER", "ADMIN", "SYSTEM_ADMIN"].includes(user?.role) ? (
                  <>
                    <Users className="w-9 h-9 text-[#0ea5e9]" />
                    Tất cả bài dự thi
                  </>
                ) : (
                  <>
                    <FileText className="w-9 h-9 text-[#0ea5e9]" />
                    Bài dự thi của bạn
                  </>
                )}
              </h3>

              {/* BỘ LỌC SIÊU SANG – ĐÃ CHẤM Ở TRÊN, CHƯA CHẤM Ở DƯỚI (CHUẨN UX 2025) */}
              {["TEACHER", "ADMIN", "SYSTEM_ADMIN"].includes(user?.role) && entries.length > 0 && (
                <div className="flex items-center bg-gradient-to-r from-gray-50 to-gray-100/50 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-1.5 ring-1 ring-black/5">

                  {/* 1. TẤT CẢ */}
                  <button
                    onClick={() => {
                      setSubmissionFilter("all");
                      setCurrentPage(1);
                    }} className={`relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2.5
        ${submissionFilter === "all" ? "bg-black text-white shadow-lg" : "text-gray-600 hover:bg-white/70 hover:shadow-md"}`}
                  >
                    <span>Tất cả</span>
                    <span className={`font-bold ${submissionFilter === "all" ? "text-sky-300" : "text-gray-500"}`}>
                      ({entries.length})
                    </span>
                  </button>

                  {/* 2. ĐÃ CHẤM – ĐẨY LÊN TRƯỚC (XANH LÁ) */}
                  <button
                    onClick={() => {
                      setSubmissionFilter("graded");
                      setCurrentPage(1);
                    }}
                    className={`relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2.5
        ${submissionFilter === "graded" ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg" : "text-gray-600 hover:bg-white/70 hover:shadow-md"}`}
                  >
                    <span>Đã chấm</span>
                    <span className={`font-bold ${submissionFilter === "graded" ? "text-emerald-100" : "text-emerald-600"}`}>
                      ({entries.filter(isGraded).length})
                    </span>
                  </button>

                  {/* 3. CHƯA CHẤM – ĐẨY XUỐNG SAU (CAM ĐỎ) */}
                  <button
                    onClick={() => {
                      setSubmissionFilter("ungraded");
                      setCurrentPage(1);
                    }} className={`relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2.5
        ${submissionFilter === "ungraded" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg" : "text-gray-600 hover:bg-white/70 hover:shadow-md"}`}
                  >
                    <span>Chưa chấm</span>
                    <span className={`font-bold ${submissionFilter === "ungraded" ? "text-orange-100" : "text-orange-600"}`}>
                      ({entries.filter(e => !isGraded(e)).length})
                    </span>
                    {submissionFilter === "ungraded" && entries.filter(e => !e.manualScore && (e.aiScore === undefined || e.aiScore === null)).length > 0 && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </button>

                </div>
              )}
            </div>

            {/* Phải: Badge tổng – nâng cấp thêm chút sang */}
            {entries.length > 0 && (
              <div className="px-6 py-3 bg-gradient-to-r from-[#0ea5e9]/10 via-[#0ea5e9]/5 to-transparent text-[#0ea5e9] rounded-2xl font-bold text-sm border border-[#0ea5e9]/30 shadow-lg backdrop-blur-sm">
                {entries.length} bài nộp
              </div>
            )}
          </div>

          {/* Phần danh sách giữ nguyên */}

          {/* Student View */}
          {!["TEACHER", "ADMIN", "SYSTEM_ADMIN"].includes(user?.role) && (
            <div className="grid gap-6">
              {entries.length === 0 ? (
                <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border-2 border-dashed border-gray-300">
                  <FileText className="w-20 h-20 text-gray-400 mx-auto mb-5" />
                  <p className="text-xl font-medium text-gray-600">Bạn chưa nộp bài nào</p>
                  <p className="text-gray-500 mt-2">
                    Hãy chuyển sang tab <strong className="text-[#0ea5e9]">Nộp bài</strong> để bắt đầu viết!
                  </p>
                </div>
              ) : (
                pagedEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-[#0ea5e9]/30 transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 group-hover:text-[#0ea5e9] transition">
                            {entry.title}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            Nộp ngày {new Date(entry.createdAt).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                        {entry.aiScore !== undefined && (
                          <div className="text-right">
                            <div className="text-4xl font-extrabold bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] bg-clip-text text-transparent">
                              {entry.aiScore}
                            </div>
                            <p className="text-xs text-gray-500">Điểm AI</p>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 line-clamp-3 leading-relaxed mb-6">
                        {entry.article}
                      </p>

                      <div className="flex gap-4">
                        <button
                          onClick={async () => {
                            // Dùng dữ liệu có sẵn từ list trước cho chắc
                            setViewEntry(entry);
                            setShowEntryModal(true);
                            setActivePreviewTab("content");

                            try {
                              // Load chi tiết và MERGE, không ghi đè mất studentName / code / className
                              const fresh = await api.get(`/journalism/entries/${entry.id}`);
                              setViewEntry((prev) => ({
                                ...prev,
                                ...fresh.data,
                              }));

                              const res = await api.get(`/journalism/entries/${entry.id}/submissions`);
                              setPreviewFiles(res.data || []);
                            } catch (err) {
                              console.error(err);
                              toast.error("Không tải được chi tiết, đang hiển thị dữ liệu tạm.");
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                        >
                          <Eye className="w-5 h-5" />
                          Xem chi tiết
                        </button>


                        <button
                          onClick={() => navigate(`/ai-submission-edit/${entry.id}`)}
                          className="flex-1 flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                        >
                          <Edit className="w-5 h-5" />
                          Chỉnh sửa
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Teacher / Admin View - Nhóm theo lớp */}
          {["TEACHER", "ADMIN", "SYSTEM_ADMIN"].includes(user?.role) && (
            <div className="space-y-10">
              {entries.length === 0 ? (
                <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border-2 border-dashed border-gray-300">
                  <Users className="w-20 h-20 text-gray-400 mx-auto mb-5" />
                  <p className="text-xl font-medium text-gray-600">Chưa có bài nộp nào</p>
                </div>
              ) : (
                Object.entries(
                  pagedEntries.reduce((acc, e) => {
                    const className = e.className || "Chưa rõ lớp";
                    if (!acc[className]) acc[className] = [];
                    acc[className].push(e);
                    return acc;
                  }, {})
                ).map(([className, students]) => (

                  <div
                    key={className}
                    className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden"
                  >

                    {/* Header lớp */}
                    <div className="bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white px-8 py-5">
                      <h3 className="text-xl font-bold flex items-center gap-3">
                        <Users className="w-7 h-7" />
                        {className}
                        <span className="ml-auto text-sm font-normal opacity-90">
                          {students.length} học sinh
                        </span>
                      </h3>
                    </div>

                    {/* Danh sách học sinh */}
                    <div className="p-6 space-y-5">
                      {students.map((e) => (
                        <div
                          key={e.id}
                          className="flex items-center gap-6 p-6 bg-gray-50/70 rounded-2xl hover:bg-gray-100 hover:shadow-md transition-all duration-300 group"
                        >
                          {/* Avatar */}
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] text-white flex items-center justify-center text-2xl font-bold shadow-lg flex-shrink-0">
                            {e.studentName?.[0] || "?"}
                          </div>

                          {/* Nội dung */}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-lg truncate">
                              {e.studentName} <span className="text-gray-500 font-normal">— {e.code}</span>
                            </p>
                            <p className="font-semibold text-gray-800 mt-1">{e.title}</p>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                              {e.article}
                            </p>
                          </div>

                          {/* Nút hành động */}
                          <div className="flex gap-3 flex-shrink-0">
                            {e.manualScore ? (
                              <div className="px-4 py-2 rounded-xl bg-purple-50 border border-purple-300 text-center">
                                <div className="text-xs text-purple-600 font-medium">Điểm GV</div>
                                <div className="text-2xl font-bold text-purple-700">
                                  {e.manualScore?.totalScore}
                                </div>
                              </div>
                            ) : e.aiScore ? (
                              <div className="px-4 py-2 rounded-xl bg-fuchsia-50 border border-fuchsia-300 text-center">
                                <div className="text-xs text-fuchsia-600 font-medium">Điểm AI</div>
                                <div className="text-2xl font-bold text-fuchsia-700">{e.aiScore}</div>
                              </div>
                            ) : null}

                            {/* Nút xem bài */}

                            <button
                              onClick={async () => {
                                // Dùng dữ liệu sẵn có trong list trước
                                setViewEntry(e);
                                setShowEntryModal(true);
                                setActivePreviewTab("content");

                                try {
                                  const fresh = await api.get(`/journalism/entries/${e.id}`);
                                  setViewEntry((prev) => ({
                                    ...prev,
                                    ...fresh.data,
                                  }));

                                  const res = await api.get(`/journalism/entries/${e.id}/submissions`);
                                  setPreviewFiles(res.data || []);
                                } catch (err) {
                                  console.error(err);
                                  toast.error("Không tải được chi tiết, đang hiển thị dữ liệu tạm.");
                                }
                              }}
                              className="px-6 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] 
             text-white rounded-xl font-medium hover:shadow-xl 
             transition-all duration-200 flex items-center gap-2"
                            >
                              <Eye className="w-5 h-5" />
                              Xem
                            </button>



                            {new Date() <= new Date(activeContest?.endDate) && (
                              <ManualScoreButton
                                entry={e}
                                rubrics={rubrics}
                                totalScore={activeContest?.totalScore}
                                isEdit={!!e.manualScore}
                              />
                            )}


                          </div>
                        </div>
                      ))}
                      {/* ⭐⭐⭐ ĐẶT PAGINATION NGAY SAU KHỐI LIST — ĐÚNG CHỖ NÀY ⭐⭐⭐ */}
                      {totalPages >= 1 && (
                        <div className="flex justify-center items-center gap-3 mt-10 select-none">

                          {/* Prev */}
                          <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                            className={`px-4 py-2 rounded-xl font-semibold transition-all ${currentPage === 1
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white shadow hover:shadow-lg hover:scale-105"
                              }`}
                          >
                            ←
                          </button>

                          {/* Page numbers with ellipsis */}
                          {(() => {
                            const pages = [];
                            const max = totalPages;

                            const addPage = (p) => {
                              pages.push(
                                <button
                                  key={p}
                                  onClick={() => setCurrentPage(p)}
                                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${currentPage === p
                                      ? "bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white shadow-lg scale-105"
                                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:shadow"
                                    }`}
                                >
                                  {p}
                                </button>
                              );
                            };

                            // Always show page 1
                            addPage(1);

                            // If currentPage > 3 -> add ellipsis
                            if (currentPage > 3) {
                              pages.push(<span key="start-dots" className="px-2">…</span>);
                            }

                            // Pages around current
                            const start = Math.max(2, currentPage - 1);
                            const end = Math.min(max - 1, currentPage + 1);

                            for (let p = start; p <= end; p++) {
                              if (p !== 1 && p !== max) addPage(p);
                            }

                            // If currentPage < max-2 -> add ellipsis
                            if (currentPage < max - 2) {
                              pages.push(<span key="end-dots" className="px-2">…</span>);
                            }

                            // Always show last page if > 1
                            if (max > 1) addPage(max);

                            return pages;
                          })()}

                          {/* Next */}
                          <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                            className={`px-4 py-2 rounded-xl font-semibold transition-all ${currentPage === totalPages
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white shadow hover:shadow-lg hover:scale-105"
                              }`}
                          >
                            →
                          </button>

                        </div>
                      )}


                    </div>
                  </div>
                ))
              )}
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

      )

      }
      {/* MODAL XEM BÀI NỘP – SIÊU ĐẸP, HIỆN ĐẠI 2025 */}
      {showEntryModal && viewEntry && (
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowEntryModal(false)}
        >
          <div
            className="bg-white w-full max-w-7xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* SIDEBAR TRÁI – THÔNG TIN + TAB */}
            <div className="w-full lg:w-96 bg-gradient-to-b from-blue-50 to-indigo-50 border-r border-gray-200 flex flex-col">
              {/* Header thông tin học sinh */}
              <div className="p-8 pb-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {(viewEntry.studentName || viewEntry.student?.fullName || "H").charAt(0)}

                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {viewEntry.studentName || viewEntry.student?.fullName || "Không rõ tên"}
                    </h3>

                    <p className="text-sm text-gray-600">Học sinh</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {["TEACHER", "ADMIN", "SYSTEM_ADMIN"].includes(user?.role) && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mã HS:</span>
                        <span className="font-semibold">
                          {viewEntry.code || viewEntry.student?.code || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lớp:</span>
                        <span className="font-semibold">
                          {viewEntry.className || viewEntry.student?.className || "—"}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nộp ngày:</span>
                    <span className="font-semibold">
                      {new Date(viewEntry.createdAt).toLocaleDateString("vi-VN", {
                        weekday: "long",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tab navigation */}
              <div className="flex-1 px-6 pb-6">
                <div className="space-y-2">
                  {[
                    { id: "content", icon: "📄", label: "Nội dung bài viết", color: "blue" },
                    { id: "files", icon: "📎", label: "Tệp đính kèm", color: "purple" },
                    { id: "score", icon: "⭐", label: "Điểm & đánh giá", color: "green" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActivePreviewTab(tab.id)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${activePreviewTab === tab.id
                          ? `bg-${tab.color}-600 text-white shadow-xl font-bold`
                          : "bg-white/80 text-gray-700 hover:bg-gray-100 shadow-md"
                        }`}
                    >
                      <span className="text-2xl">{tab.icon}</span>
                      <span className="text-left flex-1">{tab.label}</span>
                      {activePreviewTab === tab.id && (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-white">
              {/* Close button */}
              <button
                onClick={() => setShowEntryModal(false)}
                className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur rounded-full shadow-xl flex items-center justify-center text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-300 z-10"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Nội dung */}
              <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                {/* TAB NỘI DUNG */}
                {activePreviewTab === "content" && (
                  <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {viewEntry.title}
                    </h1>
                    <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed whitespace-pre-line bg-white p-8 rounded-3xl shadow-inner border border-gray-100">
                      {viewEntry.article}
                    </div>
                  </div>
                )}

                {/* TAB FILE */}
                {activePreviewTab === "files" && (
                  <div className="space-y-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                      <span className="text-4xl">📎</span> Tệp đính kèm
                    </h2>
                    {previewFiles.length === 0 ? (
                      <div className="text-center py-20">
                        <div className="text-9xl mb-6 opacity-20">📄</div>
                        <p className="text-xl text-gray-500">Chưa có tệp nào được nộp</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {previewFiles.map((f, idx) => {
                          const url = f.fileUrl;
                          const name = f.fileName || url.split("/").pop();
                          const ext = name.split(".").pop().toLowerCase();
                          return (
                            <div
                              key={f.id}
                              className="max-w-[780px] mx-auto bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                            >

                              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
                                <p className="font-bold text-lg truncate">{name}</p>
                                <p className="text-sm opacity-90">Tệp #{idx + 1}</p>
                              </div>
                              <div className="p-4">
                                {["jpg", "jpeg", "png", "gif", "webp"].includes(ext) && (
                                  <img src={url} className="w-full rounded-2xl border-4 border-white shadow-lg" alt={name} />
                                )}
                                {["mp4", "mov", "avi"].includes(ext) && (
                                  <video controls className="w-full rounded-2xl shadow-lg">
                                    <source src={url} />
                                  </video>
                                )}
                                {ext === "pdf" && (
                                  <iframe src={url} className="w-full h-96 rounded-2xl border-4 border-white shadow-lg"></iframe>
                                )}
                                {["ppt", "pptx"].includes(ext) && (
                                  <iframe
                                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
                                    className="w-full h-[600px] rounded-2xl border-4 border-white shadow-lg bg-white"
                                  ></iframe>
                                )}

                                {![
                                  "jpg", "jpeg", "png", "gif", "webp",
                                  "mp4", "mov", "avi", "pdf", "ppt", "pptx"
                                ].includes(ext) && (
                                    <div className="text-center py-16">
                                      <div className="text-9xl mb-4">📦</div>
                                      <a href={url} target="_blank" className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-2xl transition">
                                        Tải xuống {name}
                                      </a>
                                    </div>
                                  )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB ĐIỂM */}
                {activePreviewTab === "score" && (
                  <div className="max-w-4xl mx-auto space-y-8">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
                      Đánh giá & Điểm số
                    </h2>

                    {/* AI Score */}
                    {viewEntry.aiScore && (
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-10 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-2xl font-bold mb-2">Điểm AI chấm tự động</h3>
                            <p className="text-lg opacity-90">Phân tích bằng trí tuệ nhân tạo</p>
                          </div>
                          <div className="text-8xl font-extrabold">{viewEntry.aiScore}</div>
                        </div>
                        <div className="mt-6 p-6 bg-white/20 backdrop-blur rounded-2xl">
                          <p className="text-lg leading-relaxed italic">“{viewEntry.aiFeedback}”</p>
                        </div>
                      </div>
                    )}

                    {/* Manual Score */}
                    {viewEntry.manualScore && (
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-10 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-2xl font-bold mb-2">Điểm giáo viên chấm</h3>
                            <p className="text-lg opacity-90">Nhận xét trực tiếp từ giáo viên</p>
                          </div>
                          <div className="text-8xl font-extrabold">{viewEntry.manualScore.totalScore}</div>
                        </div>
                        <div className="mt-6 p-6 bg-white/20 backdrop-blur rounded-2xl">
                          <p className="text-lg leading-relaxed italic">“{viewEntry.manualScore.feedback}”</p>
                        </div>
                      </div>
                    )}

                    {!viewEntry.aiScore && !viewEntry.manualScore && (
                      <div className="text-center py-20">
                        <div className="text-9xl mb-6 opacity-20">📭</div>
                        <p className="text-2xl text-gray-500">Chưa có đánh giá nào</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
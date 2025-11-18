import React, { useEffect, useState } from "react";
import { Calendar, Clock, Send, Plus, Trash2, Scale } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/apiToken";

function toDateInputValue(dateStr) {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr.split("T")[0] || "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toDatetimeLocalValue(dateStr) {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr.replace(/:\d{2}(\.\d+)?Z?$/, "");
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

// ensure datetime-local has seconds
function ensureSeconds(dateTimeLocal) {
  if (!dateTimeLocal) return dateTimeLocal;
  if (/T\d{2}:\d{2}:\d{2}/.test(dateTimeLocal)) return dateTimeLocal;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateTimeLocal)) return `${dateTimeLocal}:00`;
  return dateTimeLocal;
}

export default function AiJournalismEditPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [form, setForm] = useState({
    title: "",
    theme: "",
    description: "",
    startDate: "",
    endDate: "",
    submissionStart: "",
    submissionEnd: "",
    status: "ACTIVE",
    rubrics: [{ criterion: "", description: "", weight: 0.25 }],
  });

  const navigate = useNavigate();
  const { contestId } = useParams();

  // load profile
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/profile");
        const me = res.data;
        setUser(me);
        if (me.objectType === "STUDENT") {
          toast.error("Bạn không có quyền truy cập trang này!");
          window.location.href = "/403";
        }
      } catch (err) {
        console.error("Không thể lấy thông tin người dùng:", err);
        toast.error("Không thể lấy thông tin người dùng!");
        window.location.href = "/login";
      }
    })();
  }, []);

  // load contest
  useEffect(() => {
    if (!contestId) return;
    setLoading(true);
    api
      .get(`/journalism/contests/${contestId}`)
      .then((res) => {
        const payload = res.data && res.data.contest ? res.data.contest : res.data;
        console.log("Dữ liệu cuộc thi nhận về (payload):", payload);

        const rubricsSource = Array.isArray(payload.rubrics)
          ? payload.rubrics
          : Array.isArray(res.data?.rubrics)
            ? res.data.rubrics
            : [{ criterion: "", description: "", weight: 0.25 }];

        setForm({
          title: payload.title || "",
          theme: payload.theme || "",
          description: payload.description || "",
          startDate: toDateInputValue(payload.startDate),
          endDate: toDateInputValue(payload.endDate),
          submissionStart: toDatetimeLocalValue(payload.submissionStart),
          submissionEnd: toDatetimeLocalValue(payload.submissionEnd),
          status: payload.status || "ACTIVE",
          rubrics: rubricsSource.map((r) => ({
            criterion: r.criterion ?? "",
            description: r.description ?? "",
            weight: typeof r.weight === "number" ? r.weight : parseFloat(r.weight || 0),
            // id removed to prevent JSON parse error
          })),
        });

        if (payload.coverUrl) {
          setCoverPreview(payload.coverUrl);
          setCoverFile(null);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi lấy cuộc thi:", err);
        toast.error("Không thể tải dữ liệu cuộc thi.");
      })
      .finally(() => setLoading(false));
  }, [contestId]);

  // cleanup objectURL
  useEffect(() => {
    return () => {
      if (coverPreview && coverPreview.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(coverPreview);
        } catch { }
      }
    };
  }, [coverPreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRubricChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.rubrics];
      if (field === "weight") {
        updated[index][field] = value === "" ? 0 : Number(value);
      } else {
        updated[index][field] = value;
      }
      return { ...prev, rubrics: updated };
    });
  };

  const addRubric = () => {
    setForm((prev) => ({ ...prev, rubrics: [...prev.rubrics, { criterion: "", description: "", weight: 0.25 }] }));
  };

  const removeRubric = (index) => {
    setForm((prev) => ({ ...prev, rubrics: prev.rubrics.filter((_, i) => i !== index) }));
  };

  const handleCoverFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (coverPreview && coverPreview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(coverPreview);
      } catch { }
    }
    const objUrl = URL.createObjectURL(file);
    setCoverFile(file);
    setCoverPreview(objUrl);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form.title.trim()) return toast.error("Tên cuộc thi là bắt buộc!");

  setLoading(true);
  try {
    const rubrics = form.rubrics.map(r => ({
      criterion: r.criterion,
      description: r.description,
      weight: Number(r.weight || 0)
    }));

    const dto = {
      ...form,
      rubrics,
      totalScore: rubrics.reduce((s, r) => s + (r.weight || 0), 0),
      submissionStart: ensureSeconds(form.submissionStart),
      submissionEnd: ensureSeconds(form.submissionEnd),
      startDate: form.startDate,
      endDate: form.endDate,
    };

    const formData = new FormData();
    formData.append("dto", new Blob([JSON.stringify(dto)], { type: "application/json" }));
    if (coverFile) formData.append("cover", coverFile);

    await api.put(`/journalism/contests/${contestId}?creatorId=${user?.userId}`, formData);

    toast.success("Cập nhật cuộc thi thành công!");
    navigate("/journalism");
  } catch (err) {
    console.error(err);
    toast.error("Không thể sửa cuộc thi.");
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="min-h-screen bg-gray-50 font-inter py-10">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md border border-gray-100 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-purple-700 flex items-center gap-2">Sửa Cuộc Thi</h1>
            <p className="text-gray-500 mt-1">Chỉnh sửa thông tin cuộc thi và cấu hình tiêu chí chấm điểm.</p>
          </div>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="mt-3 sm:mt-0 border border-gray-300 text-gray-700 hover:text-purple-700 hover:border-purple-400 rounded-lg px-4 py-2 text-sm font-medium transition-all"
          >
            ← Quay lại
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Thông tin cơ bản */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h2 className="text-lg font-semibold text-purple-700 mb-3">Thông tin cơ bản</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="font-semibold text-gray-700 mb-1 block">
                  Tên cuộc thi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 mb-1 block">Chủ đề <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="theme"
                  value={form.theme}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-purple-400 outline-none"
                  placeholder="Ví dụ: Ngôi trường em yêu"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 mb-1 block">Trạng thái <span className="text-red-500">*</span></label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-purple-400 outline-none"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="font-semibold text-gray-700 mb-1 block">Mô tả <span className="text-red-500">*</span></label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-purple-400 outline-none"
                  placeholder="Mô tả chi tiết về cuộc thi..."
                />
              </div>
            </div>
          </div>

          {/* Thời gian */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h2 className="text-lg font-semibold text-purple-700 mb-3">Thời gian <span className="text-red-500">*</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold flex items-center gap-1 mb-1"><Calendar className="h-4 w-4 text-purple-500" /> Ngày bắt đầu<span className="text-red-500">*</span></label>
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="font-semibold flex items-center gap-1 mb-1"><Calendar className="h-4 w-4 text-purple-500" /> Ngày kết thúc<span className="text-red-500">*</span></label>
                <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="font-semibold flex items-center gap-1 mb-1"><Clock className="h-4 w-4 text-purple-500" /> Bắt đầu nhận bài<span className="text-red-500">*</span></label>
                <input type="datetime-local" name="submissionStart" value={form.submissionStart} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="font-semibold flex items-center gap-1 mb-1"><Clock className="h-4 w-4 text-purple-500" /> Kết thúc nhận bài<span className="text-red-500">*</span></label>
                <input type="datetime-local" name="submissionEnd" value={form.submissionEnd} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
            </div>
          </div>

          {/* Tiêu chí chấm điểm */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h2 className="text-lg font-semibold text-purple-700 mb-3 flex items-center gap-2"><Scale className="h-5 w-5" /> Tiêu chí chấm điểm<span className="text-red-500">*</span></h2>
            {form.rubrics.map((rubric, index) => (
              <div key={index} className="border rounded-lg p-4 mb-3 bg-white shadow-sm relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="text" value={rubric.criterion} onChange={(e) => handleRubricChange(index, "criterion", e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2" placeholder="Tên tiêu chí..." />
                  <input type="text" value={rubric.description} onChange={(e) => handleRubricChange(index, "description", e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2" placeholder="Mô tả ngắn về tiêu chí..." />
                  <input type="number" step="1" min="0" value={rubric.weight} onChange={(e) => handleRubricChange(index, "weight", e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2" placeholder="Điểm tối đa" />
                </div>
                {form.rubrics.length > 1 && (
                  <button type="button" onClick={() => removeRubric(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
            ))}
            <div className="flex justify-between items-center mt-3">
              <button type="button" onClick={addRubric} className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium"><Plus className="h-4 w-4" /> Thêm tiêu chí chấm điểm</button>
              <p className="text-sm text-gray-600 font-semibold">Tổng điểm: {form.rubrics.reduce((sum, r) => sum + parseFloat(r.weight || 0), 0).toFixed(2)} điểm</p>
            </div>
          </div>

          {/* Ảnh bìa */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h2 className="text-lg font-semibold text-purple-700 mb-3">Ảnh bìa cuộc thi<span className="text-red-500">*</span></h2>
            <input type="file" accept="image/*" onChange={handleCoverFileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            {coverPreview && <img src={coverPreview} alt="Xem trước ảnh bìa" className="mt-3 w-full h-[400px] object-cover rounded-lg border border-gray-200 shadow-sm" />}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2 border border-purple-500 text-purple-700 font-semibold rounded-lg hover:bg-purple-50 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm">
              <Send className="h-5 w-5" />
              {loading ? "Đang cập nhật..." : "Cập nhật Cuộc Thi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

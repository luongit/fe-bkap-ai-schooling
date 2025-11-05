import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import api from "../services/apiToken";

export default function AiSubmissionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const contestId = queryParams.get("contestId");

  const [contest, setContest] = useState(null);
  const [entryId, setEntryId] = useState(null);
  const [title, setTitle] = useState("");
  const [article, setArticle] = useState("");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [slide, setSlide] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  // 🧠 Lấy thông tin cuộc thi
  useEffect(() => {
    if (!contestId) return;
    api
      .get(`/journalism/contests/${contestId}`)
      .then((res) => setContest(res.data?.contest))
      .catch(() => toast.error("Không tải được thông tin cuộc thi"));
  }, [contestId]);

  // 🔁 Lấy entry_id đã lưu theo học sinh + cuộc thi
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId && contestId) {
      const key = `entry_${contestId}_${userId}`;
      const saved = localStorage.getItem(key);
      if (saved) setEntryId(Number(saved));
    }
  }, [contestId]);

  // 📤 Nộp bài
  async function handleSubmit(e) {
    e.preventDefault();
    if (!contestId) return toast.error("Thiếu ID cuộc thi!");
    if (loading) return;

    // ⚠️ Kiểm tra nội dung hoặc file
    if (!image && !video && !slide && !article.trim()) {
      return toast.error("Vui lòng nhập nội dung hoặc chọn ít nhất 1 tệp để nộp!");
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("contest_id", contestId);
      if (entryId) formData.append("entry_id", entryId);
      formData.append("note", note);

      if (image) formData.append("image", image);
      if (video) formData.append("video", video);
      if (slide) formData.append("slide", slide);
      if (title) formData.append("title", title);
      if (article) formData.append("article", article);

      const res = await api.post("/journalism/submissions/upload-mixed", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("✅ Nộp bài thi thành công!");
      console.log("Upload result:", res.data);

      // ✅ Lưu entry_id riêng cho từng user + cuộc thi
      const userId = localStorage.getItem("userId");
      if (userId && res.data.entry_id) {
        const key = `entry_${contestId}_${userId}`;
        localStorage.setItem(key, res.data.entry_id);
        setEntryId(res.data.entry_id);
      }

      // 🧹 Reset form
      setTitle("");
      setArticle("");
      setImage(null);
      setVideo(null);
      setSlide(null);
      setNote("");
    } catch (err) {
      console.error(err);
      toast.error("❌ Lỗi khi nộp bài!");
    } finally {
      setLoading(false);
    }
  }

  // 🎨 Xem trước file
  const previewFile = (file) => {
    if (!file) return null;
    if (file.type.startsWith("image/"))
      return <img src={URL.createObjectURL(file)} alt="preview" className="mt-2 rounded-lg max-h-48" />;
    if (file.type.startsWith("video/"))
      return <video src={URL.createObjectURL(file)} controls className="mt-2 rounded-lg max-h-48" />;
    if (file.type === "application/pdf")
      return (
        <embed
          src={URL.createObjectURL(file)}
          type="application/pdf"
          width="100%"
          height="200px"
          className="mt-2 rounded-lg border"
        />
      );
    return <p className="text-gray-500 mt-1">📄 {file.name}</p>;
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 font-inter">
      <Toaster position="top-right" />

      <button
        onClick={() => navigate("/ai-journalism")}
        className="mb-4 text-purple-700 hover:underline font-semibold flex items-center gap-1"
      >
        ← Quay lại
      </button>

      <h2 className="text-2xl font-bold mb-2 text-gray-800">Nộp bài thi</h2>
      {contest && (
        <p className="text-gray-600 mb-6">
          Cuộc thi: <b>{contest.title}</b> — Chủ đề: <i>{contest.theme}</i>
        </p>
      )}

      {/* ⚡ Nếu đã nộp -> ẩn form */}
      {entryId ? (
        <div className="bg-green-50 border border-green-200 p-6 rounded-2xl text-center">
          <h3 className="text-green-700 text-xl font-semibold mb-2">
            🎉 Bạn đã nộp bài thành công!
          </h3>
          <p className="text-gray-600 mb-4">
            Bài nộp của bạn đã được lưu lại. Bạn có thể xem lại chi tiết bài thi của mình.
          </p>
          <button
            onClick={() => navigate(`/ai-submission-view/${entryId}`)}
            className="bg-gradient-to-r from-green-600 to-emerald-400 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            👁 Xem bài đã nộp
          </button>
        </div>
      ) : (
        // 🧾 Form nộp bài
        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-200"
        >
          {/* --- Tiêu đề & bài viết --- */}
          <div>
            <label className="font-semibold text-gray-700">Tiêu đề</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Nhập tiêu đề bài viết..."
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">Nội dung bài viết</label>
            <textarea
              rows={8}
              value={article}
              onChange={(e) => setArticle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mt-1 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Nhập nội dung bài viết..."
            ></textarea>
          </div>

          {/* --- Ảnh đại diện --- */}
          <div>
            <label className="font-semibold text-gray-700">Ảnh đại diện</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="mt-2"
            />
            {previewFile(image)}
          </div>

          {/* --- Video dự thi --- */}
          <div>
            <label className="font-semibold text-gray-700">Video dự thi</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideo(e.target.files[0])}
              className="mt-2"
            />
            {previewFile(video)}
          </div>

          {/* --- Slide --- */}
          <div>
            <label className="font-semibold text-gray-700">
              Slide thuyết trình (PDF / PPTX)
            </label>
            <input
              type="file"
              accept="
                application/pdf,
                application/vnd.ms-powerpoint,
                application/vnd.openxmlformats-officedocument.presentationml.presentation
              "
              onChange={(e) => setSlide(e.target.files[0])}
              className="mt-2"
            />
            {previewFile(slide)}
          </div>

          {/* --- Ghi chú --- */}
          <div>
            <label className="font-semibold text-gray-700">Ghi chú (tùy chọn)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="VD: Bản nộp lần 1..."
            />
          </div>

          {/* --- Submit --- */}
          <div className="text-right">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-700 to-fuchsia-500 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-60"
            >
              {loading ? "⏳ Đang nộp..." : "📨 Nộp bài"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

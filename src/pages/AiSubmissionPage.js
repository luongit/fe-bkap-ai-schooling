import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Image, Video, FileText, Send, BadgeCheck } from "lucide-react";
import api from "../services/apiToken";

function FilePreview({ file }) {
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  if (!file) return null;

  if (file.type.startsWith("image/"))
    return (
      <img
        src={previewUrl}
        alt="preview"
        className="mt-3 rounded-xl border border-gray-200 shadow-sm max-h-40 w-full object-cover"
      />
    );

  if (file.type.startsWith("video/"))
    return (
      <video
        src={previewUrl}
        controls
        className="mt-3 rounded-xl border border-gray-200 shadow-sm max-h-44 w-full"
      />
    );

  if (file.type === "application/pdf")
    return (
      <embed
        src={previewUrl}
        type="application/pdf"
        width="100%"
        height="180px"
        className="mt-3 rounded-xl border border-gray-200"
      />
    );

  return (
    <p className="mt-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 inline-block">
      {file.name}
    </p>
  );
}

export default function AiSubmissionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const contestId = new URLSearchParams(location.search).get("contestId");
  const [contest, setContest] = useState(null);
  const [entryId, setEntryId] = useState(null);
  const [title, setTitle] = useState("");
  const [article, setArticle] = useState("");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [slide, setSlide] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!contestId) return;
    api
      .get(`/journalism/contests/${contestId}`)
      .then((res) => setContest(res.data?.contest))
      .catch(() => toast.error("Không tải được thông tin cuộc thi"));
  }, [contestId]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId && contestId) {
      const saved = localStorage.getItem(`entry_${contestId}_${userId}`);
      if (saved) setEntryId(Number(saved));
    }
  }, [contestId]);

  const validateForm = () => {
    if (!title.trim()) return toast.error("Vui lòng nhập tiêu đề bài viết!");
    if (!article.trim()) return toast.error("Vui lòng nhập nội dung bài viết!");
    if (!image) return toast.error("Vui lòng chọn ảnh đại diện!");
    if (!video) return toast.error("Vui lòng chọn video dự thi!");
    if (!slide) return toast.error("Vui lòng chọn slide thuyết trình!");
    return true;
  };

  // Xử lý nộp bài
  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    if (!contestId) return toast.error("Thiếu ID cuộc thi!");
    if (!validateForm()) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("contest_id", contestId);
      if (entryId) formData.append("entry_id", entryId);
      formData.append("title", title);
      formData.append("article", article);
      formData.append("note", note);
      formData.append("image", image);
      formData.append("video", video);
      formData.append("slide", slide);

      const res = await api.post("/journalism/submissions/upload-mixed", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Nộp bài thành công!");
      const userId = localStorage.getItem("userId");
      if (userId && res.data.entry_id) {
        localStorage.setItem(`entry_${contestId}_${userId}`, res.data.entry_id);
        setEntryId(res.data.entry_id);
      }

      setTitle("");
      setArticle("");
      setImage(null);
      setVideo(null);
      setSlide(null);
      setNote("");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi nộp bài!");
    } finally {
      setLoading(false);
    }
  }
  const UploadBox = ({ label, icon: Icon, accept, onChange, file }) => (
    <div className="border-2 border-dashed border-purple-300 hover:border-purple-500 transition-colors rounded-2xl p-4 text-center bg-white/70 shadow-sm">
      <div className="flex flex-col items-center gap-2">
        <Icon className="w-8 h-8 text-purple-500" />
        <p className="font-semibold text-gray-700">{label}</p>
        <label className="cursor-pointer text-sm text-purple-600 hover:text-purple-800 underline">
          Chọn tệp
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => onChange(e.target.files[0])}
          />
        </label>
      </div>
      {file && <FilePreview file={file} />}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5ff] via-[#faf7ff] to-white py-10 px-4 font-inter">
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto mb-8">
        <button
          onClick={() => navigate("/ai-journalism")}
          className="text-purple-700 hover:text-fuchsia-600 font-semibold flex items-center gap-1 transition mb-4"
        >
          ← Quay lại trang danh sách cuộc thi
        </button>

        <div className="bg-white/80 backdrop-blur-xl border border-purple-100 rounded-3xl shadow-md p-8">
          {/* Tiêu đề chính */}
          <h1 className="text-3xl font-bold text-blue-700 mb-3 pb-2 border-b-4 border-blue-200 flex items-center gap-2">
            Trang Nộp Bài Thi
          </h1>

          {/* Thông tin cuộc thi */}
          {contest && (
            <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-2 text-gray-700 text-sm">
              <span>
                Cuộc thi:{" "}
                <b className="text-gray-900 text-base">{contest.title}</b>
              </span>

              {contest.theme && (
                <div className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-semibold shadow-sm">
                  <BadgeCheck className="w-3 h-3 text-blue-500" />
                  {contest.theme}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Nội dung */}
      <div className="max-w-5xl mx-auto">
        {entryId ? (
          <div className="bg-green-50 border border-green-200 p-8 rounded-2xl text-center shadow-sm">
            <h3 className="text-green-700 text-xl font-semibold mb-2">
              🎉 Bạn đã nộp bài thành công!
            </h3>
            <p className="text-gray-600 mb-4">
              Bài dự thi của bạn đã được lưu lại. Bạn có thể xem lại chi tiết bài thi đã nộp của mình !
            </p>
            <button
              onClick={() => navigate(`/ai-submission-view/${entryId}`)}
              className="bg-gradient-to-r from-green-600 to-emerald-400 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
            >
              👁 Xem bài thi bạn đã nộp
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white/80 backdrop-blur-lg border border-gray-100 p-8 rounded-3xl shadow-lg space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div>
                  <label className="font-semibold text-gray-700">Tiêu đề <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Nhập tiêu đề bài viết..."
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700">
                    Nội dung bài viết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={9}
                    value={article}
                    onChange={(e) => setArticle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 mt-1 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                    placeholder="Nhập nội dung bài viết..."
                  ></textarea>
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Ghi chú cho bài thi</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="VD: Bản nộp lần 1..."
                  />
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <UploadBox
                  label="Ảnh đại diện của nhóm"
                  icon={Image}
                  accept="image/*"
                  file={image}
                  onChange={setImage}
                />
                <UploadBox
                  label="Video bài thi"
                  icon={Video}
                  accept="video/*"
                  file={video}
                  onChange={setVideo}
                />
                <UploadBox
                  label="Slide của bài thi"
                  icon={FileText}
                  accept="
                    application/pdf,
                    application/vnd.ms-powerpoint,
                    application/vnd.openxmlformats-officedocument.presentationml.presentation
                  "
                  file={slide}
                  onChange={setSlide}
                />
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 border border-purple-500 text-purple-700 font-semibold rounded-lg hover:bg-purple-50 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                <Send className="h-5 w-5" />
                {loading ? "Đang nộp..." : "Nộp Bài Thi"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

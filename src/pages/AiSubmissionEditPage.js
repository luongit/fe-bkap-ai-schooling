import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Image, Video, FileText, Save, ArrowLeft } from "lucide-react";
import api from "../services/apiToken";


function OldFilePreview({ file }) {
  if (!file) return null;

  const url = file.fileUrl;

  if (file.fileType.startsWith("image"))
    return <img src={url} className="rounded-xl mt-2 max-h-40 border" alt="" />;

  if (file.fileType.startsWith("video"))
    return <video controls src={url} className="rounded-xl mt-2 max-h-40" />;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline mt-2 inline-block"
    >
      📄 Xem file: {file.fileName}
    </a>
  );
}

/* ------------------- UPLOAD BOX ------------------- */
function UploadBox({ label, icon: Icon, file, onChange, accept }) {
  return (
    <div className="border-2 border-dashed border-purple-300 rounded-2xl p-4 text-center bg-white shadow-sm">
      <Icon className="w-7 h-7 text-purple-500 mx-auto mb-2" />
      <p className="font-semibold text-gray-700">{label}</p>
      <label className="cursor-pointer text-sm text-purple-600 hover:text-purple-800 underline block mt-2">
        Chọn tệp mới
        <input
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files[0])}
          className="hidden"
        />
      </label>

      {file && (
        <p className="text-gray-600 text-xs mt-1">📌 Tệp mới: {file.name}</p>
      )}
    </div>
  );
}

/* ------------------- MAIN PAGE ------------------- */
export default function AiSubmissionEditPage() {
  const { entryId } = useParams();
  const navigate = useNavigate();

  const [entry, setEntry] = useState(null);
  const [oldFiles, setOldFiles] = useState([]);

  const [title, setTitle] = useState("");
  const [article, setArticle] = useState("");
  const [note, setNote] = useState("");

  const [newImage, setNewImage] = useState(null);
  const [newVideo, setNewVideo] = useState(null);
  const [newSlide, setNewSlide] = useState(null);

  const [loading, setLoading] = useState(false);

  /* ------------------- LOAD ENTRY + FILES ------------------- */
  useEffect(() => {
    api
      .get(`/journalism/entries/${entryId}`)
      .then((res) => {
        setEntry(res.data.entry);
        setTitle(res.data.entry.title || "");
        setArticle(res.data.entry.article || "");

        setOldFiles(res.data.submissions || []);
      })
      .catch(() => toast.error("Không tải được bài thi"));
  }, [entryId]);

  /* ------------------- SUBMIT UPDATE ------------------- */
  async function handleUpdate(e) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      /* --- 1. Cập nhật bài viết --- */
      await api.put(`/journalism/entries/update/${entryId}`, {
        title,
        article,
      });

      /* --- 2. Cập nhật file --- */
      const fd = new FormData();
      if (newImage) fd.append("image", newImage);
      if (newVideo) fd.append("video", newVideo);
      if (newSlide) fd.append("slide", newSlide);

      if (newImage || newVideo || newSlide) {
        await api.post(
          `/journalism/submissions/update-files/${entryId}`,
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      toast.success("Đã cập nhật bài thi!");

      setTimeout(() => navigate(`/ai-submission-view/${entryId}`), 800);
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  }

  if (!entry)
    return (
      <div className="p-10 text-center">
        <Toaster />
        Đang tải dữ liệu...
      </div>
    );

  /* ------------------- RENDER ------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f3ff] to-white py-10 px-4 font-inter">
      <Toaster position="top-right" />

      <div className="max-w-4xl mx-auto mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-purple-700 hover:text-purple-900 flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" /> Quay lại
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white border border-purple-100 shadow-xl rounded-3xl p-8">
        <h1 className="text-2xl font-bold text-purple-700 mb-4">
          ✏️ Chỉnh sửa bài dự thi
        </h1>

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Tiêu đề */}
          <div>
            <label className="font-semibold text-gray-700">
              Tiêu đề bài viết
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg p-3 mt-1 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Nội dung */}
          <div>
            <label className="font-semibold text-gray-700">
              Nội dung bài viết
            </label>
            <textarea
              rows={8}
              value={article}
              onChange={(e) => setArticle(e.target.value)}
              className="w-full border rounded-lg p-3 mt-1 focus:ring-2 focus:ring-purple-500"
            ></textarea>
          </div>

          {/* FILE CŨ */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">📎 File đã nộp</h3>

            {oldFiles.length === 0 && (
              <p className="text-gray-500">Không có file nào.</p>
            )}

            <div className="space-y-3">
              {oldFiles.map((f) => (
                <div key={f.id} className="border rounded-xl p-3">
                  <p className="text-sm font-medium text-gray-700">
                    {f.fileName}
                  </p>
                  <OldFilePreview file={f} />
                </div>
              ))}
            </div>
          </div>

          {/* UPLOAD FILE MỚI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <UploadBox
              label="Ảnh đại diện mới"
              icon={Image}
              accept="image/*"
              file={newImage}
              onChange={setNewImage}
            />

            <UploadBox
              label="Video mới"
              icon={Video}
              accept="video/*"
              file={newVideo}
              onChange={setNewVideo}
            />

            <UploadBox
              label="Slide mới"
              icon={FileText}
              accept="application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              file={newSlide}
              onChange={setNewSlide}
            />
          </div>

          {/* NÚT LƯU */}
          <div className="text-right pt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-purple-700 transition disabled:opacity-50"
            >
              <Save className="w-5 h-5 inline mr-2" />
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

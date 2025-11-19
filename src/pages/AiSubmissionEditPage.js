import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Image, Video, FileText, Save, ArrowLeft, BadgeCheck } from "lucide-react";
import api from "../services/apiToken";

/* ============================================================
   FILE PREVIEW for BOTH old & new files
============================================================ */
function FilePreview({ url, type }) {
  if (!url) return null;

  if (type?.startsWith("image"))
    return (
      <img
        src={url}
        alt="preview"
        className="mt-3 rounded-xl border border-gray-200 shadow-sm max-h-48 w-full object-cover"
      />
    );

  if (type?.startsWith("video"))
    return (
      <video
        src={url}
        controls
        className="mt-3 rounded-xl border border-gray-200 shadow-sm max-h-48 w-full"
      />
    );

  if (type === "application/pdf")
    return (
      <embed
        src={url}
        type="application/pdf"
        width="100%"
        height="200px"
        className="mt-3 rounded-xl border border-gray-200 shadow"
      />
    );

  // PPT / PPTX → dùng Office Viewer
  if (
    type === "application/vnd.ms-powerpoint" ||
    type === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
      url
    )}`;

    return (
      <iframe
        src={officeUrl}
        className="w-full h-56 rounded-xl border mt-3 shadow"
        title="ppt-preview"
      />
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline mt-2 inline-block"
    >
      📄 Xem file: {url.split("/").pop()}
    </a>
  );
}

/* ============================================================
   UPLOAD BOX — dùng chung cho NEW file
============================================================ */
function UploadBox({ label, icon: Icon, accept, file, onChange, previewUrl }) {
  return (
    <div className="border-2 border-dashed border-purple-300 hover:border-purple-500 transition-colors rounded-2xl p-4 text-center bg-white/70 shadow-sm">
      <div className="flex flex-col items-center gap-2">
        <Icon className="w-8 h-8 text-purple-500" />
        <p className="font-semibold text-gray-700">{label}</p>

        <label className="cursor-pointer text-sm text-purple-600 hover:text-purple-800 underline">
          Chọn tệp mới
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => onChange(e.target.files[0])}
          />
        </label>
      </div>

      {file && (
        <div className="mt-3">
          <FilePreview type={file.type} url={previewUrl} />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MAIN EDIT PAGE
============================================================ */
export default function AiSubmissionEditPage() {
  const { entryId } = useParams();
  const navigate = useNavigate();

  const [entry, setEntry] = useState(null);
  const [oldFiles, setOldFiles] = useState([]);

  // Form fields
  const [title, setTitle] = useState("");
  const [article, setArticle] = useState("");
  const [note, setNote] = useState("");

  // New files + preview
  const [newImage, setNewImage] = useState(null);
  const [newVideo, setNewVideo] = useState(null);
  const [newSlide, setNewSlide] = useState(null);

  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [slidePreview, setSlidePreview] = useState(null);

  const [loading, setLoading] = useState(false);

  /* ------------------- LOAD ENTRY ------------------- */
  useEffect(() => {
    api
      .get(`/journalism/entries/${entryId}`)
      .then((res) => {
        setEntry(res.data.entry);
        setTitle(res.data.entry.title || "");
        setArticle(res.data.entry.article || "");
        setNote(res.data.entry.note || "");

        setOldFiles(res.data.submissions || []);
      })
      .catch(() => toast.error("Không tải được dữ liệu bài thi"));
  }, [entryId]);

  /* ------------------- PREVIEW NEW FILES ------------------- */
  useEffect(() => {
    if (newImage) setImagePreview(URL.createObjectURL(newImage));
  }, [newImage]);

  useEffect(() => {
    if (newVideo) setVideoPreview(URL.createObjectURL(newVideo));
  }, [newVideo]);

  useEffect(() => {
    if (newSlide) setSlidePreview(URL.createObjectURL(newSlide));
  }, [newSlide]);

  /* ------------------- HANDLE SAVE ------------------- */
  async function handleUpdate(e) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      // Update text fields
      await api.put(`/journalism/entries/update/${entryId}`, {
        title,
        article,
        note,
      });

      // Upload file replacements
      const fd = new FormData();
      if (newImage) fd.append("image", newImage);
      if (newVideo) fd.append("video", newVideo);
      if (newSlide) fd.append("slide", newSlide);

      if (newImage || newVideo || newSlide) {
        await api.post(`/journalism/submissions/update-files/${entryId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
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

  /* ============================================================
     RENDER UI — giống 100% form nộp bài
  ============================================================ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5ff] via-[#faf7ff] to-white py-10 px-4 font-inter">
      <Toaster position="top-right" />

      {/* Back */}
      <div className="max-w-5xl mx-auto mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-purple-700 hover:text-fuchsia-600 font-semibold flex items-center gap-1 transition mb-4"
        >
          <ArrowLeft className="w-5 h-5" /> Quay lại
        </button>

        <div className="bg-white/80 backdrop-blur-xl border border-purple-100 rounded-3xl shadow-md p-8">
          <h1 className="text-3xl font-bold text-blue-700 mb-3 pb-2 border-b-4 border-blue-200 flex items-center gap-2">
            ✏️ Chỉnh Sửa Bài Thi
          </h1>

          <div className="text-sm text-gray-700">
            Đang chỉnh sửa bài thi đã nộp ngày{" "}
            <b className="text-gray-900">{new Date(entry.createdAt).toLocaleDateString("vi-VN")}</b>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleUpdate}
        className="max-w-5xl mx-auto bg-white/80 backdrop-blur-lg border border-gray-100 p-8 rounded-3xl shadow-lg space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT COLUMN – TEXT */}
          <div className="space-y-5">
            <div>
              <label className="font-semibold text-gray-700">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-purple-500"
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
                className="w-full border border-gray-300 rounded-lg p-3 mt-1 focus:ring-2 focus:ring-purple-500 resize-none"
              ></textarea>
            </div>

            <div>
              <label className="font-semibold text-gray-700">Ghi chú</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-purple-500"
                placeholder="VD: chỉnh sửa lần 2..."
              />
            </div>
          </div>

          {/* RIGHT COLUMN – FILES */}
          <div className="flex flex-col gap-5">
            {/* OLD FILES PREVIEW */}
            {oldFiles.length > 0 && (
              <div className="mb-2">
                <p className="font-semibold text-gray-600 mb-2">📎 File hiện tại:</p>
                <div className="space-y-4">
                  {oldFiles.map((f) => (
                    <div key={f.id}>
                      <p className="text-xs text-gray-500">{f.fileName}</p>
                      <FilePreview url={f.fileUrl} type={f.fileType} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload new overrides */}
            <UploadBox
              label="Ảnh đại diện mới"
              icon={Image}
              accept="image/*"
              file={newImage}
              previewUrl={imagePreview}
              onChange={setNewImage}
            />

            <UploadBox
              label="Video mới"
              icon={Video}
              accept="video/*"
              file={newVideo}
              previewUrl={videoPreview}
              onChange={setNewVideo}
            />

            <UploadBox
              label="Slide mới"
              icon={FileText}
              accept="application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              file={newSlide}
              previewUrl={slidePreview}
              onChange={setNewSlide}
            />
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition disabled:opacity-60"
          >
            <Save className="w-5 h-5" />
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}

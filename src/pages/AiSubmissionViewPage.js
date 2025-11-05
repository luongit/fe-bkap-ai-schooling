import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import api from "../services/apiToken";

export default function AiSubmissionViewPage() {
  const { entryId } = useParams();
  const navigate = useNavigate();

  const [entry, setEntry] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📥 Lấy thông tin bài thi và file nộp
  useEffect(() => {
    if (!entryId) return;

    async function fetchData() {
      try {
        const res = await api.get(`/journalism/entries/${entryId}`);
        if (res.data.status === "success") {
          setEntry(res.data.entry);
          setSubmissions(res.data.submissions || []);
        } else {
          toast.error("Không tìm thấy bài thi!");
        }
      } catch (err) {
        console.error(err);
        toast.error("Lỗi khi tải dữ liệu bài thi!");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [entryId]);

  // 🧩 Hiển thị từng loại file
  const renderFile = (f) => {
    const type = f?.fileType || "";

    // 🖼 Ảnh
    if (type.startsWith("image/"))
      return (
        <img
          src={f.fileUrl}
          alt="Ảnh dự thi"
          className="rounded-lg shadow-md max-h-64 mx-auto my-3"
        />
      );

    // 🎬 Video
    if (type.startsWith("video/"))
      return (
        <video
          src={f.fileUrl}
          controls
          className="rounded-lg shadow-md max-h-72 mx-auto my-3"
        />
      );

    // 📄 PDF
    if (type.includes("pdf"))
      return (
        <embed
          src={f.fileUrl}
          type="application/pdf"
          width="100%"
          height="400px"
          className="rounded-lg border my-3"
        />
      );

    // 🖥 Slide PowerPoint (.pptx)
   if (type.includes("presentation")) {
  const officeViewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
    f.fileUrl
  )}`;
  return (
    <div className="text-center my-3">
      <iframe
        src={officeViewUrl}
        width="100%"
        height="500px"
        className="rounded-lg border"
        title="Slide Viewer"
      ></iframe>
      <a
        href={f.fileUrl}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 underline block mt-2"
      >
        📎 Tải slide (.pptx)
      </a>
    </div>
  );
}


    // 📎 Mặc định (các loại file khác)
    return (
      <a
        href={f.fileUrl}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 underline block my-2 text-center"
      >
        📎 Tải tệp ({type || "Không rõ định dạng"})
      </a>
    );
  };

  // ⏳ Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-pulse text-gray-500">
          ⏳ Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  // ⚠️ Không có entry
  if (!entry) {
    return (
      <div className="max-w-2xl mx-auto py-10 text-center">
        <Toaster position="top-right" />
        <h2 className="text-xl font-semibold text-red-600">
          ⚠️ Không tìm thấy bài thi
        </h2>
        <button
          onClick={() => navigate("/ai-journalism")}
          className="mt-4 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  // ✅ Giao diện chính
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 font-inter">
      <Toaster position="top-right" />

      <button
        onClick={() => navigate("/ai-journalism")}
        className="mb-6 text-purple-700 hover:underline font-semibold flex items-center gap-1"
      >
        ← Quay lại danh sách
      </button>

      <h2 className="text-2xl font-bold text-gray-800 mb-2">👁 Xem bài đã nộp</h2>

      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 space-y-5">
        {/* --- Tiêu đề & bài viết --- */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            📰 {entry.title || "Chưa có tiêu đề"}
          </h3>
          <p className="text-gray-600 whitespace-pre-line">
            {entry.article || "Chưa có nội dung bài viết."}
          </p>
        </div>

        {/* --- Danh sách file --- */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            📁 Các tệp đính kèm ({submissions.length})
          </h4>

          {submissions.length === 0 ? (
            <p className="text-gray-500">Chưa có tệp nào được nộp.</p>
          ) : (
            submissions.map((f, i) => (
              <div
                key={f.id || i}
                className="border border-gray-100 rounded-lg p-3 bg-gray-50 my-3"
              >
                <p className="text-sm text-gray-600 mb-1">
                  <b>Loại:</b> {f.fileType || "Không rõ"} |{" "}
                  <b>Ngày nộp:</b>{" "}
                  {new Date(f.submittedAt).toLocaleString("vi-VN")}
                </p>
                {renderFile(f)}
              </div>
            ))
          )}
        </div>

        {/* --- Điểm & phản hồi --- */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-1">
            📊 Kết quả & Nhận xét
          </h4>

          {entry.aiScore ? (
            <div className="text-gray-700">
              <p>
                <b>Điểm:</b>{" "}
                <span className="text-purple-700 font-semibold">
                  {entry.aiScore} / 100
                </span>
              </p>
              {entry.aiFeedback && (
                <p className="mt-2 text-gray-600 italic">
                  💬 {entry.aiFeedback}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Thầy cô chưa chấm điểm bài này.</p>
          )}
        </div>
      </div>
    </div>
  );
}

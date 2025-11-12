import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import api from "../services/apiToken";
import {
  FileText,
  ArrowLeft,
  Award,
  CalendarDays,
  MessageSquare,
  FileCheck,
} from "lucide-react";

export default function AiSubmissionViewPage() {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entryId) return;
    async function fetchData() {
      try {
        const res = await api.get(`/journalism/entries/${entryId}`);
        if (res.data.status === "success") {
          setEntry(res.data.entry);
          setSubmissions(res.data.submissions || []);
        } else toast.error("Không tìm thấy bài thi!");
      } catch (err) {
        console.error(err);
        toast.error("Lỗi khi tải dữ liệu bài thi!");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [entryId]);

  const renderFile = (f) => {
    const type = f?.fileType || "";

    if (type.startsWith("image/"))
      return (
        <img
          src={f.fileUrl}
          alt="Ảnh dự thi"
          className="rounded-md border border-gray-200 w-full max-h-80 object-contain my-2"
        />
      );

    if (type.startsWith("video/"))
      return (
        <video
          src={f.fileUrl}
          controls
          className="rounded-md border border-gray-200 w-full max-h-96 my-2"
        />
      );

    if (type.includes("pdf"))
      return (
        <embed
          src={f.fileUrl}
          type="application/pdf"
          width="100%"
          height="500px"
          className="rounded-md border border-gray-200 my-3"
        />
      );

    if (type.includes("presentation")) {
      const viewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        f.fileUrl
      )}`;
      return (
        <iframe
          src={viewUrl}
          width="100%"
          height="480px"
          className="rounded-md border border-gray-200 my-3"
          title="Slide Viewer"
        ></iframe>
      );
    }

    return (
      <a
        href={f.fileUrl}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 hover:text-blue-700 underline text-sm"
      >
        📎 Tải tệp ({type || "Không rõ định dạng"})
      </a>
    );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh] text-gray-500">
        ⏳ Đang tải dữ liệu...
      </div>
    );

  if (!entry)
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <Toaster position="top-right" />
        <h2 className="text-lg font-semibold text-red-600 mb-3">
          ⚠️ Không tìm thấy bài thi
        </h2>
        <button
          onClick={() => navigate("/ai-journalism")}
          className="border border-gray-300 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-100 transition"
        >
          ← Quay lại danh sách
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-5 font-inter text-gray-800">
      <Toaster position="top-right" />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/ai-journalism")}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Quay lại danh sách</span>
          </button>

          <div className="flex items-center gap-1 text-sm text-gray-500">
            <CalendarDays className="w-4 h-4" />
            Nộp lúc: {new Date(entry.createdAt).toLocaleString("vi-VN")}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-8">
          {/* Tiêu đề */}
          <div className="text-center border-b border-gray-100 pb-5">
            <h1 className="text-2xl font-semibold text-gray-800">
              Xem Bài Dự Thi
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Nội dung bài viết, tệp đính kèm và kết quả đánh giá
            </p>
          </div>

          {/* Nội dung bài viết */}
          <section>
            <h2 className="text-lg font-semibold mb-2">
              📰 {entry.title || "Chưa có tiêu đề"}
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {entry.article || "Chưa có nội dung bài viết."}
            </p>
          </section>

          {/* Tệp đính kèm */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-semibold text-gray-800">
                Tệp đính kèm ({submissions.length})
              </h3>
            </div>

            {submissions.length === 0 ? (
              <p className="text-gray-500 text-sm italic">
                Chưa có tệp nào được nộp.
              </p>
            ) : (
              <div className="space-y-4">
                {submissions.map((f, i) => (
                  <div
                    key={f.id || i}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-2 flex-wrap gap-2">
                      <span>
                        <b>Loại:</b> {f.fileType || "Không rõ"}{" "}
                        <span className="text-gray-400 mx-1">•</span>
                        <b>Ngày nộp:</b>{" "}
                        {new Date(f.submittedAt).toLocaleString("vi-VN")}
                      </span>
                      <a
                        href={f.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <FileCheck className="w-4 h-4" /> Mở tệp
                      </a>
                    </div>
                    {renderFile(f)}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Kết quả & Nhận xét */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-semibold text-gray-800">
                Kết quả & Nhận xét
              </h3>
            </div>

            {entry.aiScore ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Điểm AI đánh giá</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {entry.aiScore}
                    <span className="text-lg text-gray-400"> / 100</span>
                  </p>
                </div>

                {entry.aiFeedback && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex gap-2 items-start">
                      <MessageSquare className="w-5 h-5 text-blue-500 mt-1" />
                      <p className="italic text-gray-700 leading-relaxed">
                        “{entry.aiFeedback}”
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">
                ⏳ Bài thi của bạn đang chờ được chấm điểm.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

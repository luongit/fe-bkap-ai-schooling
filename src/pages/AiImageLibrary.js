import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiTrash2, FiDownload, FiPlusCircle, FiImage } from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../services/apiToken";

function AiImageLibrary() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const [info, setInfo] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extending, setExtending] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // 🟢 ALWAYS call hooks at top level (no early return)
  const fetchInfo = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get("/images/library/info", {
        params: { userId: Number(userId) },
      });
      setInfo(res.data);
    } catch (err) {
      console.error("Error fetch library info:", err);
      setError("Không lấy được thông tin thư viện.");
    }
  }, [userId]);

  const fetchImages = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get("/images/library", {
        params: { userId: Number(userId) },
      });
      setImages(res.data || []);
    } catch (err) {
      console.error("Error fetch library images:", err);
      setError("Không lấy được danh sách ảnh.");
    }
  }, [userId]);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      setError("");
      await Promise.all([fetchInfo(), fetchImages()]);
      setLoading(false);
    };
    load();
  }, [fetchInfo, fetchImages, userId]);

  const handleDownload = (url) => {
    if (!url) return;
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-spark-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Đã tải ảnh.");
    } catch (err) {
      toast.error("Lỗi khi tải ảnh.");
    }
  };

  const handleDelete = async (imageId) => {
  if (!userId) return;
  if (!window.confirm("Xoá ảnh này?")) return;

  try {
    setDeletingId(imageId);

    const res = await api.delete("/images/library/delete", {
      params: { userId: Number(userId), imageId },
    });

    // Xóa ảnh trên UI
    setImages((prev) => prev.filter((img) => img.id !== imageId));

    // 🔥 Chỉ GIẢM slot nếu backend báo "decrement = true"
    if (res.data?.decrement === true) {
      setInfo((prev) =>
        prev ? { ...prev, used: Math.max(0, prev.used - 1) } : prev
      );
    }

    toast.success("Đã xoá ảnh.");
  } catch (err) {
    toast.error("Không xoá được ảnh.");
  } finally {
    setDeletingId(null);
  }
};


  const handleExtend = async () => {
    if (!userId) return;
    try {
      setExtending(true);
      setError("");

      await api.post("/images/library/extend", null, {
        params: { userId: Number(userId) },
      });

      toast.success("Đã mua thêm slot.");
      fetchInfo();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Không mua thêm được dung lượng.";
      toast.error(msg);
      setError(msg);
    } finally {
      setExtending(false);
    }
  };

  // 🟦 UI RENDER CHỈ ĐIỀU KIỆN TRONG RETURN — không ảnh hưởng hooks
  if (!token || !userId) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
          <FiImage className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Bạn cần đăng nhập để xem thư viện
          </h1>
          <button
            onClick={() => navigate("/auth/login")}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
          >
            Đăng nhập
          </button>
        </div>
      </main>
    );
  }

  const used = info?.used ?? 0;
  const capacity = info?.capacity ?? 10;
  const percent = Math.min(100, Math.round((used / capacity) * 100));

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiImage className="text-purple-600" /> Thư viện ảnh AI
          </h1>

          <button
            onClick={() => navigate("/generate-image")}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
          >
            + Tạo ảnh mới
          </button>
        </div>

        {/* INFO */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border mb-6">
          <p className="text-sm text-gray-500">Dung lượng thư viện</p>
          <p className="font-semibold text-gray-800">
            {used} / {capacity} ảnh
          </p>

          <div className="mt-2 w-full max-w-md">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600"
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>

          <button
            onClick={handleExtend}
            disabled={extending}
            className="mt-3 px-3 py-2 border border-purple-300 text-purple-700 rounded-xl bg-purple-50 hover:bg-purple-100"
          >
            {extending ? "Đang xử lý..." : "Mua thêm 5 slot"}
          </button>
        </div>

        {/* IMAGES GRID */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            Đang tải thư viện...
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            Thư viện trống.
          </div>
        ) : (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="bg-white border rounded-2xl overflow-hidden shadow-sm"
              >
                <img
                  src={img.imageUrl}
                  alt="AI"
                  className="w-full h-48 object-cover"
                />
                <div className="p-3 flex justify-between items-center">
                  <button
                    onClick={() => handleDownload(img.imageUrl)}
                    className="text-sm text-gray-600 hover:text-black"
                  >
                    <FiDownload />
                  </button>
                  <button
                    onClick={() => handleDelete(img.id)}
                    disabled={deletingId === img.id}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default AiImageLibrary;

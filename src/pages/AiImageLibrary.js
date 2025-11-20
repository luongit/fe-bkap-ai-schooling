import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiTrash2, FiDownload, FiImage, FiX, FiLoader } from "react-icons/fi";
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
    const [downloadingId, setDownloadingId] = useState(null);


    const [previewImage, setPreviewImage] = useState(null);

    const cleanPrompt = (text) => {
        if (!text) return "";
        return text
            .replace(/^tạo ảnh\s*/i, "")
            .replace(/^create image\s*/i, "")
            .trim();
    };

    const formatDate = (iso) => {
        if (!iso) return "";
        return new Date(iso).toLocaleString("vi-VN");
    };

    const fetchInfo = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await api.get("/images/library/info", {
                params: { userId: Number(userId) },
            });
            setInfo(res.data);
        } catch (err) {
            console.error(err);
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
            console.error(err);
        }
    }, [userId]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([fetchInfo(), fetchImages()]);
            setLoading(false);
        };
        load();
    }, [fetchInfo, fetchImages]);

    const handleDownload = async (url, id) => {
        try {
            setDownloadingId(id);
            const res = await api.get("/images/library/download", {
                params: { url },
                responseType: "blob",
            });

            const blob = new Blob([res.data], { type: "image/png" });
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = `ai-image-${Date.now()}.png`;
            link.click();
            toast.success("Đã tải ảnh!");
        } catch (err) {
            toast.error("Không tải được ảnh!");
        } finally {
            setDownloadingId(null);
        }
    };

    const handleDelete = async (imageId) => {
        if (!window.confirm("Xoá ảnh này?")) return;

        try {
            setDeletingId(imageId);

            const res = await api.delete("/images/library/delete", {
                params: { userId: Number(userId), imageId },
            });

            setImages((prev) => prev.filter((img) => img.id !== imageId));

            if (res.data?.decrement === true) {
                setInfo((prev) =>
                    prev ? { ...prev, used: Math.max(0, prev.used - 1) } : prev
                );
            }

            toast.success("Đã xoá ảnh!");
        } catch (err) {
            toast.error("Không xoá được ảnh!");
        } finally {
            setDeletingId(null);
        }
    };

    const handleExtend = async () => {
        try {
            setExtending(true);

            await api.post("/images/library/extend", null, {
                params: { userId: Number(userId) },
            });

            toast.success("Đã mua thêm slot!");
            fetchInfo();
        } catch (err) {
            toast.error("Không mua được!");
        } finally {
            setExtending(false);
        }
    };

    // ---------------- MAIN UI -----------------
    if (!token || !userId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Bạn cần đăng nhập
            </div>
        );
    }

    const used = info?.used ?? 0;
    const capacity = info?.capacity ?? 10;

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* HEADER */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FiImage className="text-purple-600" /> Thư viện ảnh AI
                    </h1>

                    <button
                        onClick={() => navigate("/generate-image")}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl"
                    >
                        + Tạo ảnh mới
                    </button>
                </div>

                {/* STORAGE */}
                <div className="bg-white p-4 rounded-2xl shadow border mb-6">
                    <p className="text-sm text-gray-500">Dung lượng</p>
                    <p className="font-semibold">
                        {used} / {capacity} ảnh
                    </p>

                    <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                        <div
                            className="h-full bg-purple-600"
                            style={{ width: `${(used / capacity) * 100}%` }}
                        ></div>
                    </div>

                    <button
                        onClick={handleExtend}
                        disabled={extending}
                        className="mt-3 px-3 py-2 bg-purple-50 text-purple-700 border rounded-xl"
                    >
                        {extending ? "Đang xử lý..." : "Mua thêm 5 slot"}
                    </button>
                </div>

                {/* IMAGE GRID */}
                {loading ? (
                    <div className="text-center py-16">Đang tải...</div>
                ) : images.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">Thư viện trống</div>
                ) : (
                    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {images.map((img) => (
                            <div
                                key={img.id}
                                className="bg-white border rounded-2xl shadow-sm cursor-pointer"
                                onClick={() => setPreviewImage(img)}
                            >
                                <img src={img.imageUrl} className="w-full h-48 object-cover" />

                                <div className="p-3">
                                    <p className="text-xs font-medium text-gray-800 line-clamp-2 h-8">
                                        {cleanPrompt(img.prompt)}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mb-2">
                                        {formatDate(img.createdAt)}
                                    </p>

                                    <div className="flex justify-between items-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownload(img.imageUrl, img.id);
                                            }}
                                            className="text-gray-600"
                                        >
                                            {downloadingId === img.id ? (
                                                <FiLoader className="animate-spin" />
                                            ) : (
                                                <FiDownload />
                                            )}
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(img.id);
                                            }}
                                            disabled={deletingId === img.id}
                                            className="text-red-500"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ================= PREVIEW POPUP ================= */}
            {previewImage && (
                <div className="fixed inset-0 bg-white z-50 flex">
                    {/* TOP BAR */}
                    <div className="absolute top-0 left-0 w-full h-16 bg-white border-b flex items-center justify-between px-6 z-50">

                       


                        <p className="text-sm text-gray-600 max-w-[50%] truncate">
                           Image
                        </p>

                        <button
                            onClick={() =>
                                handleDownload(previewImage.imageUrl, previewImage.id)
                            }
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition"
                        >
                            <FiDownload className="text-xl text-gray-700" />
                        </button>


                    </div>

                    {/* MAIN IMAGE */}
                 <div className="flex-1 flex flex-col items-center justify-center pt-20 pb-10 bg-white">
    <img
        src={previewImage.imageUrl}
        className="max-w-[90%] max-h-[90%] object-contain rounded-lg"
    />

    <p className="mt-3 text-gray-600 text-sm text-center">
        {cleanPrompt(previewImage.prompt)}
    </p>
</div>


                    {/* RIGHT SIDEBAR (CENTERED THUMBNAILS) */}
                   <div className="w-28 border-l bg-white flex flex-col">

    {/* DANH SÁCH ẢNH – CUỘN ĐỘC LẬP */}
    <div className="flex-1 overflow-y-auto py-4 px-2">
        <div className="flex flex-col items-center">
            {images.map((img) => (
                <img
                    key={img.id}
                    src={img.imageUrl}
                    onClick={() => setPreviewImage(img)}
                    className={`w-full h-20 object-cover mb-3 rounded-lg cursor-pointer transition 
                        ${
                            previewImage.id === img.id
                                ? "ring-2 ring-purple-500"
                                : "opacity-80 hover:opacity-100"
                        }`}
                />
            ))}
        </div>
    </div>

    {/* NÚT ĐÓNG – LUÔN DƯỚI CÙNG, KHÔNG BỊ CUỘN */}
    <div className="p-3 border-t bg-white">
        <button
            onClick={() => setPreviewImage(null)}
            className="w-full py-2 bg-purple-600 text-white text-sm font-medium rounded-lg shadow hover:bg-purple-700 transition"
        >
            Đóng
        </button>
    </div>
</div>


                </div>
            )}


        </main>
    );
}

export default AiImageLibrary;

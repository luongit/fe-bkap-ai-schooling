// src/pages/Library.jsx  ←  THAY THẾ HOÀN TOÀN 2 FILE CŨ
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiTrash2, FiDownload, FiVideo, FiImage, FiX, FiPlay,
  FiLoader, FiPlus
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../services/apiToken";
import LoginRequiredBox from "../pages/LoginRequiredBox";

function Library() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const [tab, setTab] = useState("video"); // "video" | "image"

  // VIDEO
  const [videoInfo, setVideoInfo] = useState({ used: 0, capacity: 5 });
  const [videos, setVideos] = useState([]);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [deletingVideoId, setDeletingVideoId] = useState(null);
  const [downloadingVideoId, setDownloadingVideoId] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [extendingVideo, setExtendingVideo] = useState(false);

  // IMAGE
  const [imageInfo, setImageInfo] = useState({ used: 0, capacity: 10 });
  const [images, setImages] = useState([]);
  const [loadingImage, setLoadingImage] = useState(true);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [downloadingImageId, setDownloadingImageId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [extendingImage, setExtendingImage] = useState(false);

  const formatDate = (d) => new Date(d).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });

  const cleanPrompt = (text) => text ? text.replace(/^tạo ảnh\s*/i, "").replace(/^create image\s*/i, "").trim() : "";

  // ==================== VIDEO ====================
  const fetchVideos = useCallback(async () => {
    if (!userId) return;
    try {
      const [infoRes, listRes] = await Promise.all([
        api.get("/video/library/info", { params: { userId: Number(userId) } }),
        api.get("/video/library", { params: { userId: Number(userId) } })
      ]);
      setVideoInfo(infoRes.data || { used: 0, capacity: 5 });
      setVideos(listRes.data || []);
    } catch (err) {
      toast.error("Lỗi tải thư viện video");
    } finally {
      setLoadingVideo(false);
    }
  }, [userId]);

  const handleDownloadVideo = async (url, id) => {
    try {
      setDownloadingVideoId(id);
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `video_${new Date().toISOString().slice(0,10)}.mp4`;
      a.click();
      toast.success("Đã tải video thành công!");
    } catch {
      toast.error("Không thể tải video");
    } finally {
      setDownloadingVideoId(null);
    }
  };

  const handleDeleteVideo = async (videoId) => {
  if (!window.confirm("Bạn có chắc chắn muốn xóa video này?")) return;
  try {
    setDeletingVideoId(videoId);
    const response = await api.delete("/video/library/delete", {
      params: { userId: Number(userId), videoId }
    });
    setVideos(prev => prev.filter(v => v.id !== videoId));
    if (response.data?.decrement) {
      setVideoInfo(prev => ({ ...prev, used: Math.max(0, prev.used - 1) }));
    }
    toast.success("Đã xóa video!");
  } catch (err) {
    toast.error(err.response?.data?.message || "Không thể xóa video");
  } finally {
    setDeletingVideoId(null);
  }
};

  const handleExtendVideo = async () => {
    try {
      setExtendingVideo(true);
      await api.post("/video/library/extend", null, { params: { userId: Number(userId) } });
      toast.success("Đã mua thêm 5 slot video!");
      fetchVideos();
    } catch (err) {
      toast.error(err.response?.data?.message || "Không đủ credit để mua slot");
    } finally {
      setExtendingVideo(false);
    }
  };

  // ==================== IMAGE ====================
  const fetchImages = useCallback(async () => {
    if (!userId) return;
    try {
      const [infoRes, listRes] = await Promise.all([
        api.get("/images/library/info", { params: { userId: Number(userId) } }),
        api.get("/images/library", { params: { userId: Number(userId) } })
      ]);
      setImageInfo(infoRes.data || { used: 0, capacity: 10 });
      setImages(listRes.data || []);
    } catch {
      toast.error("Lỗi tải thư viện ảnh");
    } finally {
      setLoadingImage(false);
    }
  }, [userId]);

  const handleDownloadImage = async (url, id) => {
    try {
      setDownloadingImageId(id);
      const res = await api.get("/images/library/download", { params: { url }, responseType: "blob" });
      const blob = new Blob([res.data], { type: "image/png" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `ai-image-${Date.now()}.png`;
      a.click();
      toast.success("Đã tải ảnh!");
    } catch {
      toast.error("Không tải được ảnh!");
    } finally {
      setDownloadingImageId(null);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Xoá ảnh này?")) return;
    try {
      setDeletingImageId(imageId);
      const res = await api.delete("/images/library/delete", { params: { userId: Number(userId), imageId } });
      setImages(prev => prev.filter(i => i.id !== imageId));
      if (res.data?.decrement === true) {
        setImageInfo(prev => ({ ...prev, used: Math.max(0, prev.used - 1) }));
      }
      toast.success("Đã xoá ảnh!");
    } catch {
      toast.error("Không xoá được ảnh!");
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleExtendImage = async () => {
    try {
      setExtendingImage(true);
      await api.post("/images/library/extend", null, { params: { userId: Number(userId) } });
      toast.success("Đã mua thêm slot!");
      fetchImages();
    } catch {
      toast.error("Không mua được!");
    } finally {
      setExtendingImage(false);
    }
  };

  const addImageToVideo = (url) => {
    window.dispatchEvent(new CustomEvent("add-image-to-video", { detail: { imageUrl: url } }));
    toast.success("Đã thêm ảnh vào dự án video!");
  };

  useEffect(() => {
    if (tab === "video") {
      setLoadingVideo(true);
      fetchVideos();
    } else {
      setLoadingImage(true);
      fetchImages();
    }
  }, [tab]);

  useEffect(() => {
    const handler = () => tab === "video" ? fetchVideos() : fetchImages();
    window.addEventListener("video-library-refresh", handler);
    return () => window.removeEventListener("video-library-refresh", handler);
  }, [tab]);

 if (!token || !userId) {
  return <LoginRequiredBox />;
}


  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Thư viện của tôi</h1>
          {tab === "video" ? (
            <button onClick={() => navigate("/generate-video")} className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:scale-105 transition shadow-lg">
              <FiPlus /> Tạo video mới
            </button>
          ) : (
            <button onClick={() => navigate("/generate-image")} className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition shadow-lg">
              <FiPlus /> Tạo ảnh mới
            </button>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="max-w-7xl mx-auto px-6 mt-10">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
          <button onClick={() => setTab("video")} className={`px-8 py-3 rounded-lg font-semibold flex items-center gap-2 ${tab === "video" ? "bg-white text-red-600 shadow" : "text-gray-600"}`}>
            <FiVideo /> Video ({videoInfo.used}/{videoInfo.capacity})
          </button>
          <button onClick={() => setTab("image")} className={`px-8 py-3 rounded-lg font-semibold flex items-center gap-2 ${tab === "image" ? "bg-white text-purple-600 shadow" : "text-gray-600"}`}>
            <FiImage /> Ảnh AI ({imageInfo.used}/{imageInfo.capacity})
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* TAB VIDEO */}
        {tab === "video" && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500">Số video đã lưu</p>
                  <p className="text-2xl font-bold text-gray-800">{videoInfo.used} / {videoInfo.capacity}</p>
                </div>
                <button onClick={handleExtendVideo} disabled={extendingVideo} className="px-5 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 disabled:opacity-60 font-medium transition">
                  {extendingVideo ? "Đang xử lý..." : "Mua thêm 5 slot"}
                </button>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500" style={{ width: `${(videoInfo.used / videoInfo.capacity) * 100}%` }} />
              </div>
            </div>

            {loadingVideo ? (
              <div className="text-center py-20 text-gray-500">Đang tải thư viện video...</div>
            ) : videos.length === 0 ? (
              <div className="text-center py-20">
                <FiVideo className="mx-auto text-6xl text-gray-300 mb-4" />
                <p className="text-xl text-gray-500">Chưa có video nào</p>
                <button onClick={() => navigate("/generate-video")} className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium">
                  Tạo video đầu tiên ngay!
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <div key={video.id} onClick={() => setPreviewVideo(video)} className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
                    <div className="relative aspect-video bg-gray-900">
                      {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiVideo className="text-5xl text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <FiPlay className="text-6xl text-white drop-shadow-2xl" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-800 line-clamp-2">{video.title || "Video không có tiêu đề"}</h3>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(video.createdAt)}</p>
                      <div className="flex items-center justify-between mt-4">
                        <button onClick={(e) => { e.stopPropagation(); handleDownloadVideo(video.videoUrl, video.id); }} className="text-gray-600 hover:text-blue-600 transition">
                          {downloadingVideoId === video.id ? <FiLoader className="animate-spin text-xl" /> : <FiDownload className="text-xl" />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteVideo(video.id); }} className="text-red-500 hover:text-red-700 transition">
                          {deletingVideoId === video.id ? <FiLoader className="animate-spin text-xl" /> : <FiTrash2 className="text-xl" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* TAB ẢNH AI – GIỮ NGUYÊN 100% NHƯ FILE CŨ CỦA BẠN */}
        {tab === "image" && (
          <>
            <div className="bg-white p-4 rounded-2xl shadow border mb-6">
              <p className="text-sm text-gray-500">Dung lượng</p>
              <p className="font-semibold">{imageInfo.used} / {imageInfo.capacity} ảnh</p>
              <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-purple-600" style={{ width: `${(imageInfo.used / imageInfo.capacity) * 100}%` }}></div>
              </div>
              <button onClick={handleExtendImage} disabled={extendingImage} className="mt-3 px-3 py-2 bg-purple-50 text-purple-700 border rounded-xl">
                {extendingImage ? "Đang xử lý..." : "Mua thêm 5 slot"}
              </button>
            </div>

            {loadingImage ? (
              <div className="text-center py-16">Đang tải...</div>
            ) : images.length === 0 ? (
              <div className="text-center py-16 text-gray-500">Thư viện trống</div>
            ) : (
              <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {images.map((img) => (
                  <div key={img.id} className="bg-white border rounded-2xl shadow-sm cursor-pointer" onClick={() => setPreviewImage(img)}>
                    <img src={img.imageUrl} className="w-full h-48 object-cover" alt="" />
                    <div className="p-3">
                      <p className="text-xs font-medium text-gray-800 line-clamp-2 h-8">{cleanPrompt(img.prompt)}</p>
                      <p className="text-[10px] text-gray-400 mb-2">{formatDate(img.createdAt)}</p>
                      <div className="flex justify-between items-center">
                        <button onClick={(e) => { e.stopPropagation(); handleDownloadImage(img.imageUrl, img.id); }} className="text-gray-600">
                          {downloadingImageId === img.id ? <FiLoader className="animate-spin" /> : <FiDownload />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.id); }} disabled={deletingImageId === img.id} className="text-red-500">
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

    {/* PREVIEW VIDEO */}
{previewVideo && (
  <div
className="fixed inset-0 z-50 flex bg-white backdrop-blur-sm"
>

    {/* KHUNG PREVIEW BÊN PHẢI */}
    <div
      className="ml-[260px] flex-1 h-full bg-white shadow-2xl border-l border-gray-200 relative flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Nút hành động */}
      <div className="absolute top-4 right-6 z-10 flex gap-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDownloadVideo(previewVideo.videoUrl, previewVideo.id);
          }}
          className="bg-black/10 hover:bg-black/20 backdrop-blur px-3 py-3 rounded-full transition"
        >
          <FiDownload className="text-2xl text-gray-700" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setPreviewVideo(null);
          }}
          className="bg-black/10 hover:bg-black/20 backdrop-blur px-3 py-3 rounded-full transition"
        >
          <FiX className="text-2xl text-gray-700" />
        </button>
      </div>

      {/* VIDEO */}
      <div className="flex-1 flex items-center justify-center p-10">
        <video
          src={previewVideo.videoUrl}
          controls
          autoPlay
          className="max-w-full max-h-full rounded-2xl shadow-xl border border-gray-300"
        />
      </div>

      {/* FOOTER */}
      <div className="py-4 text-center bg-white border-t">
        <p className="text-gray-700 font-semibold">
          {previewVideo.title || "Video"}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {formatDate(previewVideo.createdAt)}
        </p>
      </div>
    </div>

    {/* CỘT DANH SÁCH VIDEO BÊN PHẢI */}
<div className="w-32 bg-white border-l h-full flex flex-col justify-between p-3 pt-24">

  <div className="flex flex-col gap-3 overflow-y-auto">

        {videos.map((v) => (
          <div
            key={v.id}
            className={`cursor-pointer rounded-lg overflow-hidden shadow-sm border 
              ${previewVideo.id === v.id ? "ring-2 ring-red-500" : "opacity-80 hover:opacity-100"}`}
            onClick={() => setPreviewVideo(v)}
          >
            {v.thumbnailUrl ? (
              <img
                src={v.thumbnailUrl}
                className="w-full h-20 object-cover"
                alt=""
              />
            ) : (
              <div className="w-full h-20 bg-gray-200 flex items-center justify-center">
                <FiVideo className="text-gray-500 text-2xl" />
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => setPreviewVideo(null)}
        className="mt-4 w-full py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
      >
        Đóng
      </button>
    </div>
  </div>
)}

      {/* PREVIEW IMAGE – GIỮ NGUYÊN 100% NHƯ FILE CŨ CỦA BẠN */}
      {previewImage && (
        <div className="fixed inset-0 bg-white z-50 flex">
          <div className="absolute top-0 left-0 w-full h-16 bg-white border-b flex items-center justify-between px-6 z-50">
            <p className="text-sm text-gray-600 max-w-[50%] truncate">Image</p>
            <button onClick={() => handleDownloadImage(previewImage.imageUrl, previewImage.id)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition">
              <FiDownload className="text-xl text-gray-700" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center pt-20 pb-10 bg-white">
            <img src={previewImage.imageUrl} className="max-w-[90%] max-h-[90%] object-contain rounded-lg" alt="" />
            <p className="mt-3 text-gray-600 text-sm text-center">{cleanPrompt(previewImage.prompt)}</p>
          </div>

          <div className="w-28 border-l bg-white flex flex-col">
            <div className="flex-1 overflow-y-auto py-4 px-2">
              <div className="flex flex-col items-center">
                {images.map((img) => (
                  <img
                    key={img.id}
                    src={img.imageUrl}
                    onClick={() => setPreviewImage(img)}
                    className={`w-full h-20 object-cover mb-3 rounded-lg cursor-pointer transition 
                      ${previewImage.id === img.id ? "ring-2 ring-purple-500" : "opacity-80 hover:opacity-100"}`}
                    alt=""
                  />
                ))}
              </div>
            </div>
            <div className="p-3 border-t bg-white">
              <button onClick={() => setPreviewImage(null)} className="w-full py-2 bg-purple-600 text-white text-sm font-medium rounded-lg shadow hover:bg-purple-700 transition">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Library;
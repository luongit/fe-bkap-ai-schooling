import React, { useState, useRef } from "react";
import api from "../services/apiToken";
import { toast } from "react-toastify";


const icons = {
  plus: (props) => (
    <svg {...props} viewBox="0 0 24 24" stroke="currentColor">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  edit: (props) => (
    <svg {...props} viewBox="0 0 24 24" stroke="currentColor">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  ),
  export: (props) => (
    <svg {...props} viewBox="0 0 24 24" stroke="currentColor">
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    </svg>
  ),
};

const defaultStyle = {
  "font-size": "32px",
  "font-family": "Inter",
  "font-weight": "500",
  "highlight-color": "#fefa4a",
  "stroke-color": "#333333",
  color: "#FFFFFF",
  "stroke-width": "1px",
  "highlight-animation": "progressive",
  "text-shadow": "1px 1px rgba(0,0,0,0.3)",
  "horizontal-position": "center",
  "vertical-position": "bottom",
};

export default function VideoStudioProLayout() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [bgMusicFile, setBgMusicFile] = useState(null);
  const [bgMusicValid, setBgMusicValid] = useState(false);
  const [bgMusicPreviewUrl, setBgMusicPreviewUrl] = useState("");
  const [bgMusicDuration, setBgMusicDuration] = useState(0);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [videoResult, setVideoResult] = useState(null);
  const [autoDuration, setAutoDuration] = useState(false);
  const fileRef = useRef();
  const slide = slides[current];
  const disableEdit = slides.length === 0;

  const removeSlide = (id) => {
    setSlides((prevSlides) => {
      const index = prevSlides.findIndex((s) => s.id === id);
      if (index === -1) return prevSlides; // không tìm thấy

      const newSlides = prevSlides.filter((s) => s.id !== id);

      // Nếu xóa xong còn ảnh -> cập nhật current đúng vị trí hợp lệ
      setCurrent((prevCurrent) => {
        if (newSlides.length === 0) return 0; // hết ảnh thì reset
        if (index <= prevCurrent && prevCurrent > 0) {
          return prevCurrent - 1; // 
        }
        return Math.min(prevCurrent, newSlides.length - 1);
      });

      // Chia đều thời lượng nhạc nếu autoDuration bật
      if (autoDuration && bgMusicDuration > 0 && newSlides.length > 0) {
        const durPerSlide = Math.min(bgMusicDuration / newSlides.length, 180);
        return newSlides.map(s => ({ ...s, duration: durPerSlide }));
      }

      return newSlides;
    });
  };
  // Ước lượng thời lượng đọc (số giây) dựa trên độ dài text
  const estimateDuration = (text) => {
    const words = text.trim().split(/\s+/).length;
    // Trung bình người đọc tiếng Việt 150 từ / phút = 2.5 từ / giây
    const base = words / 2.5;
    return Math.max(base + 1.5, 12);
  };

  // ======================= ADD / UPDATE =======================
  const addSlide = (file) => {
    const preview = URL.createObjectURL(file);
    const initText = "Nhập nội dung...";
    const autoDur = estimateDuration(initText); //  tự tính thời lượng ban đầu

    const newSlide = {
      id: `${Date.now()}-${Math.random().toString(10).slice(2, 9)}`,
      text: initText,
      duration: autoDur, //  thời gian auto mặc định
      imageFile: file,
      imagePreview: preview,
      style: { ...defaultStyle },
    };

    setSlides((prev) => {
      const newArr = [...prev, newSlide];
      setCurrent(newArr.length - 1);
      setAutoDuration(true);

      // Nếu có nhạc và autoDuration, chia đều thời lượng
      if (bgMusicDuration > 0) {
        const durPerSlide = Math.min(bgMusicDuration / newArr.length, 12);
        return newArr.map(s => ({ ...s, duration: durPerSlide }));
      }

      return newArr;
    });

  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);

    // Nếu đã có 15 ảnh thì không cho thêm nữa
    if (slides.length >= 15) {
      toast.warn("Bạn chỉ được chọn tối đa 15 ảnh !");
      e.target.value = "";
      return;
    }

    // Tính tổng số ảnh sau khi chọn
    const total = slides.length + files.length;

    if (total > 15) {
      toast.warn(`Bạn chỉ được chọn tối đa 15 ảnh !`);
      const allowedFiles = files.slice(0, 15 - slides.length);
      allowedFiles.forEach(addSlide);
    } else {
      files.forEach(addSlide);
    }

    e.target.value = "";
  };

  const updateField = (key, value) => {
    setSlides((prev) => {
      return prev.map((s, i) => {
        if (i !== current) return s;

        // tự cập nhật thời lượng mới
        if (key === "text" && autoDuration) {
          const newDur = estimateDuration((value), 12);
          // Cập nhật duration 
          clearTimeout(window._autoToastTimer);
          window._autoToastTimer = setTimeout(() => {
            toast.dismiss("auto-update"); // huỷ thông báo cũ nếu có
            toast.info(`Tự động cập nhật thời lượng: ${newDur.toFixed(1)}s`, {
              toastId: "auto-update",
              position: "bottom-right",
              autoClose: 1800,
            });
          }, 600);

          return { ...s, text: value, duration: newDur };
        }

        return { ...s, [key]: value };
      });
    });
  };

  const updateStyle = (key, value) => {
    setSlides((prev) =>
      prev.map((s, i) =>
        i === current ? { ...s, style: { ...s.style, [key]: value } } : s
      )
    );
  };

  // ======================= EXPORT =======================
  const handleExport = async () => {
    if (!slides.length) return toast.error("Hãy thêm ít nhất một ảnh!");

    try {
      setLoading(true);
      setVideoResult(null);

      //  1. Chuẩn bị FormData gửi backend
      const fd = new FormData();

      // Upload nhiều ảnh
      slides.forEach((s) => fd.append("files", s.imageFile));

      // Chuẩn hóa slidesJson
      const slidesJson = slides.map((s) => ({
        durationSec: s.duration || estimateDuration(s.text),
        texts: [
          {
            text: s.text,
            style: {
              color: s.style.color,
              "font-size": s.style["font-size"],
              "font-family": s.style["font-family"],
              "font-weight": s.style["font-weight"],
              "text-shadow": s.style["text-shadow"],
              "horizontal-position": s.style["horizontal-position"],
              "vertical-position": s.style["vertical-position"],
            },
          },
        ],
      }));

      fd.append("slidesJson", JSON.stringify(slidesJson));


      if (!bgMusicFile) {
        toast.error("Bạn phải chọn audio trước khi tạo video");
        setLoading(false);
        return;
      }


      fd.append("bgMusicFile", bgMusicFile);
      const res = await api.post("/video/create-slides-advanced-upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Nhận kết quả
      if (res.data?.videoUrl) {
        toast.success("Video đã tạo thành công!");
        setVideoResult({ url: res.data.videoUrl, status: "success" });
      } else {
        throw new Error(res.data?.error || "Không có URL trả về!");
      }
    } catch (err) {
      console.error("Lỗi khi tạo video:", err);
      toast.error("Lỗi" + (err.message || "Lỗi không xác định"));
      setVideoResult({ status: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ======================= RENDER UI =======================
  return (
    <div className="flex h-screen bg-white text-gray-900">

      {/* LEFT PANEL */}
      <aside className="w-[300px] flex flex-col bg-[#F4F1FF] border-r border-[#DDD]">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-[#DDD]">
          <div className="text-sm font-semibold text-[#3A0CA3] uppercase">
            Danh sách ảnh
          </div>

          <button
            onClick={!disableEdit ? handleExport : undefined}
            disabled={disableEdit || loading}
            className={`px-3 py-1.5 rounded-md font-semibold text-xs flex items-center gap-1 text-white shadow-sm bg-gradient-to-r from-[#3A0CA3] via-[#4361EE] to-[#7209B7] ${disableEdit
              ? "cursor-not-allowed opacity-40"
              : loading
                ? "cursor-wait opacity-70"
                : "hover:scale-[1.03] active:scale-[0.97]"
              }`}
          >
            {loading ? "Đang tạo video..." : "Tạo video"}
          </button>

        </div>

        {/* Danh sách Scene */}
        <div
          className={`flex-1 overflow-y-auto p-3 space-y-4 transition ${disableEdit ? "opacity-60 pointer-events-none" : ""
            } ${loading ? "opacity-50" : ""}`}
        >
          {slides.length === 0 ? (
            <div className="text-center text-gray-500 text-sm mt-10">
              Chưa có ảnh nào được chọn . <br />
              <span className="text-[#3A0CA3] font-medium">
                Hãy chọn ảnh ở bên dưới để bắt đầu tạo video.
              </span>
            </div>
          ) : (
            slides.map((s, i) => (
              <div
                key={s.id}
                className={`p-2 rounded-lg border cursor-pointer transition ${i === current
                  ? "border-[#3A0CA3] bg-[#EDE5FF]"
                  : "border-gray-300 hover:bg-gray-50"
                  }`}
                onClick={() => !loading && setCurrent(i)}
              >
                <div className="flex items-center justify-between">
                  <img
                    src={s.imagePreview}
                    className="w-12 h-12 rounded object-cover border border-gray-300"
                    alt=""
                  />
                  <label
                    className={`cursor-pointer ${disableEdit || loading
                      ? "opacity-40 pointer-events-none"
                      : "bg-[#3A0CA3] hover:bg-[#5023BA]"
                      } p-1.5 rounded text-white`}
                    title="Đổi ảnh"
                  >
                    <icons.edit className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      disabled={disableEdit || loading}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files[0];
                        if (f) {
                          updateField("imageFile", f);
                          updateField("imagePreview", URL.createObjectURL(f));
                        }
                      }}
                    />
                  </label>
                </div>

                {i === current && (
                  <>
                    <textarea
                      value={s.text}
                      disabled={disableEdit || loading}
                      maxLength={150}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.length >= 150) {
                          toast.warn("Giới hạn 150 ký tự cho mỗi ảnh!", {
                            toastId: "limit-text",
                            position: "bottom-right",
                            autoClose: 2000,
                          });
                        }
                        updateField("text", val);
                      }}
                      className="w-full mt-2 text-sm bg-white border border-gray-300 rounded p-2 resize-none text-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="Nhập nội dung cho ảnh (tối đa 150 ký tự)..."
                    />

                    {/* Hiển thị bộ đếm ký tự */}
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {s.text.length}/150 ký tự
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <div
          className={`flex justify-between items-center bg-[#F9F8FF] border-b border-gray-200 px-4 py-3 ${disableEdit
            ? "opacity-60 pointer-events-none"
            : loading
              ? "opacity-60 pointer-events-none"
              : ""
            }`}
        >
          <div className="flex items-center gap-4 flex-nowrap overflow-x-auto py-2">
            {/* Độ đậm */}


            {/* Thời gian */}
            <label className="flex items-center gap-2 text-sm flex-shrink-0">
              ⏱ Thời gian (giây)
              <select
                disabled={disableEdit || loading}
                className="bg-white border border-gray-300 rounded px-2 py-1 w-28 disabled:opacity-60"
                value={autoDuration ? "auto" : slide?.duration || 12}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "auto") {
                    const autoDur = estimateDuration(slide?.text || "");
                    const dur = Math.min(autoDur, 12);
                    updateField("duration", dur);
                    setAutoDuration(true);
                    toast.info(`Thời gian tự tính toán là : ${dur.toFixed(1)} giây`, { position: "bottom-right" });
                  } else {
                    const num = parseFloat(val);
                    if (num < 5 || num > 180) {
                      toast.warn("Thời lượng video trong khoảng từ 5 - 180 giây!", { position: "bottom-right" });
                      return;
                    }
                    updateField("duration", num);
                    setAutoDuration(false);
                  }
                }}
              >
                <option title="Tự tính toán thời gian phù hợp" value="auto">Tự động</option>
                {[5, 8, 10, 12].map((sec) => (
                  <option key={sec} value={sec}>{sec} giây</option>
                ))}
              </select>
            </label>

            {/* Nhạc nền */}
            <label className="flex items-center gap-2 text-sm flex-shrink-0">
              🎵 Nhạc nền
              <label
                className={`ml-2 cursor-pointer p-1 rounded bg-white border ${loading || disableEdit ? "opacity-40 pointer-events-none" : ""}`}
                title="Tải lên file audio (mp3)"
              >
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;

                    if (!f.type.startsWith("audio/")) {
                      toast.error("Tệp không phải audio!");
                      return;
                    }
                    if (f.size > 30 * 1024 * 1024) {
                      toast.error("Giới hạn audio tối đa 30MB");
                      return;
                    }

                    setBgMusicFile(f);
                    setBgMusicValid(true);

                    if (bgMusicPreviewUrl) URL.revokeObjectURL(bgMusicPreviewUrl);

                    const audioUrl = URL.createObjectURL(f);
                    const audioObj = new Audio(audioUrl);
                    audioRef.current = audioObj;

                    audioObj.onended = () => setIsPlaying(false);

                    audioObj.onloadedmetadata = () => {
                      setBgMusicDuration(audioObj.duration);

                      if (autoDuration && slides.length > 0) {
                        setSlides(prev =>
                          prev.map(s => ({ ...s, duration: Math.min(audioObj.duration / prev.length, 180) }))
                        );
                      }
                    };

                    setBgMusicPreviewUrl(audioUrl);
                    toast.success("Đã chọn nhạc nền video !");
                  }}
                  disabled={loading || disableEdit}
                />
                <span className="px-2 py-1 text-sm text-[#3A0CA3]">Chọn nhạc nền</span>
              </label>

              {bgMusicFile && (
                <div className="ml-3 flex items-center gap-2 text-sm text-gray-700 min-w-0">
                  <button
                    title="Dừng phát nghe trước nhạc nền"
                    onClick={() => {
                      if (!audioRef.current) return;
                      if (isPlaying) {
                        audioRef.current.pause();
                        setIsPlaying(false);
                      } else {
                        audioRef.current.play().catch(() => toast.error("Không phát được âm thanh !"));
                        setIsPlaying(true);
                      }
                    }}
                    className="px-2 py-1 border rounded hover:bg-gray-100 flex-shrink-0"
                  >
                    {isPlaying ? "⏸ Dừng" : "▶ Nghe thử"}
                  </button>

                  <span className="truncate max-w-[180px]" title={bgMusicFile.name}>{bgMusicFile.name}</span>

                  <button
                    onClick={() => {
                      // Dừng audio nếu đang phát
                      if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                        setIsPlaying(false);
                      }

                      setBgMusicFile(null);
                      setBgMusicValid(false);
                      if (bgMusicPreviewUrl) {
                        URL.revokeObjectURL(bgMusicPreviewUrl);
                        setBgMusicPreviewUrl("");
                      }
                    }}
                    className="text-red-500 font-bold flex-shrink-0"
                    title="Xóa tệp âm thanh đã gửi lên"
                  >
                    ×
                  </button>

                </div>
              )}
            </label>
          </div>

        </div>

        {/* PREVIEW */}
        <main className="flex-1 flex flex-col items-center justify-center bg-white">
          {loading && (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/50 z-50">
              <div className="w-24 h-24 border-8 border-t-[#3A0CA3] border-gray-300 rounded-full animate-spin"></div>
              <span className="mt-4 text-white font-semibold">Đang tiến hành tạo video...Vui lòng không tắt trình duyệt hay đổi sang cửa sổ màn hình khác !</span>
            </div>
          )}
          {slide ? (
            <div className="relative aspect-video w-[75%] rounded-xl overflow-hidden shadow-md border border-gray-200">
              <img
                src={slide.imagePreview}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-95"
              />
              <div
                className="absolute inset-x-0 flex justify-center text-center px-8"
                style={{
                  top:
                    slide.style["vertical-position"] === "top"
                      ? "15%"
                      : slide.style["vertical-position"] === "center"
                        ? "50%"
                        : "90%",
                  transform:
                    slide.style["vertical-position"] === "bottom"
                      ? "translateY(-100%)"
                      : "translateY(-50%)",
                }}
              >
                <div
                  style={{
                    fontSize: slide.style["font-size"],
                    fontFamily: slide.style["font-family"],
                    fontWeight: slide.style["font-weight"],
                    color: slide.style["color"],
                    textShadow: slide.style["text-shadow"],
                    width: "100%",
                    maxWidth: "100%",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                    textAlign:
                      slide.style["horizontal-position"] === "left"
                        ? "left"
                        : slide.style["horizontal-position"] === "right"
                          ? "right"
                          : "center",
                  }}
                >
                  {slide.text}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Chưa có ảnh nào</div>
          )}

          {/* RESULT MODAL */}
          {videoResult && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
              <div className="bg-white rounded-2xl shadow-2xl w-[80%] max-w-3xl relative p-8">
                {/* Nút đóng */}
                <button
                  onClick={() => setVideoResult(null)}
                  className="absolute top-3 right-4 text-gray-400 hover:text-[#7209B7] text-2xl font-bold transition"
                >
                  ×
                </button>

                {videoResult.status === "success" ? (
                  <>
                    {/* Header: Video thành công + Nút tải xuống ngang hàng */}
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-5">
                      <div className="flex items-center gap-2 text-lg font-semibold bg-gradient-to-r from-[#3A0CA3] to-[#7209B7] bg-clip-text text-transparent">
                        <span>Video đã tạo thành công!</span>
                      </div>
                    </div>

                    {/* Preview video */}
                    <video
                      src={videoResult.url}
                      controls
                      autoPlay
                      className="w-full rounded-xl border border-gray-300 shadow-lg"
                    />
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-red-600 font-semibold text-lg">
                      Lỗi khi tạo video !
                    </p>
                    <p className="text-gray-700 mt-2">{videoResult.message}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        <footer
          className={`relative border-t border-gray-200 bg-[#F9F8FF] ${slides.length === 0
            ? "flex items-center justify-start"
            : "flex flex-wrap items-start justify-start"
            } gap-4 px-4 ${slides.length === 0
              ? "py-[10px] overflow-hidden"
              : "py-4 overflow-y-auto"
            } max-h-[240px] scroll-smooth ${loading ? "pointer-events-none opacity-60" : ""
            }`}
        >
          {slides.length === 0 ? (
            // Khi chưa có ảnh
            <div className="w-full flex items-center justify-start">
              {/* Nút thêm ảnh — cách trái 15px, căn giữa chiều cao */}
              <label
                className={`cursor-pointer w-24 h-24 border-2 border-dashed border-[#C7B6FF] rounded-xl flex items-center justify-center 
        text-[#3A0CA3] transition-all shadow-sm flex-shrink-0 ml-[15px] ${loading
                    ? "opacity-40 pointer-events-none"
                    : "hover:border-[#3A0CA3] hover:text-white hover:bg-[#3A0CA3]/90"
                  }`}
              >
                <icons.plus className="w-8 h-8" />
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>

              {/* Văn bản hướng dẫn — cách nút 30px */}
              <div className="flex flex-col items-start text-left ml-8 text-gray-600 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📁</span>
                  <span>Chưa có ảnh nào được chọn .</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[#3A0CA3] font-medium">
                  <span className="text-xl" title="Chọn tệp ảnh để ghép vào video">➕</span>
                  <span>Bấm nút bên trái để thêm ảnh vào video .</span>
                </div>
              </div>
            </div>
          ) : (
            // Khi đã có ảnh
            <>
              {slides.map((s, i) => (
                <div
                  key={s.id}
                  className={`relative cursor-pointer flex flex-col items-center text-xs transition-all ${i === current
                    ? "opacity-100 scale-105"
                    : "opacity-80 hover:opacity-90 hover:scale-105"
                    }`}
                  onClick={() => !loading && setCurrent(i)}
                >
                  <img
                    src={s.imagePreview}
                    alt=""
                    className={`w-24 h-24 object-cover rounded-xl border shadow-sm ${i === current
                      ? "border-[#3A0CA3] ring-2 ring-[#B197FC]/60"
                      : "border-gray-300"
                      }`}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSlide(s.id);
                    }}
                    disabled={loading}
                    className="absolute top-1 right-1 text-black text-lg font-bold leading-none hover:text-red-600 disabled:opacity-40 transition"
                    title="Xóa ảnh này"
                  >
                    ×
                  </button>
                  <span className="truncate w-24 mt-1 text-gray-700 text-center">
                    {s.text.slice(0, 21) || "Ảnh"}
                  </span>
                </div>
              ))}

              {/* ➕ Nút thêm ảnh cuối danh sách */}
              <label
                className={`cursor-pointer w-24 h-24 border-2 border-dashed border-[#C7B6FF] rounded-xl 
        flex items-center justify-center text-[#3A0CA3] transition-all shadow-sm flex-shrink-0 ${loading
                    ? "opacity-40 pointer-events-none"
                    : "hover:border-[#3A0CA3] hover:text-white hover:bg-[#3A0CA3]/90"
                  }`}
              >
                <icons.plus className="w-8 h-8" />
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}

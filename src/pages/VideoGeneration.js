// src/pages/VideoGeneration.jsx
import api from "../services/apiToken"; // axios instance có token/refresh
import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// ===== Inline SVG Icons =====
const VideoIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"></polygon>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
  </svg>
);
const SendIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);
const LoaderIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v2M20.5 5.5l-1.4 1.4M18 8h-2M15.5 5.5l1.4 1.4M12 2v2M8 8H6M3.5 5.5l1.4 1.4M2 12h2M3.5 18.5l1.4-1.4M6 16v2M5.5 20.5l1.4-1.4M12 20v2M18 16v2M20.5 18.5l-1.4-1.4"></path>
  </svg>
);
const XCircleIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);
const ExternalLinkIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);
const UserIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);
const ApertureIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="14.31" y1="8" x2="20.05" y2="17.94"></line>
    <line x1="9.69" y1="8" x2="2.95" y2="6.06"></line>
    <line x1="12" y1="2" x2="12" y2="7.07"></line>
    <line x1="12" y1="17" x2="12" y2="22"></line>
    <line x1="20.05" y1="6.06" x2="14.31" y2="16"></line>
    <line x1="3.95" y1="17.94" x2="9.69" y2="8"></line>
  </svg>
);

// ===== Consts =====
const ESTIMATED_CREDIT_COST = 50;

function VideoGeneration() {
  // --- State chính ---
  const [prompt, setPrompt] = useState(""); // mỗi dòng 1 tiêu đề nếu muốn
  const [loading, setLoading] = useState(false);
  const [remainingCredit, setRemainingCredit] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [videoHistory, setVideoHistory] = useState([]);
  const listEndRef = useRef(null);

  // --- Ảnh: hỗ trợ nhiều ảnh (select / paste / drag-drop) ---
  const [files, setFiles] = useState([]); // File[]
  const [previews, setPreviews] = useState([]); // string[] (ObjectURL)

  // --- Audio: ưu tiên URL để khớp backend hiện tại (/create-batch-upload yêu cầu audioUrl) ---
  const [audioUrl, setAudioUrl] = useState("");

  const textAreaRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const cost = ESTIMATED_CREDIT_COST;
  const started = videoHistory.length > 0;

  // --- Auto scroll ---
  useEffect(() => {
    if (listEndRef.current) listEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [videoHistory, loading]);

  // --- Auto grow textarea ---
  const autoGrow = useCallback(() => {
    const ta = textAreaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, []);
  useEffect(() => { autoGrow(); }, [prompt, autoGrow]);

  // --- Fetch credit ---
  const fetchInitialCredit = useCallback(async () => {
    if (!token) return;
    setErrorMessage("");
    try {
      const res = await api.get("/user/credits");
      if (res.data?.credit !== undefined) setRemainingCredit(res.data.credit);
      else setErrorMessage(res.data?.message || "Không lấy được thông tin credit.");
    } catch (err) {
      console.error("Fetch credit error:", err);
      setErrorMessage(err.response?.data?.message || "Lỗi kết nối API credit. Vui lòng thử lại.");
    }
  }, [token]);

  useEffect(() => {
    fetchInitialCredit();
    const handleCreditUpdate = () => fetchInitialCredit();
    window.addEventListener("creditUpdated", handleCreditUpdate);
    return () => window.removeEventListener("creditUpdated", handleCreditUpdate);
  }, [fetchInitialCredit]);

  // --- Helpers: validate & add images ---
  const addImageFiles = useCallback((incomingFiles) => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB/ảnh
    const validTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);

    const newFiles = [];
    const newPreviews = [];

    Array.from(incomingFiles || []).forEach((f) => {
      if (!validTypes.has(f.type)) {
        toast.error(`${f.name}: chỉ hỗ trợ JPG/PNG/WebP`);
        return;
      }
      if (f.size > MAX_SIZE) {
        toast.error(`${f.name}: >10MB`);
        return;
      }
      newFiles.push(f);
      newPreviews.push(URL.createObjectURL(f));
    });

    if (!newFiles.length) return;

    setFiles((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  }, []);

  const onInputFilesChange = useCallback((e) => {
    addImageFiles(e.target.files);
    e.target.value = ""; // cho phép chọn lại cùng file
  }, [addImageFiles]);

  const onPaste = useCallback((e) => {
    const items = e.clipboardData?.items || [];
    const bucket = [];
    for (const it of items) {
      if (it.type && it.type.startsWith("image/")) {
        const f = it.getAsFile();
        if (f) bucket.push(f);
      }
    }
    if (bucket.length) addImageFiles(bucket);
  }, [addImageFiles]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) addImageFiles(e.dataTransfer.files);
  }, [addImageFiles]);
  const onDragOver = useCallback((e) => e.preventDefault(), []);

  const removeImageAt = useCallback((idx) => {
    setPreviews((prev) => {
      const url = prev[idx];
      if (url) URL.revokeObjectURL(url);
      const cp = prev.slice();
      cp.splice(idx, 1);
      return cp;
    });
    setFiles((prev) => {
      const cp = prev.slice();
      cp.splice(idx, 1);
      return cp;
    });
  }, []);

  const removeAllImages = useCallback(() => {
    setPreviews((prev) => { prev.forEach((u) => URL.revokeObjectURL(u)); return []; });
    setFiles([]);
  }, []);

//   useEffect(() => () => { // cleanup on unmount
//     previews.forEach((u) => URL.revokeObjectURL(u));
//   }, [previews]);

  // --- Open URL in new tab ---
  const handleOpenVideo = useCallback((url) => {
    if (!url) return toast.error("Không mở được đường dẫn video!");
    toast.info("Đang mở URL kết quả trong tab mới.", { autoClose: 2500 });
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  // --- Submit: gửi MULTIPART tới /api/video/create-batch-upload ---
  const handleSubmit = useCallback(async () => {
    if (!token || !userId) {
      toast.error("Vui lòng đăng nhập để tạo video.", { autoClose: 1800 });
      navigate("/auth/login");
      return;
    }

    if (files.length === 0) {
      setErrorMessage("Hãy chọn hoặc dán ít nhất 1 ảnh.");
      return;
    }

    if (remainingCredit !== null && remainingCredit < cost) {
      setErrorMessage(`Không đủ credit. Cần ${cost} credit.`);
      toast.error(`Bạn không đủ credit! (Cần ${cost})`, { autoClose: 2500 });
      return;
    }

    // Chuẩn hoá titles từ prompt: mỗi dòng một tiêu đề (tuỳ chọn)
    const rawLines = (prompt || "").split("\n").map((s) => s.trim()).filter(Boolean);
    let titles = [];
    if (rawLines.length === 1 && files.length > 1) {
      // lặp tiêu đề 1 dòng cho mọi ảnh
      titles = Array(files.length).fill(rawLines[0]);
    } else if (rawLines.length === files.length) {
      titles = rawLines;
    } else if (rawLines.length === 0) {
      titles = []; // để backend tự xử lý (render không caption hoặc tự sinh)
    } else {
      toast.error(`Số dòng tiêu đề (${rawLines.length}) phải bằng số ảnh (${files.length}), hoặc chỉ 1 dòng để dùng chung.`);
      return;
    }

    const loadingId = Date.now();
    setVideoHistory((prev) => [
      ...prev,
      { id: loadingId, role: "assistant", type: "loading_msg", content: "Đang upload và render video. Vui lòng chờ..." },
    ]);
    setLoading(true);
    setErrorMessage("");

    const clearLoading = () => setVideoHistory((prev) => prev.filter((m) => m.id !== loadingId));

    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f)); // \uD83D\uDCCE tên field đúng theo backend
      fd.append("titles", JSON.stringify(titles)); // backend sẽ parse JSON chuỗi này
      fd.append("audioUrl", audioUrl || ""); // yêu cầu backend hiện tại

      const res = await api.post("/video/create-batch-upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearLoading();

      const videoUrl = res.data?.videoUrl;
      if (!videoUrl) throw new Error("API không trả về videoUrl.");

      setVideoHistory((prev) => [
        ...prev,
        { role: "user", type: "text", content: prompt || "(Không nhập tiêu đề)" },
        { role: "assistant", type: "video", content: videoUrl, prompt: prompt || "(Không có tiêu đề)" },
      ]);

      setRemainingCredit((prev) => (prev !== null ? prev - cost : prev));
      toast.success("✅ Video đã tạo xong!", { autoClose: 2500 });
      window.dispatchEvent(new Event("creditUpdated"));

      // reset input
      removeAllImages();
      setPrompt("");
      setAudioUrl("");
    } catch (err) {
      console.error("Lỗi tạo video:", err);
      clearLoading();
      const msg = err.response?.data?.error || err.message || "Lỗi không xác định";
      setVideoHistory((prev) => [...prev, { role: "assistant", type: "error", content: msg }]);
    } finally {
      setLoading(false);
    }
  }, [token, userId, files, prompt, audioUrl, remainingCredit, cost, navigate, removeAllImages]);

  // --- Render message ---
  const RenderMessageContent = useCallback(({ message }) => {
    if (message.role === "user") {
      return (
        <div className="flex items-start space-x-3 p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
          <UserIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
          <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
        </div>
      );
    }
    if (message.type === "video") {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-purple-200 w-full max-w-lg mx-auto">
          <p className="text-sm text-gray-700 mb-3 font-semibold">
            Yêu cầu: <span className="text-purple-700 font-normal italic">"{message.prompt}"</span>
          </p>
          <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-300 mb-4">
            <video key={message.content} controls autoPlay={false} muted className="w-full h-full object-cover" poster="https://via.placeholder.com/640x360?text=AI+Video+Result">
              <source src={message.content} type="video/mp4" />
              Trình duyệt của bạn không hỗ trợ thẻ video.
            </video>
          </div>
          <div className="flex justify-center">
            <button onClick={() => handleOpenVideo(message.content)} className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition duration-150 shadow-md hover:shadow-lg text-sm" title="Mở video kết quả trong tab mới">
              <ExternalLinkIcon className="h-4 w-4" />
              <span>Mở Video (URL Tab Mới)</span>
            </button>
          </div>
        </div>
      );
    }
    if (message.type === "error") {
      return (
        <div className="flex items-start space-x-3 p-3 bg-red-100 border border-red-400 text-red-800 rounded-lg">
          <XCircleIcon className="w-5 h-5 flex-shrink-0 mt-1" />
          <div>
            {/* <strong>Lỗi quan trọng:</strong> */}
            <p className="text-sm mt-1">{message.content}</p>
          </div>
        </div>
      );
    }
    if (message.type === "loading_msg") {
      return (
        <div className="flex items-start space-x-3 p-3 bg-yellow-100/80 border border-yellow-300 text-yellow-800 rounded-lg animate-pulse">
          <LoaderIcon className="w-5 h-5 flex-shrink-0 mt-1 animate-spin" />
          <div className="text-sm font-medium">{message.content}</div>
        </div>
      );
    }
    return <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>;
  }, [handleOpenVideo]);

  // ====== UI ======
  return (
    <main className="flex flex-col h-screen bg-gray-50 font-sans antialiased" onPaste={onPaste}>
      {!token ? (
        <section className="flex flex-1 items-center justify-center p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl text-center">
            <ApertureIcon className="text-purple-600 w-12 h-12 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-3">Tạo Video AI</h1>
            <p className="text-gray-500 mb-6">Vui lòng đăng nhập để bắt đầu tạo video.</p>
            <a href="/auth/login" className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition duration-200 shadow-md">Đăng nhập ngay</a>
          </div>
        </section>
      ) : (
        <>
          <section className="flex-1 overflow-hidden flex flex-col pt-4">
            {!started && (
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
                <VideoIcon className="text-purple-500 w-20 h-20 mb-6 bg-purple-100 p-4 rounded-full shadow-inner" />
                <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Tạo Video AI Sáng Tạo</h1>
                <p className="text-gray-500 text-lg">Dán/Chọn nhiều ảnh và (tuỳ chọn) nhập tiêu đề cùng Audio URL.</p>
                {errorMessage && (
                  <div className="mt-6 p-4 w-full bg-red-100 border border-red-400 text-red-800 rounded-lg flex items-center space-x-3">
                    <XCircleIcon className="text-red-500 w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{errorMessage}</p>
                  </div>
                )}
              </div>
            )}

            {/* Lịch sử */}
            <div className={`overflow-y-auto px-4 sm:px-8 pb-4 ${started ? "flex-grow" : "flex-grow-0"}`}>
              <div className="max-w-3xl mx-auto space-y-4">
                {videoHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[90%] md:max-w-[75%] lg:max-w-[60%] ${msg.role === "user" ? "self-end" : "self-start"}`}>
                      <RenderMessageContent message={msg} />
                    </div>
                  </div>
                ))}
                <div ref={listEndRef} className="pt-4" />
              </div>
            </div>
          </section>

          {/* Thanh nhập liệu */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-xl">
            <div className="max-w-3xl mx-auto space-y-3">
              {/* Preview ảnh */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {previews.map((src, idx) => (
                    <div key={idx} className="relative group">
                      <img src={src} alt={`preview-${idx}`} className="h-20 w-full object-cover rounded-lg border" />
                      <button type="button" onClick={() => removeImageAt(idx)} className="absolute -top-2 -right-2 bg-white shadow-md text-black rounded-full w-6 h-6 text-xs hidden group-hover:flex items-center justify-center" title="Bỏ ảnh">×</button>
                    </div>
                  ))}
                  {/* <button type="button" onClick={removeAllImages} className="col-span-full text-left text-sm text-black-600 hover:underline">Bỏ tất cả ảnh</button> */}
                  
                </div>
              )}

              <div onDrop={onDrop} onDragOver={onDragOver} className="flex items-end gap-3 rounded-2xl border border-gray-300 p-2 focus-within:ring-2 focus-within:ring-purple-500">
                {/* nút chọn nhiều ảnh */}
                <label className="shrink-0 px-3 py-2 rounded-xl border border-dashed border-purple-400 hover:bg-purple-50 cursor-pointer text-sm font-medium">
                  <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={onInputFilesChange} disabled={loading} />
                  + Ảnh (nhiều)
                </label>

                {/* textarea: nhập tiêu đề mỗi dòng */}
                <textarea ref={textAreaRef} value={prompt} onChange={(e) => setPrompt(e.target.value)} onInput={autoGrow} onPaste={onPaste} placeholder="Mỗi dòng 1 tiêu đề (tuỳ chọn). Bạn cũng có thể Ctrl+V ảnh hoặc kéo-thả vào đây." rows={1} className="flex-1 resize-none border-0 outline-none p-2 rounded-xl min-h-[40px] max-h-[240px] overflow-y-auto" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }} disabled={loading} />

                {/* nút gửi */}
                <button className={`flex items-center justify-center w-10 h-10 rounded-full transition ${loading || (files.length === 0) || remainingCredit === 0 || (remainingCredit !== null && remainingCredit < cost) ? "bg-gray-300 text-gray-100 cursor-not-allowed" : "bg-purple-600 text-white hover:bg-purple-700"}`} title="Gửi" onClick={handleSubmit} disabled={loading || files.length === 0 || remainingCredit === 0 || (remainingCredit !== null && remainingCredit < cost)}>
                  {loading ? <LoaderIcon className="h-5 w-5 animate-spin" /> : <SendIcon className="h-5 w-5" />}
                </button>
              </div>

              {/* Audio URL */}
              <div className="flex items-center gap-2">
                <input type="url" placeholder="Audio URL (tuỳ chọn)" value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} className="flex-1 border rounded-lg px-3 py-2" />
                <span className="text-xs text-gray-500">Backend hiện nhận <code>audioUrl</code></span>
              </div>

              <p className="text-xs text-gray-500 mt-1 text-right">
                Mỗi lần tạo video tốn <span className="font-semibold text-purple-600">{cost} credit</span>. Còn lại: <span className="font-bold text-purple-600">{remainingCredit !== null ? remainingCredit.toLocaleString() : "..."}</span>
              </p>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default VideoGeneration;

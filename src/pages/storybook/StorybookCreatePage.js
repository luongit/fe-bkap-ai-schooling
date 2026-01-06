import { useEffect, useMemo, useRef, useState } from "react";
import useStorybook from "../../hooks/useStorybook";
import ChatComposer from "../../components/ChatComposer";
import "./storybook-create.css";
import StorybookModal from "./StorybookModal";
import { useSearchParams } from "react-router-dom";

export default function StorybookCreatePage() {
  const [prompt, setPrompt] = useState("");
  const sb = useStorybook();

  // ✅ dùng state để UI rerender chắc chắn (ref dễ lỗi)
  const [started, setStarted] = useState(false);
const [openReader, setOpenReader] = useState(false);
const [isPlaying, setIsPlaying] = useState(false);

  // animation control
  const [flipDir, setFlipDir] = useState(null); // "next" | "prev" | null
  const [isFlipping, setIsFlipping] = useState(false);
const [searchParams] = useSearchParams();
const tab = searchParams.get("tab"); // "history" | null

const showHistory = tab === "history";

  // audio
  const audioRef = useRef(null);

  const page = sb.pages?.[sb.index];

  /* =====================
     CREATE + GENERATE
  ====================== */
  const handleCreateAndGenerate = async () => {
    if (!prompt.trim() || sb.loading) return;

    setStarted(true);

    const created = await sb.createStorybook(prompt);
    await sb.generateStorybook(created.id);
  };

  /* =====================
     PROGRESS (GIỐNG GEMINI)
  ====================== */
  const progressUI = useMemo(() => {
    if (!started) return null;

    let label = "Đang khởi tạo storybook…";
    let percent = 10;

    if (sb.status === "GENERATING") {
      if (sb.pages.length === 0) {
        label = "✍️ AI đang viết nội dung truyện…";
        percent = 35;
      } else if (!sb.pages[0]?.imageUrl) {
        label = "🎨 AI đang vẽ tranh minh họa…";
        percent = 65;
      } else if (!sb.pages[0]?.audioUrl) {
        label = "🔊 AI đang tạo giọng đọc…";
        percent = 85;
      }
    }

    if (sb.status === "COMPLETED") {
      label = "📖 Hoàn thành! Bắt đầu đọc truyện";
      percent = 100;
    }

    return (
      <div className="sb-progress">
        <div className="sb-progress-label">{label}</div>
        <div className="sb-progress-bar">
          <div className="sb-progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>
    );
  }, [started, sb.status, sb.pages]);

  /* =====================
     AUTO PLAY AUDIO WHEN PAGE CHANGES
  ====================== */
  useEffect(() => {
  if (!page?.audioUrl || !audioRef.current) return;

  const audio = audioRef.current;

  const play = async () => {
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  play();

  audio.onended = () => setIsPlaying(false);

  return () => {
    audio.onended = null;
  };
}, [page?.audioUrl, sb.index]);


  /* =====================
     FLIP HELPERS
  ====================== */
  const flipTo = (dir) => {
    if (!page) return;
    if (isFlipping) return;

    // chặn lật vượt biên
    if (dir === "prev" && sb.index === 0) return;
    if (dir === "next" && sb.index === sb.pages.length - 1) return;

    setIsFlipping(true);
    setFlipDir(dir);

    // thời gian = đúng với CSS animation
    window.setTimeout(() => {
      if (dir === "prev") sb.prevPage();
      else sb.nextPage();

      // reset
      setFlipDir(null);
      setIsFlipping(false);
    }, 520);
  };

  const onBookClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) flipTo("prev");
    else flipTo("next");
  };
const exportPdf = async () => {
  if (!sb.storybookId) return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `/api/storybooks/${sb.storybookId}/export/pdf`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error("Export PDF failed");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    window.open(url, "_blank");
  } catch (err) {
    console.error(err);
    alert("Không thể xuất PDF (token hết hạn?)");
  }
};


  /* =====================
     RENDER
  ====================== */
  return (
  <>
    <div className="sb-root">
      {/* ===== LEFT SIDEBAR (GIỐNG GEMINI) ===== */}
      <aside className="sb-sidebar">
        <div className="sb-side-header">
          <div className="sb-side-title">Storybook</div>
          <div
            className={`sb-status-pill ${
              sb.status ? sb.status.toLowerCase() : ""
            }`}
          >
            {sb.status || "IDLE"}
          </div>
        </div>

        <div className="sb-side-box">
          <div className="sb-side-label">Ý tưởng</div>
          <div className="sb-prompt-preview">
            {prompt?.trim() ? prompt : "Chưa nhập ý tưởng…"}
          </div>
        </div>

        {progressUI}

        <div className="sb-side-box">
          <div className="sb-side-label">Điều khiển</div>
          <div className="sb-side-actions">
            <button
              className="sb-side-btn"
              onClick={() => flipTo("prev")}
              disabled={!page || sb.index === 0 || isFlipping}
              title="Trang trước"
            >
              ◀
            </button>

            <div className="sb-side-counter">
              {page ? (
                <>
                  <div className="sb-counter-main">
                    {sb.index + 1}/{sb.pages.length}
                  </div>
                  <div className="sb-counter-sub">
                    Click trái/phải để lật
                  </div>
                </>
              ) : (
                <div className="sb-counter-sub">Chưa có trang</div>
              )}
            </div>

            <button
              className="sb-side-btn"
              onClick={() => flipTo("next")}
              disabled={
                !page || sb.index === sb.pages.length - 1 || isFlipping
              }
              title="Trang sau"
            >
              ▶
            </button>
          </div>
        </div>

        <div className="sb-side-foot">
          <div className="sb-foot-hint">
            Tip: Hover lên trang để thấy hiệu ứng “lật nhẹ”.
          </div>
        </div>
      </aside>

      {/* ===== MAIN READER ===== */}
      <main className="sb-main">
        {/* AUDIO BAR TOP */}
        {page && (
  <div className="sb-reader-top">
    {/* LEFT */}
    <div className="sb-rt-left">
      <span className="sb-rt-title">
        {sb.storybook?.title || "Storybook"}
      </span>
    </div>

    {/* CENTER */}
    <div className="sb-rt-center">
      <button
        className="icon-btn"
        onClick={() => flipTo("prev")}
        disabled={sb.index === 0}
        title="Trang trước"
      >
        ⟨
      </button>

      <span className="sb-rt-page">
        {sb.index + 1}/{sb.pages.length}
      </span>

      <button
        className="icon-btn"
        onClick={() => flipTo("next")}
        disabled={sb.index === sb.pages.length - 1}
        title="Trang sau"
      >
        ⟩
      </button>
    </div>

    {/* RIGHT */}
    <div className="sb-rt-right">
      {/* PLAY / PAUSE */}
      <button
        className="icon-btn"
        title={isPlaying ? "Tạm dừng" : "Phát"}
        onClick={() => {
          if (!audioRef.current) return;

          if (audioRef.current.paused) {
            audioRef.current.play();
            setIsPlaying(true);
          } else {
            audioRef.current.pause();
            setIsPlaying(false);
          }
        }}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>

      {/* DOWNLOAD PDF */}
     <button
  className="icon-btn"
  title="Tải PDF"
  onClick={exportPdf}
>
  ⬇
</button>


      {/* FULLSCREEN */}
      <button
  className="icon-btn"
  title="Toàn màn hình"
  onClick={() => {
    // ⛔ DỪNG AUDIO MAIN TRƯỚC
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsPlaying(false);
    setOpenReader(true);
  }}
>
  ⛶
</button>

    </div>

    {/* AUDIO (ẨN UI) */}
    <audio
      ref={audioRef}
      key={page.audioUrl}
      src={page.audioUrl}
      preload="auto"
    />
  </div>
)}



        {/* BOOK */}
        {page && (
          <div className="sb-stage">
            <div
              className={[
                "book",
                flipDir ? `flip-${flipDir}` : "",
                isFlipping ? "is-flipping" : "",
              ].join(" ")}
              role="button"
              tabIndex={0}
              onClick={onBookClick}
              onDoubleClick={() => setOpenReader(true)} // ✅ MỞ MODAL
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") flipTo("prev");
                if (e.key === "ArrowRight") flipTo("next");
              }}
            >
              {/* LEFT PAGE */}
              <div className="page left">
                <div className="page-inner page-image">
                  <img src={page.imageUrl} alt="" />
                </div>
                <div className="page-num left-num">
                  {sb.index * 2 + 1}
                </div>
              </div>

              <div className="spine" />

              {/* RIGHT PAGE */}
              <div className="page right">
                <div className="page-inner page-text">
                  <div className="dropcap-wrap">
                    {page.textContent}
                  </div>
                </div>
                <div className="page-num right-num">
                  {sb.index * 2 + 2}
                </div>
              </div>

              <div className="hover-zone left-zone" />
              <div className="hover-zone right-zone" />
            </div>
          </div>
        )}

        {!page && (
          <div className="sb-empty">
            <div className="sb-empty-title">
              Tạo Storybook để bắt đầu
            </div>
            <div className="sb-empty-sub">
              Nhập ý tưởng ở thanh chat bên dưới, AI sẽ viết truyện + vẽ
              ảnh + tạo giọng đọc.
            </div>
          </div>
        )}
      </main>

      {!started && (
        <div className="sb-chat">
          <ChatComposer
            value={prompt}
            onChange={setPrompt}
            onSubmit={handleCreateAndGenerate}
            loading={sb.loading}
            disabled={sb.loading}
            placeholder="Nhập ý tưởng truyện tranh cho AI..."
          />
          <div className="sb-chat-hint">
            Enter để gửi • Shift+Enter xuống dòng
          </div>
        </div>
      )}
    </div>

  {openReader && (
  <StorybookModal
    sb={sb}
    onClose={() => setOpenReader(false)}
  />
)}


  </>
  
);

}

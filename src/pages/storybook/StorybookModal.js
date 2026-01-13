import { useEffect, useRef, useState } from "react";
import "./storybook-modal.css";

export default function StorybookModal({ sb, onClose }) {
  /* =====================
     HOOKS – LUÔN Ở TRÊN
  ====================== */
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  /* =====================
     SAFE DATA
  ====================== */
  const pages = sb?.pages || [];
  const index = sb?.index ?? 0;
  const page = pages[index] || pages[0];

  /* =====================
     LOCK BODY SCROLL
  ====================== */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  /* =====================
     AUDIO AUTOPLAY
  ====================== */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !page?.audioUrl) return;

    audio.pause();
    audio.currentTime = 0;

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));

    return () => {
      audio.pause();
    };
  }, [page?.audioUrl]);

  /* =====================
     GUARD SAU HOOKS
  ====================== */
  if (!sb || pages.length === 0 || !page) {
    return null;
  }

  /* =====================
     ACTIONS
  ====================== */
  const closeModal = () => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
    onClose();
  };

  const goPrev = (e) => {
    e.stopPropagation();
    if (index > 0) sb.prevPage();
  };

  const goNext = (e) => {
    e.stopPropagation();
    if (index < pages.length - 1) sb.nextPage();
  };

  /* =====================
     RENDER
  ====================== */
  return (
    <div className="sb-backdrop" onClick={closeModal}>
      <div
        className="sb-reader"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP BAR */}
        <div className="sb-reader-top">
          <div className="sb-rt-left">
            <button className="icon-btn" onClick={closeModal}>✕</button>
            <span className="sb-rt-title">
              {sb.storybook?.title || "Storybook"}
            </span>
          </div>

          <div className="sb-rt-center">
            <button
              className="icon-btn"
              onClick={goPrev}
              disabled={index === 0}
            >
              ⟨
            </button>

            <span className="sb-rt-page">
              {index + 1}/{pages.length}
            </span>

            <button
              className="icon-btn"
              onClick={goNext}
              disabled={index === pages.length - 1}
            >
              ⟩
            </button>
          </div>

          <div className="sb-rt-right">
            <button
              className="icon-btn"
              onClick={() => {
                const a = audioRef.current;
                if (!a) return;

                if (a.paused) {
                  a.play().catch(() => {});
                  setIsPlaying(true);
                } else {
                  a.pause();
                  setIsPlaying(false);
                }
              }}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>

            <button
              className="icon-btn"
              onClick={() =>
                window.open(`/api/storybooks/${sb.storybookId}/export-pdf`)
              }
            >
              ⬇
            </button>
          </div>
        </div>

        {/* BOOK */}
        <div className="sb-reader-shell">
          <div className="sb-modal-book">
            <div className="page left">
              <div className="page-inner page-image">
                <img src={page.imageUrl} alt="" />
              </div>
            </div>

            <div className="spine" />

            <div className="page right">
              <div className="page-inner page-text">
                <div className="dropcap-wrap">
                  {page.textContent}
                </div>
              </div>
            </div>

            <div className="hover-zone left-zone" onClick={goPrev} />
            <div className="hover-zone right-zone" onClick={goNext} />
          </div>
        </div>

        <audio ref={audioRef} src={page.audioUrl} preload="auto" />
      </div>
    </div>
  );
}

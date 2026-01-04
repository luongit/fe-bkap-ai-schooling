import { useEffect, useRef, useState } from "react";
import "./storybook-modal.css";

export default function StorybookModal({ sb, onClose }) {
  const page = sb.pages[sb.index];
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!page?.audioUrl || !audioRef.current) return;

    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {});
  }, [page?.audioUrl, sb.index]);

  if (!page) return null;

  const closeModal = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    onClose();
  };

  return (
    <div className="sb-backdrop" onClick={closeModal}>
      {/* ❗ chặn click lan vào backdrop */}
      <div
        className="sb-reader"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP BAR – REUSE */}
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
              onClick={sb.prevPage}
              disabled={sb.index === 0}
            >⟨</button>

            <span className="sb-rt-page">
              {sb.index + 1}/{sb.pages.length}
            </span>

            <button
              className="icon-btn"
              onClick={sb.nextPage}
              disabled={sb.index === sb.pages.length - 1}
            >⟩</button>
          </div>

          <div className="sb-rt-right">
            <button
              className="icon-btn"
              onClick={() => {
                const a = audioRef.current;
                if (!a) return;
                a.paused ? a.play() : a.pause();
                setIsPlaying(!a.paused);
              }}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>

            <button
              className="icon-btn"
              onClick={() =>
                window.open(`/api/storybooks/${sb.storybookId}/export-pdf`)
              }
            >⬇</button>
          </div>
        </div>

        {/* BOOK */}
        <div
          className="sb-modal-book"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            e.clientX - r.left < r.width / 2
              ? sb.prevPage()
              : sb.nextPage();
          }}
        >
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
        </div>

        <audio ref={audioRef} src={page.audioUrl} preload="auto" />
      </div>
    </div>
  );
}

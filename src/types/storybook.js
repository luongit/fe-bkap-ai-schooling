// src/hooks/useStorybook.js
import { useEffect, useRef, useState } from "react";
import storybookService from "../services/storybookService";

/**
 * useStorybook
 * - Quản lý state storybook
 * - Generate async + polling
 * - Load pages
 * - Export PDF
 *
 * ==> PORT TỪ FILE HTML TEST
 */
export default function useStorybook() {
  // ===== STATE (tương đương biến global trong HTML) =====
  const [storybookId, setStorybookId] = useState(null);
  const [status, setStatus] = useState(null);
  const [pages, setPages] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== REF để giữ timer polling =====
  const pollTimerRef = useRef(null);

  // ================= CREATE DRAFT =================
  const createStorybook = async (prompt) => {
    try {
      if (!prompt?.trim()) {
        throw new Error("Prompt is required");
      }

      setLoading(true);
      setError(null);

      const sb = await storybookService.createDraft({
        originalPrompt: prompt,
        textModel: "gemini-2.5-flash",
        imageModel: "gemini-2.5-flash-image",
        ttsModel: "gemini-2.5-flash-preview-tts",
      });

      setStorybookId(sb.id);
      setStatus(sb.status);
      setPages([]);
      setIndex(0);
    } catch (err) {
      console.error(err);
      setError(err.message || "Create storybook failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= GENERATE =================
  const generateStorybook = async () => {
    if (!storybookId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await storybookService.generate(storybookId);
      setStatus(res.status);

      startPolling();
    } catch (err) {
      console.error(err);
      setError(err.message || "Generate failed");
      setLoading(false);
    }
  };

  // ================= POLLING STATUS =================
  const startPolling = () => {
    stopPolling();

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await storybookService.getStatus(storybookId);
        setStatus(res.status);

        if (res.status === "COMPLETED") {
          stopPolling();
          await loadPages();
          setLoading(false);
        }

        if (res.status === "FAILED") {
          stopPolling();
          setLoading(false);
          setError("Generate failed");
        }
      } catch (err) {
        console.error(err);
        stopPolling();
        setLoading(false);
        setError("Polling error");
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  // ================= LOAD PAGES =================
  const loadPages = async () => {
    if (!storybookId) return;

    try {
      const data = await storybookService.getPages(storybookId);
      setPages(data || []);
      setIndex(0);
    } catch (err) {
      console.error(err);
      setError("Load pages failed");
    }
  };

  // ================= EXPORT PDF =================
  const exportPdf = async () => {
    if (!storybookId) return;

    try {
      const url = await storybookService.exportPdf(storybookId);
      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      setError("Export PDF failed");
    }
  };

  // ================= CLEANUP =================
  useEffect(() => {
    return () => stopPolling();
  }, []);

  // ================= NAVIGATION =================
  const nextPage = () => {
    setIndex((i) => Math.min(i + 1, pages.length - 1));
  };

  const prevPage = () => {
    setIndex((i) => Math.max(i - 1, 0));
  };

  return {
    // state
    storybookId,
    status,
    pages,
    index,
    loading,
    error,

    // actions
    createStorybook,
    generateStorybook,
    exportPdf,
    nextPage,
    prevPage,
    setIndex,
  };
}

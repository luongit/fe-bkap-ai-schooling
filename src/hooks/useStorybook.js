import { useEffect, useRef, useState } from "react";
import storybookService from "../services/storybookService";

export default function useStorybook() {
  const [storybookId, setStorybookId] = useState(null);
  const [status, setStatus] = useState(null);
  const [pages, setPages] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pollRef = useRef(null);

  // ================= CREATE =================
  const createStorybook = async (prompt) => {
    if (!prompt?.trim()) throw new Error("Prompt required");

    setLoading(true);
    setError(null);

    try {
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

      return sb; // ⭐ QUAN TRỌNG
    } catch (e) {
      setError("Tạo storybook thất bại");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // ================= GENERATE =================
  const generateStorybook = async (id) => {
  const targetId = id ?? storybookId;
  if (!targetId) return;

  setLoading(true);
  setError(null);

  try {
    await storybookService.generate(targetId);
    setStatus("GENERATING");
    startPolling(targetId);
  } catch (e) {
    setError("Generate thất bại");
    setLoading(false);
  }
};

const startPolling = (id) => {
  stopPolling();

  pollRef.current = setInterval(async () => {
    try {
      const res = await storybookService.getStatus(id);
      setStatus(res.status);

      if (res.status === "COMPLETED") {
        stopPolling();
        await loadPages(id); // 🔥 CHỈ LOAD PAGE Ở ĐÂY
        setLoading(false);
      }

      if (res.status === "FAILED") {
        stopPolling();
        setError("Generate thất bại");
        setLoading(false);
      }
    } catch {
      stopPolling();
      setError("Polling lỗi");
      setLoading(false);
    }
  }, 3000);
};


  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  // ================= LOAD PAGES =================
  const loadPages = async (id) => {
    try {
      const data = await storybookService.getPages(id);
      setPages(data || []);
      setIndex(0);
    } catch {
      setError("Load trang lỗi");
    }
  };

  // ================= CLEANUP =================
  useEffect(() => {
    return () => stopPolling();
  }, []);

  return {
    storybookId,
    status,
    pages,
    index,
    loading,
    error,
    createStorybook,
    generateStorybook,
    nextPage: () => setIndex((i) => Math.min(i + 1, pages.length - 1)),
    prevPage: () => setIndex((i) => Math.max(i - 1, 0)),
  };
}

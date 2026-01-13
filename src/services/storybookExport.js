import { API_BASE_URL } from "./api";

/**
 * Export storybook PDF (Gemini-style)
 */
export async function exportStorybookPdf(storybookId) {
  if (!storybookId) {
    console.warn("[PDF] Missing storybookId");
    return;
  }

  const token = localStorage.getItem("token");

  console.log("[PDF] Export start:", storybookId);

  const res = await fetch(
    `${API_BASE_URL}/storybooks/${storybookId}/export/pdf`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const t = await res.text();
    throw new Error("Export failed: " + t);
  }

  const blob = await res.blob();

  const url = window.URL.createObjectURL(blob);

  triggerDownload(url, `storybook-${storybookId}.pdf`);
}

/* ===============================
   PRIVATE HELPERS
================================ */
function triggerDownload(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  window.URL.revokeObjectURL(url);

  console.log("[PDF] Download triggered:", filename);
}

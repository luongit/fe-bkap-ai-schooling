import { useEffect, useState } from "react";

export default function StorybookHistoryPanel({ onSelect }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("/api/storybooks/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setList(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("LOAD HISTORY ERROR:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="sb-history-loading">Đang tải lịch sử…</div>;
  }

  if (list.length === 0) {
    return <div className="sb-history-empty">Chưa có storybook nào</div>;
  }

  return (
    <div className="sb-history-list">
      {list.map((sb) => (
        <div
          key={sb.id}
          className="sb-history-item"
          onClick={() => onSelect(sb)}
        >
          <div className="sb-history-title">
            {sb.title || "Storybook chưa đặt tên"}
          </div>

          <div className={`sb-history-status ${sb.status?.toLowerCase()}`}>
            {sb.status}
          </div>

          <div className="sb-history-prompt">
            {sb.originalPrompt}
          </div>
        </div>
      ))}
    </div>
  );
}

import { useEffect, useState } from "react";

export default function StorybookHistoryPage() {
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
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }
    return res.json();
  })
  .then(data => {
    setList(data);
    setLoading(false);
  })
  .catch(err => {
    console.error("API ERROR:", err);
    setLoading(false);
  });

  }, []);

  if (loading) {
    return <div style={{ padding: 24 }}>Loading storybooks...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>📚 Lịch sử Storybook</h2>

      {list.length === 0 && (
        <div>Chưa có storybook nào</div>
      )}

      <ul style={{ marginTop: 16 }}>
        {list.map(sb => (
          <li
            key={sb.id}
            style={{
              marginBottom: 12,
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 8,
            }}
          >
            <div><b>ID:</b> {sb.id}</div>
            <div><b>Title:</b> {sb.title || "(chưa có)"}</div>
            <div><b>Status:</b> {sb.status}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {sb.originalPrompt}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

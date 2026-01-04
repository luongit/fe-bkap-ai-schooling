export default function ChatComposer({
  value,
  onChange,
  onSubmit,
  loading,
  disabled,
  placeholder = "Nhập ý tưởng truyện..."
}) {
  return (
    <div className="composer grok-style">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
      />

      <button
        className="send-btn"
        onClick={onSubmit}
        disabled={loading || disabled}
        title="Gửi"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 19V5m7 7l-7-7-7 7"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
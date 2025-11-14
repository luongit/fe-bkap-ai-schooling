import React, { useEffect, useRef, useState } from "react";

export default function VoiceChatGPT5() {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [voice, setVoice] = useState("alloy");
  const [sceneCode, setSceneCode] = useState("cafe");
  const [difficulty, setDifficulty] = useState("standard");
  const [studentId] = useState(1);
  const [log, setLog] = useState([]);
  const recognitionRef = useRef(null);

  const API_TURN = "http://localhost:8080/api/voice-hero/turn";
  const API_GREET = "http://localhost:8080/api/voice-hero/greet";

  // ==========================
  // Greet khi load trang
  // ==========================
  useEffect(() => {
    const greet = async () => {
      try {
        const res = await fetch(API_GREET, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            sceneCode,
            difficulty,
            voice,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Greet HTTP error:", res.status, text);
          setLog((l) => [...l, "❌ Greet lỗi: " + text]);
          return;
        }

        const data = await res.json();

        if (data.audioBase64) {
          setAudioUrl("data:audio/mpeg;base64," + data.audioBase64);
        }

        if (data.replyVietnamese) {
          setLog((l) => [...l, "🤖 BKAP AI (VI): " + data.replyVietnamese]);
        } else if (data.replyText) {
          setLog((l) => [...l, "🤖 BKAP AI: " + data.replyText]);
        }
      } catch (err) {
        console.error("Greeting error:", err);
        setLog((l) => [...l, "❌ Greeting error: " + err.message]);
      }
    };

    greet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================
  // SpeechRecognition setup
  // ==========================
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }

    const rec = new SR();

    rec.lang = "vi-VN";          // Ưu tiên tiếng Việt, vẫn nghe được EN
    rec.maxAlternatives = 5;
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => {
      setListening(true);
      setLog((l) => [...l, "🎧 Đang nghe bạn..."]);
    };

    rec.onerror = (e) => {
      setLog((l) => [...l, `⚠️ Lỗi nhận diện giọng nói: ${e.error}`]);
      setListening(false);
    };

    rec.onend = () => setListening(false);

    rec.onresult = async (e) => {
      const text = e.results[0][0].transcript.trim();
      if (!text) return;

      setLog((l) => [...l, `🗣️ Bạn nói: ${text}`]);
      stopListening();
      await sendToGPT(text);
    };

    recognitionRef.current = rec;
  }, [voice, sceneCode, difficulty, studentId]);

  const startListening = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognitionRef.current?.start();
    } catch (err) {
      console.error(err);
      setLog((l) => [...l, "❌ Không mở được mic: " + err.message]);
    }
  };

  const stopListening = () => recognitionRef.current?.stop();

  // ==========================
  // Gửi turn lên BE
  // ==========================
  const sendToGPT = async (message) => {
    try {
      setLog((l) => [...l, "📤 Gửi lên BKAP AI..."]);

      const res = await fetch(API_TURN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          sceneCode,
          difficulty,
          message,
          voice,
        }),
      });

      if (!res.ok) {
        const text = await res.text(); // 🔥 xem chính xác BE trả gì
        console.error("TURN HTTP error:", res.status, text);
        setLog((l) => [...l, "❌ Lỗi từ server: " + text]);
        return;
      }

      const data = await res.json();

      if (data.audioBase64) {
        setAudioUrl("data:audio/mpeg;base64," + data.audioBase64);
      }

      const reply =
        data.replyVietnamese ||
        data.replyText ||
        "(Không nhận được phản hồi nội dung)";

      setLog((l) => [...l, "🤖 BKAP AI: " + reply]);
    } catch (err) {
      console.error(err);
      setLog((l) => [...l, "❌ Lỗi gửi GPT: " + err.message]);
    }
  };

  if (!supported)
    return <p>⚠ Trình duyệt không hỗ trợ Web Speech API</p>;

  return (
    <div style={styles.container}>
      <h2>🎧 BKAP VoiceHero GPT-5</h2>

      <div style={{ marginBottom: 10 }}>
        <label>🎙 Giọng:</label>
        <select
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
          style={styles.select}
        >
          <option value="alloy">Alloy</option>
        </select>

        <label style={{ marginLeft: 15 }}>🎯 Scene:</label>
        <select
          value={sceneCode}
          onChange={(e) => setSceneCode(e.target.value)}
          style={styles.select}
        >
          {/* Chỉ chọn những scene CÓ trong JSON */}
          <option value="cafe">At the Café</option>
          <option value="shopping">Shopping for Clothes</option>
          <option value="self-intro">Self Introduction</option>
          <option value="directions">Asking for Directions</option>
          <option value="small-talk">Small Talk & Weather</option>
        </select>

        <label style={{ marginLeft: 15 }}>📌 Difficulty:</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          style={styles.select}
        >
          <option value="easy">Easy</option>
          <option value="standard">Standard</option>
          <option value="challenging">Challenging</option>
        </select>
      </div>

      {!listening ? (
        <button style={styles.button} onClick={startListening}>
          🎤 Bắt đầu nói
        </button>
      ) : (
        <p>🎙️ Đang nghe bạn...</p>
      )}

      {audioUrl && (
        <audio
          src={audioUrl}
          autoPlay
          controls
          onPlay={stopListening}
          onEnded={() => {
            setAudioUrl(null);
            setTimeout(() => startListening(), 900);
          }}
        />
      )}

      <div style={styles.console}>
        <b>🪄 Console:</b>
        <ul>
          {log.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 24,
    maxWidth: 650,
    margin: "0 auto",
    textAlign: "center",
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  select: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid #ccc",
    marginLeft: 6,
  },
  button: {
    marginTop: 10,
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 18px",
    cursor: "pointer",
    fontWeight: 600,
  },
  console: {
    marginTop: 20,
    textAlign: "left",
    fontSize: 14,
    background: "#f7f7f7",
    borderRadius: 8,
    padding: 10,
  },
};

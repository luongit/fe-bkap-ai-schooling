// src/pages/Home.jsx
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/atom-one-dark.css';


import TopIntro from '../components/TopIntro';
import { getLangIcon, extractText, speakText } from '../services/handle/Function';
// Tuỳ chọn: nếu muốn giữ lưới an toàn FE cho LaTeX (dù BE đã chuẩn), bật dòng dưới:
// import { transformLatexDelimiters } from '../services/latex';

const API_URL = process.env.REACT_APP_API_URL || '';

function Home() {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('chatHistory')) || [];
    } catch {
      return [];
    }
  });

  const [sessionId, setSessionId] = useState(() => sessionStorage.getItem('sessionId') || null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const started = chatHistory.length > 0;
  const assistantMessageRef = useRef({ role: 'assistant', content: '' });

  const controllerRef = useRef(null);
  const listEndRef = useRef(null);

  // Persist history 1 lần khi thay đổi (tránh sessionStorage mỗi chunk)
  useEffect(() => {
    sessionStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Auto scroll khi có message mới
  useEffect(() => {
    if (listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [chatHistory, loading]);

  //Lịch sử chat
  const loadSession = useCallback(async (sid) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/conversations/${sid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Không tải được lịch sử");

      const data = await res.json();
      const mapped = data
        .flatMap(log => [
          log.message && { role: "user", content: log.message },
          log.response && { role: "assistant", content: log.response }
        ])
        .filter(m => m && m.content !== "[Session started]");


      // loại null
      setChatHistory(mapped);
      setSessionId(sid);
      sessionStorage.setItem("sessionId", sid);
      sessionStorage.setItem("chatHistory", JSON.stringify(mapped));
    } catch (err) {
      console.error("Load session error:", err);
    }
  }, [API_URL]);
  useEffect(() => {
    const handler = (e) => {
      const sid = e.detail;
      loadSession(sid);
    };

    window.addEventListener("selectSession", handler);
    return () => {
      window.removeEventListener("selectSession", handler);
    };
  }, [loadSession]);

    // Reset khi tạo cuộc trò chuyện mới
  useEffect(() => {
    const handleNewChat = () => {
      sessionStorage.removeItem("chatHistory");
      sessionStorage.removeItem("sessionId");
      setChatHistory([]);
      setSessionId(null);
      setInput('');
    };

    window.addEventListener("newChat", handleNewChat);
    return () => {
      window.removeEventListener("newChat", handleNewChat);
    };
  }, []);

  // Helpers
  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }, []);

 const handleClear = useCallback(async () => {
  if (!window.confirm('Bạn có chắc muốn xóa toàn bộ cuộc trò chuyện này?')) return;

  const sid = sessionStorage.getItem('sessionId');
  const token = localStorage.getItem("token");
  if (!sid || !token) {
    // Không có session thì chỉ xoá local
    sessionStorage.removeItem('chatHistory');
    setChatHistory([]);
    setSessionId(null);
    return;
  }

  try {
    const res = await fetch(`${API_URL}/conversations/${sid}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Xóa session thất bại");

    // Sau khi xoá BE thành công → xoá local luôn
    sessionStorage.removeItem('chatHistory');
    sessionStorage.removeItem('sessionId');
    setChatHistory([]);
    setSessionId(null);
    setInput('');

    // Gửi sự kiện để sidebar (nếu có) reload lại danh sách session
    window.dispatchEvent(new Event("sessionUpdated"));
  } catch (err) {
    console.error("Delete session error:", err);
    alert("Không xoá được cuộc trò chuyện!");
  }
}, [API_URL]);


  // Math-safe check nhẹ để giảm vỡ công thức (BE đã chuẩn, FE chỉ là lưới an toàn)
  const isMathBalanced = (s) => {
    const dollars = (s.match(/(?<!\\)\$/g) || []).length;
    return dollars % 2 === 0;
  };

  // Throttle render khi stream (batch mỗi ~80ms)
  const scheduleRef = useRef({ timer: null, pending: '' });

  const pushAssistantChunk = useCallback((baseHistory, assistantMsgRef, chunk) => {
    scheduleRef.current.pending += chunk;
    if (scheduleRef.current.timer) return;

    scheduleRef.current.timer = setTimeout(() => {
      const take = scheduleRef.current.pending;
      scheduleRef.current.pending = '';
      scheduleRef.current.timer = null;

      if (!take) return;

      // FE guard: chỉ append khi tương đối an toàn cho KaTeX
      if (isMathBalanced(take) || /\n|\.\s$/.test(take)) {
        assistantMsgRef.current.content += take;
        const newHistory = [
          ...baseHistory.slice(0, -1),
          baseHistory[baseHistory.length - 1],
          { ...assistantMsgRef.current }
        ];
        setChatHistory(newHistory);
      } else {
        // nếu chưa “an toàn”, dồn thêm và chờ batch tiếp theo
        scheduleRef.current.pending = take + scheduleRef.current.pending;
      }
    }, 80);
  }, []);

  const handleSubmit = useCallback(async () => {
    const question = input.trim();
    if (!question || loading) return;

    const updatedHistory = [...chatHistory, { role: 'user', content: question }];
    setChatHistory(updatedHistory);
    setInput('');
    setLoading(true);

    // Chuẩn bị stream
    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    try {
      const token = localStorage.getItem('token');

      // 🔹 Nếu chưa có sessionId thì gọi API để tạo mới
      let sessionToUse = sessionId;
      if (!sessionToUse) {
        const startRes = await fetch(`${API_URL}/conversations/start`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const startData = await startRes.json();
        sessionToUse = startData.sessionId;
        setSessionId(sessionToUse);
        sessionStorage.setItem('sessionId', sessionToUse);
      }

      //  Gọi API stream, lần này truyền đúng sessionId
      const res = await fetch(`${API_URL}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/x-ndjson',
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store',
        body: JSON.stringify({ messages: updatedHistory, session_id: sessionToUse }),
        signal
      });


      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      assistantMessageRef.current = { role: 'assistant', content: '' };

      let bufferTail = ''; // phòng khi có phần dư chưa “an toàn”

      // Đọc NDJSON
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n').filter(Boolean);

        for (const line of lines) {
          let json;
          try {
            json = JSON.parse(line);
          } catch {
            // có thể là dòng rác do network; gom lại để lần sau parse
            bufferTail += line;
            continue;
          }

          if (json.type === 'error') {
            console.error('AI error:', json.message);
            continue;
          }
          if (json.type === 'done') {
            // flush phần còn lại
            if (scheduleRef.current.timer) {
              clearTimeout(scheduleRef.current.timer);
              scheduleRef.current.timer = null;
            }
            const rest = scheduleRef.current.pending;
            scheduleRef.current.pending = '';

            assistantMessageRef.current.content += rest;
            const finalHistory = [
              ...updatedHistory.slice(0, -1),
              updatedHistory[updatedHistory.length - 1],
              { ...assistantMessageRef.current }
            ];
            setChatHistory(finalHistory);
            break;
          }

          if (json.type === 'chunk') {
            // Tuỳ chọn: nếu bạn bật transform FE thì xử lý ở đây
            // const safeContent = transformLatexDelimiters?.(json.content ?? '') ?? (json.content ?? '');
            const safeContent = json.content ?? '';
            // Gộp + batch update
            pushAssistantChunk(updatedHistory, assistantMessageRef, safeContent);
          }
        } window.dispatchEvent(new Event("sessionUpdated"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (scheduleRef.current.timer) {
        clearTimeout(scheduleRef.current.timer);
        scheduleRef.current.timer = null;
        scheduleRef.current.pending = '';
      }
      setLoading(false);
    }
  }, [API_URL, chatHistory, input, loading, pushAssistantChunk]);


  // Markdown renderer (đặt remarkMath TRƯỚC remarkGfm)
  const Markdown = useMemo(() => {
    return function MD({ children }) {
      // Nếu muốn luôn chạy lưới an toàn FE cho LaTeX, bật transform dưới:
      // const text = transformLatexDelimiters(String(children ?? ''));
      const text = String(children ?? '');
      return (
        <ReactMarkdown
          children={text}
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[
            rehypeHighlight,
            [rehypeKatex, { throwOnError: false, strict: false }]
          ]}
          components={{
            code({ inline, className, children: codeChildren, ...props }) {
              const isBlock = !inline && typeof codeChildren === 'object' && String(codeChildren).includes('\n');
              const lang = className || '';
              return isBlock ? (
                <div className="code-block-wrapper">
                  <div className="code-header">
                    <span className="code-lang">{getLangIcon(lang)}</span>
                    <button className="copy-button" onClick={() => handleCopy(extractText(codeChildren))}>
                      {copied ? 'Đã sao chép' : 'Sao chép'}
                    </button>
                  </div>
                  <pre className="code-block">
                    <code className={lang} {...props}>{codeChildren}</code>
                  </pre>
                </div>
              ) : (
                <code className="inline-code" {...props}>{codeChildren}</code>
              );
            }
          }}
        />
      );
    };
  }, [copied, handleCopy]);

  return (

    <main className="main">
      <section className="hero">
        {!started && <TopIntro />}

        {chatHistory.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>
            <div className="message-box">
              {msg.role === 'user' ? (
                <div className="user-message">
                  <pre>{msg.content}</pre>
                </div>
              ) : (
                <>
                  <Markdown>{msg.content}</Markdown>
                  <div className="feedback-bar">
                    <button className="btn-icon" onClick={() => handleCopy(msg.content)} title="Sao chép">📋</button>
                    <button className="btn-icon" onClick={() => alert('Bạn thích phản hồi này!')} title="Thích">👍</button>
                    <button className="btn-icon" onClick={() => alert('Bạn không thích phản hồi này!')} title="Không thích">👎</button>
                    <button className="btn-icon" onClick={() => speakText(msg.content)} title="Đọc to">🔊</button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {loading && <div className="chat-message"><span className="blinker">█</span></div>}
        <div ref={listEndRef} />

        <div className="composer-wrap">
          <div className="composer" role="group" aria-label="Hộp nhập câu hỏi">
            <textarea
              placeholder="Nhập câu hỏi bất kì..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="right">
              <button className="circle-btn send" title="Gửi" onClick={handleSubmit}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l14-7-7 14-2-5-5-2z" stroke="#16a34a" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            {!!chatHistory.length && (
              <button className="circle-btn danger" onClick={handleClear} title="Xoá lịch sử">🗑️</button>
            )}
          </div>
        </div>

        <p className="disclaimer">
          Khi đặt câu hỏi, bạn đồng ý với <a href="#">Điều khoản</a> và <a href="#">Chính sách quyền riêng tư</a>.
        </p>
      </section>

    </main>

  );
}

export default Home;

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/atom-one-dark.css';
import { FiSend } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import { getLangIcon, extractText, speakText } from '../services/handle/Function';

const API_URL = process.env.REACT_APP_API_URL || '';

export default function WritingPage() {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('writingHistory')) || [];
    } catch {
      return [];
    }
  });
  const [outlines, setOutlines] = useState([]); // State mới để lưu dàn ý
  const [selectedOutline, setSelectedOutline] = useState(''); // State để lưu dàn ý được chọn
  const { sessionId: urlSessionId } = useParams();
  const [sessionId, setSessionId] = useState(() => sessionStorage.getItem('writingSessionId') || null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [remainingCredit, setRemainingCredit] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [tone, setTone] = useState('Trang trọng');
  const [language, setLanguage] = useState('Tiếng Việt');
  const [length, setLength] = useState('Mặc định');

  const categories = [
    { title: 'Phân tích', desc: 'Phân tích tác phẩm chuyên sâu', color: 'text-blue-600 bg-blue-50' },
    { title: 'Nghị luận xã hội', desc: 'Viết nghị luận về một vấn đề xã hội', color: 'text-red-600 bg-red-50' },
    { title: 'Nghị luận văn học', desc: 'Viết nghị luận về tác phẩm văn học', color: 'text-red-600 bg-red-50' },
    { title: 'Miêu tả', desc: 'Miêu tả con người, đồ vật, cảnh vật', color: 'text-orange-600 bg-orange-50' },
    { title: 'Văn biểu cảm', desc: 'Viết văn biểu cảm về con người hoặc sự việc', color: 'text-orange-600 bg-orange-50' },
    { title: 'Văn tự sự', desc: 'Kể lại một câu chuyện, sự việc', color: 'text-green-600 bg-green-50' },
    { title: 'Viết thư', desc: 'Viết thư gửi người thân, bạn bè', color: 'text-orange-600 bg-orange-50' },
    { title: 'Thuyết minh', desc: 'Giới thiệu, trình bày kiến thức khách quan', color: 'text-blue-600 bg-blue-50' },
  ];

  const assistantMessageRef = useRef({ role: 'assistant', content: '' });
  const controllerRef = useRef(null);
  const listEndRef = useRef(null);

  // Kiểm tra xem có phản hồi từ AI chưa
  const hasAssistantResponse = chatHistory.some(msg => msg.role === 'assistant');

  // Persist history
  useEffect(() => {
    sessionStorage.setItem('writingHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Auto scroll
  useEffect(() => {
    if (listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [chatHistory, loading]);

  // Check login
  const token = localStorage.getItem('token');
  useEffect(() => {
    if (!token) {
      setErrorMessage('Bạn cần đăng nhập để sử dụng tính năng này.');
    }
  }, [token]);

  // Fetch initial credit
  useEffect(() => {
    const fetchInitialCredit = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/user/credits`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Không lấy được thông tin credit');
        }
        const data = await res.json();
        setRemainingCredit(data.credit);
      } catch (err) {
        setErrorMessage(err.message || 'Không lấy được thông tin credit.');
      }
    };
    fetchInitialCredit();
  }, [token]);

  // Load session
  const loadSession = useCallback(async (sid) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/conversations/${sid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Không tải được lịch sử');
      const data = await res.json();
      const mapped = data
        .flatMap((log) => [
          log.message && { role: 'user', content: log.message },
          log.response && { role: 'assistant', content: log.response },
        ])
        .filter((m) => m && m.content !== '[Session started]');
      setChatHistory(mapped);
      setSessionId(sid);
      sessionStorage.setItem('writingSessionId', sid);
    } catch (err) {
      setErrorMessage('Không tải được lịch sử chat.');
    }
  }, [token]);

  useEffect(() => {
    if (urlSessionId) {
      loadSession(urlSessionId);
    }
  }, [urlSessionId, loadSession]);

  // Handle new writing session
  useEffect(() => {
    const handleNewWriting = () => {
      sessionStorage.removeItem('writingHistory');
      sessionStorage.removeItem('writingSessionId');
      setChatHistory([]);
      setOutlines([]); // Xóa dàn ý khi bắt đầu session mới
      setSelectedOutline('');
      setSessionId(null);
      setInput('');
    };
    window.addEventListener('newWriting', handleNewWriting);
    return () => window.removeEventListener('newWriting', handleNewWriting);
  }, []);

  // Handle category click
  const handleCategoryClick = (cat) => {
    let prompt = "";
    switch (cat.title) {
      case "Phân tích":
        prompt = "Phân tích tác phẩm ";
        break;
      case "Nghị luận xã hội":
        prompt = "Viết bài nghị luận xã hội về chủ đề ";
        break;
      case "Nghị luận văn học":
        prompt = "Viết bài nghị luận văn học về chủ đề ";
        break;
      case "Miêu tả":
        prompt = "Viết bài văn tả ";
        break;
      case "Văn biểu cảm":
        prompt = "Cảm nghĩ của em về ";
        break;
      case "Văn tự sự":
        prompt = "Viết bài văn kể câu chuyện ";
        break;
      case "Viết thư":
        prompt = "Viết thư gửi ";
        break;
      case "Thuyết minh":
        prompt = "Viết bài văn thuyết minh về ";
        break;
      default:
        prompt = `Viết văn ${cat.title.toLowerCase()} về `;
    }
    setInput(prompt);
  };

  // Handle copy
  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }, []);

  // Handle clear
  const handleClear = useCallback(async () => {
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ cuộc trò chuyện này?')) return;
    const sid = sessionStorage.getItem('writingSessionId');
    if (!sid || !token) {
      sessionStorage.removeItem('writingHistory');
      setChatHistory([]);
      setOutlines([]); // Xóa dàn ý khi xóa session
      setSelectedOutline('');
      setSessionId(null);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/conversations/${sid}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Xóa session thất bại');
      sessionStorage.removeItem('writingHistory');
      sessionStorage.removeItem('writingSessionId');
      setChatHistory([]);
      setOutlines([]);
      setSelectedOutline('');
      setSessionId(null);
      setInput('');
      window.dispatchEvent(new Event('writingSessionUpdated'));
    } catch (err) {
      setErrorMessage('Không xóa được cuộc trò chuyện.');
    }
  }, [token]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    const question = input.trim();
    if (!question || loading || remainingCredit === 0) return;

    const updatedHistory = [...chatHistory, { role: 'user', content: question }];
    setChatHistory(updatedHistory);
    setInput('');
    setLoading(true);
    setErrorMessage('');

    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    try {
      const token = localStorage.getItem('token');
      let sessionToUse = sessionId;
      if (!sessionToUse) {
        const startRes = await fetch(`${API_URL}/conversations/start`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!startRes.ok) throw new Error('Không tạo được session');
        const startData = await startRes.json();
        sessionToUse = startData.sessionId;
        setSessionId(sessionToUse);
        sessionStorage.setItem('writingSessionId', sessionToUse);
      }

      const res = await fetch(`${API_URL}/writing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/x-ndjson',
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
        body: JSON.stringify({
          messages: updatedHistory,
          session_id: sessionToUse,
          tone,
          language,
          length,
        }),
        signal,
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      assistantMessageRef.current = { role: 'assistant', content: '' };
      let currentOutline = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          let json;
          try {
            json = JSON.parse(line);
          } catch (e) {
            console.error('Lỗi parse NDJSON:', line, e);
            continue;
          }

          if (json.type === 'error') {
            setErrorMessage(json.message || 'Lỗi từ server.');
            setLoading(false);
            break;
          }
          if (json.type === 'done') {
            if (currentOutline) {
              setOutlines((prev) => [...prev, currentOutline]); // Lưu dàn ý
              setSelectedOutline(currentOutline); // Chọn dàn ý mới nhất
            }
            const finalHistory = [
              ...updatedHistory.slice(0, -1),
              updatedHistory[updatedHistory.length - 1],
              { ...assistantMessageRef.current },
            ];
            setChatHistory(finalHistory);
            if (json.remainingCredit !== undefined) {
              setRemainingCredit(json.remainingCredit);
            }
            break;
          }
          if (json.type === 'chunk') {
            if (json.content.startsWith('## Dàn ý')) {
              currentOutline += json.content; // Thu thập dàn ý
            } else {
              assistantMessageRef.current.content += json.content ?? '';
            }
            setChatHistory([
              ...updatedHistory.slice(0, -1),
              updatedHistory[updatedHistory.length - 1],
              { ...assistantMessageRef.current },
            ]);
          }
        }
        window.dispatchEvent(new Event('writingSessionUpdated'));
      }
    } catch (err) {
      setErrorMessage('Đã xảy ra lỗi khi gửi yêu cầu.');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [chatHistory, input, loading, sessionId, token, tone, language, length, remainingCredit]);

  // Markdown renderer
  const Markdown = useMemo(() => {
    return function MD({ children }) {
      const text = String(children ?? '');
      return (
        <ReactMarkdown
          children={text}
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeHighlight, [rehypeKatex, { throwOnError: false, strict: false }]]}
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
            },
          }}
        />
      );
    };
  }, [copied, handleCopy]);

  return (
  <main className="main">
    <section className="hero">
      {!token ? (
        <div className="not-logged">
          <div className="not-logged-box">
            <p className="not-logged-text">
             Bạn cần đăng nhập để bắt đầu trò chuyện
            </p>
            <a href="/auth/login" className="login-btn">
              Đăng nhập
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Toàn bộ giao diện WritingPage hiện tại */}
          <div className="flex flex-col items-center justify-center w-full min-h-screen bg-gray-50 px-4">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-3">
          <span className="text-3xl">✏️</span>
        </div>
        <h1 className="text-2xl font-semibold">AI Viết văn</h1>
        <p className="text-gray-500 text-sm">
          AI viết văn theo yêu cầu, hỗ trợ viết content và sáng tạo nội dung miễn phí
        </p>
      </div>

      {/* Categories - Chỉ hiển thị khi chưa có phản hồi từ AI */}
      {!hasAssistantResponse && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-3xl mb-6">
          {categories.map((c, idx) => (
            <div
              key={idx}
              onClick={() => handleCategoryClick(c)}
              className={`p-3 rounded-xl cursor-pointer border hover:shadow-md transition ${c.color}`}
            >
              <h3 className="font-medium text-sm">{c.title}</h3>
              <p className="text-xs text-gray-500">{c.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chat History */}
      {chatHistory.map((msg, i) => (
        <div key={i} className={`chat-message ${msg.role}`}>
          <div className="message-box">
            {msg.role === 'user' ? (
              <div className="user-message">
                <Markdown>{msg.content}</Markdown>
              </div>
            ) : (
              <>
                <Markdown>{msg.content}</Markdown>
                <div className="feedback-bar">
                  <button className="btn-icon" onClick={() => handleCopy(msg.content)} title="Sao chép">
                    📋
                  </button>
                  <button className="btn-icon" onClick={() => alert('Bạn thích phản hồi này!')} title="Thích">
                    👍
                  </button>
                  <button className="btn-icon" onClick={() => alert('Bạn không thích phản hồi này!')} title="Không thích">
                    👎
                  </button>
                  <button className="btn-icon" onClick={() => speakText(msg.content)} title="Đọc to">
                    🔊
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
      {loading && (
        <div className="chat-message">
          <span className="blinker">█</span>
        </div>
      )}
      <div ref={listEndRef} />

      {/* Input + Dropdowns */}
      <div className="w-full max-w-3xl border rounded-2xl shadow-sm bg-white p-4 flex flex-col gap-3">
        {!hasAssistantResponse && (
          <div className="flex items-center gap-3 flex-wrap">
            <select
              className="bg-transparent outline-none text-sm text-gray-700 border rounded-lg px-2 py-1"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              <option>Trang trọng</option>
              <option>Thân mật</option>
            </select>
            <select
              className="bg-transparent outline-none text-sm text-gray-700 border rounded-lg px-2 py-1"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option>Tiếng Việt</option>
              <option>Tiếng Anh</option>
            </select>
            <select
              className="bg-transparent outline-none text-sm text-gray-700 border rounded-lg px-2 py-1"
              value={length}
              onChange={(e) => setLength(e.target.value)}
            >
              <option>Mặc định</option>
              <option>Ngắn</option>
              <option>Vừa</option>
              <option>Dài</option>
            </select>
            {outlines.length > 0 && (
              <select
                className="bg-transparent outline-none text-sm text-gray-700 border rounded-lg px-2 py-1"
                value={selectedOutline}
                onChange={(e) => setSelectedOutline(e.target.value)}
              >
                <option value="">Chọn dàn ý</option>
                {outlines.map((outline, index) => (
                  <option key={index} value={outline}>
                    Dàn ý {index + 1}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
        {selectedOutline && (
          <div className="outline-preview bg-gray-50 p-3 rounded-lg">
            <Markdown>{selectedOutline}</Markdown>
          </div>
        )}
        <div className="composer-wrap">
          <div className="composer" role="group" aria-label="Hộp nhập câu hỏi">
            <textarea
              placeholder="Nhập câu hỏi bất kì..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="right">
              <button
                className="circle-btn send"
                title="Gửi"
                onClick={handleSubmit}
                disabled={loading || remainingCredit === 0}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12l14-7-7 14-2-5-5-2z"
                    stroke="#16a34a"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {remainingCredit === 0 && (
        <div className="credit-warning">
          <p>
            Bạn đã hết credit, vui lòng <a href="/purchase-credits">mua thêm credit</a> để tiếp tục sử dụng.
          </p>
        </div>
      )}
      {!!chatHistory.length && (
        <button className="circle-btn danger" onClick={handleClear} title="Xóa lịch sử">
          🗑️
        </button>
      )}
    </div>
        </>
      )}
    </section>
  </main>
);

}
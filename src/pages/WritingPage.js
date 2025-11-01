import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCopy, FiVolume2 } from 'react-icons/fi';
import { BsHandThumbsUp, BsHandThumbsDown } from 'react-icons/bs';
import { getLangIcon, extractText, speakText } from '../services/handle/Function';
import api from '../services/apiToken'; // ✅ Thêm dòng này
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/atom-one-dark.css';
import 'react-toastify/dist/ReactToastify.css';
import '../style/chat.css';

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
  const [outlines, setOutlines] = useState([]);
  const [selectedOutline, setSelectedOutline] = useState('');
  const { sessionId: urlSessionId } = useParams();
  const [sessionId, setSessionId] = useState(() => sessionStorage.getItem('writingSessionId') || null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
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
  const navigate = useNavigate();
  const hasAssistantResponse = chatHistory.some(msg => msg.role === 'assistant');
  const hasMessages = chatHistory.length > 0;

  useEffect(() => {
    sessionStorage.setItem('writingHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    if (listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [chatHistory, loading]);

  const token = localStorage.getItem('token');
  useEffect(() => {
    if (!token) {
      setErrorMessage('Bạn cần đăng nhập để sử dụng tính năng này.');
    }
  }, [token]);

  // ✅ Đổi fetch sang api
  useEffect(() => {
    const fetchInitialCredit = async () => {
      if (!token) return;
      try {
        const res = await api.get('/user/credits');
        setRemainingCredit(res.data.credit);
      } catch (err) {
        setErrorMessage(err.message || 'Không lấy được thông tin credit.');
      }
    };
    fetchInitialCredit();
  }, [token]);

  // ✅ Đổi fetch sang api
  const loadSession = useCallback(async (sid) => {
    if (!token) return;
    try {
      const res = await api.get(`/conversations/${sid}`);
      const data = res.data;
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

  useEffect(() => {
    const handleNewWriting = () => {
      sessionStorage.removeItem('writingHistory');
      sessionStorage.removeItem('writingSessionId');
      setChatHistory([]);
      setOutlines([]);
      setSelectedOutline('');
      setSessionId(null);
      setInput('');
    };
    window.addEventListener('newWriting', handleNewWriting);
    return () => window.removeEventListener('newWriting', handleNewWriting);
  }, []);

  const handleCategoryClick = (cat) => {
    let prompt = "";
    switch (cat.title) {
      case "Phân tích": prompt = "Phân tích tác phẩm "; break;
      case "Nghị luận xã hội": prompt = "Viết bài nghị luận xã hội về chủ đề "; break;
      case "Nghị luận văn học": prompt = "Viết bài nghị luận văn học về chủ đề "; break;
      case "Miêu tả": prompt = "Viết bài văn tả "; break;
      case "Văn biểu cảm": prompt = "Cảm nghĩ của em về "; break;
      case "Văn tự sự": prompt = "Viết bài văn kể câu chuyện "; break;
      case "Viết thư": prompt = "Viết thư gửi "; break;
      case "Thuyết minh": prompt = "Viết bài văn thuyết minh về "; break;
      default: prompt = `Viết văn ${cat.title.toLowerCase()} về `;
    }
    setInput(prompt);
  };

  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text);
    toast.success('Đã sao chép vào clipboard!', { position: 'top-right', autoClose: 2000 });
    setCopied(true);
    setActiveButton('copy');
    setTimeout(() => { setCopied(false); setActiveButton(null); }, 2000);
  }, []);

  const handleFeedback = useCallback((messageId, feedbackType) => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để gửi phản hồi.');
      return;
    }
    setActiveButton(feedbackType);
    toast.success('Cảm ơn phản hồi của bạn!');
    setTimeout(() => setActiveButton(null), 200);
  }, [token]);

  const handleSpeak = useCallback((text) => {
    try {
      speakText(text);
      toast.info('Đang đọc nội dung...');
    } catch {
      toast.error('Không đọc được nội dung.');
    }
  }, []);

  // ✅ Đổi fetch sang api
  const handleClear = useCallback(async () => {
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ cuộc trò chuyện này?')) return;
    const sid = sessionStorage.getItem('writingSessionId');
    if (!sid || !token) {
      sessionStorage.removeItem('writingHistory');
      setChatHistory([]);
      setOutlines([]);
      setSelectedOutline('');
      setSessionId(null);
      return;
    }
    try {
      await api.delete(`/conversations/${sid}`);
      sessionStorage.removeItem('writingHistory');
      sessionStorage.removeItem('writingSessionId');
      setChatHistory([]);
      setOutlines([]);
      setSelectedOutline('');
      setSessionId(null);
      setInput('');
      window.dispatchEvent(new Event('writingSessionUpdated'));
    } catch {
      setErrorMessage('Không xóa được cuộc trò chuyện.');
    }
  }, [token]);

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
      // ✅ Đổi fetch sang api
      if (!sessionToUse) {
        const startRes = await api.post('/conversations/start');
        const startData = startRes.data;
        sessionToUse = startData.sessionId;
        setSessionId(sessionToUse);
        sessionStorage.setItem('writingSessionId', sessionToUse);
      }

      // ⚠️ Giữ nguyên phần stream NDJSON
      const res = await fetch(`${API_URL}/writing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/x-ndjson',
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
        body: JSON.stringify({ messages: updatedHistory, session_id: sessionToUse, tone, language, length }),
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
          try { json = JSON.parse(line); } catch { continue; }
          if (json.type === 'error') { setErrorMessage(json.message); setLoading(false); break; }
          if (json.type === 'done') {
            if (currentOutline) setOutlines((prev) => [...prev, currentOutline]);
            const finalHistory = [...updatedHistory, { ...assistantMessageRef.current }];
            setChatHistory(finalHistory);
            if (json.remainingCredit !== undefined) setRemainingCredit(json.remainingCredit);
            break;
          }
          if (json.type === 'chunk') {
            if (json.content.startsWith('## Dàn ý')) currentOutline += json.content;
            else assistantMessageRef.current.content += json.content ?? '';
            setChatHistory([...updatedHistory, { ...assistantMessageRef.current }]);
          }
        }
      }
    } catch (err) {
      setErrorMessage('Đã xảy ra lỗi khi gửi yêu cầu.');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [chatHistory, input, loading, sessionId, token, tone, language, length, remainingCredit]);

  const Markdown = useMemo(() => {
    return function MD({ children }) {
      const text = String(children ?? '');
      return (
        <ReactMarkdown
          children={text}
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeHighlight, [rehypeKatex, { throwOnError: false, strict: false }]]}
        />
      );
    };
  }, []);

  // --- UI giữ nguyên ---
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
            {!hasMessages && (
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-3">
                  <span className="text-3xl">✏️</span>
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">AI Viết Văn</h1>
                <p className="text-gray-500 text-sm mt-2 max-w-md">
                  AI hỗ trợ viết văn theo yêu cầu, giúp bạn sáng tạo nội dung chất lượng và dễ dàng.
                </p>
              </div>
            )}

            {errorMessage && (
              <div className="error-message">
                <p>{errorMessage}</p>
                {errorMessage.includes('hết credit') && (
                  <p>
                    <a href="/purchase-credits">Mua thêm credit</a>
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {token && (
        <>
          <div className="chat-scroll-wrapper has-messages">
            <div className="chat-container">
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
              {chatHistory.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.role === 'user' ? 'user' : 'ai'}`}>
                  <div className="message-box">
                    <Markdown>{msg.content}</Markdown>
                    {msg.role === 'assistant' && (
                      <div className="feedback-bar">
                        <button
                          className={`btn-icon ${activeButton === 'copy' ? 'active' : ''}`}
                          onClick={() => handleCopy(msg.content)}
                          title="Sao chép"
                        >
                          <FiCopy className="h-5 w-5" />
                        </button>
                        <button
                          className={`btn-icon ${activeButton === 'like' ? 'active' : ''}`}
                          onClick={() => handleFeedback(i, 'like')}
                          title="Thích"
                        >
                          <BsHandThumbsUp className={activeButton === 'like' ? 'h-6 w-6' : 'h-5 w-5'} />
                        </button>
                        <button
                          className={`btn-icon ${activeButton === 'dislike' ? 'active' : ''}`}
                          onClick={() => handleFeedback(i, 'dislike')}
                          title="Không thích"
                        >
                          <BsHandThumbsDown className={activeButton === 'dislike' ? 'h-6 w-6' : 'h-5 w-5'} />
                        </button>
                        <button
                          className={`btn-icon ${activeButton === 'speak' ? 'active' : ''}`}
                          onClick={() => handleSpeak(msg.content)}
                          title="Đọc to"
                        >
                          <FiVolume2 className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              )}
              <div ref={listEndRef} />
              {!hasAssistantResponse && (
                <div className="w-full max-w-3xl mb-6">
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
                  {selectedOutline && (
                    <div className="outline-preview bg-gray-50 p-3 rounded-lg mt-3">
                      <Markdown>{selectedOutline}</Markdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="input-area">
            <div className="composer grok-style" role="group" aria-label="Hộp nhập câu hỏi">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <button
                className="send-btn"
                title="Gửi"
                onClick={handleSubmit}
                disabled={loading || remainingCredit === 0}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 19V5m7 7l-7-7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <p className="disclaimer">
              Khi đặt câu hỏi, bạn đồng ý với <a href="#">Điều khoản</a> và <a href="#">Chính sách quyền riêng tư</a>.
            </p>
            {remainingCredit === 0 && (
              <div className="credit-warning">
                <p>
                  Bạn đã hết credit, vui lòng <a href="/purchase-credits">mua thêm credit</a> để tiếp tục sử dụng.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}

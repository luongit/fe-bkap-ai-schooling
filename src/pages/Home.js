import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCopy, FiVolume2, FiCheck, FiSquare } from 'react-icons/fi';
import { BsHandThumbsUp, BsHandThumbsDown } from 'react-icons/bs';
import TopIntro from '../components/TopIntro';
import { getLangIcon, extractText, speakText } from '../services/handle/Function';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/atom-one-dark.css';
import 'react-toastify/dist/ReactToastify.css';
import '../style/chat.css';
import '../style/mobile.css';

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
  const { sessionId: urlSessionId } = useParams();
  const [sessionId, setSessionId] = useState(() => sessionStorage.getItem('sessionId') || null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [remainingCredit, setRemainingCredit] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const started = chatHistory.length > 0;
  const assistantMessageRef = useRef({ role: 'assistant', content: '' });
  const controllerRef = useRef(null);
  const listEndRef = useRef(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const checkToken = () => {
      const currentToken = localStorage.getItem('token');
      if (currentToken !== token) {
        setToken(currentToken);
      }
    };

    const handleStorageChange = (event) => {
      if (event.key === 'token') {
        setToken(localStorage.getItem('token'));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const intervalId = setInterval(checkToken, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [token]);

  useEffect(() => {
    if (!token) {
      sessionStorage.removeItem('chatHistory');
      sessionStorage.removeItem('sessionId');
      setChatHistory([]);
      setSessionId(null);
      setRemainingCredit(null);
      setShowLoginModal(true);
      window.dispatchEvent(new Event('userLoggedOut'));
    } else {
      setShowLoginModal(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      sessionStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory, token]);

  useEffect(() => {
    if (listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: 'instant', block: 'end' });
    }
  }, [chatHistory, loading]);

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
        if (data.credit !== undefined) {
          setRemainingCredit(data.credit);
        } else if (data.error) {
          setErrorMessage(data.message || 'Không lấy được thông tin credit');
        }
      } catch (err) {
        console.error('Fetch credit error:', err);
        setErrorMessage(err.message || 'Không lấy được thông tin credit. Vui lòng thử lại.');
      }
    };
    fetchInitialCredit();
  }, [token, API_URL]);

  const loadSession = useCallback(
    async (sid) => {
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
        sessionStorage.setItem('sessionId', sid);
        sessionStorage.setItem('chatHistory', JSON.stringify(mapped));
      } catch (err) {
        console.error('Load session error:', err);
        setErrorMessage('Không tải được lịch sử chat. Vui lòng thử lại.');
      }
    },
    [API_URL, token],
  );

  useEffect(() => {
    if (urlSessionId && token) {
      loadSession(urlSessionId);
    }
  }, [urlSessionId, loadSession, token]);

  useEffect(() => {
    const handleNewChat = () => {
      sessionStorage.removeItem('chatHistory');
      sessionStorage.removeItem('sessionId');
      setChatHistory([]);
      setSessionId(null);
      setInput('');
    };
    window.addEventListener('newChat', handleNewChat);
    return () => window.removeEventListener('newChat', handleNewChat);
  }, []);

  const handleCopy = useCallback((text) => {
    try {
      navigator.clipboard.writeText(text);
      toast.success('Đã sao chép vào clipboard!', {
        toastId: 'copyMessage',
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });
      setCopied(true);
      setActiveButton('copy');
      setTimeout(() => {
        setCopied(false);
        setActiveButton(null);
      }, 2000);
    } catch (err) {
      console.error('Copy error:', err);
      toast.error('Không sao chép được. Vui lòng thử lại!', {
        toastId: 'copyError',
        position: 'top-right',
        autoClose: 2000,
      });
    }
  }, []);

  const handleFeedback = useCallback((messageId, feedbackType) => {
    if (!token) {
      setErrorMessage('Vui lòng đăng nhập để gửi phản hồi.');
      toast.error('Vui lòng đăng nhập để gửi phản hồi.', {
        toastId: 'feedbackLoginError',
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }
    setActiveButton(feedbackType);
    toast.success('Cảm ơn phản hồi của bạn!', {
      toastId: `feedback_${feedbackType}_${messageId}`,
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'colored',
    });
    setTimeout(() => setActiveButton(null), 200);
  }, [token]);

  const handleSpeak = useCallback((text) => {
    try {
      speakText(text);
      toast.info('Đang đọc nội dung...', {
        toastId: 'speakMessage',
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });
      setActiveButton('speak');
      setTimeout(() => setActiveButton(null), 200);
    } catch (err) {
      console.error('Speak error:', err);
      toast.error('Không đọc được nội dung. Vui lòng thử lại!', {
        toastId: 'speakError',
        position: 'top-right',
        autoClose: 2000,
      });
    }
  }, []);

  const handleGoal = useCallback(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setErrorMessage('Vui lòng đăng nhập để tạo mục tiêu.');
      toast.error('Vui lòng đăng nhập để tạo mục tiêu.', {
        toastId: 'goalError',
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }
    setActiveButton('goal');
    navigate(`/students/${userId}/goals`, { state: { goal: chatHistory[chatHistory.length - 1]?.content } });
    setTimeout(() => setActiveButton(null), 200);
  }, [navigate, chatHistory]);

  const handleClear = useCallback(async () => {
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ cuộc trò chuyện này?')) return;
    const sid = sessionStorage.getItem('sessionId');
    if (!sid || !token) {
      sessionStorage.removeItem('chatHistory');
      sessionStorage.removeItem('sessionId');
      setChatHistory([]);
      setSessionId(null);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/conversations/${sid}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Xóa session thất bại');
      sessionStorage.removeItem('chatHistory');
      sessionStorage.removeItem('sessionId');
      setChatHistory([]);
      setSessionId(null);
      setInput('');
      window.dispatchEvent(new Event('sessionUpdated'));
    } catch (err) {
      console.error('Delete session error:', err);
      setErrorMessage('Không xóa được cuộc trò chuyện. Vui lòng thử lại.');
    }
  }, [API_URL, token]);

  const handleStop = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort(); // Ngắt fetch request
      controllerRef.current = null;
    }
    if (scheduleRef.current.timer) {
      clearTimeout(scheduleRef.current.timer); // Xóa timer
      scheduleRef.current.timer = null;
      scheduleRef.current.pending = ''; // Xóa buffer
    }
    if (assistantMessageRef.current.content) {
      // Lưu nội dung đã nhận được vào chatHistory
      setChatHistory((prev) => [
        ...prev,
        { ...assistantMessageRef.current },
      ]);
      assistantMessageRef.current = { role: 'assistant', content: '' }; // Reset assistant message
    }
    setLoading(false); // Reset loading
    toast.info('Đã dừng trả lời.', {
      toastId: 'stopStream',
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'colored',
    });
  }, []);

  const isMathBalanced = (s) => {
    const dollars = (s.match(/(?<!\\)\$/g) || []).length;
    return dollars % 2 === 0;
  };

  const scheduleRef = useRef({ timer: null, pending: '' });
  const pushAssistantChunk = useCallback((baseHistory, assistantMessageRef, chunk) => {
    scheduleRef.current.pending += chunk;
    if (scheduleRef.current.timer) return;
    scheduleRef.current.timer = setTimeout(() => {
      const take = scheduleRef.current.pending;
      scheduleRef.current.pending = '';
      scheduleRef.current.timer = null;
      if (!take) return;
      if (isMathBalanced(take) || /\n|\.\s$/.test(take)) {
        assistantMessageRef.current.content += take;
        const newHistory = [
          ...baseHistory,
          { ...assistantMessageRef.current },
        ];
        setChatHistory(newHistory);
      } else {
        scheduleRef.current.pending = take + scheduleRef.current.pending;
      }
    }, 80);
  }, []);

  const handleSubmit = useCallback(async () => {
    const question = input.trim();
    if (!question || loading || remainingCredit === 0) return;

    const updatedHistory = [
      ...chatHistory,
      { role: 'user', content: question },
    ];
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
        sessionStorage.setItem('sessionId', sessionToUse);
      }
      const res = await fetch(`${API_URL}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/x-ndjson',
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
        body: JSON.stringify({ messages: updatedHistory, session_id: sessionToUse }),
        signal,
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      assistantMessageRef.current = { role: 'assistant', content: '' };
      let bufferTail = '';
      let firstChunkReceived = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          let json;
          try {
            if (!line || line === 'undefined') {
              console.warn('Dòng NDJSON không hợp lệ, bỏ qua:', line);
              continue;
            }
            json = JSON.parse(line);
          } catch (e) {
            console.error('Lỗi parse NDJSON:', line, e);
            bufferTail += line + '\n';
            continue;
          }

          if (json.type === 'error') {
            setErrorMessage(json.message || 'Lỗi từ server, vui lòng thử lại');
            setLoading(false);
            break;
          }
          
          if (json.type === 'done') {
            if (scheduleRef.current.timer) {
              clearTimeout(scheduleRef.current.timer);
              scheduleRef.current.timer = null;
            }
            const rest = scheduleRef.current.pending;
            scheduleRef.current.pending = '';
            assistantMessageRef.current.content += rest;
            const finalHistory = [
              ...updatedHistory,
              { ...assistantMessageRef.current },
            ];
            setChatHistory(finalHistory);
            if (json.remainingCredit !== undefined) {
              setRemainingCredit(json.remainingCredit);
            }
            break;
          }
          if (json.type === 'chunk') {
            const safeContent = json.content ?? '';
            if (!firstChunkReceived) {
              firstChunkReceived = true;
              setLoading(false);
            }
            pushAssistantChunk(updatedHistory, assistantMessageRef, safeContent);
          }
        }
        window.dispatchEvent(new Event('sessionUpdated'));
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted by user');
      } else {
        console.error('Lỗi trong handleSubmit:', err);
        setErrorMessage('Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại.');
      }
      setLoading(false);
    } finally {
      if (scheduleRef.current.timer) {
        clearTimeout(scheduleRef.current.timer);
        scheduleRef.current.timer = null;
        scheduleRef.current.pending = '';
      }
      setLoading(false);
    }
  }, [API_URL, chatHistory, input, loading, pushAssistantChunk, sessionId, token, remainingCredit]);

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
                    <button className={`copy-button ${copied ? 'copied' : ''}`} onClick={() => handleCopy(extractText(codeChildren))}>
                      {copied ? 'Đã sao chép!' : 'Sao chép'}
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
              <p className="not-logged-text">Bạn cần đăng nhập để bắt đầu trò chuyện</p>
              <a href="/auth/login" className="login-btn">
                Đăng nhập
              </a>
            </div>
          </div>
        ) : (
          <>
            {!started && <TopIntro />}
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
          <div className={`chat-scroll-wrapper ${chatHistory.length > 0 ? 'has-messages' : ''}`}>
            <div className="chat-container">
              <div className="chat-inner">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`chat-message ${msg.role}`}>
                    <div className="message-box">
                      <Markdown>{msg.content}</Markdown>
                      {msg.role === 'assistant' && (
                        <div className="feedback-bar">
                          <button className="btn-icon" onClick={() => handleCopy(msg.content)} title="Sao chép">
                            <FiCopy className="h-5 w-5" />
                          </button>
                          <button className="btn-icon" onClick={() => handleFeedback(i, 'like')} title="Thích">
                            <BsHandThumbsUp className="h-5 w-5" />
                          </button>
                          <button className="btn-icon" onClick={() => handleFeedback(i, 'dislike')} title="Không thích">
                            <BsHandThumbsDown className="h-5 w-5" />
                          </button>
                          <button className="btn-icon" onClick={() => handleSpeak(msg.content)} title="Đọc to">
                            <FiVolume2 className="h-5 w-5" />
                          </button>
                          <button className="btn-icon" onClick={handleGoal} title="Tạo mục tiêu">
                            <FiCheck className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="typing-indicator">
                    <span></span>
                  </div>
                )}
                <div ref={listEndRef} />
              </div>
            </div>
          </div>

          <div
            className="input-area"
            style={{
              transform: chatHistory.length === 0 ? "translateY(-25vh)" : "translateY(0)",
              transition: "transform 0.3s ease",
              position: "relative",
            }}
          >
            <div className="composer grok-style" role="group" aria-label="Hộp nhập câu hỏi">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tôi có thể giúp gì cho bạn?"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              {loading ? (
                <button
                  className="stop-btn"
                  title="Dừng trả lời"
                  onClick={handleStop}
                >
                  <FiSquare className="stop-icon" />
                </button>
              ) : (
                <button
                  className="send-btn"
                  title="Gửi"
                  onClick={handleSubmit}
                  disabled={loading || remainingCredit === 0}
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
              )}
            </div>

            {chatHistory.length > 0 && (
              <p className="disclaimer">
                Khi đặt câu hỏi, bạn đồng ý với <a href="#">Điều khoản</a> và <a href="#">Chính sách quyền riêng tư</a>.
              </p>
            )}

            {remainingCredit === 0 && (
              <div className="credit-warning">
                <p>
                  Bạn đã hết credit, vui lòng{" "}
                  <a href="/purchase-credits">Mua thêm credit</a> để tiếp tục sử dụng.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}

export default Home;
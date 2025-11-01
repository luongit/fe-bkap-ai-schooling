import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FiDownload, FiImage, FiSend, FiLoader, FiXCircle } from 'react-icons/fi';
import api from "../services/apiToken"; // ✅ interceptor tự refresh token
import '../style/ImageGeneration.css';

const DEFAULT_STYLE = "default";
const DEFAULT_SIZE = "1024x1024";
const ESTIMATED_CREDIT_COST = 10;

function ImageGeneration() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingCredit, setRemainingCredit] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [imageHistory, setImageHistory] = useState([]);
  const listEndRef = useRef(null);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const cost = ESTIMATED_CREDIT_COST;
  const started = imageHistory.length > 0;

  // --- Tự cuộn xuống cuối ---
  useEffect(() => {
    if (listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [imageHistory, loading]);

  // --- Lấy credit ban đầu ---
  const fetchInitialCredit = async () => {
    if (!token) return;
    setErrorMessage('');
    try {
      const res = await api.get(`/user/credits`); // ✅ dùng axios instance
      const data = res.data;
      if (data.credit !== undefined) {
        setRemainingCredit(data.credit);
      } else {
        setErrorMessage(data.message || 'Không lấy được thông tin credit.');
      }
    } catch (err) {
      console.error('Fetch credit error:', err);
      setErrorMessage(err.message || 'Lỗi kết nối API credit. Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    fetchInitialCredit();
    const handleCreditUpdate = () => fetchInitialCredit();
    window.addEventListener('creditUpdated', handleCreditUpdate);
    return () => window.removeEventListener('creditUpdated', handleCreditUpdate);
  }, [token]);

  // --- Tải ảnh xuống ---
  const handleDownload = useCallback((url) => {
    if (!url) return;
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-spark-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Đã tải ảnh thành công!", { autoClose: 2000 });
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Không tải được ảnh. Vui lòng thử lại!");
    }
  }, []);

  // --- Gửi prompt tạo ảnh ---
  const handleSubmit = useCallback(async () => {
    if (!token || !userId) {
      toast.error('Vui lòng đăng nhập để tạo ảnh.', { autoClose: 2000 });
      navigate('/auth/login');
      return;
    }

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setErrorMessage('Vui lòng nhập mô tả (prompt) cho ảnh.');
      return;
    }

    if (remainingCredit !== null && remainingCredit < cost) {
      setErrorMessage(`Không đủ credit. Cần ${cost} credit.`);
      toast.error(`Bạn không đủ credit! (Cần ${cost})`, { autoClose: 3000 });
      return;
    }

    setImageHistory(prev => [
      ...prev,
      { role: 'user', content: trimmedPrompt, type: 'text' }
    ]);

    setLoading(true);
    setPrompt('');
    setErrorMessage('');

    try {
      const requestBody = {
        userId: Number(userId),
        prompt: trimmedPrompt,
        style: DEFAULT_STYLE,
        size: DEFAULT_SIZE,
      };

      const res = await api.post(`/images/generate`, requestBody); // ✅ auto token
      const imageUrlResult = res.data;

      if (!imageUrlResult || imageUrlResult.length < 10) {
        throw new Error("API đã thành công nhưng không trả về đường dẫn ảnh hợp lệ.");
      }

      setImageHistory(prev => [
        ...prev,
        { role: 'assistant', content: imageUrlResult, type: 'image', prompt: trimmedPrompt }
      ]);

      setRemainingCredit(prev => (prev !== null ? prev - cost : prev));
      toast.success("✅ Ảnh đã được tạo thành công!");
      window.dispatchEvent(new Event('creditUpdated'));
    } catch (err) {
      console.error('Lỗi tạo ảnh:', err);
      setImageHistory(prev => [
        ...prev,
        { role: 'assistant', content: err.message || "Lỗi tạo ảnh", type: 'error' }
      ]);
    } finally {
      setLoading(false);
    }
  }, [token, userId, prompt, remainingCredit, cost, navigate]);

  // --- Hiển thị nội dung từng tin nhắn ---
  const RenderMessageContent = useCallback(({ message }) => {
    if (message.type === 'image') {
      return (
        <div className="img-result-box">
          <p className="img-prompt-text">Yêu cầu: <strong>{message.prompt}</strong></p>
          <div className="img-container">
            <img src={message.content} alt="Ảnh được tạo bởi AI" className="generated-img" />
            <div className="img-actions">
              <button onClick={() => handleDownload(message.content)} className="download-btn">
                <FiDownload className="h-5 w-5" /> Tải xuống
              </button>
            </div>
          </div>
        </div>
      );
    }
    if (message.type === 'error') {
      return (
        <div className="img-error-msg">
          <FiXCircle className="inline w-5 h-5 mr-2" />
          <strong>Lỗi:</strong> {message.content}
        </div>
      );
    }
    return <p>{message.content}</p>;
  }, [handleDownload]);

  // --- Giao diện chính ---
  return (
    <main className="img-main">
      {!token ? (
        <section className="img-hero img-full-center">
          <div className="img-auth-box">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Bạn cần đăng nhập để sử dụng tính năng này</h1>
            <p className="text-gray-500 mb-6">Vui lòng đăng nhập để bắt đầu tạo ảnh AI.</p>
            <a href="/auth/login" className="img-login-btn">Đăng nhập</a>
          </div>
        </section>
      ) : (
        <>
          <section className="img-hero">
            {!started && (
              <div className="img-initial-intro">
                <FiImage className="text-purple-500 w-16 h-16 mb-4" />
                <h1 className="text-2xl font-semibold text-gray-800">Tạo Ảnh AI Sáng Tạo</h1>
                <p className="text-gray-500 mt-2">Mô tả chi tiết ảnh bạn muốn tạo trong ô bên dưới.</p>
                {errorMessage && (
                  <div className="img-error-msg mt-4">
                    <FiXCircle className="text-red-500 w-5 h-5" />
                    <p>{errorMessage}</p>
                  </div>
                )}
              </div>
            )}

            {/* Lịch sử ảnh */}
            <div className={`img-scroll-wrapper ${started ? 'has-messages' : ''} ${!started ? 'hidden' : ''}`}>
              <div className="img-chat-container">
                <div className="img-chat-inner">
                  {imageHistory.map((msg, i) => (
                    <div key={i} className={`img-msg ${msg.role}`}>
                      <div className="img-msg-box">
                        <RenderMessageContent message={msg} />
                      </div>
                    </div>
                  ))}
                  {loading && <div className="img-typing-indicator"><span></span></div>}
                  <div ref={listEndRef} />
                </div>
              </div>
            </div>
          </section>

          {/* Ô nhập liệu */}
          <div className="img-input-area">
            <div className="img-composer" role="group">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Mô tả chi tiết ảnh bạn muốn tạo..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                disabled={loading}
              />
              <button
                className="send-btn"
                title="Tạo ảnh"
                onClick={handleSubmit}
                disabled={loading || !prompt.trim() || (remainingCredit !== null && remainingCredit < cost)}
              >
                {loading ? <FiLoader className="h-5 w-5 animate-spin" /> : <FiSend className="h-5 w-5" />}
              </button>
            </div>

            <p className="img-disclaimer">
              Mỗi lần tạo ảnh tốn <span className="font-semibold text-purple-600">{cost} credit</span>.{" "}
              Credit còn lại:{" "}
              <span className="font-bold text-purple-600">
                {remainingCredit !== null ? remainingCredit : "..."}
              </span>
            </p>
          </div>
        </>
      )}
    </main>
  );
}

export default ImageGeneration;

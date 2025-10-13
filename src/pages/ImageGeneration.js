import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FiDownload, FiImage, FiSend, FiLoader, FiXCircle } from 'react-icons/fi';
// import '../style/chat.css'; // ✅ ĐÃ XÓA KẾ THỪA
import '../style/ImageGeneration.css'; // CHỈ SỬ DỤNG CSS RIÊNG

const API_URL = process.env.REACT_APP_API_URL;

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

    // --- LOGIC CUỘN TỰ ĐỘNG ---
    useEffect(() => {
        if (listEndRef.current) {
            listEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [imageHistory, loading]);


    // --- FETCH CREDIT (GIỮ NGUYÊN) ---
    const fetchInitialCredit = async () => {
        if (!token) return;
        setErrorMessage('');
        try {
            const res = await fetch(`${API_URL}/user/credits`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Không lấy được thông tin credit');
            }
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
        const handleNewImageGeneration = () => {
            setImageHistory([]); // Reset lịch sử
            setPrompt('');      // Xóa input
            // ... reset các state liên quan khác
        };
        window.addEventListener('newImageGeneration', handleNewImageGeneration);
        return () => window.removeEventListener('newImageGeneration', handleNewImageGeneration);
    }, []);
    useEffect(() => {
        fetchInitialCredit();
        const handleCreditUpdate = () => {
            fetchInitialCredit();
        };
        window.addEventListener('creditUpdated', handleCreditUpdate);
        return () => window.removeEventListener('creditUpdated', handleCreditUpdate);
    }, [token, API_URL]);

    // --- Xử lý tải ảnh xuống ---
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

    // --- Xử lý tạo ảnh ---
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

            const res = await fetch(`${API_URL}/images/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            const responseText = await res.text();

            if (!res.ok) {
                let errorMsg = responseText;
                try {
                    const errorJson = JSON.parse(responseText);
                    errorMsg = errorJson.message || errorMsg;
                } catch (e) {
                    errorMsg = responseText.replace('ERROR: ', '');
                }

                setImageHistory(prev => [
                    ...prev,
                    { role: 'assistant', content: errorMsg, type: 'error' }
                ]);

                throw new Error(errorMsg || 'Lỗi không xác định khi tạo ảnh.');
            }

            const imageUrlResult = responseText;

            if (!imageUrlResult || imageUrlResult.length < 10) {
                throw new Error("API đã thành công nhưng không trả về đường dẫn ảnh hợp lệ.");
            }

            setImageHistory(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: imageUrlResult,
                    type: 'image',
                    prompt: trimmedPrompt
                }
            ]);

            setRemainingCredit(prev => (prev !== null ? prev - cost : prev));
            toast.success("✅ Ảnh đã được tạo thành công!");
            window.dispatchEvent(new Event('creditUpdated'));

        } catch (err) {
            console.error('Lỗi tạo ảnh:', err);
        } finally {
            setLoading(false);
        }
    }, [token, userId, prompt, remainingCredit, cost, navigate, API_URL]);

    // --- Component Hiển thị Ảnh/Phản hồi ---
    const RenderMessageContent = useCallback(({ message }) => {
        if (message.type === 'image') {
            return (
                <div className="img-result-box">
                    <p className="img-prompt-text">
                        Yêu cầu: **{message.prompt}**
                    </p>
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
        // Tin nhắn văn bản (cho user prompt)
        return <p>{message.content}</p>;
    }, [handleDownload]);

    return (
        // Sử dụng class 'img-main' mới cho bố cục độc lập
        // <main className="img-main"> 
        //     <section className="img-hero">
        //         {!started && (
        //             <div className="img-initial-intro">
        //                 <FiImage className="text-purple-500 w-16 h-16 mb-4" />
        //                 <h1 className="text-2xl font-semibold text-gray-800">Tạo Ảnh AI Sáng Tạo</h1>
        //                 <p className="text-gray-500 mt-2">Mô tả chi tiết ảnh bạn muốn tạo trong ô bên dưới.</p>
        //                 {errorMessage && ( 
        //                     <div className="img-error-msg mt-4">
        //                         <FiXCircle className="text-red-500 w-5 h-5" />
        //                         <p>{errorMessage}</p>
        //                     </div>
        //                 )}
        //             </div>
        //         )}

        //         {/* VÙNG CUỘN LỊCH SỬ ẢNH */}
        //         <div className={`img-scroll-wrapper ${started ? 'has-messages' : ''} ${!started ? 'hidden' : ''}`}>
        //             <div className="img-chat-container">
        //                 <div className="img-chat-inner">
        //                     {imageHistory.map((msg, i) => (
        //                         // Sử dụng class 'img-msg' mới
        //                         <div key={i} className={`img-msg ${msg.role}`}>
        //                             <div className="img-msg-box">
        //                                 <RenderMessageContent message={msg} />
        //                             </div>
        //                         </div>
        //                     ))}

        //                     {loading && (
        //                         <div className="img-typing-indicator"> 
        //                             <span></span>
        //                         </div>
        //                     )}
        //                     <div ref={listEndRef} />
        //                 </div>
        //             </div>
        //         </div>
        //     </section>

        //     {/* Thanh nhập liệu cố định */}
        //     <div className="img-input-area"> 

        //         <div className="img-composer" role="group" aria-label="Hộp nhập mô tả ảnh">
        //             <textarea
        //                 value={prompt}
        //                 onChange={(e) => setPrompt(e.target.value)}
        //                 placeholder="Mô tả chi tiết ảnh bạn muốn tạo..."
        //                 onKeyDown={(e) => {
        //                     if (e.key === "Enter" && !e.shiftKey) {
        //                         e.preventDefault();
        //                         handleSubmit();
        //                     }
        //                 }}
        //                 disabled={loading}
        //             />
        //             <button
        //                 className="send-btn"
        //                 title="Tạo ảnh"
        //                 onClick={handleSubmit}
        //                 disabled={loading || !prompt.trim() || remainingCredit === 0 || (remainingCredit !== null && remainingCredit < cost)}
        //             >
        //                 {loading ? (
        //                     <FiLoader className="h-5 w-5 animate-spin" />
        //                 ) : (
        //                     <FiSend className="h-5 w-5" />
        //                 )}
        //             </button>
        //         </div>

        //         <p className="img-disclaimer">
        //             Mỗi lần tạo ảnh tốn <span className="font-semibold text-purple-600">{cost} credit</span>. 
        //             Credit còn lại: <span className="font-bold text-purple-600">{remainingCredit !== null ? remainingCredit : '...'}</span>
        //         </p>
        //     </div>
        // </main>
        <main className="img-main">

            {/* ✅ KIỂM TRA ĐĂNG NHẬP TOÀN MÀN HÌNH */}
            {!token ? (
                // --- Trạng thái CHƯA ĐĂNG NHẬP ---
                <section className="img-hero img-full-center">
                    <div className="img-auth-box"> {/* SỬ DỤNG CLASS MỚI CHO HỘP ĐĂNG NHẬP */}
                        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
                            Bạn cần đăng nhập để sử dụng tính năng này
                        </h1>
                        <p className="text-gray-500 mb-6">
                            Vui lòng đăng nhập để bắt đầu tạo ảnh AI.
                        </p>
                        <a href="/auth/login" className="img-login-btn">
                            Đăng nhập
                        </a>
                    </div>
                </section>
            ) : (
                // --- Trạng thái ĐÃ ĐĂNG NHẬP ---
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

                        {/* VÙNG CUỘN LỊCH SỬ ẢNH */}
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
                                    {loading && (
                                        <div className="img-typing-indicator"> <span></span> </div>
                                    )}
                                    <div ref={listEndRef} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Thanh nhập liệu cố định */}
                    <div className="img-input-area">
                        <div className="img-composer" role="group" aria-label="Hộp nhập mô tả ảnh">
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
                                disabled={loading || !prompt.trim() || remainingCredit === 0 || (remainingCredit !== null && remainingCredit < cost)}
                            >
                                {loading ? (<FiLoader className="h-5 w-5 animate-spin" />) : (<FiSend className="h-5 w-5" />)}
                            </button>
                        </div>
                        <p className="img-disclaimer">
                            Mỗi lần tạo ảnh tốn <span className="font-semibold text-purple-600">{cost} credit</span>.
                            Credit còn lại: <span className="font-bold text-purple-600">{remainingCredit !== null ? remainingCredit : '...'}</span>
                        </p>
                    </div>
                </>
            )}
        </main>

    );
}

export default ImageGeneration;
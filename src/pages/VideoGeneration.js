import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Thay thế import react-icons/fi bằng các thành phần SVG nội tuyến để tránh lỗi module resolution.
const VideoIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
);
const SendIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);
const LoaderIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v2M20.5 5.5l-1.4 1.4M18 8h-2M15.5 5.5l1.4 1.4M12 2v2M8 8H6M3.5 5.5l1.4 1.4M2 12h2M3.5 18.5l1.4-1.4M6 16v2M5.5 20.5l1.4-1.4M12 20v2M18 16v2M20.5 18.5l-1.4-1.4"></path></svg>
);
const XCircleIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
);
const ExternalLinkIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
);
const UserIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const ApertureIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="14.31" y1="8" x2="20.05" y2="17.94"></line><line x1="9.69" y1="8" x2="2.95" y2="6.06"></line><line x1="12" y1="2" x2="12" y2="7.07"></line><line x1="12" y1="17" x2="12" y2="22"></line><line x1="20.05" y1="6.06" x2="14.31" y2="16"></line><line x1="3.95" y1="17.94" x2="9.69" y2="8"></line></svg>
);


const API_URL = process.env.REACT_APP_API_URL;

const ESTIMATED_CREDIT_COST = 50; 
const DEFAULT_VIDEO_TITLE = "My AI Video"; 

function VideoGeneration() {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [remainingCredit, setRemainingCredit] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const [videoHistory, setVideoHistory] = useState([]);

    const listEndRef = useRef(null);

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId'); 
    const cost = ESTIMATED_CREDIT_COST;

    const started = videoHistory.length > 0;

    // --- LOGIC CUỘN TỰ ĐỘNG ---
    useEffect(() => {
        if (listEndRef.current) {
            listEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [videoHistory, loading]);


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
        const handleNewVideoGeneration = () => {
            setVideoHistory([]); 
            setPrompt('');      
        };
        window.addEventListener('newVideoGeneration', handleNewVideoGeneration);
        return () => window.removeEventListener('newVideoGeneration', handleNewVideoGeneration);
    }, []);

    useEffect(() => {
        fetchInitialCredit();
        const handleCreditUpdate = () => {
            fetchInitialCredit();
        };
        window.addEventListener('creditUpdated', handleCreditUpdate);
        return () => window.removeEventListener('creditUpdated', handleCreditUpdate);
    }, [token, API_URL]);


    // --- Xử lý Mở đường dẫn video ---
    const handleOpenVideo = useCallback((url) => {
        if (url) {
            toast.info("Đang mở URL kết quả trong tab mới. Vui lòng kiểm tra trạng thái video trực tiếp tại đó.", { autoClose: 5000 });
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            toast.error("Không mở được đường dẫn video!");
        }
    }, []);

    // --- Xử lý tạo Video ---
    const handleSubmit = useCallback(async () => {
        if (!token || !userId) {
            toast.error('Vui lòng đăng nhập để tạo video.', { autoClose: 2000 });
            navigate('/auth/login');
            return;
        }

        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt) {
            setErrorMessage('Vui lòng nhập mô tả (prompt) cho video.');
            return;
        }

        if (remainingCredit !== null && remainingCredit < cost) {
            setErrorMessage(`Không đủ credit. Cần ${cost} credit.`);
            toast.error(`Bạn không đủ credit! (Cần ${cost})`, { autoClose: 3000 });
            return;
        }

        // Thêm prompt của người dùng vào lịch sử
        const userPromptMsg = { role: 'user', content: trimmedPrompt, type: 'text' };
        
        // Tin nhắn loading: Cập nhật nội dung để phản ánh quá trình chờ đợi LÂU trên backend (mô hình blocking)
        const loadingMsgId = Date.now();
        const loadingMessage = { 
            id: loadingMsgId,
            role: 'assistant', 
            content: "Yêu cầu đã được gửi. Video đang được tạo trên máy chủ. Quá trình này **có thể mất từ 1-5 phút**. Vui lòng không đóng tab.", 
            type: 'loading_msg' 
        };

        setVideoHistory(prev => [
            ...prev,
            userPromptMsg,
            loadingMessage 
        ]);

        setLoading(true);
        setPrompt('');
        setErrorMessage('');
        
        // Hàm trợ giúp để tìm và xóa tin nhắn loading
        const clearLoadingMessage = () => {
             setVideoHistory(prev => prev.filter(msg => msg.id !== loadingMsgId));
        };

        try {
            const urlParams = new URLSearchParams({ prompt: trimmedPrompt });
            const fetchUrl = `${API_URL}/videos/generate-video?${urlParams.toString()}`;
            
            const res = await fetch(fetchUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const responseText = await res.text();
            clearLoadingMessage(); // Xóa tin nhắn loading khi có phản hồi

            if (!res.ok) {
                let errorMsg = responseText;
                try {
                    const errorJson = JSON.parse(responseText);
                    errorMsg = errorJson.error || errorMsg; 
                } catch (e) {
                    errorMsg = responseText.replace('ERROR: ', '');
                }

                setVideoHistory(prev => [
                    ...prev,
                    { role: 'assistant', content: errorMsg, type: 'error' }
                ]);

                throw new Error(errorMsg || 'Lỗi không xác định khi tạo video.');
            }

            const responseJson = JSON.parse(responseText);
            const videoUrlResult = responseJson.videoUrl; 

            if (!videoUrlResult || videoUrlResult.length < 10) {
                throw new Error("API đã thành công nhưng không trả về đường dẫn video hợp lệ.");
            }

            setVideoHistory(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: videoUrlResult,
                    type: 'video', 
                    prompt: trimmedPrompt
                }
            ]);

            setRemainingCredit(prev => (prev !== null ? prev - cost : prev));
            toast.success("✅ Video đã hoàn thành! Vui lòng bấm 'Mở Video' để xem.", { autoClose: 3000 });
            window.dispatchEvent(new Event('creditUpdated'));

        } catch (err) {
            console.error('Lỗi tạo video:', err);
            clearLoadingMessage(); 
            
            const finalErrorMsg = err.message || 'Lỗi kết nối hoặc hết thời gian chờ (timeout). Video có thể vẫn đang được tạo trên máy chủ.';
            
            setVideoHistory(prev => {
                if (!prev.some(msg => msg.type === 'error' && msg.content === finalErrorMsg)) {
                    return [
                        ...prev,
                        { role: 'assistant', content: finalErrorMsg, type: 'error' }
                    ];
                }
                return prev;
            });

        } finally {
            setLoading(false);
        }
    }, [token, userId, prompt, remainingCredit, cost, navigate, API_URL]);

    // --- Component Hiển thị Video/Phản hồi ---
    const RenderMessageContent = useCallback(({ message }) => {
        // User Prompt
        if (message.role === 'user') {
            return (
                <div className="flex items-start space-x-3 p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
                    <UserIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                </div>
            );
        }
        
        // Video Result - ĐÃ SỬA ĐỔI ĐỂ NHÚNG THẺ <video>
        if (message.type === 'video') {
            return (
                <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-purple-200 w-full max-w-lg mx-auto"> 
                    <p className="text-sm text-gray-700 mb-3 font-semibold">
                        Yêu cầu: <span className="text-purple-700 font-normal italic">"{message.prompt}"</span>
                    </p>
                    
                    {/* THẺ VIDEO ĐÃ ĐƯỢC THÊM */}
                    <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-300 mb-4">
                        <video
                            key={message.content} // Quan trọng: Buộc render lại khi URL thay đổi
                            controls 
                            autoPlay={false} 
                            muted // Nên để muted nếu muốn autoplay
                            className="w-full h-full object-cover"
                            poster="https://via.placeholder.com/640x360?text=AI+Video+Result" 
                        >
                            <source src={message.content} type="video/mp4" />
                            Trình duyệt của bạn không hỗ trợ thẻ video.
                        </video>
                    </div>
                    
                    <div className="flex justify-center"> 
                        <button 
                            onClick={() => handleOpenVideo(message.content)} 
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition duration-150 shadow-md hover:shadow-lg text-sm"
                            title="Mở video kết quả trong tab mới"
                        >
                            <ExternalLinkIcon className="h-4 w-4" /> 
                            <span>Mở Video (URL Tab Mới)</span>
                        </button>
                    </div>
                </div>
            );
        }

        // Error Message
        if (message.type === 'error') {
            return (
                <div className="flex items-start space-x-3 p-3 bg-red-100 border border-red-400 text-red-800 rounded-lg"> 
                    <XCircleIcon className="w-5 h-5 flex-shrink-0 mt-1" />
                    <div>
                        <strong>Lỗi quan trọng:</strong> 
                        <p className="text-sm mt-1">{message.content}</p>
                    </div>
                </div>
            );
        }

        // Loading Message (Assistant)
        if (message.type === 'loading_msg') {
            return (
                <div className="flex items-start space-x-3 p-3 bg-yellow-100/80 border border-yellow-300 text-yellow-800 rounded-lg animate-pulse"> 
                    <LoaderIcon className="w-5 h-5 flex-shrink-0 mt-1 animate-spin" />
                    <div className="text-sm font-medium">
                        {message.content}
                    </div>
                </div>
            );
        }
        
        // Default (shouldn't happen for assistant)
        return <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>;
    }, [handleOpenVideo]);

    return (
        <main className="flex flex-col h-screen bg-gray-50 font-sans antialiased"> 

            {/* ✅ KIỂM TRA ĐĂNG NHẬP TOÀN MÀN HÌNH */}
            {!token ? (
                // --- Trạng thái CHƯA ĐĂNG NHẬP ---
                <section className="flex flex-1 items-center justify-center p-4"> 
                    <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl text-center"> 
                        <ApertureIcon className="text-purple-600 w-12 h-12 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800 mb-3">
                            Tạo Video AI
                        </h1>
                        <p className="text-gray-500 mb-6">
                            Vui lòng đăng nhập để bắt đầu tạo video bằng mô tả văn bản.
                        </p>
                        <a href="/auth/login" className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition duration-200 shadow-md"> 
                            Đăng nhập ngay
                        </a>
                    </div>
                </section>
            ) : (
                // --- Trạng thái ĐÃ ĐĂNG NHẬP ---
                <>
                    <section className="flex-1 overflow-hidden flex flex-col pt-4"> 
                        {!started && (
                            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto"> 
                                <VideoIcon className="text-purple-500 w-20 h-20 mb-6 bg-purple-100 p-4 rounded-full shadow-inner" />
                                <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Tạo Video AI Sáng Tạo</h1>
                                <p className="text-gray-500 text-lg">Mô tả chi tiết, rõ ràng nội dung video bạn muốn tạo để có kết quả tốt nhất.</p>
                                
                                {/* Dùng error message ở đây nếu có */}
                                {errorMessage && (
                                    <div className="mt-6 p-4 w-full bg-red-100 border border-red-400 text-red-800 rounded-lg flex items-center space-x-3">
                                        <XCircleIcon className="text-red-500 w-5 h-5 flex-shrink-0" />
                                        <p className="text-sm font-medium">{errorMessage}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* VÙNG CUỘN LỊCH SỬ VIDEO */}
                        <div className={`overflow-y-auto px-4 sm:px-8 pb-4 ${started ? 'flex-grow' : 'flex-grow-0'}`}> 
                            <div className="max-w-3xl mx-auto space-y-4"> 
                                {videoHistory.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}> 
                                        <div className={`max-w-[90%] md:max-w-[75%] lg:max-w-[60%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}> 
                                            <RenderMessageContent message={msg} />
                                        </div>
                                    </div>
                                ))}
                                <div ref={listEndRef} className="pt-4" />
                            </div>
                        </div>
                    </section>

                    {/* Thanh nhập liệu cố định */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-xl"> 
                        <div className="max-w-3xl mx-auto">
                            <div className="flex space-x-3 items-end"> 
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Mô tả chi tiết video bạn muốn tạo..."
                                    rows={1}
                                    className="flex-1 resize-none border border-gray-300 p-3 rounded-xl focus:ring-purple-500 focus:border-purple-500 transition duration-150 overflow-hidden min-h-[48px] max-h-[150px] shadow-inner"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit();
                                        }
                                    }}
                                    disabled={loading}
                                />
                                <button
                                    className={`flex items-center justify-center w-12 h-12 rounded-full transition duration-200 shadow-lg ${
                                        loading || !prompt.trim() || remainingCredit === 0 || (remainingCredit !== null && remainingCredit < cost)
                                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                        : 'bg-purple-600 text-white hover:bg-purple-700'
                                    }`}
                                    title="Tạo video"
                                    onClick={handleSubmit}
                                    disabled={loading || !prompt.trim() || remainingCredit === 0 || (remainingCredit !== null && remainingCredit < cost)}
                                >
                                    {loading ? (<LoaderIcon className="h-6 w-6 animate-spin" />) : (<SendIcon className="h-6 w-6" />)}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-right"> 
                                Mỗi lần tạo video tốn <span className="font-semibold text-purple-600">{cost} credit</span>.
                                Credit còn lại: <span className="font-bold text-purple-600">{remainingCredit !== null ? remainingCredit.toLocaleString() : '...'}</span>
                            </p>
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}

export default VideoGeneration;
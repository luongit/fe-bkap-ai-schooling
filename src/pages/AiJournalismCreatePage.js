import React, { useState, useEffect } from "react";
import { Calendar, Clock, FileText, Send } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../services/apiToken"; // axios instance có refresh token

export default function AiJournalismCreatePage() {
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({
        title: "",
        theme: "",
        description: "",
        startDate: "",
        endDate: "",
        submissionStart: "",
        submissionEnd: "",
        status: "ACTIVE",
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/profile");
                const me = res.data;
                setUser(me);

                // 🧱 CHẶN học sinh
                if (me.objectType === "STUDENT") {
                    toast.error("Bạn không có quyền truy cập trang này!");
                    // Chuyển hướng về trang cuộc thi
                    window.location.href = "//403";
                }
            } catch (err) {
                console.error("Không thể lấy profile:", err);
                toast.error("Không thể lấy thông tin người dùng!");
                // Nếu chưa đăng nhập thì quay về login
                window.location.href = "/login";
            }
        })();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title) return toast.error("Tên cuộc thi là bắt buộc!");

        setLoading(true);
        try {
            const res = await api.post(`/journalism/create?creatorId=${user.userId}`, form); // hoặc lấy userId từ token/profile
            toast.success("🎉 Tạo cuộc thi thành công!");
            console.log("Created contest:", res.data);

            // Reset form
            setForm({
                title: "",
                theme: "",
                description: "",
                startDate: "",
                endDate: "",
                submissionStart: "",
                submissionEnd: "",
                status: "ACTIVE",
            });
        } catch (err) {
            console.error("Lỗi tạo cuộc thi:", err);
            toast.error("Không thể tạo cuộc thi!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-inter py-10">
            <Toaster position="top-right" />

            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8 border border-gray-200">
                <h1 className="text-3xl font-bold text-purple-700 mb-2">
                    🏆 Tạo Cuộc Thi Mới
                </h1>
                <p className="text-gray-500 mb-6">
                    Nhập thông tin bên dưới để khởi tạo cuộc thi mới cho học sinh.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tên cuộc thi */}
                    <div>
                        <label className="font-semibold block mb-1">Tên cuộc thi *</label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="Ví dụ: AI Nhà Báo Nhí 2025"
                            required
                        />
                    </div>

                    {/* Chủ đề */}
                    <div>
                        <label className="font-semibold block mb-1">Chủ đề</label>
                        <input
                            type="text"
                            name="theme"
                            value={form.theme}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="Ví dụ: Ngôi trường em yêu"
                        />
                    </div>

                    {/* Mô tả */}
                    <div>
                        <label className="font-semibold block mb-1">Mô tả</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="Mô tả chi tiết về cuộc thi..."
                        />
                    </div>

                    {/* Ngày bắt đầu - kết thúc */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold block mb-1 flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-purple-500" /> Ngày bắt đầu
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="font-semibold block mb-1 flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-purple-500" /> Ngày kết thúc
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Thời gian mở / đóng nộp bài */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold block mb-1 flex items-center gap-1">
                                <Clock className="h-4 w-4 text-purple-500" /> Bắt đầu nhận bài
                            </label>
                            <input
                                type="datetime-local"
                                name="submissionStart"
                                value={form.submissionStart}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="font-semibold block mb-1 flex items-center gap-1">
                                <Clock className="h-4 w-4 text-purple-500" /> Kết thúc nhận bài
                            </label>
                            <input
                                type="datetime-local"
                                name="submissionEnd"
                                value={form.submissionEnd}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Trạng thái */}
                    <div>
                        <label className="font-semibold block mb-1">Trạng thái</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="DRAFT">DRAFT</option>
                            <option value="CLOSED">CLOSED</option>
                        </select>
                    </div>

                    {/* Nút tạo */}
                    <div className="text-right pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-700 to-fuchsia-500 text-white px-5 py-2 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-60"
                        >
                            <Send className="h-4 w-4" />
                            {loading ? "Đang tạo..." : "Tạo cuộc thi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

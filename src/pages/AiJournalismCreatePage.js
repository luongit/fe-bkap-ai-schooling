import React, { useState, useEffect } from "react";
import { Calendar, Clock, Send, Plus, Trash2, Scale } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../services/apiToken"; // axios instance có refresh token

export default function AiJournalismCreatePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    // luu anh bia cuoc thi va xem truoc anh bia cuoc thi
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);

    const [form, setForm] = useState({
        title: "",
        theme: "",
        description: "",
        startDate: "",
        endDate: "",
        submissionStart: "",
        submissionEnd: "",
        status: "ACTIVE",
        rubrics: [
            { criterion: "", description: "", weight: 0.25 }
        ],
    });

    // ===== Lấy thông tin người dùng =====
    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/profile");
                const me = res.data;
                setUser(me);

                if (me.objectType === "STUDENT") {
                    toast.error("Bạn không có quyền truy cập trang này!");
                    window.location.href = "/403";
                }
            } catch (err) {
                console.error("Không thể lấy profile:", err);
                toast.error("Không thể lấy thông tin người dùng!");
                window.location.href = "/login";
            }
        })();
    }, []);

    // ===== Xử lý form =====
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    // ===== Xử lý tiêu chí chấm điểm =====
    const handleRubricChange = (index, field, value) => {
        const updated = [...form.rubrics];
        updated[index][field] = value;
        setForm({ ...form, rubrics: updated });
    };

    const addRubric = () => {
        setForm({
            ...form,
            rubrics: [...form.rubrics, { criterion: "", description: "", weight: 0.25 }],
        });
    };

    const removeRubric = (index) => {
        const updated = form.rubrics.filter((_, i) => i !== index);
        setForm({ ...form, rubrics: updated });
    };

    // ===== Gửi request tạo cuộc thi =====
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return toast.error("Tên cuộc thi là bắt buộc!");

        setLoading(true);
        try {
            const totalScore = form.rubrics.reduce(
                (sum, r) => sum + parseFloat(r.weight || 0),
                0
            );
            // upload cover ảnh bìa cuộc thi
            const formData = new FormData();
            formData.append(
                "dto",
                new Blob([JSON.stringify({ ...form, totalScore })], {
                    type: "application/json",
                })
            );

            if (coverFile) formData.append("cover", coverFile);
            const res = await api.post(
                `/journalism/create?creatorId=${user.userId}`,
                formData
            );

            toast.success("🎉 Tạo cuộc thi thành công!");
            console.log("Created contest:", res.data);

            // ♻️ Reset form
            setForm({
                title: "",
                theme: "",
                description: "",
                startDate: "",
                endDate: "",
                submissionStart: "",
                submissionEnd: "",
                status: "ACTIVE",
                rubrics: [{ criterion: "", description: "", weight: 0 }],
            });
            if (coverPreview) URL.revokeObjectURL(coverPreview);
            setCoverFile(null);
            setCoverPreview(null);
        } catch (err) {
            console.error("🔥 Lỗi tạo cuộc thi:", err);
            if (err.response) {
                console.error("🧩 Response status:", err.response.status);
                console.error("📜 Response data:", err.response.data);
                toast.error(
                    `Không thể tạo cuộc thi (${err.response.status}): ${err.response.data.message || "Lỗi không xác định"
                    }`
                );
            } else {
                toast.error("Không thể tạo cuộc thi (Lỗi mạng hoặc server)");
            }
        } finally {
            setLoading(false);
        }
    };



    // ===== UI =====
    return (
        <div className="min-h-screen bg-gray-50 font-inter py-10">
            <Toaster position="top-right" />

            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8 border border-gray-200">
                <h1 className="text-3xl font-bold text-purple-700 mb-2">
                    🏆 Tạo Cuộc Thi Mới
                </h1>
                <p className="text-gray-500 mb-6">
                    Nhập thông tin bên dưới để khởi tạo cuộc thi và tiêu chí chấm điểm.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Thông tin cơ bản */}
                    <div className="space-y-4">
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
                    </div>

                    {/* Thời gian */}
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
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="font-semibold block mb-1 flex items-center gap-1">
                                <Clock className="h-4 w-4 text-purple-500" /> Bắt đầu nhận bài
                            </label>
                            <input
                                type="datetime-local"
                                name="submissionStart"
                                value={form.submissionStart}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* Tiêu chí chấm điểm */}
                    <div className="pt-4 border-t border-gray-200">
                        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-purple-700">
                            <Scale className="h-5 w-5" /> Tiêu chí chấm điểm
                        </h2>

                        {form.rubrics.map((rubric, index) => (
                            <div
                                key={index}
                                className="border rounded-lg p-4 mb-3 bg-gray-50 relative"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="font-semibold block mb-1">Tên tiêu chí</label>
                                        <input
                                            type="text"
                                            value={rubric.criterion}
                                            onChange={(e) =>
                                                handleRubricChange(index, "criterion", e.target.value)
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            placeholder="VD: Nội dung sáng tạo"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-semibold block mb-1">Mô tả</label>
                                        <input
                                            type="text"
                                            value={rubric.description}
                                            onChange={(e) =>
                                                handleRubricChange(index, "description", e.target.value)
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            placeholder="Giải thích ngắn..."
                                        />
                                    </div>
                                    <div>
                                        <label className="font-semibold block mb-1">Điểm tối đa</label>
                                        <input
                                            type="number"
                                            step="1"
                                            min="0"
                                            value={rubric.weight}
                                            onChange={(e) =>
                                                handleRubricChange(index, "weight", e.target.value)
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            placeholder="VD: 25"
                                        />
                                    </div>
                                </div>

                                {form.rubrics.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeRubric(index)}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* Nút thêm tiêu chí */}
                        <button
                            type="button"
                            onClick={addRubric}
                            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 mt-2"
                        >
                            <Plus className="h-4 w-4" /> Thêm tiêu chí
                        </button>

                        {/* ✅ Hiển thị tổng điểm */}
                        <div className="mt-4 text-sm font-semibold text-gray-700 flex items-center gap-2">
                            {(() => {
                                const total = form.rubrics.reduce(
                                    (sum, r) => sum + parseFloat(r.weight || 0),
                                    0
                                );
                                return (
                                    <p className="mt-1 text-blue-600">
                                        💯 Tổng điểm tối đa của bài thi: {total.toFixed(2)} điểm
                                    </p>
                                );
                            })()}
                        </div>
                    </div>


                    {/* Trạng thái */}
                    <div>
                        <label className="font-semibold block mb-1">Trạng thái</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="DRAFT">DRAFT</option>
                            <option value="CLOSED">CLOSED</option>
                        </select>
                    </div>


                    {/* Chọn ảnh bìa cuộc thi */}
                    <div>
                        <label className="font-semibold block mb-1">Ảnh bìa cuộc thi</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (coverPreview) URL.revokeObjectURL(coverPreview);
                                setCoverFile(file);
                                if (file) setCoverPreview(URL.createObjectURL(file));
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />

                        {coverPreview && (
                            <img
                                src={coverPreview}
                                alt="Xem trước ảnh bìa cuộc thi"
                                className="mt-2 w-full h-[500px] object-cover rounded-lg border"
                            />
                        )}
                    </div>


                    {/* Nút tạo */}
                    <div className="text-right pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white rounded-xl bg-gradient-to-r from-green-400 via-blue-500 to-cyan-500 hover:scale-105 transition-transform disabled:opacity-50">
                            <Send className="h-5 w-5" />
                            {loading ? "Đang tạo..." : "Tạo cuộc thi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

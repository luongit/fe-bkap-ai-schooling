import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Error403Page() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-3xl font-bold mb-2 text-gray-800">403 - Truy cập bị từ chối</h1>
            <p className="text-gray-600 mb-6">
                Bạn không có quyền truy cập trang này. Vui lòng quay lại trang chủ hoặc đăng nhập bằng tài khoản khác.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={() => navigate("/")}
                    className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                    Trang chủ
                </button>
                <button
                    onClick={() => navigate(-1)}
                    className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                    Quay lại
                </button>
            </div>
        </div>
    );
}

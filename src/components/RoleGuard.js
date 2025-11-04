import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/apiToken";
import LoadingOverlay from "./LoadingOverlay"; // bạn có thể tạo hoặc bỏ qua

export default function RoleGuard({ allowRoles = [] }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/profile"); // hoặc /api/profile
                setUser(res.data);
            } catch (e) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return <LoadingOverlay message="Đang kiểm tra quyền truy cập..." />;

    if (!user) return <Navigate to="/login" replace />;
    if (!allowRoles.includes(user.role)) return <Navigate to="/403" replace />;

    return <Outlet />; // ✅ render các route con (nếu đủ quyền)
}

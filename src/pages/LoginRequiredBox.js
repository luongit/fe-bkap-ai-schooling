import { LogIn } from "lucide-react";

export default function LoginRequiredBox() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="relative w-full max-w-md">
        {/* Hiệu ứng nền mờ + bóng */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0ea5e9]/20 to-[#38bdf8]/20 rounded-3xl blur-3xl -z-10 animate-pulse" />
        
        {/* Card chính */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="p-10 text-center">
            {/* Icon lớn + hiệu ứng gradient */}
            <div className="mx-auto w-24 h-24 mb-8 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] flex items-center justify-center shadow-xl">
              <LogIn className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>

            {/* Tiêu đề */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Chào mừng bạn trở lại!
            </h2>

            {/* Mô tả */}
            <p className="text-lg text-gray-600 leading-relaxed mb-10">
              Bạn cần đăng nhập để tiếp tục trò chuyện, xem bài dự thi<br />
              và sử dụng tất cả tính năng của hệ thống
            </p>

            {/* Nút đăng nhập SIÊU ĐẸP */}
            <a
              href="/auth/login"
              className="group relative inline-flex items-center justify-center w-full py-5 px-8 
                         text-white font-bold text-xl rounded-2xl
                         bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]
                         shadow-xl hover:shadow-2xl 
                         transform hover:scale-105 active:scale-100
                         transition-all duration-300 overflow-hidden"
            >
              {/* Hiệu ứng sáng lướt */}
              <span className="absolute inset-0 w-full h-full bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              
              <LogIn className="w-6 h-6 mr-3 group-hover:translate-x-1 transition-transform" />
              Đăng nhập ngay
              <span className="ml-3 group-hover:translate-x-2 transition-transform">→</span>
            </a>

            {/* Dòng nhỏ xinh phía dưới */}
            <p className="mt-8 text-sm text-gray-500">
              Chưa có tài khoản?{" "}
              <a href="/register" className="text-[#0ea5e9] font-semibold hover:underline">
                Đăng ký miễn phí
              </a>
            </p>
          </div>

          {/* Hiệu ứng hạt li ti trang trí */}
          <div className="absolute top-4 right-4 w-32 h-32 bg-[#0ea5e9]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-6 left-6 w-40 h-40 bg-[#38bdf8]/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}
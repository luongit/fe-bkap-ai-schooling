import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiCheckCircle,
  FiZap,
  FiShield,
  FiTrendingUp,
  FiClock,
  FiMessageCircle,
} from "react-icons/fi";
import "../style/pricing.css";

const PRICING_PLANS = [
  {
    name: "Gói Khởi Động",
    description: "Phù hợp cho học sinh làm quen với BKAP AI và trải nghiệm các thao tác cơ bản.",
    price: "Miễn phí",
    ctaLabel: "Bắt đầu dùng ngay",
    ctaLink: "/",
    features: [
      "100 credit tặng mỗi tháng",
      "Chat AI cơ bản với bộ câu hỏi thường gặp",
      "Giải bài tập với thời gian phản hồi chuẩn hóa",
      "Lịch sử thao tác lưu tối đa 10 phiên",
    ],
  },
  {
    name: "Gói Tăng Tốc",
    description: "Đáp ứng nhu cầu học tập chuyên sâu với số credit linh hoạt theo thao tác.",
    price: "199.000đ / tháng",
    highlight: "Phổ biến",
    ctaLabel: "Nâng cấp",
    ctaLink: "https://bkapai.vn/register",
    features: [
      "1.500 credit mỗi tháng (mua thêm bất kỳ lúc nào)",
      "Chat AI chuyên sâu với bộ nhớ ngữ cảnh dài",
      "Viết văn AI với 20 chủ đề chuẩn chương trình BKAP",
      "Tạo ảnh minh họa tốc độ cao (20 credit/lượt)",
      "Ưu tiên hỗ trợ kỹ thuật trong giờ hành chính",
    ],
  },
  {
    name: "Gói Doanh Nghiệp",
    description: "Thiết kế riêng cho trung tâm, lớp học lớn cần quản trị học viên và báo cáo.",
    price: "Liên hệ",
    ctaLabel: "Đặt lịch tư vấn",
    ctaLink: "https://bkapai.vn/register",
    features: [
      "Credit linh hoạt theo hợp đồng (bắt đầu từ 10.000 credit)",
      "Đồng bộ tài khoản học viên và phân quyền theo vai trò",
      "Báo cáo tiến độ học tập theo tuần/tháng",
      "Tích hợp LMS và API tùy chỉnh",
      "Quản lý thao tác và giới hạn chi phí theo nhóm",
      "Chuyên viên hỗ trợ riêng 24/7",
    ],
  },
];

const ACTION_COSTS = [
  {
    label: "Chat AI (1 phiên gồm 20 lượt hội thoại)",
    credit: "25 credit",
    detail: "Tự động tối ưu để tiết kiệm credit khi câu trả lời ngắn.",
  },
  {
    label: "Giải bài tập có kèm lời giải từng bước",
    credit: "40 credit",
    detail: "Bao gồm phân tích đề, gợi ý phương pháp và lời giải chi tiết.",
  },
  {
    label: "Viết văn AI đầy đủ (700 - 1.000 chữ)",
    credit: "60 credit",
    detail: "Được phép chỉnh sửa bản nháp 2 lần trong 24 giờ.",
  },
  {
    label: "Tạo ảnh minh họa độ phân giải cao",
    credit: "20 credit",
    detail: "Xuất PNG nền trong, giới hạn 6 ảnh/ngày với gói miễn phí.",
  },
  {
    label: "Phân tích báo cáo học tập PDF",
    credit: "80 credit",
    detail: "Hỗ trợ tải lên tối đa 15 trang, trả kết quả trong vòng 2 phút.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Credit có hết hạn không?",
    answer:
      "Credit trong cùng chu kỳ thanh toán sẽ hết hạn sau 30 ngày. Với gói Doanh Nghiệp, credit được cộng dồn theo điều khoản hợp đồng.",
  },
  {
    question: "Có thể mua thêm credit khi đang sử dụng gói không?",
    answer:
      "Bạn có thể mua thêm credit bất kỳ lúc nào từ trang quản lý tài khoản. Credit mua thêm sẽ được cộng ngay lập tức và áp dụng cho toàn bộ tính năng.",
  },
  {
    question: "BKAP AI có giới hạn số thiết bị không?",
    answer:
      "Mỗi tài khoản cá nhân đăng nhập tối đa trên 3 thiết bị. Gói Doanh Nghiệp hỗ trợ quản lý theo vai trò và không giới hạn thiết bị.",
  },
  {
    question: "Làm sao để quản lý chi phí thao tác cho học viên?",
    answer:
      "Bạn có thể cấu hình hạn mức credit theo ngày hoặc theo thao tác. Khi gần chạm ngưỡng, hệ thống tự động gửi thông báo đến giáo viên phụ trách.",
  },
];


function PricingPage() {
  useEffect(() => {
    document.title = "Bảng giá chi phí thao tác | BKAP AI";
    document.body.classList.add("allow-body-scroll");
    return () => {
      document.body.classList.remove("allow-body-scroll");
    };
  }, []);

  return (
    <div className="pricing-page bg-gray-50 min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-6xl mx-auto space-y-16">
        <section className="text-center space-y-6">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
            <FiZap className="h-4 w-4" />
            Bảng giá chi phí thao tác
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
            Linh hoạt theo thao tác, tối ưu chi phí cho từng phiên làm việc
          </h1>
          <p className="mx-auto max-w-3xl text-gray-600 text-lg">
            BKAP AI sử dụng credit để đo lường mọi thao tác: từ chat, giải bài tập, viết văn cho đến tạo ảnh.
            Chọn gói phù hợp hoặc liên hệ để nhận tư vấn tùy biến theo nhu cầu học tập và giảng dạy.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
            >
              Dùng thử miễn phí
            </Link>
            <a
              href="https://bkapai.vn/register"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-purple-200 text-purple-700 font-semibold hover:bg-purple-50 transition"
            >
              Tư vấn nâng cấp
            </a>
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative h-full rounded-2xl border bg-white shadow-sm hover:shadow-md transition ${plan.highlight ? "border-purple-500" : "border-gray-200"
                }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-purple-600 text-white text-sm font-semibold shadow">
                  {plan.highlight}
                </span>
              )}

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-gray-900">{plan.name}</h2>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>
                <div className="text-3xl font-bold text-purple-600">{plan.price}</div>
                <a
                  href={plan.ctaLink}
                  target={plan.ctaLink.startsWith("http") ? "_blank" : undefined}
                  rel={plan.ctaLink.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-flex w-full items-center justify-center px-5 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
                >
                  {plan.ctaLabel}
                </a>
                <ul className="space-y-2 pt-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
                      <FiCheckCircle className="mt-0.5 h-4 w-4 text-purple-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Chi tiết credit cho từng thao tác</h2>
                <p className="text-gray-600">
                  Theo dõi rõ ràng chi phí để phân bổ ngân sách và quản lý hạn mức cho học viên.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                <FiTrendingUp className="h-4 w-4" />
                Chi phí tự động tối ưu theo độ dài thao tác
              </div>
            </div>

            <div className="overflow-hidden border border-gray-200 rounded-xl">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wide">
                      Thao tác
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wide">
                      Credit tiêu tốn
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wide">
                      Ghi chú
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {ACTION_COSTS.map((item) => (
                    <tr key={item.label} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">{item.label}</td>
                      <td className="px-6 py-4 text-purple-600 font-semibold">{item.credit}</td>
                      <td className="px-6 py-4 text-gray-600">{item.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          <div className="p-6 md:p-8 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl shadow-lg space-y-6">
            <div className="flex items-center gap-3">
              <FiShield className="h-6 w-6" />
              <h3 className="text-xl font-semibold">Quản lý chi phí thông minh</h3>
            </div>
            <p className="text-purple-50">
              BKAP AI cung cấp bảng điều khiển chi tiết giúp bạn phân bổ credit theo lớp, môn học hoặc từng học viên.
              Thiết lập cảnh báo khi sắp chạm hạn mức và tự động khóa thao tác vượt giới hạn để bảo vệ ngân sách.
            </p>
            <ul className="space-y-2 text-sm text-purple-100">
              <li className="flex items-start gap-2">
                <FiClock className="mt-0.5 h-4 w-4" />
                Theo dõi thời gian sử dụng và lịch sử thao tác theo phút.
              </li>
              <li className="flex items-start gap-2">
                <FiMessageCircle className="mt-0.5 h-4 w-4" />
                Báo cáo chi tiết theo loại thao tác: chat, viết văn, tạo ảnh, phân tích tài liệu.
              </li>
              <li className="flex items-start gap-2">
                <FiTrendingUp className="mt-0.5 h-4 w-4" />
                Gợi ý nâng gói khi nhu cầu tăng đột biến trong kỳ thi.
              </li>
            </ul>
          </div>
          <div className="p-6 md:p-8 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Câu hỏi thường gặp</h3>
            <ul className="space-y-5">
              {FAQ_ITEMS.map((item) => (
                <li key={item.question} className="space-y-2">
                  <p className="font-medium text-gray-900">{item.question}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

export default PricingPage;

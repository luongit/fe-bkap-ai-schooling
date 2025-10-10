import { useState } from "react";
import axios from "axios";

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState({});
    const [success, setSuccess] = useState("");

    const [studentInfo, setStudentInfo] = useState({
        username: "",
        email: "",
        phone: "",
        fullName: "",

        birthdate: "",
        hobbies: "",
    });

    const [parentInfo, setParentInfo] = useState({
        username: "",
        name: "",
        email: "",
        phone: "",
        address: "",
    });

    const checkUsernameExists = async (username) => {
        try {
            const res = await axios.get(`http://localhost:8080/api/auth/check-username?username=${username}`);
            return res.data.exists; // true nếu username đã tồn tại
        } catch (err) {
            console.error("Lỗi kiểm tra username:", err);
            return false;
        }
    };

    const checkEmailExists = async (email) => {
        try {
            const res = await axios.get(`http://localhost:8080/api/auth/check-email?email=${email}`);
            return res.data.exists; // true nếu email đã tồn tại
        } catch (err) {
            console.error("Lỗi kiểm tra email:", err);
            return false;
        }
    };

    // Hàm validate email
    const isValidEmail = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Hàm validate phone (10-15 số)
    const isValidPhone = (phone) =>
        /^\d{10,15}$/.test(phone);

    const handleNext = () => {
        if (!role) {
            setError({ step: "Vui lòng chọn vai trò của bạn" });
            return;
        }
        setError({});
        setStep(2);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        let errs = {};

        // Regex: chỉ cho phép chữ, số, dấu gạch dưới, không khoảng trắng, không dấu
        const usernameRegex = /^[a-zA-Z0-9_]+$/;

        // --- VALIDATE CHUNG ---
        if (!password) errs.password = "Mật khẩu bắt buộc";
        if (!confirmPassword) errs.confirmPassword = "Nhập lại mật khẩu bắt buộc";
        if (password && confirmPassword && password !== confirmPassword)
            errs.confirmPassword = "Mật khẩu nhập lại không khớp";

        // --- VALIDATE STUDENT ---
        if (role === "student") {
            // Tên đăng nhập
            if (!studentInfo.username) errs.username = "Tên đăng nhập bắt buộc";
            else if (!usernameRegex.test(studentInfo.username))
                errs.username = "Tên đăng nhập chỉ được chứa chữ, số, dấu gạch dưới, không dấu và không cách";

            // Họ và tên
            if (!studentInfo.fullName || studentInfo.fullName.trim() === "")
                errs.fullName = "Họ và tên bắt buộc";
            else if (studentInfo.fullName.length < 2)
                errs.fullName = "Họ và tên quá ngắn";

            // Ngày sinh
            if (!studentInfo.birthdate)
                errs.birthdate = "Ngày sinh bắt buộc";
            else {
                const birthDate = new Date(studentInfo.birthdate);
                const now = new Date();
                if (birthDate > now)
                    errs.birthdate = "Ngày sinh không hợp lệ (không thể ở tương lai)";
            }

            // Email
            if (!studentInfo.email) errs.email = "Email bắt buộc";
            else if (!isValidEmail(studentInfo.email)) errs.email = "Email không hợp lệ";

            // Số điện thoại
            if (!studentInfo.phone) errs.phone = "Số điện thoại bắt buộc";
            else if (!isValidPhone(studentInfo.phone)) errs.phone = "Số điện thoại không hợp lệ";
        }
        // --- VALIDATE PARENT ---
        if (role === "parent") {
            if (!parentInfo.username) errs.username = "Tên đăng nhập bắt buộc";
            else if (!usernameRegex.test(parentInfo.username))
                errs.username = "Tên đăng nhập chỉ được chứa chữ, số, dấu gạch dưới, không dấu và không cách";

            if (!parentInfo.name) errs.name = "Họ tên bắt buộc";

            if (!parentInfo.email) errs.email = "Email bắt buộc";
            else if (!isValidEmail(parentInfo.email)) errs.email = "Email không hợp lệ";

            if (!parentInfo.phone) errs.phone = "Số điện thoại bắt buộc";
            else if (!isValidPhone(parentInfo.phone)) errs.phone = "Số điện thoại không hợp lệ";
        }

        // --- CHECK USERNAME/EMAIL TỒN TẠI ---
        if (role === "student" || role === "parent") {
            const username = role === "student" ? studentInfo.username : parentInfo.username;
            const email = role === "student" ? studentInfo.email : parentInfo.email;

            if (await checkUsernameExists(username)) {
                errs.username = "Tên đăng nhập đã tồn tại";
            }
            if (await checkEmailExists(email)) {
                errs.email = "Email đã tồn tại";
            }
        }

        // --- STOP IF ERRORS EXIST ---
        if (Object.keys(errs).length > 0) {
            setError(errs);
            setSuccess("");
            return;
        }

        // --- CALL API ---
        try {
            setError({});
            setSuccess("Đang xử lý...");

            let payload = {};
            if (role === "student") {
                payload = { ...studentInfo, password };
                await axios.post("http://localhost:8080/api/auth/register/student", payload);
            } else if (role === "parent") {
                payload = { ...parentInfo, password };
                await axios.post("http://localhost:8080/api/auth/register/parent", payload);
            }

            setSuccess("✅ Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.");
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
        } catch (err) {
            console.error("❌ Lỗi đăng ký:", err.response?.data || err.message);
            const message = err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
            setError({ server: message });
            setSuccess("");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                {step === 1 && (
                    <>
                        <h2 className="text-2xl font-bold mb-6 text-center">
                            Chọn vai trò của bạn
                        </h2>
                        {error.step && <p className="text-red-500 mb-4">{error.step}</p>}
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => setRole("student")}
                                className={`p-3 rounded border ${role === "student" ? "bg-blue-500 text-white" : "hover:bg-blue-100"
                                    }`}
                            >
                                Học sinh
                            </button>
                            <button
                                onClick={() => setRole("parent")}
                                className={`p-3 rounded border ${role === "parent" ? "bg-blue-500 text-white" : "hover:bg-blue-100"
                                    }`}
                            >
                                Phụ huynh
                            </button>
                        </div>
                        <button
                            onClick={handleNext}
                            className="w-full bg-green-500 text-white p-2 rounded mt-6 hover:bg-green-600"
                        >
                            Tiếp tục
                        </button>
                    </>
                )}

                {step === 2 && (
                    <form onSubmit={handleRegister}>
                        <h2 className="text-2xl font-bold mb-6 text-center">
                            Đăng ký tài khoản ({role === "student" ? "Học sinh" : "Phụ huynh"})
                        </h2>

                        {error.server && <p className="text-red-500 mb-4">{error.server}</p>}
                        {success && <p className="text-green-500 mb-4">{success}</p>}

                        {/* Form Student */}
                        {role === "student" && (
                            <>
                                <InputField
                                    placeholder="Tên đăng nhập"
                                    value={studentInfo.username}
                                    onChange={(val) => setStudentInfo({ ...studentInfo, username: val })}
                                    error={error.username}
                                />
                                <InputField
                                    placeholder="Họ và tên"
                                    value={studentInfo.fullName}
                                    onChange={(val) => setStudentInfo({ ...studentInfo, fullName: val })}
                                    error={error.fullName}
                                />

                                <InputField
                                    placeholder="Ngày sinh"
                                    type="date"
                                    value={studentInfo.birthdate}
                                    onChange={(val) => setStudentInfo({ ...studentInfo, birthdate: val })}
                                    error={error.birthdate}
                                />
                                <InputField
                                    placeholder="Email"
                                    type="email"
                                    value={studentInfo.email}
                                    onChange={(val) => setStudentInfo({ ...studentInfo, email: val })}
                                    error={error.email}
                                />
                                <InputField
                                    placeholder="Số điện thoại"
                                    value={studentInfo.phone}
                                    onChange={(val) => setStudentInfo({ ...studentInfo, phone: val })}
                                    error={error.phone}
                                />
                                <InputField
                                    placeholder="Sở thích"
                                    value={studentInfo.hobbies}
                                    onChange={(val) => setStudentInfo({ ...studentInfo, hobbies: val })}
                                    error={error.hobbies}
                                />
                                <InputField
                                    placeholder="Mật khẩu"
                                    type="password"
                                    value={password}
                                    onChange={(val) => setPassword(val)}
                                    error={error.password}
                                />
                                <InputField
                                    placeholder="Nhập lại mật khẩu"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(val) => setConfirmPassword(val)}
                                    error={error.confirmPassword}
                                />
                            </>
                        )}


                        {/* Form Parent */}
                        {role === "parent" && (
                            <>
                                <InputField
                                    placeholder="Tên đăng nhập"
                                    value={parentInfo.username}
                                    onChange={(val) => setParentInfo({ ...parentInfo, username: val })}
                                    error={error.username}
                                />
                                <InputField
                                    placeholder="Họ tên phụ huynh"
                                    value={parentInfo.name}
                                    onChange={(val) => setParentInfo({ ...parentInfo, name: val })}
                                    error={error.name}
                                />
                                <InputField
                                    placeholder="Email"
                                    type="email"
                                    value={parentInfo.email}
                                    onChange={(val) => setParentInfo({ ...parentInfo, email: val })}
                                    error={error.email}
                                />
                                <InputField
                                    placeholder="Số điện thoại"
                                    value={parentInfo.phone}
                                    onChange={(val) => setParentInfo({ ...parentInfo, phone: val })}
                                    error={error.phone}
                                />
                                <InputField
                                    placeholder="Địa chỉ"
                                    value={parentInfo.address}
                                    onChange={(val) => setParentInfo({ ...parentInfo, address: val })}
                                    error={error.address}
                                />
                                <InputField
                                    placeholder="Mật khẩu"
                                    type="password"
                                    value={password}
                                    onChange={(val) => setPassword(val)}
                                    error={error.password}
                                />
                                <InputField
                                    placeholder="Nhập lại mật khẩu"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(val) => setConfirmPassword(val)}
                                    error={error.confirmPassword}
                                />
                            </>
                        )}

                        <div className="flex justify-between mt-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Quay lại
                            </button>

                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Đăng ký
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

// Component input field với hiển thị lỗi
const InputField = ({ placeholder, type = "text", value, onChange, error }) => (
    <div className="mb-4">
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full p-2 border rounded ${error ? "border-red-500" : ""}`}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
);

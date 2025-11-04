export default function LoadingOverlay({ message }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-600">
            <div className="animate-spin h-10 w-10 border-4 border-purple-400 border-t-transparent rounded-full mb-3"></div>
            <p>{message || "Đang tải..."}</p>
        </div>
    );
}

import { useState, useEffect } from "react";
import { Route, Routes, Link } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";

import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import GoalsPage from "./pages/GoalsPage";
import ProfileEditPage from "./pages/ProfileEditPage";
import WritingPage from "./pages/WritingPage";
import TopIntro from "./components/TopIntro";
import ImageGeneration from "./pages/ImageGeneration";
import PricingPage from "./pages/PricingPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style/mobile.css";
import "./components/css/Sidebar.css";
import './components/css/TopIntro.css';
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  useEffect(() => {
    // khi sidebar mở thì khóa cuộn body
    if (isSidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [isSidebarOpen]);
  return (
    <>
      {/* Nút 2 gạch giống ChatGPT — ẩn khi sidebar mở */}
      {!isSidebarOpen && (
        <button className="burger" onClick={toggleSidebar}>
          <span className="burger-icon">
            <span className="line top"></span>
            <span className="line bottom"></span>
          </span>
        </button>
      )}

      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      <Sidebar
        className={isSidebarOpen ? "open" : ""}
        isOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />
      <Header />
      <main
        className={`main-content flex-grow min-h-screen z-1 relative ${isSidebarOpen ? "sidebar-open" : ""
          }`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
          <Route path="/chat/:sessionId" element={<Home />} />
          <Route path="/students/:studentId/goals" element={<GoalsPage />} />
          <Route path="/writing" element={<WritingPage />} />
          <Route path="/generate-image" element={<ImageGeneration />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route
            path="*"
            element={
              <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-red-600 mb-4">
                    404 - Không tìm thấy trang
                  </h1>
                  <Link
                    to="/"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Quay về Home
                  </Link>
                </div>
              </div>
            }
          />
        </Routes>
      </main>

      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;

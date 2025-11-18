import { useState, useEffect } from "react";
import { Route, Routes, Link, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import GoalsPage from "./pages/GoalsPage";
import ProfileEditPage from "./pages/ProfileEditPage";
import WritingPage from "./pages/WritingPage";
import ImageGeneration from "./pages/ImageGeneration";
import VideoGeneration from "./pages/VideoGeneration";
import PricingPage from "./pages/PricingPage";
import AiJournalismPage from "./pages/AiJournalismPage";
import AiSubmissionPage from "./pages/AiSubmissionPage";
import AiSubmissionViewPage from "./pages/AiSubmissionViewPage";
import AiJournalismCreatePage from "./pages/AiJournalismCreatePage";
import AiJournalismEditPage from "./pages/AiJournalismEditPage";
import Error403Page from "./pages/Error403Page";
import RoleGuard from "./components/RoleGuard";
import VoiceReportPage from "./pages/voice_ai/VoiceReportPage";
import VoiceChatGPT5 from "./pages/voice_ai/VoiceChatGPT5";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./style/mobile.css";
import "./components/css/Sidebar.css";
import "./components/css/TopIntro.css";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", isSidebarOpen);
  }, [isSidebarOpen]);

  // danh sách các path ẩn header
  const hideHeaderPaths = ["/generate-video"];

  const shouldHideHeader = hideHeaderPaths.includes(location.pathname);

  return (
    <>
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

      <div className={`app-layout ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <Sidebar
          className={isSidebarOpen ? "open" : ""}
          isOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
        />

        <div className="right-area">
          {/* chỉ render Header nếu không nằm trong danh sách ẩn */}
          {!shouldHideHeader && <Header />}

          <main className="main-content flex-grow min-h-screen relative">
            <Routes>
              <Route
                element={<RoleGuard allowRoles={["SYSTEM_ADMIN", "ADMIN", "TEACHER"]} />}
              >
                <Route path="/ai-journalism/create" element={<AiJournalismCreatePage />} />
                <Route path="/ai-journalism/edit/:contestId" element={<AiJournalismEditPage />} />
              </Route>

              <Route path="/" element={<Home />} />
              <Route path="/403" element={<Error403Page />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<ProfileEditPage />} />
              <Route path="/chat/:sessionId" element={<Home />} />
              <Route path="/students/:studentId/goals" element={<GoalsPage />} />
              <Route path="/writing" element={<WritingPage />} />
              <Route path="/generate-image" element={<ImageGeneration />} />
              <Route path="/generate-video" element={<VideoGeneration />} />
              <Route path="/journalism" element={<AiJournalismPage />} />
              <Route path="/ai-journalism/submit" element={<AiSubmissionPage />} />
              <Route path="/ai-submission-view/:entryId" element={<AiSubmissionViewPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/voice-chat" element={<VoiceChatGPT5 />} />
              <Route path="/voice-report" element={<VoiceReportPage />} />

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
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;

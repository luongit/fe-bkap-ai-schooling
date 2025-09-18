import { Route, Routes, Link } from "react-router-dom"; // Xóa BrowserRouter khỏi import
import Footer from "./components/Footer";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import ProfileEditPage from "./pages/ProfileEditPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Sidebar />
      <Header />
      <main className="flex-grow min-h-screen z-1 relative">
        {" "}
    
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/login" element={<LoginPage />} /> */}
         
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
          <Route path="/chat/:sessionId" element={<Home />} />
          {/* Fallback 404 */}
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

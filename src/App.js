import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import LoginPage from "./pages/LoginPage";
import ProfilePage from './pages/ProfilePage';
import ProfileEditPage from './pages/ProfileEditPage';

function App() {
  return (
    <>
     <Sidebar />
     <Header />
     <Routes>
      <Route path='/' element={<Home />}/>
      <Route path="/login" element={<LoginPage />}/>
      <Route path="/profile" element={<ProfilePage />}/>
      <Route path="/profile/edit" element={<ProfileEditPage />}/>
    
     </Routes>
     <Footer />
    </>
  );
}

export default App;

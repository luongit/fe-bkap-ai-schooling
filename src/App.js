import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';

function App() {
  return (
    <>
     <Sidebar />
     <Header />
     <Routes>
      <Route path='/' element={<Home />}/>
     </Routes>
     <Footer />
    </>
  );
}

export default App;

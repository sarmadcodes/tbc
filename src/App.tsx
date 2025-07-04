import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<Admin />} />
          </Routes>
        </motion.main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;

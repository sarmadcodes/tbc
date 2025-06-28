import React, { useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Plus, 
  Settings, 
  LogOut,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import AdminDashboard from '../components/admin/AdminDashboard';
import ArticleManager from '../components/admin/ArticleManager';
import ArticleEditor from '../components/admin/ArticleEditor';

// Broken Column Logo Component
const BrokenColumnLogo = ({ className = "w-10 h-10", color = "currentColor" }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    fill={color}
  >
    {/* Column base */}
    <rect x="20" y="85" width="60" height="10" rx="2" />
    
    {/* Column shaft - broken into pieces */}
    <rect x="35" y="75" width="30" height="12" />
    <rect x="33" y="60" width="34" height="15" transform="rotate(-2 50 67.5)" />
    <rect x="37" y="45" width="26" height="15" transform="rotate(1 50 52.5)" />
    <rect x="32" y="30" width="36" height="15" transform="rotate(-1.5 50 37.5)" />
    
    {/* Column capital (top) */}
    <rect x="25" y="20" width="50" height="8" rx="1" />
    <rect x="22" y="15" width="56" height="6" rx="2" />
    <rect x="20" y="10" width="60" height="6" rx="3" />
    
    {/* Crack lines */}
    <path d="M50 75 L45 60 L52 45 L48 30" stroke={color} strokeWidth="1" fill="none" opacity="0.6" />
    <path d="M52 70 L55 55 L48 40 L52 25" stroke={color} strokeWidth="0.8" fill="none" opacity="0.4" />
  </svg>
);

const Admin: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  const sidebarItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Articles', path: '/admin/articles', icon: FileText },
    { name: 'New Article', path: '/admin/articles/new', icon: Plus },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - The Broken Column</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="flex">
          {/* Sidebar */}
          <motion.div
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            className="w-64 bg-white shadow-lg min-h-screen"
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-8">
                <BrokenColumnLogo 
                  className="w-10 h-10" 
                  color="#d97706" 
                />
                <span className="font-serif text-xl font-bold text-gray-900">Admin Panel</span>
              </div>

              <nav className="space-y-2">
                {sidebarItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-full transition-all duration-200 ${
                        isActive
                          ? 'bg-gold-100 text-gold-700 border border-gold-200'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <IconComponent size={20} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center space-x-3 px-4 py-2 mb-4">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Admin User</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-full transition-colors w-full"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/articles" element={<ArticleManager />} />
              <Route path="/articles/new" element={<ArticleEditor />} />
              <Route path="/articles/edit/:id" element={<ArticleEditor />} />
              <Route path="/settings" element={<AdminSettings />} />
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
};

// Settings Component
const AdminSettings: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-serif font-bold text-gray-900">Settings</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-gray-600">Settings panel coming soon...</p>
      </div>
    </motion.div>
  );
};

export default Admin;
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, User } from 'lucide-react';

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

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Check if we're on a page with white background
  const isOnWhitePage = location.pathname !== '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Articles', path: '/articles' },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        (isScrolled || isOnWhitePage) ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between w-full">
            {/* Left side - Navigation */}
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative py-2 transition-colors duration-200 ${
                    location.pathname === item.path
                      ? (isOnWhitePage ? 'text-gold-600' : isScrolled ? 'text-gold-600' : 'text-gold-300')
                      : (isOnWhitePage ? 'text-gray-900 hover:text-gold-600' : isScrolled ? 'text-gray-700 hover:text-gold-600' : 'text-white/90 hover:text-white')
                  }`}
                >
                  {item.name}
                  {location.pathname === item.path && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500"
                      layoutId="navbar-indicator"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Center - Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <BrokenColumnLogo 
                className="w-10 h-10" 
                color={isOnWhitePage ? '#111827' : isScrolled ? '#1f2937' : '#ffffff'} 
              />
              <span className={`font-serif text-xl font-bold ${isOnWhitePage ? 'text-gray-900' : isScrolled ? 'text-gray-900' : 'text-white'}`}>
                The Broken Column
              </span>
            </Link>

            {/* Right side - Search and Admin */}
            <div className="flex items-center space-x-4">
              <button className={`p-2 rounded-full transition-colors ${
                isOnWhitePage ? 'text-gray-900 hover:bg-gray-100' : isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'
              }`}>
                <Search size={20} />
              </button>
              <Link
                to="/admin"
                className={`p-2 rounded-full transition-colors ${
                  isOnWhitePage ? 'text-gray-900 hover:bg-gray-100' : isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'
                }`}
              >
                <User size={20} />
              </Link>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden flex justify-between items-center w-full">
            {/* Left side - Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <BrokenColumnLogo 
                className="w-8 h-8" 
                color={isOnWhitePage ? '#111827' : isScrolled ? '#1f2937' : '#ffffff'} 
              />
              <span className={`font-serif text-lg font-bold ${isOnWhitePage ? 'text-gray-900' : isScrolled ? 'text-gray-900' : 'text-white'}`}>
                The Broken Column
              </span>
            </Link>

            {/* Right side - Search, Admin, and Menu */}
            <div className="flex items-center space-x-2">
              <button className={`p-2 rounded-full transition-colors ${
                isOnWhitePage ? 'text-gray-900 hover:bg-gray-100' : isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'
              }`}>
                <Search size={18} />
              </button>
              <Link
                to="/admin"
                className={`p-2 rounded-full transition-colors ${
                  isOnWhitePage ? 'text-gray-900 hover:bg-gray-100' : isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'
                }`}
              >
                <User size={18} />
              </Link>
              <button
                className={`p-2 rounded-full ${
                  isOnWhitePage ? 'text-gray-900' : isScrolled ? 'text-gray-700' : 'text-white'
                }`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>


        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden bg-white shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="block py-2 text-gray-700 hover:text-gold-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
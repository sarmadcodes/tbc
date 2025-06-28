import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

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

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <BrokenColumnLogo 
                className="w-10 h-10" 
                color="#ffffff" 
              />
              <span className="font-serif text-xl font-bold">The Broken Column</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Premium digital magazine featuring in-depth analysis of world events, culture, and extraordinary stories from around the globe.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gold-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold-400 transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/articles" className="text-gray-400 hover:text-white transition-colors">Articles</Link></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <div className="space-y-2">
              <a href="mailto:hello@thebrokencolumn.com" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <Mail size={16} />
                <span>hello@thebrokencolumn.com</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 The Broken Column. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
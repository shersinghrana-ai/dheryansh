import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, User, Shield, Menu, X } from 'lucide-react';

interface NavigationProps {
  isAdmin?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ isAdmin = false }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = isAdmin ? [
    { path: '/admin', label: 'Dashboard', icon: Home },
    { path: '/admin/map', label: 'Live Map', icon: MapPin },
  ] : [
    { path: '/', label: 'Home', icon: Home },
    { path: '/my-reports', label: 'My Reports', icon: User },
    { path: '/admin', label: 'Admin', icon: Shield },
  ];

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">जा</span>
            </div>
            <span className="text-white text-xl font-bold">Jan Awaaz</span>
            <span className="text-slate-400 text-sm hidden sm:inline">Voice of People</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  location.pathname === path
                    ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-800 rounded-lg mt-2">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-all ${
                    location.pathname === path
                      ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
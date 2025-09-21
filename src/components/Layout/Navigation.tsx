import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, User, Shield, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../UI/Button';

interface NavigationProps {
  isAdmin?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ isAdmin = false }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAdmin: userIsAdmin } = useAuth();

  const navLinks = (isAdmin || userIsAdmin) ? [
    { path: '/admin', label: 'Dashboard', icon: Home },
    { path: '/admin/map', label: 'Live Map', icon: MapPin },
  ] : [
    { path: '/', label: 'Home', icon: Home },
    ...(user ? [{ path: '/my-reports', label: 'My Reports', icon: User }] : []),
    ...(!user ? [{ path: '/login', label: 'Login', icon: Shield }] : []),
  ];

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };
  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-white to-green-600 rounded-lg flex items-center justify-center border-2 border-orange-400 shadow-lg">
              <div className="relative">
                <span className="text-orange-800 font-bold text-lg">🏛️</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xl font-bold flex items-center">
                Jan Awaaz
                <span className="ml-2 text-orange-400 text-lg">🇮🇳</span>
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline -mt-1">जन आवाज़ • Voice of People</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation Links */}
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
            
            {/* User Info & Logout */}
            {user && (
              <div className="flex items-center space-x-4 pl-4 border-l border-slate-700">
                <div className="text-sm">
                  <div className="text-white font-medium">{user.name}</div>
                  <div className="text-slate-400 text-xs">
                    {user.isAdmin ? 'Administrator' : 'Citizen'}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-300 hover:text-white"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            )}
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
              
              {/* Mobile User Info & Logout */}
              {user && (
                <div className="pt-3 mt-3 border-t border-slate-700">
                  <div className="px-3 py-2 text-sm">
                    <div className="text-white font-medium">{user.name}</div>
                    <div className="text-slate-400 text-xs">
                      {user.isAdmin ? 'Administrator' : 'Citizen'}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700 w-full"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
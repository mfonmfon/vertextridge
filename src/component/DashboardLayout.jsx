import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Repeat,
  User,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  BarChart3,
  LineChart,
  Home,
  Users,
} from 'lucide-react';
import logo from '../assets/logo.jpeg';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationCenter from './NotificationCenter';
import Avatar from './Avatar';

// ────────────────────────────────────
// Sidebar Link
// ────────────────────────────────────
const SidebarLink = ({ icon: Icon, label, path, active, onClick }) => (
  <Link
    to={path}
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-4 transition-all relative group ${
      active ? 'text-primary' : 'text-white/40 hover:text-white'
    }`}
  >
    {active && (
      <motion.div
        layoutId="sidebar-active"
        className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
      />
    )}
    <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-white/20 group-hover:text-white/60'}`} />
    <span className="text-sm font-bold tracking-tight">{label}</span>
  </Link>
);

// ────────────────────────────────────
// Bottom Tab Item
// ────────────────────────────────────
const BottomTabItem = ({ icon: Icon, label, path, active }) => (
  <Link
    to={path}
    className={`flex flex-col items-center gap-1 py-1 flex-1 transition-all ${
      active ? 'text-primary' : 'text-white/30'
    }`}
  >
    <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-primary/10' : ''}`}>
      <Icon className="w-5 h-5" />
    </div>
    <span className="text-[10px] font-bold">{label}</span>
  </Link>
);

// ────────────────────────────────────
// Dashboard Layout
// ────────────────────────────────────
const DashboardLayout = ({ children }) => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Markets', icon: BarChart3, path: '/markets' },
    { label: 'Trade', icon: LineChart, path: '/trade' },
    { label: 'Copy Trading', icon: Users, path: '/copy-trading' },
    { label: 'Funds', icon: Wallet, path: '/funds' },
    { label: 'Profile', icon: User, path: '/profile' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const bottomTabs = [
    { label: 'Home', icon: Home, path: '/dashboard' },
    { label: 'Markets', icon: BarChart3, path: '/markets' },
    { label: 'Trade', icon: LineChart, path: '/trade' },
    { label: 'Funds', icon: Wallet, path: '/funds' },
    { label: 'Profile', icon: User, path: '/profile' },
  ];

  const isActive = (path) => {
    if (path === '/trade') return location.pathname.startsWith('/trade');
    if (path === '/copy-trading') return location.pathname.startsWith('/copy-trading');
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark text-white flex overflow-hidden">
      {/* ═══ Sidebar Desktop ═══ */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-white/5 bg-dark pt-8 flex-shrink-0">
        <div className="px-8 mb-12 flex items-center gap-3">
          <img src={logo} alt="Vertex Ridge" className="w-10 h-10 rounded-xl object-cover" />
          <span className="text-2xl font-bold tracking-tight">Vertex Ridge<span className="text-primary italic">.</span></span>
        </div>

        <nav className="flex-1">
          {sidebarItems.map((item) => (
            <SidebarLink
              key={item.label}
              {...item}
              active={isActive(item.path)}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-6 py-4 text-red-500/60 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {/* ═══ Main Content Area ═══ */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        {/* Header */}
        <header className="h-16 lg:h-20 border-b border-white/5 bg-dark/50 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {/* Mobile: brand */}
            <div className="lg:hidden flex items-center gap-2">
              <img src={logo} alt="Vertex Ridge" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-lg font-bold">Vertex Ridge<span className="text-primary italic">.</span></span>
            </div>

            {/* Desktop: search */}
            <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 w-64">
              <Search className="w-4 h-4 text-white/20" />
              <input
                type="text"
                placeholder="Search markets..."
                className="bg-transparent border-none text-xs text-white focus:outline-none w-full"
                onFocus={() => navigate('/markets')}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <NotificationCenter />

            <div className="h-10 w-[1px] bg-white/5 hidden lg:block" />

            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-sm font-bold">{user?.name || 'User'}</span>
                <span className="text-[10px] uppercase font-bold text-primary tracking-widest">
                  {user?.kycStatus === 'verified' ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <Avatar 
                user={user} 
                size={40} 
                className="ring-2 ring-primary/20" 
              />
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="p-4 lg:p-8 flex-1">
          {children}
        </main>
      </div>

      {/* ═══ Mobile Bottom Tab Bar ═══ */}
      <div className="fixed bottom-0 inset-x-0 lg:hidden z-50">
        <div className="bg-dark/90 backdrop-blur-xl border-t border-white/5 px-2 pt-2 pb-[env(safe-area-inset-bottom,8px)]">
          <div className="flex items-center justify-around">
            {bottomTabs.map((tab) => (
              <BottomTabItem
                key={tab.label}
                {...tab}
                active={isActive(tab.path)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Mobile Menu Overlay (secondary items) ═══ */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-72 bg-dark z-[60] p-8 border-r border-white/5 lg:hidden"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <img src={logo} alt="Vertex Ridge" className="w-10 h-10 rounded-xl object-cover" />
                  <span className="text-2xl font-bold">Vertex Ridge.</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/40">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex flex-col gap-2">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 p-4 text-white/60 hover:text-primary transition-all rounded-xl"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-bold">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;

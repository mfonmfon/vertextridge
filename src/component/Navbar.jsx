import React, { useState, useEffect } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.jpeg';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about-us' },
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-dark/95 backdrop-blur-md py-4 border-b border-white/5' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo} alt="Vertex Ridge" className="w-10 h-10 rounded-lg object-cover transform transition-transform group-hover:scale-105" />
          <span className="text-xl md:text-2xl font-bold tracking-tight">
            Vertex <span className="text-primary">Ridge</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-white/80 hover:text-white font-medium transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Side - Language & Sign In */}
        <div className="hidden lg:flex items-center gap-4">
          <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">English</span>
          </button>
          <Link
            to="/login"
            className="px-6 py-2.5 bg-primary text-dark font-bold rounded-lg hover:bg-primary/90 transition-all"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-white"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-dark/95 backdrop-blur-md border-t border-white/5"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-white/80 hover:text-white font-medium py-2 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors w-full">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">English</span>
                </button>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full px-6 py-3 bg-primary text-dark font-bold rounded-lg hover:bg-primary/90 transition-all text-center"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

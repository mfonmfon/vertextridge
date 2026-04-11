import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
    { name: 'Product', path: '/product' },
    { name: 'Page', path: '/resource', hasDropdown: true },
    { name: 'Blog', path: '/blog', hasDropdown: true },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-dark/80 backdrop-blur-md py-4 border-b border-white/5' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-bold text-dark text-xl transform transition-transform group-hover:scale-105">
            T
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Trad<span className="text-primary italic">Z</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <motion.div
              key={link.name}
              whileHover={{ y: -2, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link 
                to={link.path}
                className="group flex items-center gap-1 text-sm font-medium text-white/80 hover:text-primary transition-colors"
              >
                {link.name}
                {link.hasDropdown && <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-primary transition-colors" />}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden md:block">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Link 
              to="/register"
              className="px-8 py-3 bg-primary text-dark font-bold rounded-full hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all"
            >
              Get Started
            </Link>
          </motion.div>
        </div>

        {/* Mobile menu toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark border-b border-white/5 overflow-hidden"
          >
            <div className="px-4 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xl font-medium"
                >
                  {link.name}
                </Link>
              ))}
              <Link 
                to="/register"
                className="w-full py-4 bg-primary text-dark text-center font-bold rounded-xl"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

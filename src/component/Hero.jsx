import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import heroMockup from '../assets/hero_mockup.png';
import Avatar from './Avatar';

const Hero = () => {
  const navigate = useNavigate();

  const handleOpenAccount = () => {
    navigate('/register');
  };

  const handleDemoAccount = () => {
    // For demo account, you can either:
    // 1. Navigate to register with a demo flag
    // 2. Navigate to a separate demo page
    // 3. Show a modal explaining demo features
    navigate('/register', { state: { isDemoAccount: true } });
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-dark">
        <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col gap-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full w-fit">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold tracking-wider text-white/60">TRADING OPTION</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
            The Trusted <br />
            <span className="text-primary italic">Trading</span> Option.
          </h1>

          <p className="text-lg text-muted max-w-lg leading-relaxed">
            Your Partner in Profitable Trading. Experience seamless trading with 
            advanced analytic tools and a global community of experts.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <motion.button 
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenAccount}
              className="w-full sm:w-auto px-10 py-4 bg-primary text-dark font-bold rounded-full hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all"
            >
              Open Account
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDemoAccount}
              className="w-full sm:w-auto px-10 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              Open Demo Account
            </motion.button>
          </div>
        </motion.div>

        {/* Visual Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="relative px-4"
        >
          <img 
            src={heroMockup} 
            alt="Trading Mobiles" 
            className="w-full max-w-[600px] mx-auto filter drop-shadow-[0_20px_50px_rgba(163,230,53,0.15)]"
          />
          
          {/* Floating labels / elements */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] right-0 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl hidden lg:block"
          >
            <span className="text-primary font-bold">+12.5%</span>
          </motion.div>

          {/* Connection lines (replicated with CSS SVG) */}
          <div className="absolute top-[10%] left-[5%] w-[90%] h-[80%] pointer-events-none -z-10 overflow-visible opacity-50">
            <svg viewBox="0 0 400 300" className="w-full h-full stroke-primary fill-none stroke-[1] stroke-dash-2 opacity-50">
              <path d="M50,150 L150,50 L250,200 L350,100" />
              <circle cx="50" cy="150" r="4" fill="#a3e635" />
              <circle cx="150" cy="50" r="4" fill="#a3e635" />
              <circle cx="250" cy="200" r="4" fill="#a3e635" />
              <circle cx="350" cy="100" r="4" fill="#a3e635" />
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

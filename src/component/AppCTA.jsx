import React from 'react';
import { Apple, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import heroMockup from '../assets/hero_mockup.png';
import logo from '../assets/logo.jpeg';

const AppCTA = () => {
  return (
    <section className="bg-dark py-24 md:py-32 relative overflow-hidden border-t border-white/5">
      {/* Background radial glow */}
      <div className="absolute bottom-0 right-0 w-[50%] h-[100%] bg-primary/10 blur-[150px] -z-10 rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-16 md:gap-24">
        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex-1 text-center md:text-left flex flex-col gap-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full w-fit mx-auto md:mx-0">
            <span className="text-xs font-bold tracking-widest text-white/40 uppercase">Download Our App</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
            Download Our App & <br />
            Get The <span className="text-primary italic">Special Offer!</span>
          </h2>

          <p className="text-lg text-muted max-w-xl leading-relaxed">
            Take your trading anywhere with our mobile app. Get exclusive 
            promotions and real-time alerts on your favorite assets.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all group">
              <Apple className="w-8 h-8 group-hover:text-primary transition-colors" />
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Download on the</span>
                <span className="text-xl font-bold">App Store</span>
              </div>
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all group">
              <Smartphone className="w-8 h-8 group-hover:text-primary transition-colors" />
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Get it on</span>
                <span className="text-xl font-bold">Google Play</span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Mockup Content */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="flex-1 relative"
        >
          <img 
            src={heroMockup} 
            alt="Trading Mobiles" 
            className="w-full max-w-[600px] mx-auto filter drop-shadow-[0_20px_50px_rgba(163,230,53,0.1)]"
          />
        </motion.div>
      </div>

      {/* Footer minimal info */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Vertex Ridge" className="w-8 h-8 rounded-lg object-cover" />
          <span className="text-xl font-bold tracking-tight">
            Vertex <span className="text-primary">Ridge</span>
          </span>
        </div>
        <p className="text-white/20 text-sm">
          © 2026 Vertex Ridge Marketplace. All rights reserved.
        </p>
        <div className="flex items-center gap-8">
          <button className="text-white/40 hover:text-primary text-sm transition-colors">Privacy Policy</button>
          <button className="text-white/40 hover:text-primary text-sm transition-colors">Terms of Service</button>
        </div>
      </div>
    </section>
  );
};

export default AppCTA;

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Globe2 } from 'lucide-react';
import traderImg from '../assets/trader_feature.png';

const Features = () => {
  return (
    <section className="bg-white py-24 md:py-32 overflow-hidden border-t border-dark/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-16 md:gap-24 items-center">
        {/* Visual Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Main image with styling */}
          <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl">
            <img 
              src={traderImg} 
              alt="Professional Trader" 
              className="w-full object-cover"
            />
          </div>

          {/* Floating UI cards */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -left-10 bg-white p-6 rounded-2xl shadow-xl z-20 border border-dark/5 hidden lg:block"
          >
            <div className="flex flex-col gap-2">
              <span className="text-xs text-dark/40 font-semibold uppercase tracking-widest">Global Reach</span>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-dark">195 +</span>
                  <span className="text-xs text-dark/40">Countries</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-10 -right-10 bg-dark p-6 rounded-2xl shadow-2xl z-20 hidden lg:block"
          >
            <div className="flex flex-col gap-3">
              <span className="text-xs text-white/40 font-semibold uppercase tracking-widest">Transaction</span>
              <div className="flex flex-col gap-1">
                <span className="text-primary font-bold text-xl">$ 34,453.09</span>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '70%' }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="flex flex-col gap-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full w-fit">
            <span className="text-xs font-bold tracking-wider text-dark/60 uppercase text-center">About Us</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-dark">
            Maximum Profit & Secure <br />
            <span className="italic text-primary">Trading Platform</span>
          </h2>

          <p className="text-lg text-dark/60 leading-relaxed">
            Experience the next level of financial empowerment. Our platform is built 
            to maximize your profitability while providing unmatched security for 
            every single transaction. Reliable, fast, and globally accessible.
          </p>

          <div className="grid sm:grid-cols-2 gap-8 pt-4">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-dark text-lg mb-2">Secure Transaction</h4>
                <p className="text-dark/40 text-sm leading-relaxed">
                  Bank-level encryption and multi-factor authentication protect every transaction. Your funds are secured with military-grade security protocols.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Globe2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-dark text-lg mb-2">Global Services</h4>
                <p className="text-dark/40 text-sm leading-relaxed">
                  Trade 24/7 across global markets with access to stocks, forex, crypto, and commodities from over 195 countries worldwide.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button className="px-10 py-4 bg-primary text-dark font-bold rounded-full hover:bg-primary/90 hover:shadow-xl transition-all active:scale-95 leading-none">
              More About Us
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;

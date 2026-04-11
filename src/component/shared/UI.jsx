import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind class merging
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Card = ({ children, className, noPadding = false }) => (
  <div className={cn(
    "bg-card border border-white/5 rounded-[2rem] overflow-hidden",
    !noPadding && "p-8",
    className
  )}>
    {children}
  </div>
);

export const Input = ({ label, icon: Icon, className, ...props }) => (
  <div className="flex flex-col gap-2 w-full">
    {label && <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">{label}</label>}
    <div className="relative group">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />}
      <input 
        className={cn(
          "w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all",
          Icon ? "pl-12" : "pl-6",
          className
        )}
        {...props}
      />
    </div>
  </div>
);

export const Button = ({ children, variant = 'primary', className, ...props }) => {
  const variants = {
    primary: "bg-primary text-dark hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(163,230,53,0.3)]",
    secondary: "bg-white/5 text-white border border-white/10 hover:bg-white/10",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "px-8 py-4 font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

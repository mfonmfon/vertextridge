import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react';

const CTASection = () => {
  const features = [
    { icon: TrendingUp, text: 'Real-time market data' },
    { icon: Shield, text: 'Bank-level security' },
    { icon: Zap, text: 'Instant execution' },
  ];

  return (
    <section className="py-20 md:py-32 px-4 md:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 md:p-12 lg:p-16 backdrop-blur-sm"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
                <span className="text-xs font-bold tracking-widest text-primary uppercase">
                  Start Trading Today
                </span>
              </div>

              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Ready to Start Your <br />
                <span className="text-primary">Trading Journey?</span>
              </h2>

              <p className="text-lg text-white/60 mb-8 leading-relaxed">
                Join thousands of traders who trust Vertex Ridge. Get started with $50 bonus and access to all premium features.
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-white/80">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-dark font-bold rounded-xl hover:bg-primary/90 transition-all"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/features"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/20 font-bold rounded-xl hover:bg-white/20 transition-all"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Content - Stats */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: '50K+', label: 'Active Traders' },
                { value: '$2B+', label: 'Trading Volume' },
                { value: '150+', label: 'Countries' },
                { value: '99.9%', label: 'Uptime' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-primary/50 transition-all"
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-16 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <img src="/src/assets/logo.jpeg" alt="Vertex Ridge" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-xl font-bold tracking-tight">
              Vertex <span className="text-primary">Ridge</span>
            </span>
          </div>
          <p className="text-white/40 text-sm text-center md:text-left">
            © 2024 Vertex Ridge. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="text-white/40 hover:text-primary text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-white/40 hover:text-primary text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

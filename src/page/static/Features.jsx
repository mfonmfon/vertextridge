import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Shield, TrendingUp, Users, Bell, BarChart3,
  Lock, Smartphone, Globe, Clock, DollarSign, Award
} from 'lucide-react';
import Navbar from '../../component/Navbar';

const Features = () => {
  const mainFeatures = [
    {
      icon: Zap,
      title: 'Lightning Fast Execution',
      description: 'Execute trades in milliseconds with our high-performance infrastructure. Never miss an opportunity.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your assets are protected with military-grade encryption and multi-factor authentication.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Real-time charts, technical indicators, and market insights to make informed decisions.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Users,
      title: 'Copy Trading',
      description: 'Follow and copy successful traders automatically. Learn while you earn.',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const allFeatures = [
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Get instant alerts for price movements, trade executions, and market news.',
    },
    {
      icon: BarChart3,
      title: 'Portfolio Analytics',
      description: 'Track your performance with detailed analytics and insights.',
    },
    {
      icon: Lock,
      title: 'Cold Storage',
      description: 'Majority of funds stored offline in secure cold wallets.',
    },
    {
      icon: Smartphone,
      title: 'Mobile Trading',
      description: 'Trade on the go with our iOS and Android apps.',
    },
    {
      icon: Globe,
      title: 'Global Markets',
      description: 'Access stocks, crypto, forex, and commodities from one platform.',
    },
    {
      icon: Clock,
      title: '24/7 Trading',
      description: 'Trade crypto markets around the clock, never miss an opportunity.',
    },
    {
      icon: DollarSign,
      title: 'Low Fees',
      description: 'Competitive fees with no hidden charges. What you see is what you pay.',
    },
    {
      icon: Award,
      title: 'Award Winning',
      description: 'Recognized as one of the best trading platforms by industry experts.',
    },
  ];

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
              <span className="text-xs font-bold tracking-widest text-primary uppercase">Features</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              Everything You Need <br />
              <span className="text-primary">To Trade Successfully</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              Powerful tools and features designed to give you the edge in today's fast-moving markets.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity rounded-3xl blur-xl"
                  style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
                />
                <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-primary/50 transition-all">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-white/60 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Features Grid */}
      <section className="py-20 px-4 md:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">More Features</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Discover all the tools and features that make Vertex Ridge the best choice for traders
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-dark border border-white/10 rounded-2xl p-6 hover:border-primary/50 transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-white/60">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trading Tools Section */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Professional Trading Tools
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Advanced Charting</h3>
                    <p className="text-white/60">
                      TradingView integration with 100+ technical indicators and drawing tools.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">One-Click Trading</h3>
                    <p className="text-white/60">
                      Execute trades instantly with our streamlined interface. No delays, no hassle.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bell className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Price Alerts</h3>
                    <p className="text-white/60">
                      Set custom alerts and never miss important price movements again.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-transparent rounded-3xl flex items-center justify-center">
                <BarChart3 className="w-32 h-32 text-primary/50" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Experience All Features Today
          </h2>
          <p className="text-lg text-white/60 mb-8">
            Start trading with $50 bonus. No credit card required.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-primary text-dark font-bold rounded-xl hover:bg-primary/90 transition-all"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Features;

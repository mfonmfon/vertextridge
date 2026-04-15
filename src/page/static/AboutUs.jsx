import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Users, TrendingUp, Award, Target, Heart } from 'lucide-react';
import Navbar from '../../component/Navbar';

const AboutUs = () => {
  const stats = [
    { value: '50K+', label: 'Active Traders' },
    { value: '$2B+', label: 'Trading Volume' },
    { value: '150+', label: 'Countries' },
    { value: '99.9%', label: 'Uptime' },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'Your assets are protected with bank-level security and encryption.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Built by traders, for traders. We listen to our community.',
    },
    {
      icon: TrendingUp,
      title: 'Innovation',
      description: 'Cutting-edge technology to give you the competitive edge.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Committed to providing the best trading experience possible.',
    },
    {
      icon: Target,
      title: 'Transparency',
      description: 'Clear pricing, no hidden fees, complete transparency.',
    },
    {
      icon: Heart,
      title: 'Customer Success',
      description: '24/7 support to help you succeed in your trading journey.',
    },
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: 'https://i.pravatar.cc/300?img=1',
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: 'https://i.pravatar.cc/300?img=2',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      image: 'https://i.pravatar.cc/300?img=3',
    },
    {
      name: 'David Kim',
      role: 'Head of Trading',
      image: 'https://i.pravatar.cc/300?img=4',
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
              <span className="text-xs font-bold tracking-widest text-primary uppercase">About Us</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              Empowering Traders <br />
              <span className="text-primary">Worldwide</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              Vertex Ridge is a next-generation trading platform built to democratize access to global markets. 
              We combine cutting-edge technology with user-friendly design to help everyone trade with confidence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 md:px-8 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm md:text-base text-white/40">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>
                  Founded in 2020, Vertex Ridge was born from a simple idea: trading should be accessible to everyone, 
                  not just Wall Street professionals.
                </p>
                <p>
                  Our founders, experienced traders and technologists, saw the barriers preventing everyday people 
                  from participating in global markets. High fees, complex interfaces, and lack of education were 
                  keeping millions on the sidelines.
                </p>
                <p>
                  Today, we're proud to serve over 50,000 traders across 150 countries, processing billions in 
                  trading volume every month. But we're just getting started.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-transparent rounded-3xl p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl md:text-8xl font-bold text-primary mb-4">2020</div>
                  <div className="text-xl text-white/60">Year Founded</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-4 md:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Values</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              These principles guide everything we do at Vertex Ridge
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-dark border border-white/10 rounded-2xl p-6 hover:border-primary/50 transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-white/60">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Led by industry veterans with decades of combined experience
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="relative mb-4 overflow-hidden rounded-2xl">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-primary text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Start Trading?
          </h2>
          <p className="text-lg text-white/60 mb-8">
            Join thousands of traders who trust Vertex Ridge for their trading needs
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

export default AboutUs;

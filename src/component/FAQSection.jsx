import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, MessageCircle } from 'lucide-react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: 'How do I get started with Vertex Ridge?',
      answer: 'Getting started is easy! Simply click the "Get Started" button, create your account with your email, complete the quick verification process, and you\'re ready to start trading. New users receive a $50 welcome bonus.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept a wide range of payment methods including bank transfers, credit/debit cards, and cryptocurrency deposits. All transactions are secured with bank-level encryption.',
    },
    {
      question: 'Is my money safe with Vertex Ridge?',
      answer: 'Absolutely. We use bank-level security with military-grade encryption, two-factor authentication, and store the majority of funds in secure cold storage. Your assets are protected 24/7.',
    },
    {
      question: 'What are the trading fees?',
      answer: 'Our fees are transparent and competitive. Starter accounts have 0.1% trading fees, Pro accounts 0.05%, and Enterprise accounts 0.01%. No hidden charges or surprise fees.',
    },
    {
      question: 'Can I trade on mobile?',
      answer: 'Yes! Vertex Ridge is fully responsive and works seamlessly on all devices. Trade anytime, anywhere with our mobile-optimized platform.',
    },
    {
      question: 'What is Copy Trading?',
      answer: 'Copy Trading allows you to automatically replicate the trades of successful traders. It\'s perfect for beginners who want to learn from experienced traders while earning returns.',
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-20 md:py-32 px-4 md:px-8 overflow-hidden">
      {/* Modern Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold tracking-widest text-primary uppercase">FAQ</span>
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            Got <span className="text-primary">Questions?</span>
          </h2>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about trading with Vertex Ridge
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="group"
            >
              <div
                className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border rounded-2xl overflow-hidden transition-all duration-300 ${
                  openIndex === index
                    ? 'border-primary shadow-lg shadow-primary/20'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-300" />
                
                <button
                  onClick={() => toggleFAQ(index)}
                  className="relative w-full flex items-start justify-between p-6 md:p-8 text-left gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                        openIndex === index
                          ? 'bg-primary text-dark'
                          : 'bg-white/10 text-white/40'
                      }`}>
                        {(index + 1).toString().padStart(2, '0')}
                      </div>
                      <span className={`text-base md:text-lg font-bold transition-colors ${
                        openIndex === index ? 'text-primary' : 'text-white'
                      }`}>
                        {faq.question}
                      </span>
                    </div>
                  </div>
                  
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      openIndex === index
                        ? 'bg-primary text-dark'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="relative px-6 md:px-8 pb-6 md:pb-8">
                        <div className="pl-11 text-white/70 leading-relaxed">
                          {faq.answer}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modern CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 relative"
        >
          <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">
                    Still have questions?
                  </h3>
                  <p className="text-white/60">
                    Our support team is here to help you 24/7
                  </p>
                </div>
              </div>
              <a
                href="/contact"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-primary text-dark font-bold rounded-xl hover:bg-primary/90 transition-all whitespace-nowrap"
              >
                Contact Support
                <ChevronDown className="w-5 h-5 -rotate-90 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;

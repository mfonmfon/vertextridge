import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, MessageCircle } from 'lucide-react';
import Navbar from '../../component/Navbar';
import AppCTA from '../../component/AppCTA';

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const categories = [
    {
      name: 'Getting Started',
      faqs: [
        {
          question: 'How do I create an account?',
          answer: 'Click the "Sign In" button in the top right corner, then select "Sign Up". Fill in your details, verify your email, and you\'re ready to start trading!',
        },
        {
          question: 'What documents do I need for KYC verification?',
          answer: 'You\'ll need a government-issued ID (passport, driver\'s license, or national ID card) and proof of address (utility bill or bank statement from the last 3 months).',
        },
        {
          question: 'How long does account verification take?',
          answer: 'Most accounts are verified within 24 hours. During peak times, it may take up to 48 hours. You\'ll receive an email once your account is verified.',
        },
      ],
    },
    {
      name: 'Deposits & Withdrawals',
      faqs: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept bank transfers, credit/debit cards, and cryptocurrency deposits (BTC, ETH, USDT). All major payment methods are supported.',
        },
        {
          question: 'How long do deposits take?',
          answer: 'Crypto deposits are instant. Bank transfers take 1-3 business days. Card deposits are processed within minutes.',
        },
        {
          question: 'Are there any deposit fees?',
          answer: 'We don\'t charge deposit fees. However, your bank or payment provider may charge their own fees.',
        },
        {
          question: 'How do I withdraw funds?',
          answer: 'Go to Funds → Withdraw, select your preferred method, enter the amount, and confirm. Withdrawals are processed within 24 hours.',
        },
      ],
    },
    {
      name: 'Trading',
      faqs: [
        {
          question: 'What assets can I trade?',
          answer: 'You can trade cryptocurrencies, stocks, forex, commodities, and indices. We offer over 500 trading instruments.',
        },
        {
          question: 'What are your trading fees?',
          answer: 'Trading fees start at 0.1% per trade. Pro users get 0.05% and Enterprise users get 0.01%. No hidden fees.',
        },
        {
          question: 'Can I trade on mobile?',
          answer: 'Yes! Our mobile app is available on iOS and Android. Trade anywhere, anytime with full functionality.',
        },
        {
          question: 'What is copy trading?',
          answer: 'Copy trading lets you automatically copy the trades of successful traders. You can follow multiple traders and customize your risk settings.',
        },
      ],
    },
    {
      name: 'Security',
      faqs: [
        {
          question: 'How secure is my account?',
          answer: 'We use bank-level security with 256-bit encryption, two-factor authentication, and cold storage for crypto assets. Your funds are protected by insurance.',
        },
        {
          question: 'What is two-factor authentication (2FA)?',
          answer: '2FA adds an extra layer of security by requiring a code from your phone in addition to your password. We highly recommend enabling it.',
        },
        {
          question: 'What happens if I forget my password?',
          answer: 'Click "Forgot Password" on the login page. We\'ll send you a reset link via email. Follow the instructions to create a new password.',
        },
      ],
    },
    {
      name: 'Account & Support',
      faqs: [
        {
          question: 'How do I contact support?',
          answer: 'You can reach us via live chat (24/7), email (support@vertexridge.com), or phone (+1 555-123-4567). Average response time is under 5 minutes.',
        },
        {
          question: 'Can I have multiple accounts?',
          answer: 'Each person is allowed one account. Multiple accounts may result in suspension. However, you can have multiple sub-accounts for different strategies.',
        },
        {
          question: 'How do I close my account?',
          answer: 'Contact our support team to initiate account closure. Withdraw all funds first. Account closure takes 7-14 days for security reasons.',
        },
      ],
    },
  ];

  const filteredCategories = categories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.faqs.length > 0);

  const toggleFAQ = (categoryIndex, faqIndex) => {
    const index = `${categoryIndex}-${faqIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
              <span className="text-xs font-bold tracking-widest text-primary uppercase">FAQ</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              Frequently Asked <br />
              <span className="text-primary">Questions</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-8">
              Find answers to common questions about Vertex Ridge. Can't find what you're looking for? Contact our support team.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for answers..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="pb-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60">No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredCategories.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h2 className="text-2xl md:text-3xl font-bold mb-6">{category.name}</h2>
                  <div className="space-y-4">
                    {category.faqs.map((faq, faqIndex) => {
                      const index = `${categoryIndex}-${faqIndex}`;
                      const isOpen = openIndex === index;

                      return (
                        <motion.div
                          key={faqIndex}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: faqIndex * 0.05 }}
                          viewport={{ once: true }}
                          className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all"
                        >
                          <button
                            onClick={() => toggleFAQ(categoryIndex, faqIndex)}
                            className="w-full flex items-center justify-between p-6 text-left"
                          >
                            <span className="font-bold text-lg pr-4">{faq.question}</span>
                            <ChevronDown
                              className={`w-5 h-5 text-primary flex-shrink-0 transition-transform ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="px-6 pb-6 text-white/60 leading-relaxed">
                                  {faq.answer}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Still Have Questions?
          </h2>
          <p className="text-lg text-white/60 mb-8">
            Our support team is available 24/7 to help you with any questions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-block px-8 py-4 bg-primary text-dark font-bold rounded-xl hover:bg-primary/90 transition-all"
            >
              Contact Support
            </Link>
            <button className="inline-block px-8 py-4 bg-white/10 border border-white/20 font-bold rounded-xl hover:bg-white/20 transition-all">
              Live Chat
            </button>
          </div>
        </div>
      </section>

      <AppCTA />
    </div>
  );
};

export default FAQ;

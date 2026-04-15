import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import Navbar from '../../component/Navbar';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: 'Starter',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for beginners',
      features: [
        { text: '$50 welcome bonus', included: true },
        { text: 'Basic trading features', included: true },
        { text: '0.1% trading fee', included: true },
        { text: 'Email support', included: true },
        { text: 'Mobile app access', included: true },
        { text: 'Advanced analytics', included: false },
        { text: 'Copy trading', included: false },
        { text: 'Priority support', included: false },
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro',
      price: { monthly: 29, yearly: 290 },
      description: 'For serious traders',
      features: [
        { text: '$100 welcome bonus', included: true },
        { text: 'All Starter features', included: true },
        { text: '0.05% trading fee', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Copy trading', included: true },
        { text: 'Priority email support', included: true },
        { text: 'API access', included: true },
        { text: '24/7 phone support', included: false },
      ],
      cta: 'Start Pro Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: { monthly: 99, yearly: 990 },
      description: 'For professional traders',
      features: [
        { text: '$500 welcome bonus', included: true },
        { text: 'All Pro features', included: true },
        { text: '0.01% trading fee', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: '24/7 phone support', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'White-label options', included: true },
        { text: 'Institutional features', included: true },
      ],
      cta: 'Contact Sales',
      popular: false,
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
              <span className="text-xs font-bold tracking-widest text-primary uppercase">Pricing</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              Simple, Transparent <br />
              <span className="text-primary">Pricing</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed mb-8">
              Choose the plan that fits your trading style. Upgrade or downgrade anytime.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 rounded-full p-2">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-primary text-dark'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full font-bold transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-primary text-dark'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative bg-white/5 border rounded-3xl p-8 ${
                  plan.popular
                    ? 'border-primary shadow-2xl shadow-primary/20 scale-105'
                    : 'border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary text-dark px-4 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-white/60 text-sm mb-6">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold">
                      ${plan.price[billingCycle]}
                    </span>
                    <span className="text-white/40">
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-white/20 flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={
                          feature.included ? 'text-white' : 'text-white/40'
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.name === 'Enterprise' ? '/contact' : '/register'}
                  className={`block w-full py-4 rounded-xl font-bold text-center transition-all ${
                    plan.popular
                      ? 'bg-primary text-dark hover:bg-primary/90'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 md:px-8 bg-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-6">
            {[
              {
                q: 'Can I change plans later?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, bank transfers, and cryptocurrency payments.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! All paid plans come with a 14-day free trial. No credit card required.',
              },
              {
                q: 'What happens if I exceed my limits?',
                a: 'We\'ll notify you before you reach your limits. You can upgrade anytime to increase your limits.',
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-dark border border-white/10 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold mb-2">{faq.q}</h3>
                <p className="text-white/60">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;

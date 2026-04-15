import React from 'react';
import Navbar from '../../component/Navbar';
import Hero from '../../component/Hero';
import AssetGrid from '../../component/AssetGrid';
import Features from '../../component/Features';
import FAQSection from '../../component/FAQSection';
import CTASection from '../../component/CTASection';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-dark text-white font-sans selection:bg-primary selection:text-dark">
      <Navbar />
      <main>
        <Hero />
        <AssetGrid />
        <Features />
        <FAQSection />
        <CTASection />
      </main>
    </div>
  );
};

export default LandingPage;

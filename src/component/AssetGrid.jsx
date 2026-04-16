import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Globe, Briefcase, BarChart3, Database, TrendingUp } from 'lucide-react';

const AssetGrid = () => {

 const assets = [
  {
    name: 'Stocks Trading',
    icon: LineChart,
    bg: 'bg-primary/10',
    text: 'Buy and sell shares of publicly listed companies to grow your portfolio and earn returns through price appreciation and dividends.',
  },
  {
    name: 'Forex Trading',
    icon: Globe,
    bg: 'bg-primary/10',
    text: 'Trade global currency pairs like EUR/USD and GBP/JPY, capitalizing on exchange rate fluctuations in the world\'s largest financial market.',
  },
  {
    name: 'Commodities Trading',
    icon: Briefcase,
    bg: 'bg-primary/10',
    text: 'Invest in physical goods like gold, oil, and agricultural products, using commodity markets to diversify and hedge against inflation.',
  },
  {
    name: 'Stocks Indices',
    icon: BarChart3,
    bg: 'bg-primary/10',
    text: 'Gain broad market exposure by trading indices like the S&P 500 and NASDAQ, reflecting the overall performance of a basket of top stocks.',
  },
  {
    name: 'Cryptos Trading',
    icon: Database,
    bg: 'bg-primary/10',
    text: 'Trade leading digital assets like Bitcoin and Ethereum on a secure platform, taking advantage of crypto market volatility around the clock.',
  },
  {
    name: 'Bonds Trading',
    icon: TrendingUp,
    bg: 'bg-primary/10',
    text: 'Invest in government and corporate bonds for stable, predictable returns, balancing your portfolio with lower-risk fixed-income securities.',
  },
];

  return (
    <section className="bg-white py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-6 mb-16 md:mb-24">
          <div className="px-4 py-2 bg-primary/20 border border-primary/40 rounded-full w-fit">
            <span className="text-xs font-bold tracking-wider text-dark/80 uppercase">TRADING OPTION</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-dark tracking-tight">Trading Assets</h2>
          <p className="text-dark/60 max-w-xl text-lg leading-relaxed">
            Discover a wide range of trading opportunities with our diverse asset classes. 
            Tailored to your investment strategy and risk profile.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {assets.map((asset, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ 
                y: -10, 
                rotateX: 10, 
                rotateY: 10,
                boxShadow: "0 40px 80px rgba(0,0,0,0.1)"
              }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 30,
                delay: index * 0.05 
              }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-3xl border border-dark/5 hover:border-primary/40 group transition-all flex flex-col gap-6 cursor-pointer"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className={`w-14 h-14 rounded-2xl ${asset.bg} flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-dark transition-all translate-z-10`}>
                <asset.icon className="w-7 h-7" />
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-xl font-bold text-dark group-hover:text-primary transition-colors">{asset.name}</h3>
                <p className="text-dark/40 text-sm leading-relaxed">
                  {asset.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AssetGrid;

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  ChevronRight,
  Wallet,
  BarChart3,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { Card, Button } from '../../component/shared/UI';
import { useUser } from '../../context/UserContext';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { fetchTrending, fetchPrices, formatPrice, formatChange } from '../../services/marketService';
import { copyTradingService } from '../../services/copyTradingService';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

// ────────────────────────────────────
// Mini Sparkline Component
// ────────────────────────────────────
const Sparkline = ({ data, positive }) => {
  if (!data || data.length === 0) return null;
  const chartData = data.filter((_, i) => i % 4 === 0).map((price, i) => ({ i, price }));
  const color = positive ? '#22c55e' : '#ef4444';

  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={`spark-${positive ? 'g' : 'r'}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${positive ? 'g' : 'r'})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// ────────────────────────────────────
// Dashboard
// ────────────────────────────────────
const Dashboard = () => {
  const { user, holdings, tradeHistory, transactions } = useUser();
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [holdingPrices, setHoldingPrices] = useState({});
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [copyPL, setCopyPL] = useState(0);

  // Unified activity feed
  const recentActivity = [
    ...tradeHistory.map(t => ({ ...t, activityType: 'trade' })),
    ...transactions.map(tx => ({ 
      ...tx, 
      activityType: 'finance', 
      total: tx.amount,
      timestamp: tx.timestamp 
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 8);

  useEffect(() => {
    loadMarketData();
    loadCopyTradingStats();
  }, []);

  useEffect(() => {
    if (holdings.length > 0) {
      loadHoldingPrices();
    }
  }, [holdings]);

  const loadMarketData = async () => {
    try {
      const data = await fetchTrending();
      setTrending(data);
    } catch (err) {
      console.error('Failed to load trending:', err);
    } finally {
      setLoadingMarket(false);
    }
  };

  const loadCopyTradingStats = async () => {
    try {
      const relationships = await copyTradingService.getMyCopies();
      const active = relationships?.filter(r => r.status === 'active') || [];
      const totalPL = active.reduce((sum, r) => sum + (r.total_profit || 0), 0);
      setCopyPL(totalPL);
    } catch (err) {
      // silently fail — user may not have any copies yet
    }
  };

  const loadHoldingPrices = async () => {
    try {
      const ids = holdings.map((h) => h.assetId);
      const prices = await fetchPrices(ids);
      const map = {};
      prices.forEach((p) => { map[p.id] = p; });
      setHoldingPrices(map);
    } catch (err) {
      console.error('Failed to load holding prices:', err);
    }
  };

  // Calculate portfolio value
  const portfolioValue = holdings.reduce((acc, h) => {
    const livePrice = holdingPrices[h.assetId]?.price || h.avgBuyPrice;
    return acc + h.quantity * livePrice;
  }, 0);

  const portfolioCost = holdings.reduce((acc, h) => acc + h.quantity * h.avgBuyPrice, 0);
  const portfolioPL = portfolioValue - portfolioCost;
  const portfolioPLPercent = portfolioCost > 0 ? (portfolioPL / portfolioCost) * 100 : 0;

  const totalBalance = (user?.balance || 0) + portfolioValue;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 lg:gap-8 pb-24 lg:pb-8"
    >
      {/* KYC Alert */}
      {user?.kycStatus !== 'verified' && (
        <motion.div
          variants={itemVariants}
          className="bg-primary/5 border border-primary/20 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="text-primary w-5 h-5 flex-shrink-0" />
            <p className="text-sm">Complete verification to unlock all features.</p>
          </div>
          <Link to="/onboarding">
            <Button className="px-6 py-2 text-xs leading-none whitespace-nowrap">Verify Now</Button>
          </Link>
        </motion.div>
      )}

      {/* ═══ Stats Cards ═══ */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Balance */}
        <Card className="flex flex-col gap-2 sm:gap-3 relative overflow-hidden group p-4 sm:p-6">
          <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
            <Wallet className="w-16 h-16 sm:w-24 sm:h-24 text-primary" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] sm:tracking-[0.2em]">Total Balance</span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono tracking-tighter animate-count break-all">
            ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[9px] sm:text-[10px] font-bold text-white/20 uppercase tracking-wider sm:tracking-widest truncate">Cash: ${(user?.balance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
        </Card>

        {/* Daily P/L */}
        <Card className="flex flex-col gap-2 sm:gap-3 relative overflow-hidden group p-4 sm:p-6">
          <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
            {portfolioPL >= 0 ? <TrendingUp className="w-16 h-16 sm:w-24 sm:h-24 text-profit" /> : <TrendingDown className="w-16 h-16 sm:w-24 sm:h-24 text-loss" />}
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] sm:tracking-[0.2em]">Portfolio P/L</span>
          <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold font-mono tracking-tighter animate-count break-all ${portfolioPL >= 0 ? 'text-profit' : 'text-loss'}`}>
            {portfolioPL >= 0 ? '+' : ''}{formatPrice(portfolioPL)}
          </h2>
          <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full w-fit ${portfolioPL >= 0 ? 'text-profit bg-profit/10' : 'text-loss bg-loss/10'}`}>
            {formatChange(portfolioPLPercent)}
          </span>
        </Card>

        {/* Holdings Count */}
        <Card className="flex flex-col gap-2 sm:gap-3 relative overflow-hidden group p-4 sm:p-6">
          <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
            <BarChart3 className="w-16 h-16 sm:w-24 sm:h-24 text-primary" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] sm:tracking-[0.2em]">Holdings</span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono tracking-tighter animate-count">
            {holdings.length}
          </h2>
          <span className="text-[9px] sm:text-[10px] font-bold text-white/20 uppercase tracking-wider sm:tracking-widest truncate">
            {tradeHistory.length} trades total
          </span>
        </Card>

        {/* Total Profit */}
        <Card className="flex flex-col gap-2 sm:gap-3 relative overflow-hidden group p-4 sm:p-6">
          <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
            <TrendingUp className="w-16 h-16 sm:w-24 sm:h-24 text-profit" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] sm:tracking-[0.2em]">Total Profit</span>
          <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold font-mono tracking-tighter animate-count break-all ${(portfolioPL + copyPL) >= 0 ? 'text-profit' : 'text-loss'}`}>
            {(portfolioPL + copyPL) >= 0 ? '+' : ''}{formatPrice(portfolioPL + copyPL)}
          </h2>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${(portfolioPL + copyPL) >= 0 ? 'text-profit bg-profit/10' : 'text-loss bg-loss/10'}`}>
              Trading + Copies
            </span>
          </div>
        </Card>
      </motion.div>

      {/* ═══ Main Grid ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Left: Holdings + Market Movers */}
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6 lg:gap-8">

          {/* My Holdings */}
          <motion.div variants={itemVariants}>
            <Card noPadding className="flex flex-col">
              <div className="p-4 sm:p-6 lg:p-8 border-b border-white/5 flex items-center justify-between gap-4">
                <h3 className="text-base sm:text-lg font-bold">My Holdings</h3>
                <Link to="/trade" className="text-primary text-xs font-bold hover:underline flex items-center gap-1 whitespace-nowrap">
                  Trade <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {holdings.length > 0 ? (
                <div className="flex flex-col divide-y divide-white/5">
                  {holdings.map((holding) => {
                    const live = holdingPrices[holding.assetId];
                    const currentPrice = live?.price || holding.avgBuyPrice;
                    const value = holding.quantity * currentPrice;
                    const pl = (currentPrice - holding.avgBuyPrice) / holding.avgBuyPrice * 100;
                    const positive = pl >= 0;

                    return (
                      <button
                        key={holding.assetId}
                        onClick={() => navigate(`/trade/${holding.assetId}`)}
                        className="p-3 sm:p-4 lg:p-6 flex items-center gap-2 sm:gap-4 hover:bg-white/[0.02] transition-colors text-left"
                      >
                        <img src={holding.image} alt={holding.symbol} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="font-bold text-xs sm:text-sm">{holding.symbol}</span>
                            <span className="text-[9px] sm:text-[10px] text-white/30 truncate">{holding.name}</span>
                          </div>
                          <span className="text-[10px] sm:text-xs text-white/40">{holding.quantity.toFixed(6)} units</span>
                        </div>
                        <div className="w-16 sm:w-20 hidden md:block">
                          <Sparkline data={live?.sparkline} positive={positive} />
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-xs sm:text-sm font-mono">{formatPrice(value)}</span>
                          <span className={`text-[10px] sm:text-[11px] font-bold ${positive ? 'text-profit' : 'text-loss'}`}>
                            {formatChange(pl)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 sm:p-12 lg:p-16 flex flex-col items-center justify-center gap-3 sm:gap-4 text-center">
                  <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-white/5" />
                  <p className="text-white/20 text-xs sm:text-sm">No holdings yet</p>
                  <Link to="/markets">
                    <Button className="px-4 sm:px-6 py-2 text-xs">Browse Markets</Button>
                  </Link>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Market Movers */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-bold">Market Movers</h3>
              <Link to="/markets" className="text-primary text-xs font-bold hover:underline flex items-center gap-1 whitespace-nowrap">
                See All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2">
              {loadingMarket ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="min-w-[140px] sm:min-w-[160px] h-[120px] sm:h-[140px] bg-card border border-white/5 rounded-2xl animate-pulse flex-shrink-0" />
                ))
              ) : (
                trending.slice(0, 8).map((coin) => {
                  const positive = coin.change24h >= 0;
                  return (
                    <button
                      key={coin.id}
                      onClick={() => navigate(`/trade/${coin.id}`)}
                      className="min-w-[140px] sm:min-w-[160px] bg-card border border-white/5 rounded-2xl p-3 sm:p-4 flex flex-col gap-2 sm:gap-3 hover:border-primary/30 transition-all group text-left flex-shrink-0"
                    >
                      <div className="flex items-center gap-2">
                        <img src={coin.image} alt={coin.symbol} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="font-bold text-xs block">{coin.symbol}</span>
                          <p className="text-[9px] sm:text-[10px] text-white/30 truncate">{coin.name}</p>
                        </div>
                      </div>
                      <div className="h-7 sm:h-8">
                        <Sparkline data={coin.sparkline} positive={positive} />
                      </div>
                      <div className="flex items-end justify-between gap-2">
                        <span className="font-bold text-xs sm:text-sm font-mono truncate">{formatPrice(coin.price)}</span>
                        <span className={`text-[9px] sm:text-[10px] font-bold whitespace-nowrap ${positive ? 'text-profit' : 'text-loss'}`}>
                          {formatChange(coin.change24h)}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-6 lg:gap-8">
          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <Card noPadding className="flex flex-col">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-base font-bold">Recent Activity</h3>
                <Link to="/funds" className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline">View All</Link>
              </div>
              {recentActivity.length > 0 ? (
                <div className="flex flex-col divide-y divide-white/5">
                  {recentActivity.map((activity) => {
                    const isTrade = activity.activityType === 'trade';
                    const isPositive = isTrade ? activity.type === 'sell' : activity.type === 'deposit';
                    
                    return (
                      <div key={activity.id} className="p-4 lg:p-5 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isPositive ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}`}>
                          {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs capitalize">
                              {isTrade ? `${activity.type} ${activity.symbol}` : activity.type}
                            </span>
                          </div>
                          <span className="text-[10px] text-white/30">
                            {new Date(activity.timestamp).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <span className={`text-xs font-bold font-mono ${isPositive ? 'text-profit' : 'text-loss'}`}>
                          {isPositive ? '+' : '-'}${activity.total?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 flex flex-col items-center justify-center gap-3 text-center">
                  <Clock className="w-10 h-10 text-white/5" />
                  <p className="text-white/20 text-xs">No activity yet</p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Quick CTA */}
          <motion.div variants={itemVariants}>
            <Card className="bg-primary text-dark flex flex-col gap-4 p-6 border-none ring-8 ring-primary/5">
              <h3 className="text-lg font-bold leading-tight">Start Trading<br />in 30 seconds</h3>
              <p className="text-dark/60 text-sm">Browse the markets, pick a coin, and make your first trade.</p>
              <Link to="/markets">
                <Button variant="secondary" className="bg-dark text-white border-none py-3 w-full">
                  Explore Markets
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;

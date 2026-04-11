import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  Flame,
  Bookmark,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../../component/shared/UI';
import { useUser } from '../../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchTrending,
  fetchPrices,
  searchAssets,
  formatPrice,
  formatChange,
} from '../../services/marketService';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const POLL_INTERVAL = 10000; // refresh every 10s

// ────────────────────────────────────
// Mini Sparkline
// ────────────────────────────────────
const Sparkline = ({ data, positive }) => {
  if (!data || data.length === 0) return null;
  const chartData = data.filter((_, i) => i % 4 === 0).map((price, i) => ({ i, price }));
  const color = positive ? '#22c55e' : '#ef4444';
  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={`mkt-${positive ? 'g' : 'r'}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="price" stroke={color} strokeWidth={1.5}
          fill={`url(#mkt-${positive ? 'g' : 'r'})`} dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// ────────────────────────────────────
// Live price cell — flashes on change
// ────────────────────────────────────
const LivePrice = ({ price }) => {
  const [flash, setFlash] = useState(null);
  const prevPrice = useRef(price);

  useEffect(() => {
    if (prevPrice.current == null) { prevPrice.current = price; return; }
    if (price === prevPrice.current) return;
    setFlash(price > prevPrice.current ? 'up' : 'down');
    prevPrice.current = price;
    const t = setTimeout(() => setFlash(null), 800);
    return () => clearTimeout(t);
  }, [price]);

  return (
    <span className={`font-bold text-sm font-mono transition-colors duration-500 ${
      flash === 'up' ? 'text-profit' : flash === 'down' ? 'text-loss' : ''
    }`}>
      ${formatPrice(price)}
    </span>
  );
};

// ────────────────────────────────────
// Markets Page
// ────────────────────────────────────
const Markets = () => {
  const navigate = useNavigate();
  const { toggleWatchlist, isWatchlisted, watchlist } = useUser();

  const [tab, setTab] = useState('trending');
  const [trending, setTrending] = useState([]);
  const [watchlistData, setWatchlistData] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const pollRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const loadTrending = useCallback(async (silent = false) => {
    if (!silent) setLoadingTrending(true);
    else setRefreshing(true);
    try {
      const data = await fetchTrending();
      setTrending(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load trending:', err);
    } finally {
      setLoadingTrending(false);
      setRefreshing(false);
    }
  }, []);

  const loadWatchlistPrices = useCallback(async (silent = false) => {
    if (!silent) setLoadingWatchlist(true);
    try {
      const data = await fetchPrices(watchlist);
      setWatchlistData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    } finally {
      setLoadingWatchlist(false);
    }
  }, [watchlist]);

  useEffect(() => { loadTrending(); }, []);

  useEffect(() => {
    if (tab === 'watchlist' && watchlist.length > 0) loadWatchlistPrices();
  }, [tab, watchlist]);

  // Auto-poll every 30s
  useEffect(() => {
    pollRef.current = setInterval(() => {
      if (tab === 'trending') loadTrending(true);
      else if (watchlist.length > 0) loadWatchlistPrices(true);
    }, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [tab, watchlist, loadTrending, loadWatchlistPrices]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchAssets(searchQuery);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  const displayList = tab === 'watchlist' ? watchlistData : trending;

  return (
    <div className="flex flex-col gap-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Markets</h1>
          <p className="text-white/30 text-sm mt-1">Discover and track your favourite coins</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-profit animate-pulse" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Live</span>
          </div>
          {lastUpdated && (
            <span className="hidden sm:block text-[10px] text-white/20">
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => tab === 'trending' ? loadTrending(true) : loadWatchlistPrices(true)}
            disabled={refreshing}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <RefreshCw className={`w-4 h-4 text-white/40 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        <input
          id="market-search"
          type="text"
          placeholder="Search coins by name or symbol..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-card border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Search Results */}
      {isSearching && (
        <Card noPadding className="flex flex-col">
          <div className="p-4 border-b border-white/5">
            <span className="text-xs font-bold text-white/30 uppercase tracking-widest">
              Search Results
            </span>
          </div>
          {searchLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="flex flex-col divide-y divide-white/5">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <button
                    onClick={() => navigate(`/trade/${result.id}`)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <img src={result.image} alt={result.symbol} className="w-9 h-9 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-sm">{result.symbol}</span>
                      <p className="text-xs text-white/30 truncate">{result.name}</p>
                    </div>
                    {result.marketCapRank && (
                      <span className="text-[10px] text-white/20 font-mono bg-white/5 px-2 py-1 rounded-lg">
                        #{result.marketCapRank}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWatchlist(result.id); }}
                    className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 transition-colors ${
                        isWatchlisted(result.id) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-white/20 text-sm py-12">No results found</p>
          )}
        </Card>
      )}

      {/* Tabs */}
      {!isSearching && (
        <>
          <div className="flex gap-1 bg-white/5 rounded-2xl p-1">
            <button
              onClick={() => setTab('trending')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === 'trending' ? 'bg-card text-white' : 'text-white/30 hover:text-white/50'
              }`}
            >
              <Flame className="w-4 h-4" />
              Trending
            </button>
            <button
              onClick={() => setTab('watchlist')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === 'watchlist' ? 'bg-card text-white' : 'text-white/30 hover:text-white/50'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              Watchlist
              {watchlist.length > 0 && (
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {watchlist.length}
                </span>
              )}
            </button>
          </div>

          {/* Asset List */}
          {loadingTrending && tab === 'trending' ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-16 bg-card border border-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : tab === 'watchlist' && watchlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Star className="w-16 h-16 text-white/5" />
              <p className="text-white/20 text-sm">Your watchlist is empty</p>
              <p className="text-white/10 text-xs max-w-[240px] text-center">
                Tap the star icon on any coin to add it here
              </p>
            </div>
          ) : loadingWatchlist && tab === 'watchlist' ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-2"
            >
              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-[1fr_100px_100px_80px_40px] gap-4 px-4 py-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                <span>Asset</span>
                <span className="text-right">Price</span>
                <span className="text-right">24h Change</span>
                <span className="text-right">Chart</span>
                <span />
              </div>

              {displayList.map((coin) => {
                const positive = (coin.change24h || 0) >= 0;
                return (
                  <motion.div key={coin.id} variants={itemVariants}>
                    <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-card border border-white/5 rounded-2xl hover:border-primary/20 transition-all group sm:grid sm:grid-cols-[1fr_100px_100px_80px_40px]">
                      <button
                        onClick={() => navigate(`/trade/${coin.id}`)}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left"
                      >
                        <img src={coin.image} alt={coin.symbol} className="w-9 h-9 rounded-full flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="font-bold text-sm">{coin.symbol}</span>
                          <p className="text-[11px] text-white/30 truncate">{coin.name}</p>
                        </div>
                      </button>

                      <button
                        onClick={() => navigate(`/trade/${coin.id}`)}
                        className="text-right"
                      >
                        <LivePrice price={coin.price} />
                      </button>

                      <button
                        onClick={() => navigate(`/trade/${coin.id}`)}
                        className="text-right hidden sm:block"
                      >
                        <span className={`text-xs font-bold inline-flex items-center gap-1 ${positive ? 'text-profit' : 'text-loss'}`}>
                          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {formatChange(coin.change24h)}
                        </span>
                      </button>

                      <div className="hidden sm:block w-20">
                        <Sparkline data={coin.sparkline} positive={positive} />
                      </div>

                      {/* Mobile change indicator */}
                      <span className={`sm:hidden text-[11px] font-bold ${positive ? 'text-profit' : 'text-loss'}`}>
                        {formatChange(coin.change24h)}
                      </span>

                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWatchlist(coin.id); }}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <Star
                          className={`w-4 h-4 transition-all ${
                            isWatchlisted(coin.id)
                              ? 'text-yellow-400 fill-yellow-400 scale-110'
                              : 'text-white/10 group-hover:text-white/30'
                          }`}
                        />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Markets;

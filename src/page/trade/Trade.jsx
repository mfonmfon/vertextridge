import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Search,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Card, Button, Input } from '../../component/shared/UI';
import { useUser } from '../../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchCoinDetail,
  fetchChart,
  searchAssets,
  fetchPrices,
  formatPrice,
  formatChange,
} from '../../services/marketService';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// ────────────────────────────────────
// Custom Chart Tooltip
// ────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-white/10 rounded-xl px-3 py-2">
      <p className="text-xs font-mono font-bold">{formatPrice(payload[0].value)}</p>
      <p className="text-[10px] text-white/40">
        {new Date(payload[0].payload.time).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  );
};

// ────────────────────────────────────
// Trade Page
// ────────────────────────────────────
const Trade = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const { user, holdings, executeTrade, toggleWatchlist, isWatchlisted } = useUser();

  const [coin, setCoin] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartRange, setChartRange] = useState('7');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  // Trade form
  const [tradeType, setTradeType] = useState('buy');
  const [inputMode, setInputMode] = useState('usd'); // 'usd' or 'qty'
  const [inputValue, setInputValue] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Asset picker
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Load coin on mount / assetId change
  useEffect(() => {
    if (assetId) {
      loadCoin(assetId);
    } else {
      loadCoin('bitcoin');
    }
  }, [assetId]);

  // Load chart when range or coin changes
  useEffect(() => {
    if (coin?.id) loadChart(coin.id, chartRange);
  }, [coin?.id, chartRange]);

  const loadCoin = async (id) => {
    setLoading(true);
    try {
      const data = await fetchCoinDetail(id);
      setCoin(data);
    } catch (err) {
      console.error('Failed to load coin:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadChart = async (id, days) => {
    setChartLoading(true);
    try {
      const data = await fetchChart(id, days);
      // Extract the prices array and format it for the chart
      const formattedData = data.prices?.map(point => ({
        time: point.timestamp,
        price: point.price
      })) || [];
      setChartData(formattedData);
    } catch (err) {
      console.error('Failed to load chart:', err);
      setChartData([]); // Set empty array on error
    } finally {
      setChartLoading(false);
    }
  };

  // Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
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

  // Calculations
  const quantity = useMemo(() => {
    if (!coin?.price || !inputValue) return 0;
    if (inputMode === 'usd') return parseFloat(inputValue) / coin.price;
    return parseFloat(inputValue);
  }, [inputValue, inputMode, coin?.price]);

  const total = useMemo(() => {
    if (!coin?.price || !inputValue) return 0;
    if (inputMode === 'usd') return parseFloat(inputValue);
    return parseFloat(inputValue) * coin.price;
  }, [inputValue, inputMode, coin?.price]);

  const holdingForCoin = holdings.find((h) => h.assetId === coin?.id);
  const maxSellQty = holdingForCoin?.quantity || 0;

  const canTrade = () => {
    if (!coin?.price || !inputValue || total <= 0) return false;
    if (tradeType === 'buy' && total > (user?.balance || 0)) return false;
    if (tradeType === 'sell' && quantity > maxSellQty) return false;
    return true;
  };

  const handleTrade = () => {
    if (!canTrade()) return;
    const success = executeTrade(
      { id: coin.id, symbol: coin.symbol, name: coin.name, image: coin.image },
      tradeType,
      quantity,
      coin.price
    );
    if (success) {
      setShowSuccess(true);
      setInputValue('');
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const selectAsset = (assetResult) => {
    setShowPicker(false);
    setSearchQuery('');
    navigate(`/trade/${assetResult.id}`);
  };

  const ranges = [
    { label: '24H', value: '1' },
    { label: '7D', value: '7' },
    { label: '30D', value: '30' },
    { label: '90D', value: '90' },
  ];

  const positive = (coin?.change24h || 0) >= 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24 lg:pb-8 max-w-5xl mx-auto">
      {/* ═══ Header ═══ */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white/60" />
        </button>

        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-primary/30 transition-all"
        >
          {coin?.image && <img src={coin.image} alt={coin.symbol} className="w-6 h-6 rounded-full" />}
          <span className="font-bold text-sm">{coin?.symbol || 'Select'}</span>
          <ChevronDown className="w-4 h-4 text-white/30" />
        </button>

        <button
          onClick={() => coin && toggleWatchlist(coin.id)}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <Star
            className={`w-5 h-5 transition-colors ${coin && isWatchlisted(coin.id) ? 'text-yellow-400 fill-yellow-400' : 'text-white/30'}`}
          />
        </button>
      </div>

      {/* ═══ Price Display ═══ */}
      <div className="text-center">
        <h1 className="text-4xl lg:text-5xl font-bold font-mono tracking-tighter">
          {formatPrice(coin?.price)}
        </h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          {positive ? (
            <TrendingUp className="w-4 h-4 text-profit" />
          ) : (
            <TrendingDown className="w-4 h-4 text-loss" />
          )}
          <span className={`text-sm font-bold ${positive ? 'text-profit' : 'text-loss'}`}>
            {formatChange(coin?.change24h)}
          </span>
          <span className="text-xs text-white/20">24h</span>
          <span className="w-1.5 h-1.5 rounded-full bg-profit pulse-glow ml-1" />
          <span className="text-[10px] text-white/20 uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* ═══ Chart ═══ */}
      <Card className="p-0 overflow-hidden">
        {/* Range selector */}
        <div className="flex gap-1 p-4 border-b border-white/5">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setChartRange(r.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                chartRange === r.value
                  ? 'bg-primary text-dark'
                  : 'bg-white/5 text-white/40 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="h-[200px] lg:h-[280px] px-2">
          {chartLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={positive ? '#22c55e' : '#ef4444'} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={positive ? '#22c55e' : '#ef4444'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={positive ? '#22c55e' : '#ef4444'}
                  strokeWidth={2}
                  fill="url(#chartGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-white/20 text-sm">No chart data available</p>
            </div>
          )}
        </div>

        {/* Price Stats */}
        {coin && (
          <div className="grid grid-cols-3 divide-x divide-white/5 border-t border-white/5">
            <div className="p-4 text-center">
              <span className="text-[10px] text-white/30 uppercase tracking-widest block">24H High</span>
              <span className="font-bold text-xs font-mono text-profit">{formatPrice(coin.high24h)}</span>
            </div>
            <div className="p-4 text-center">
              <span className="text-[10px] text-white/30 uppercase tracking-widest block">24H Low</span>
              <span className="font-bold text-xs font-mono text-loss">{formatPrice(coin.low24h)}</span>
            </div>
            <div className="p-4 text-center">
              <span className="text-[10px] text-white/30 uppercase tracking-widest block">Volume</span>
              <span className="font-bold text-xs font-mono">${coin.volume ? (coin.volume / 1e9).toFixed(2) + 'B' : '—'}</span>
            </div>
          </div>
        )}
      </Card>

      {/* ═══ Trade Panel ═══ */}
      <Card className="flex flex-col gap-6">
        {/* Buy / Sell Toggle */}
        <div className="flex bg-white/5 rounded-2xl p-1 gap-1">
          <button
            onClick={() => setTradeType('buy')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              tradeType === 'buy' ? 'bg-profit text-dark' : 'text-white/40 hover:text-white'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setTradeType('sell')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              tradeType === 'sell' ? 'bg-loss text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            Sell
          </button>
        </div>

        {/* Input Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setInputMode('usd'); setInputValue(''); }}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              inputMode === 'usd' ? 'bg-primary/10 text-primary' : 'text-white/30 hover:text-white/50'
            }`}
          >
            USD Amount
          </button>
          <button
            onClick={() => { setInputMode('qty'); setInputValue(''); }}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              inputMode === 'qty' ? 'bg-primary/10 text-primary' : 'text-white/30 hover:text-white/50'
            }`}
          >
            Quantity
          </button>
        </div>

        {/* Amount Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
            {inputMode === 'usd' ? 'Amount in USD' : `Quantity (${coin?.symbol || ''})`}
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-2xl font-mono font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>

        {/* Quick amounts */}
        {tradeType === 'buy' && (
          <div className="flex gap-2">
            {[25, 50, 100, 500].map((amt) => (
              <button
                key={amt}
                onClick={() => { setInputMode('usd'); setInputValue(String(amt)); }}
                className="flex-1 py-2 rounded-xl bg-white/5 text-xs font-bold text-white/40 hover:bg-white/10 hover:text-white transition-all"
              >
                ${amt}
              </button>
            ))}
          </div>
        )}

        {tradeType === 'sell' && maxSellQty > 0 && (
          <div className="flex gap-2">
            {[0.25, 0.5, 0.75, 1].map((pct) => (
              <button
                key={pct}
                onClick={() => { setInputMode('qty'); setInputValue(String(maxSellQty * pct)); }}
                className="flex-1 py-2 rounded-xl bg-white/5 text-xs font-bold text-white/40 hover:bg-white/10 hover:text-white transition-all"
              >
                {pct * 100}%
              </button>
            ))}
          </div>
        )}

        {/* Order Summary */}
        {inputValue && total > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white/5 rounded-2xl p-4 flex flex-col gap-2"
          >
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Price per {coin?.symbol}</span>
              <span className="font-mono font-bold">{formatPrice(coin?.price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Quantity</span>
              <span className="font-mono font-bold">{quantity.toFixed(6)} {coin?.symbol}</span>
            </div>
            <div className="h-px bg-white/10 my-1" />
            <div className="flex justify-between text-base">
              <span className="font-bold">Total</span>
              <span className="font-mono font-bold">${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
          </motion.div>
        )}

        {/* Available balance / holdings info */}
        <div className="text-xs text-white/30 text-center">
          {tradeType === 'buy'
            ? `Available: $${(user?.balance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
            : `Holding: ${maxSellQty.toFixed(6)} ${coin?.symbol || ''}`
          }
        </div>

        {/* Execute Button */}
        <Button
          onClick={handleTrade}
          disabled={!canTrade()}
          className={`w-full py-4 text-base ${
            tradeType === 'buy'
              ? 'bg-profit text-dark hover:bg-profit/90 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]'
              : 'bg-loss text-white hover:bg-loss/90 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]'
          }`}
        >
          {tradeType === 'buy' ? 'Buy' : 'Sell'} {coin?.symbol || ''}
        </Button>
      </Card>

      {/* ═══ Success Toast ═══ */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 bg-profit text-dark px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl shadow-profit/30 z-[100]"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold text-sm">
              {tradeType === 'buy' ? 'Purchase' : 'Sale'} executed successfully!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Asset Picker Modal ═══ */}
      <AnimatePresence>
        {showPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPicker(false)}
              className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-[70]"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed inset-x-0 bottom-0 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 bg-card border border-white/10 rounded-t-3xl lg:rounded-3xl z-[80] max-h-[70vh] lg:w-[480px] flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold">Select Asset</h3>
                <button onClick={() => setShowPicker(false)} className="text-white/30 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    placeholder="Search coins..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {searchLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => selectAsset(result)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                  >
                    <img src={result.image} alt={result.symbol} className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <span className="font-bold text-sm">{result.symbol}</span>
                      <p className="text-xs text-white/30">{result.name}</p>
                    </div>
                    {result.marketCapRank && (
                      <span className="text-[10px] text-white/20 font-mono">#{result.marketCapRank}</span>
                    )}
                  </button>
                ))}
                {!searchLoading && searchQuery && searchResults.length === 0 && (
                  <p className="text-center text-white/20 text-sm py-8">No results found</p>
                )}
                {!searchQuery && (
                  <p className="text-center text-white/20 text-xs py-8">Type to search for a coin…</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Trade;

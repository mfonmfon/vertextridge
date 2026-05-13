const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');
const marketController = require('../controllers/marketController');
const { protect } = require('../middleware/authMiddleware');

// Cache: 10s for prices (live feel), 300s for charts, 120s for search
const priceCache = new NodeCache({ stdTTL: 10 });
const chartCache = new NodeCache({ stdTTL: 300 });
const searchCache = new NodeCache({ stdTTL: 120 });

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// Helper: fetch with error handling and Binance fallback
async function geckoFetch(url) {
  try {
    const res = await fetch(`${COINGECKO_BASE}${url}`);
    if (!res.ok) {
      if (res.status === 429) {
        console.warn('CoinGecko rate limit hit, attempting fallback...');
      } else {
        console.warn(`CoinGecko API error ${res.status}, attempting fallback...`);
      }
      throw new Error('GECKO_ERROR');
    }
    return res.json();
  } catch (err) {
    // If it's a price request, we can try Binance as fallback for ANY error
    if (url.includes('/coins/markets')) {
      console.log('Using Binance fallback for market data due to:', err.message);
      return await binanceFallback();
    }
    throw err;
  }
}

// Binance Fallback for top coins
async function binanceFallback() {
  const symbolMap = {
    'BTCUSDT': { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
    'ETHUSDT': { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
    'BNBUSDT': { id: 'binancecoin', symbol: 'BNB', name: 'BNB', image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
    'SOLUSDT': { id: 'solana', symbol: 'SOL', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
    'ADAUSDT': { id: 'cardano', symbol: 'ADA', name: 'Cardano', image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png' },
    'XRPUSDT': { id: 'ripple', symbol: 'XRP', name: 'XRP', image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' },
    'DOTUSDT': { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png' },
    'MATICUSDT': { id: 'polygon', symbol: 'MATIC', name: 'Polygon', image: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png' },
    'DOGEUSDT': { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png' },
    'AVAXUSDT': { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', image: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png' }
  };

  const symbols = Object.keys(symbolMap);
  const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(symbols)}`);
  const data = await res.json();
  
  return data.map(item => {
    const info = symbolMap[item.symbol] || { 
      id: item.symbol.replace('USDT', '').toLowerCase(),
      symbol: item.symbol.replace('USDT', ''),
      name: item.symbol.replace('USDT', ''),
      image: '' 
    };

    return {
      id: info.id,
      symbol: info.symbol,
      name: info.name,
      image: info.image || `https://assets.coingecko.com/coins/images/1/large/${info.id}.png`,
      current_price: parseFloat(item.lastPrice),
      price_change_percentage_24h: parseFloat(item.priceChangePercent),
      market_cap: 0,
      total_volume: parseFloat(item.volume),
      sparkline_in_7d: { price: [] }
    };
  });
}

// ──────────────────────────────────────────────
// GET /api/market/trending
// Top coins by market cap with sparkline data
// ──────────────────────────────────────────────
router.get('/trending', async (req, res) => {
  try {
    const cached = priceCache.get('trending');
    if (cached) return res.json(cached);

    const data = await geckoFetch(
      '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h,7d'
    );

    const normalized = data.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h,
      change7d: coin.price_change_percentage_7d_in_currency,
      marketCap: coin.market_cap,
      volume: coin.total_volume,
      sparkline: coin.sparkline_in_7d?.price || [],
      high24h: coin.high_24h,
      low24h: coin.low_24h,
    }));

    priceCache.set('trending', normalized);
    res.json(normalized);
  } catch (err) {
    console.error('Trending error:', err.message);
    res.status(500).json({ error: 'Failed to fetch trending assets' });
  }
});

// ──────────────────────────────────────────────
// GET /api/market/prices?ids=bitcoin,ethereum
// Get current prices for specific coin IDs
// ──────────────────────────────────────────────
router.get('/prices', async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.status(400).json({ error: 'ids query param required' });

    const cacheKey = `prices_${ids}`;
    const cached = priceCache.get(cacheKey);
    if (cached) return res.json(cached);

    const data = await geckoFetch(
      `/coins/markets?vs_currency=usd&ids=${ids}&sparkline=true&price_change_percentage=24h`
    );

    const normalized = data.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h,
      marketCap: coin.market_cap,
      volume: coin.total_volume,
      sparkline: coin.sparkline_in_7d?.price || [],
      high24h: coin.high_24h,
      low24h: coin.low_24h,
    }));

    priceCache.set(cacheKey, normalized);
    res.json(normalized);
  } catch (err) {
    console.error('Prices error:', err.message);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

// ──────────────────────────────────────────────
// GET /api/market/chart/:id?days=7
// Price history chart data
// ──────────────────────────────────────────────
router.get('/chart/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const days = req.query.days || '7';

    const cacheKey = `chart_${id}_${days}`;
    const cached = chartCache.get(cacheKey);
    if (cached) return res.json(cached);

    const data = await geckoFetch(
      `/coins/${id}/market_chart?vs_currency=usd&days=${days}`
    );

    const chartData = data.prices.map(([timestamp, price]) => ({
      time: timestamp,
      price: price,
    }));

    chartCache.set(cacheKey, chartData);
    res.json(chartData);
  } catch (err) {
    console.error('Chart error:', err.message);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

// ──────────────────────────────────────────────
// GET /api/market/search?q=bitcoin
// Search coins by name/symbol
// ──────────────────────────────────────────────
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'q query param required' });

    const cacheKey = `search_${q.toLowerCase()}`;
    const cached = searchCache.get(cacheKey);
    if (cached) return res.json(cached);

    const data = await geckoFetch(`/search?query=${encodeURIComponent(q)}`);

    const results = data.coins.slice(0, 15).map((coin) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.large || coin.thumb,
      marketCapRank: coin.market_cap_rank,
    }));

    searchCache.set(cacheKey, results);
    res.json(results);
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Failed to search assets' });
  }
});

// ──────────────────────────────────────────────
// GET /api/market/coin/:id
// Detailed info for a single coin
// ──────────────────────────────────────────────
router.get('/coin/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `coin_${id}`;
    const cached = priceCache.get(cacheKey);
    if (cached) return res.json(cached);

    const data = await geckoFetch(
      `/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`
    );

    const coin = {
      id: data.id,
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      image: data.image?.large || data.image?.small,
      price: data.market_data?.current_price?.usd,
      change24h: data.market_data?.price_change_percentage_24h,
      marketCap: data.market_data?.market_cap?.usd,
      volume: data.market_data?.total_volume?.usd,
      high24h: data.market_data?.high_24h?.usd,
      low24h: data.market_data?.low_24h?.usd,
      ath: data.market_data?.ath?.usd,
      athDate: data.market_data?.ath_date?.usd,
      description: data.description?.en?.slice(0, 300),
    };

    priceCache.set(cacheKey, coin);
    res.json(coin);
  } catch (err) {
    console.error('Coin detail error:', err.message);
    res.status(500).json({ error: 'Failed to fetch coin details' });
  }
});

// ──────────────────────────────────────────────
// Watchlist routes (protected)
// ──────────────────────────────────────────────
router.post('/watchlist/toggle', protect, marketController.toggleWatchlist);
router.get('/watchlist', protect, marketController.getWatchlist);

module.exports = router;

import { request } from './api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// ──────────────────────────────────────────────
// Market Data Service
// Uses backend API which proxies to CoinGecko
// ──────────────────────────────────────────────

export const marketService = {
  toggleWatchlist: async (assetId) => {
    return request('/market/watchlist/toggle', {
      method: 'POST',
      body: { assetId },
    });
  },

  getWatchlist: async () => {
    return request('/market/watchlist', {
      method: 'GET',
    });
  },
};

export async function fetchTrending() {
  try {
    // Use our backend API which proxies to CoinGecko
    const res = await fetch(`${API_BASE}/market/trending`);
    if (!res.ok) {
      console.error('Trending API failed with status:', res.status);
      throw new Error('Failed to fetch trending');
    }
    const data = await res.json();
    console.log('Trending data received:', data.length, 'coins');
    return data;
  } catch (error) {
    console.error('Error fetching trending:', error);
    // Fallback to mock data
    console.log('Using mock data fallback');
    return getMockTrendingData();
  }
}

export async function fetchPrices(ids) {
  if (!ids || ids.length === 0) return [];
  
  try {
    const res = await fetch(`${API_BASE}/market/prices?ids=${ids.join(',')}`);
    if (!res.ok) throw new Error('Failed to fetch prices');
    return await res.json();
  } catch (error) {
    console.error('Error fetching prices:', error);
    return [];
  }
}

export async function fetchChart(coinId, days = 7) {
  try {
    const res = await fetch(`${API_BASE}/market/chart/${coinId}?days=${days}`);
    if (!res.ok) throw new Error('Failed to fetch chart');
    const data = await res.json();
    
    return {
      prices: data.map(point => ({
        timestamp: point.time,
        price: point.price,
        date: new Date(point.time).toISOString()
      })),
      volumes: [] // Chart endpoint doesn't include volumes
    };
  } catch (error) {
    console.error('Error fetching chart:', error);
    return { prices: [], volumes: [] };
  }
}

export async function searchAssets(query) {
  if (!query || query.trim().length < 2) return [];
  
  try {
    const res = await fetch(`${API_BASE}/market/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search');
    const data = await res.json();
    
    // Get market data for search results
    if (data.length > 0) {
      const coinIds = data.slice(0, 10).map(coin => coin.id);
      try {
        const marketRes = await fetch(`${API_BASE}/market/prices?ids=${coinIds.join(',')}`);
        if (marketRes.ok) {
          const marketData = await marketRes.json();
          return marketData.map(coin => ({
            id: coin.id,
            symbol: coin.symbol,
            name: coin.name,
            image: coin.image,
            price: coin.price,
            change24h: coin.change24h,
            marketCap: coin.marketCap,
            marketCapRank: data.find(d => d.id === coin.id)?.marketCapRank
          }));
        }
      } catch (marketError) {
        console.error('Error fetching market data for search results:', marketError);
      }
    }
    
    // Return basic search results without market data
    return data.slice(0, 10);
  } catch (error) {
    console.error('Error searching assets:', error);
    return [];
  }
}

export async function fetchCoinDetail(coinId) {
  try {
    const res = await fetch(`${API_BASE}/market/coin/${coinId}`);
    if (!res.ok) throw new Error('Failed to fetch coin');
    const data = await res.json();
    
    return {
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      image: data.image,
      description: data.description,
      price: data.price,
      change24h: data.change24h,
      marketCap: data.marketCap,
      volume: data.volume,
      high24h: data.high24h,
      low24h: data.low24h,
      ath: data.ath,
      athDate: data.athDate,
      sparkline: []
    };
  } catch (error) {
    console.error('Error fetching coin detail:', error);
    throw error;
  }
}

// Mock data fallback
function getMockTrendingData() {
  return [
    {
      id: 'bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin',
      image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      price: 43250.50,
      change24h: 2.45,
      marketCap: 847000000000,
      volume: 15000000000,
      sparkline: [42000, 42500, 43000, 43250, 43100, 43250, 43300, 43250],
      marketCapRank: 1
    },
    {
      id: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      price: 2650.75,
      change24h: 1.85,
      marketCap: 318000000000,
      volume: 8500000000,
      sparkline: [2600, 2620, 2640, 2650, 2645, 2650, 2655, 2650],
      marketCapRank: 2
    },
    {
      id: 'tether',
      symbol: 'USDT',
      name: 'Tether',
      image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
      price: 1.00,
      change24h: 0.01,
      marketCap: 95000000000,
      volume: 45000000000,
      sparkline: [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00],
      marketCapRank: 3
    },
    {
      id: 'binancecoin',
      symbol: 'BNB',
      name: 'BNB',
      image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
      price: 315.25,
      change24h: 3.12,
      marketCap: 48000000000,
      volume: 1200000000,
      sparkline: [305, 308, 312, 315, 313, 315, 316, 315],
      marketCapRank: 4
    },
    {
      id: 'solana',
      symbol: 'SOL',
      name: 'Solana',
      image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
      price: 98.45,
      change24h: 5.67,
      marketCap: 42000000000,
      volume: 2100000000,
      sparkline: [93, 95, 96, 98, 97, 98, 99, 98],
      marketCapRank: 5
    },
    {
      id: 'ripple',
      symbol: 'XRP',
      name: 'XRP',
      image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
      price: 0.52,
      change24h: -1.23,
      marketCap: 28000000000,
      volume: 1500000000,
      sparkline: [0.53, 0.52, 0.52, 0.52, 0.52, 0.52, 0.52, 0.52],
      marketCapRank: 6
    },
    {
      id: 'usd-coin',
      symbol: 'USDC',
      name: 'USDC',
      image: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
      price: 1.00,
      change24h: 0.00,
      marketCap: 27000000000,
      volume: 5000000000,
      sparkline: [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00],
      marketCapRank: 7
    },
    {
      id: 'cardano',
      symbol: 'ADA',
      name: 'Cardano',
      image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
      price: 0.48,
      change24h: 2.34,
      marketCap: 17000000000,
      volume: 450000000,
      sparkline: [0.47, 0.47, 0.48, 0.48, 0.48, 0.48, 0.48, 0.48],
      marketCapRank: 8
    },
    {
      id: 'avalanche-2',
      symbol: 'AVAX',
      name: 'Avalanche',
      image: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
      price: 36.75,
      change24h: 4.21,
      marketCap: 14000000000,
      volume: 680000000,
      sparkline: [35, 35.5, 36, 36.5, 36.7, 36.8, 36.9, 36.75],
      marketCapRank: 9
    },
    {
      id: 'dogecoin',
      symbol: 'DOGE',
      name: 'Dogecoin',
      image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
      price: 0.085,
      change24h: 1.56,
      marketCap: 12000000000,
      volume: 850000000,
      sparkline: [0.084, 0.084, 0.085, 0.085, 0.085, 0.085, 0.085, 0.085],
      marketCapRank: 10
    },
    {
      id: 'polkadot',
      symbol: 'DOT',
      name: 'Polkadot',
      image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
      price: 7.25,
      change24h: -0.85,
      marketCap: 9500000000,
      volume: 320000000,
      sparkline: [7.3, 7.28, 7.26, 7.25, 7.24, 7.25, 7.26, 7.25],
      marketCapRank: 11
    },
    {
      id: 'polygon',
      symbol: 'MATIC',
      name: 'Polygon',
      image: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
      price: 0.92,
      change24h: 3.45,
      marketCap: 8500000000,
      volume: 420000000,
      sparkline: [0.89, 0.90, 0.91, 0.92, 0.92, 0.92, 0.92, 0.92],
      marketCapRank: 12
    },
    {
      id: 'chainlink',
      symbol: 'LINK',
      name: 'Chainlink',
      image: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
      price: 14.85,
      change24h: 2.67,
      marketCap: 8200000000,
      volume: 580000000,
      sparkline: [14.5, 14.6, 14.7, 14.8, 14.85, 14.85, 14.85, 14.85],
      marketCapRank: 13
    },
    {
      id: 'litecoin',
      symbol: 'LTC',
      name: 'Litecoin',
      image: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
      price: 72.50,
      change24h: 1.23,
      marketCap: 5400000000,
      volume: 420000000,
      sparkline: [71.5, 72, 72.2, 72.5, 72.4, 72.5, 72.5, 72.5],
      marketCapRank: 14
    },
    {
      id: 'uniswap',
      symbol: 'UNI',
      name: 'Uniswap',
      image: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png',
      price: 6.45,
      change24h: 4.12,
      marketCap: 4900000000,
      volume: 180000000,
      sparkline: [6.2, 6.3, 6.35, 6.4, 6.45, 6.45, 6.45, 6.45],
      marketCapRank: 15
    }
  ];
}

// Format helpers
export function formatPrice(price) {
  if (price == null) return '$0.00';
  if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${price.toFixed(6)}`;
}

export function formatChange(change) {
  if (change == null) return '0.00%';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

export function formatMarketCap(cap) {
  if (!cap) return '$0';
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
  return `$${cap.toLocaleString()}`;
}

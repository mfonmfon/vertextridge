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
    if (!res.ok) throw new Error('Failed to fetch trending');
    return await res.json();
  } catch (error) {
    console.error('Error fetching trending:', error);
    // Fallback to mock data
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
      sparkline: [42000, 42500, 43000, 43250, 43100, 43250],
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
      sparkline: [2600, 2620, 2640, 2650, 2645, 2650],
      marketCapRank: 2
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

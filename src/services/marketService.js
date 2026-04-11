import { request } from './api';

const API_BASE = 'http://localhost:5000/api';

// ──────────────────────────────────────────────
// Market Data Service
// Communicates with our Node.js backend proxy
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
  const res = await fetch(`${API_BASE}/market/trending`);
  if (!res.ok) throw new Error('Failed to fetch trending');
  return res.json();
}

export async function fetchPrices(ids) {
  const res = await fetch(`${API_BASE}/market/prices?ids=${ids.join(',')}`);
  if (!res.ok) throw new Error('Failed to fetch prices');
  return res.json();
}

export async function fetchChart(coinId, days = 7) {
  const res = await fetch(`${API_BASE}/market/chart/${coinId}?days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch chart');
  return res.json();
}

export async function searchAssets(query) {
  const res = await fetch(`${API_BASE}/market/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search');
  return res.json();
}

export async function fetchCoinDetail(coinId) {
  const res = await fetch(`${API_BASE}/market/coin/${coinId}`);
  if (!res.ok) throw new Error('Failed to fetch coin');
  return res.json();
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

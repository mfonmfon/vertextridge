import { request } from './api';

export const copyTradingService = {
  // Get all master traders
  getMasterTraders: async (sortBy = 'followers', limit = 20, offset = 0) => {
    return request(`/copy-trading/masters?sortBy=${sortBy}&limit=${limit}&offset=${offset}`, {
      method: 'GET',
    });
  },

  // Get single master trader details
  getMasterTrader: async (id) => {
    return request(`/copy-trading/masters/${id}`, {
      method: 'GET',
    });
  },

  // Start copying a trader
  startCopying: async (data) => {
    return request('/copy-trading/start', {
      method: 'POST',
      body: data,
    });
  },

  // Stop copying a trader
  stopCopying: async (relationshipId) => {
    return request(`/copy-trading/stop/${relationshipId}`, {
      method: 'POST',
    });
  },

  // Get my copy relationships
  getMyCopies: async () => {
    return request('/copy-trading/my-copies', {
      method: 'GET',
    });
  },

  // Get copied trades history
  getCopiedTrades: async (limit = 50, offset = 0) => {
    return request(`/copy-trading/copied-trades?limit=${limit}&offset=${offset}`, {
      method: 'GET',
    });
  },
};

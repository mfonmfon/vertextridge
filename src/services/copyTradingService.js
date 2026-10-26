import { request } from './api';

export const copyTradingService = {
  // Get all active master traders (created by admin)
  getMasterTraders: async (sortBy = 'followers', limit = 20, offset = 0) => {
    return request(`/copy-trading/masters?sortBy=${sortBy}&limit=${limit}&offset=${offset}`);
  },

  // Get single master trader details
  getMasterTrader: async (id) => {
    return request(`/copy-trading/masters/${id}`);
  },

  // Start copying a trader — userId is passed explicitly in the body
  startCopying: async (data) => {
    return request('/copy-trading/start', {
      method: 'POST',
      body: data  // data must include { userId, masterId, allocatedAmount, ... }
    });
  },

  // Stop copying a trader — userId is passed in the body
  stopCopying: async (relationshipId, userId) => {
    return request(`/copy-trading/stop/${relationshipId}`, {
      method: 'POST',
      body: { userId }
    });
  },

  // Get user's copy relationships — userId passed as query param
  getMyCopies: async (userId) => {
    try {
      if (!userId) return [];
      const response = await request(`/copy-trading/my-copies?userId=${userId}`);
      return response.relationships || [];
    } catch (error) {
      console.error('Error fetching copy relationships:', error);
      return [];
    }
  },

  // Get copied trades history — userId passed as query param
  getCopiedTrades: async (userId, limit = 50, offset = 0) => {
    try {
      if (!userId) return [];
      const response = await request(`/copy-trading/trades?userId=${userId}&limit=${limit}&offset=${offset}`);
      return response.trades || [];
    } catch (error) {
      console.error('Error fetching copied trades:', error);
      return [];
    }
  }
};

export default copyTradingService;

import { request } from './api';

export const tradeService = {
  execute: async (tradeData) => {
    return request('/trade/execute', {
      method: 'POST',
      body: tradeData,
    });
  },

  getHistory: async () => {
    return request('/trade/history', {
      method: 'GET',
    });
  },

  getHoldings: async () => {
    return request('/trade/holdings', {
      method: 'GET',
    });
  },
};

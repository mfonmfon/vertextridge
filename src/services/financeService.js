import { request } from './api';

export const financeService = {
  deposit: async (amount, method) => {
    return request('/finance/deposit', {
      method: 'POST',
      body: { amount, method },
    });
  },

  withdraw: async (amount, method) => {
    return request('/finance/withdraw', {
      method: 'POST',
      body: { amount, method },
    });
  },

  transfer: async (recipient, amount, note) => {
    return request('/finance/transfer', {
      method: 'POST',
      body: { recipient, amount, note },
    });
  },

  getTransactions: async () => {
    return request('/finance/transactions', {
      method: 'GET',
    });
  },
};

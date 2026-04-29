import { request } from './api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const copyTradingService = {
  // Get all master traders
  getMasterTraders: async (sortBy = 'followers', limit = 20, offset = 0) => {
    try {
      const response = await fetch(`${API_BASE}/copy-trading/masters?sortBy=${sortBy}&limit=${limit}&offset=${offset}`);
      if (!response.ok) throw new Error('Failed to fetch master traders');
      return await response.json();
    } catch (error) {
      console.error('Error fetching master traders:', error);
      // Return mock data for development
      return {
        traders: getMockTraders(),
        total: 12,
        limit,
        offset
      };
    }
  },

  // Get single master trader details
  getMasterTrader: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/copy-trading/masters/${id}`);
      if (!response.ok) throw new Error('Failed to fetch master trader');
      return await response.json();
    } catch (error) {
      console.error('Error fetching master trader:', error);
      return {
        trader: getMockTraders().find(t => t.id === id) || getMockTraders()[0],
        performance: getMockPerformance()
      };
    }
  },

  // Start copying a trader
  startCopying: async (data) => {
    return request('/copy-trading/start', {
      method: 'POST',
      body: data
    });
  },

  // Stop copying a trader
  stopCopying: async (relationshipId) => {
    return request(`/copy-trading/stop/${relationshipId}`, {
      method: 'POST'
    });
  },

  // Get user's copy relationships
  getMyCopyRelationships: async () => {
    try {
      return await request('/copy-trading/my-copies');
    } catch (error) {
      console.error('Error fetching copy relationships:', error);
      return { relationships: [] };
    }
  },

  // Get copied trades history
  getCopiedTrades: async (limit = 50, offset = 0) => {
    try {
      return await request(`/copy-trading/trades?limit=${limit}&offset=${offset}`);
    } catch (error) {
      console.error('Error fetching copied trades:', error);
      return { trades: [] };
    }
  }
};

// Mock data for development
function getMockTraders() {
  return [
    {
      id: '1',
      display_name: 'CryptoKing',
      bio: 'Professional trader with 5+ years experience in crypto markets. Specializing in swing trading and risk management.',
      total_followers: 1250,
      total_profit: 125000,
      win_rate: 78.5,
      risk_score: 4,
      verified: true,
      specialization: ['Bitcoin', 'Ethereum', 'DeFi'],
      min_copy_amount: 100,
      total_trades: 342,
      avg_trade_duration: '2.5 days',
      max_drawdown: 12.5,
      sharpe_ratio: 1.85,
      performance_fee: 20
    },
    {
      id: '2',
      display_name: 'AltcoinMaster',
      bio: 'Focused on discovering and trading promising altcoins before they moon. High risk, high reward strategy.',
      total_followers: 890,
      total_profit: 89000,
      win_rate: 65.2,
      risk_score: 7,
      verified: true,
      specialization: ['Altcoins', 'Small Cap', 'Gems'],
      min_copy_amount: 250,
      total_trades: 156,
      avg_trade_duration: '5.2 days',
      max_drawdown: 25.8,
      sharpe_ratio: 1.42,
      performance_fee: 25
    },
    {
      id: '3',
      display_name: 'SafeTrader',
      bio: 'Conservative trading approach with focus on capital preservation and steady growth.',
      total_followers: 2100,
      total_profit: 67000,
      win_rate: 85.3,
      risk_score: 2,
      verified: true,
      specialization: ['Bitcoin', 'Stablecoins', 'Conservative'],
      min_copy_amount: 50,
      total_trades: 89,
      avg_trade_duration: '12.3 days',
      max_drawdown: 5.2,
      sharpe_ratio: 2.15,
      performance_fee: 15
    },
    {
      id: '4',
      display_name: 'DeFiExpert',
      bio: 'DeFi protocol specialist. Trading governance tokens and yield farming opportunities.',
      total_followers: 675,
      total_profit: 156000,
      win_rate: 72.1,
      risk_score: 5,
      verified: false,
      specialization: ['DeFi', 'Governance', 'Yield'],
      min_copy_amount: 500,
      total_trades: 234,
      avg_trade_duration: '3.8 days',
      max_drawdown: 18.7,
      sharpe_ratio: 1.67,
      performance_fee: 30
    },
    {
      id: '5',
      display_name: 'TechAnalyst',
      bio: 'Pure technical analysis trader. Using advanced charting and indicators for precise entries.',
      total_followers: 1450,
      total_profit: 98000,
      win_rate: 69.8,
      risk_score: 6,
      verified: true,
      specialization: ['Technical Analysis', 'Scalping', 'Momentum'],
      min_copy_amount: 200,
      total_trades: 567,
      avg_trade_duration: '1.2 days',
      max_drawdown: 22.1,
      sharpe_ratio: 1.53,
      performance_fee: 22
    },
    {
      id: '6',
      display_name: 'HODLStrategy',
      bio: 'Long-term investment strategy focusing on fundamentally strong projects.',
      total_followers: 3200,
      total_profit: 234000,
      win_rate: 91.2,
      risk_score: 1,
      verified: true,
      specialization: ['Long-term', 'Fundamentals', 'Blue Chip'],
      min_copy_amount: 100,
      total_trades: 45,
      avg_trade_duration: '45.6 days',
      max_drawdown: 8.9,
      sharpe_ratio: 2.87,
      performance_fee: 10
    }
  ];
}

function getMockPerformance() {
  const performance = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  let profit = 0;
  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Random daily performance
    const dailyChange = (Math.random() - 0.4) * 1000; // Slightly positive bias
    profit += dailyChange;
    
    performance.push({
      date: date.toISOString().split('T')[0],
      profit: Math.round(profit),
      trades: Math.floor(Math.random() * 5),
      win_rate: 65 + Math.random() * 20
    });
  }
  
  return performance;
}

export default copyTradingService;
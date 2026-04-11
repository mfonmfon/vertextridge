import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, TrendingDown, X, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { copyTradingService } from '../../services/copyTradingService';
import { toast } from 'react-hot-toast';

const MyCopies = () => {
  const [activeTab, setActiveTab] = useState('active'); // active | history
  const [copyRelationships, setCopyRelationships] = useState([]);
  const [copiedTrades, setCopiedTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stoppingId, setStoppingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [relationships, trades] = await Promise.all([
        copyTradingService.getMyCopies(),
        copyTradingService.getCopiedTrades()
      ]);
      setCopyRelationships(relationships);
      setCopiedTrades(trades);
    } catch (error) {
      toast.error('Failed to load copy trading data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStopCopying = async (relationshipId, traderName) => {
    if (!confirm(`Stop copying ${traderName}?`)) return;
    
    try {
      setStoppingId(relationshipId);
      await copyTradingService.stopCopying(relationshipId);
      toast.success(`Stopped copying ${traderName}`);
      await loadData();
    } catch (error) {
      toast.error('Failed to stop copying');
      console.error(error);
    } finally {
      setStoppingId(null);
    }
  };

  const activeCopies = copyRelationships.filter(r => r.status === 'active');
  const inactiveCopies = copyRelationships.filter(r => r.status !== 'active');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">My Copy Trading</h1>
        <p className="text-white/40">Manage your copy trading relationships</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-6 py-3 font-bold text-sm transition-all relative ${
            activeTab === 'active' ? 'text-primary' : 'text-white/40 hover:text-white'
          }`}
        >
          Active Copies ({activeCopies.length})
          {activeTab === 'active' && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-bold text-sm transition-all relative ${
            activeTab === 'history' ? 'text-primary' : 'text-white/40 hover:text-white'
          }`}
        >
          Trade History ({copiedTrades.length})
          {activeTab === 'history' && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            />
          )}
        </button>
      </div>

      {/* Active Copies Tab */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeCopies.length === 0 ? (
            <div className="bg-surface border border-white/5 rounded-2xl p-12 text-center">
              <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">No Active Copies</h3>
              <p className="text-white/40 mb-6">Start copying successful traders to grow your portfolio</p>
              <Link
                to="/copy-trading"
                className="inline-block px-6 py-3 bg-primary text-dark font-bold rounded-xl hover:bg-primary/90 transition-all"
              >
                Browse Traders
              </Link>
            </div>
          ) : (
            activeCopies.map((relationship) => (
              <motion.div
                key={relationship.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-white/5 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-2xl font-bold">
                      {relationship.trader_name?.charAt(0)}
                    </div>
                    <div>
                      <Link
                        to={`/copy-trading/${relationship.master_trader_id}`}
                        className="text-xl font-bold hover:text-primary transition-all"
                      >
                        {relationship.trader_name}
                      </Link>
                      <p className="text-sm text-white/40">
                        Copying since {new Date(relationship.started_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStopCopying(relationship.id, relationship.trader_name)}
                    disabled={stoppingId === relationship.id}
                    className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {stoppingId === relationship.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    Stop Copying
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-dark/50 rounded-xl p-4">
                    <p className="text-xs text-white/40 mb-1">Amount Allocated</p>
                    <p className="text-lg font-bold">${relationship.copy_amount?.toLocaleString()}</p>
                  </div>
                  <div className="bg-dark/50 rounded-xl p-4">
                    <p className="text-xs text-white/40 mb-1">Total P&L</p>
                    <p className={`text-lg font-bold flex items-center gap-1 ${
                      relationship.total_profit_loss >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {relationship.total_profit_loss >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      ${Math.abs(relationship.total_profit_loss || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-dark/50 rounded-xl p-4">
                    <p className="text-xs text-white/40 mb-1">Trades Copied</p>
                    <p className="text-lg font-bold">{relationship.trades_copied || 0}</p>
                  </div>
                  <div className="bg-dark/50 rounded-xl p-4">
                    <p className="text-xs text-white/40 mb-1">Win Rate</p>
                    <p className="text-lg font-bold text-primary">
                      {relationship.win_rate ? `${relationship.win_rate}%` : 'N/A'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Trade History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {copiedTrades.length === 0 ? (
            <div className="bg-surface border border-white/5 rounded-2xl p-12 text-center">
              <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">No Trade History</h3>
              <p className="text-white/40">Your copied trades will appear here</p>
            </div>
          ) : (
            <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark/50">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-bold text-white/40 uppercase">Trader</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-white/40 uppercase">Asset</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-white/40 uppercase">Type</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-white/40 uppercase">Amount</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-white/40 uppercase">P&L</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-white/40 uppercase">Status</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-white/40 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {copiedTrades.map((trade) => (
                      <tr key={trade.id} className="border-t border-white/5 hover:bg-white/5 transition-all">
                        <td className="px-6 py-4">
                          <Link
                            to={`/copy-trading/${trade.master_trader_id}`}
                            className="font-bold hover:text-primary transition-all"
                          >
                            {trade.trader_name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 font-bold">{trade.asset_symbol}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            trade.trade_type === 'buy' 
                              ? 'bg-green-500/10 text-green-500' 
                              : 'bg-red-500/10 text-red-500'
                          }`}>
                            {trade.trade_type?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold">${trade.amount?.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`font-bold flex items-center gap-1 ${
                            trade.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {trade.profit_loss >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            ${Math.abs(trade.profit_loss || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            trade.status === 'completed' 
                              ? 'bg-green-500/10 text-green-500'
                              : trade.status === 'active'
                              ? 'bg-blue-500/10 text-blue-500'
                              : 'bg-red-500/10 text-red-500'
                          }`}>
                            {trade.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/40 text-sm">
                          {new Date(trade.copied_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyCopies;

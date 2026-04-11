import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Filter,
} from 'lucide-react';
import { Card, Button } from '../../component/shared/UI';
import { useUser } from '../../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ────────────────────────────────────
// Funds Page
// ────────────────────────────────────
const Funds = () => {
  const { user, transactions, tradeHistory } = useUser();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // all | deposits | withdrawals | trades

  // Merge and sort all activity
  const allActivity = [
    ...transactions.map((tx) => ({
      ...tx,
      category: tx.type === 'deposit' ? 'deposit' : 'withdrawal',
      title: tx.type === 'deposit' ? 'Deposit' : 'Withdrawal',
      displayAmount: tx.amount,
      positive: tx.type === 'deposit',
    })),
    ...tradeHistory.map((trade) => ({
      id: trade.id,
      date: trade.timestamp,
      category: 'trade',
      type: trade.type,
      title: `${trade.type === 'buy' ? 'Bought' : 'Sold'} ${trade.symbol}`,
      displayAmount: trade.total,
      positive: trade.type === 'sell',
      status: 'completed',
      symbol: trade.symbol,
      quantity: trade.quantity,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filtered = filter === 'all'
    ? allActivity
    : filter === 'trades'
    ? allActivity.filter((a) => a.category === 'trade')
    : filter === 'deposits'
    ? allActivity.filter((a) => a.category === 'deposit')
    : allActivity.filter((a) => a.category === 'withdrawal');

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 lg:gap-8 pb-24 lg:pb-8 max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl lg:text-3xl font-bold">Funds</h1>
        <p className="text-white/30 text-sm mt-1">Manage your wallet and view activity</p>
      </motion.div>

      {/* Balance Card */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
            <Wallet className="w-32 h-32 text-primary" />
          </div>

          <div className="flex flex-col gap-2 mb-8">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
              Available Balance
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold font-mono tracking-tighter text-primary animate-count">
              ${(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => navigate('/finance/deposit')}
              className="flex items-center justify-center gap-2 py-4"
            >
              <ArrowDownLeft className="w-4 h-4" />
              Deposit
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/finance/withdraw')}
              className="flex items-center justify-center gap-2 py-4"
            >
              <ArrowUpRight className="w-4 h-4" />
              Withdraw
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
        <Card className="flex flex-col gap-1 p-4 lg:p-6">
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Deposits</span>
          <span className="text-lg font-bold font-mono text-profit">
            ${transactions
              .filter((t) => t.type === 'deposit')
              .reduce((acc, t) => acc + t.amount, 0)
              .toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </Card>
        <Card className="flex flex-col gap-1 p-4 lg:p-6">
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Withdrawn</span>
          <span className="text-lg font-bold font-mono text-loss">
            ${transactions
              .filter((t) => t.type !== 'deposit')
              .reduce((acc, t) => acc + t.amount, 0)
              .toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </Card>
        <Card className="flex flex-col gap-1 p-4 lg:p-6">
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Trades</span>
          <span className="text-lg font-bold font-mono">{tradeHistory.length}</span>
        </Card>
      </motion.div>

      {/* Activity */}
      <motion.div variants={itemVariants}>
        <Card noPadding>
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-bold">Activity</h3>
            <div className="flex gap-1">
              {['all', 'deposits', 'withdrawals', 'trades'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                    filter === f
                      ? 'bg-primary/10 text-primary'
                      : 'text-white/20 hover:text-white/40'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="flex flex-col divide-y divide-white/5">
              {filtered.map((item) => (
                <div key={item.id} className="p-4 lg:p-5 flex items-center gap-4 hover:bg-white/[0.01] transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    item.positive ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'
                  }`}>
                    {item.positive ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-sm">{item.title}</span>
                    <p className="text-[11px] text-white/30">
                      {new Date(item.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`font-bold text-sm font-mono ${item.positive ? 'text-profit' : 'text-loss'}`}>
                      {item.positive ? '+' : '-'}${item.displayAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-primary/40 font-bold uppercase tracking-widest">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 flex flex-col items-center justify-center gap-4 text-center">
              <Clock className="w-12 h-12 text-white/5" />
              <p className="text-white/20 text-sm">No activity yet</p>
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Funds;

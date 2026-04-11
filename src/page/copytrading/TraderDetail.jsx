import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, TrendingUp, Users, Award, Shield, DollarSign, Clock, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { copyTradingService } from '../../services/copyTradingService';
import { useUser } from '../../context/UserContext';
import toast from 'react-hot-toast';

const TraderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [trader, setTrader] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyData, setCopyData] = useState({
    allocatedAmount: '',
    copyPercentage: 100,
    stopLoss: '',
    takeProfit: ''
  });
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    fetchTraderDetails();
  }, [id]);

  const fetchTraderDetails = async () => {
    try {
      setLoading(true);
      const data = await copyTradingService.getMasterTrader(id);
      setTrader(data.trader);
      setPerformance(data.performance.reverse()); // Oldest first for chart
    } catch (error) {
      toast.error('Failed to load trader details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCopy = async () => {
    if (!copyData.allocatedAmount || parseFloat(copyData.allocatedAmount) < trader.min_copy_amount) {
      toast.error(`Minimum copy amount is $${trader.min_copy_amount}`);
      return;
    }

    if (parseFloat(copyData.allocatedAmount) > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      setCopying(true);
      await copyTradingService.startCopying({
        masterId: trader.id,
        allocatedAmount: parseFloat(copyData.allocatedAmount),
        copyPercentage: parseFloat(copyData.copyPercentage),
        stopLoss: copyData.stopLoss ? parseFloat(copyData.stopLoss) : null,
        takeProfit: copyData.takeProfit ? parseFloat(copyData.takeProfit) : null
      });
      
      toast.success(`Successfully started copying ${trader.display_name}!`);
      setShowCopyModal(false);
      navigate('/dashboard/my-copies');
    } catch (error) {
      toast.error(error.message || 'Failed to start copying');
    } finally {
      setCopying(false);
    }
  };

  const getRiskColor = (score) => {
    if (score <= 3) return 'text-green-500 bg-green-500/10';
    if (score <= 6) return 'text-yellow-500 bg-yellow-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  const getRiskLabel = (score) => {
    if (score <= 3) return 'Low Risk';
    if (score <= 6) return 'Medium Risk';
    return 'High Risk';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trader details...</p>
        </div>
      </div>
    );
  }

  if (!trader) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trader not found</h2>
          <button onClick={() => navigate('/dashboard/copy-trading')} className="text-blue-600 hover:underline">
            Back to traders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard/copy-trading')}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Traders</span>
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl">
                {trader.display_name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{trader.display_name}</h1>
                  {trader.verified && (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-white fill-white" />
                    </div>
                  )}
                  <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${getRiskColor(trader.risk_score)}`}>
                    {getRiskLabel(trader.risk_score)}
                  </div>
                </div>
                <p className="text-gray-600 mb-2">{trader.bio}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {trader.total_followers.toLocaleString()} followers
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    {trader.total_trades.toLocaleString()} trades
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowCopyModal(true)}
              className="px-8 py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition shadow-lg"
            >
              Start Copying
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Profit</p>
                <p className="text-2xl font-bold text-green-600">${trader.total_profit.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Win Rate</p>
                <p className="text-2xl font-bold text-blue-600">{trader.win_rate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Duration</p>
                <p className="text-xl font-bold text-purple-600">{trader.avg_trade_duration}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Performance Fee</p>
                <p className="text-2xl font-bold text-orange-600">{trader.performance_fee}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">30-Day Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#999"
                tick={{ fontSize: 12 }}
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#999" tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Profit']}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Specialization */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Specialization</h2>
          <div className="flex flex-wrap gap-3">
            {trader.specialization?.map((spec, i) => (
              <span key={i} className="px-4 py-2 bg-black text-white text-sm font-medium rounded-xl">
                {spec}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Copy Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Start Copying {trader.display_name}</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allocated Amount (Min: ${trader.min_copy_amount})
                </label>
                <input
                  type="number"
                  value={copyData.allocatedAmount}
                  onChange={(e) => setCopyData({...copyData, allocatedAmount: e.target.value})}
                  placeholder={`Min $${trader.min_copy_amount}`}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                />
                <p className="text-xs text-gray-500 mt-1">Your balance: ${user?.balance?.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Copy Percentage: {copyData.copyPercentage}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={copyData.copyPercentage}
                  onChange={(e) => setCopyData({...copyData, copyPercentage: e.target.value})}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stop Loss %</label>
                  <input
                    type="number"
                    value={copyData.stopLoss}
                    onChange={(e) => setCopyData({...copyData, stopLoss: e.target.value})}
                    placeholder="Optional"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Take Profit %</label>
                  <input
                    type="number"
                    value={copyData.takeProfit}
                    onChange={(e) => setCopyData({...copyData, takeProfit: e.target.value})}
                    placeholder="Optional"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCopyModal(false)}
                className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleStartCopy}
                disabled={copying}
                className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50"
              >
                {copying ? 'Starting...' : 'Start Copying'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TraderDetail;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Award, Shield, Search, Filter, ArrowUpRight, ArrowDownRight, Star } from 'lucide-react';
import { copyTradingService } from '../../services/copyTradingService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CopyTrading = () => {
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('followers');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTraders();
  }, [sortBy]);

  const fetchTraders = async () => {
    try {
      setLoading(true);
      const data = await copyTradingService.getMasterTraders(sortBy);
      setTraders(data.traders || []);
    } catch (error) {
      toast.error('Failed to load traders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTraders = traders.filter(trader =>
    trader.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trader.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Copy Trading</h1>
              <p className="text-gray-600 mt-1">Follow and copy successful traders automatically</p>
            </div>
            <button
              onClick={() => navigate('/copy-trading/my-copies')}
              className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              My Copies
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Active Traders</p>
                  <p className="text-2xl font-bold text-blue-900">{traders.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium">Avg Win Rate</p>
                  <p className="text-2xl font-bold text-green-900">
                    {traders.length > 0 ? (traders.reduce((acc, t) => acc + parseFloat(t.win_rate), 0) / traders.length).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 font-medium">Total Followers</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {traders.reduce((acc, t) => acc + t.total_followers, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-orange-600 font-medium">Verified</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {traders.filter(t => t.verified).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search traders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 font-medium"
            >
              <option value="followers">Most Followers</option>
              <option value="profit">Highest Profit</option>
              <option value="winRate">Best Win Rate</option>
              <option value="trades">Most Trades</option>
            </select>
          </div>
        </div>
      </div>

      {/* Traders Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-20 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTraders.map((trader, index) => (
              <motion.div
                key={trader.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/copy-trading/${trader.id}`)}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-black hover:shadow-xl transition-all cursor-pointer group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                      {trader.display_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{trader.display_name}</h3>
                        {trader.verified && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <Star className="w-3 h-3 text-white fill-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{trader.total_followers.toLocaleString()} followers</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskColor(trader.risk_score)}`}>
                    {getRiskLabel(trader.risk_score)}
                  </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{trader.bio}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Total Profit</p>
                    <p className="text-lg font-bold text-green-600">
                      ${trader.total_profit.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Win Rate</p>
                    <p className="text-lg font-bold text-blue-600">
                      {trader.win_rate}%
                    </p>
                  </div>
                </div>

                {/* Specialization Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {trader.specialization?.slice(0, 3).map((spec, i) => (
                    <span key={i} className="px-3 py-1 bg-black/5 text-black text-xs font-medium rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Min. Copy</p>
                    <p className="text-sm font-bold text-gray-900">${trader.min_copy_amount}</p>
                  </div>
                  <div className="flex items-center gap-2 text-black font-semibold group-hover:gap-3 transition-all">
                    <span>View Details</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && filteredTraders.length === 0 && (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No traders found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CopyTrading;

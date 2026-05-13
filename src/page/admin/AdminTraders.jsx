import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Check, X, RefreshCw, Shield, ShieldAlert, TrendingUp } from 'lucide-react';
import { Card, Button, Input } from '../../component/shared/UI';
import { adminService } from '../../services/adminService';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminTraders = () => {
  const navigate = useNavigate();
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTrader, setEditingTrader] = useState(null);
  
  const initialFormState = {
    display_name: '',
    bio: '',
    win_rate: '75',
    risk_score: '3',
    verified: true,
    is_active: true,
    min_copy_amount: '100',
    performance_fee: '15',
    max_drawdown: '10',
    specialization: '' // Will be converted to array
  };
  
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    loadTraders();
  }, []);

  const loadTraders = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllTraders();
      setTraders(response.traders || []);
    } catch (error) {
      toast.error('Failed to load traders');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (trader = null) => {
    if (trader) {
      setEditingTrader(trader);
      setFormData({
        display_name: trader.display_name,
        bio: trader.bio || '',
        win_rate: trader.win_rate.toString(),
        risk_score: trader.risk_score.toString(),
        verified: trader.verified,
        is_active: trader.is_active,
        min_copy_amount: trader.min_copy_amount.toString(),
        performance_fee: trader.performance_fee.toString(),
        max_drawdown: trader.max_drawdown?.toString() || '0',
        specialization: Array.isArray(trader.specialization) ? trader.specialization.join(', ') : ''
      });
    } else {
      setEditingTrader(null);
      setFormData(initialFormState);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      win_rate: parseFloat(formData.win_rate),
      risk_score: parseInt(formData.risk_score),
      min_copy_amount: parseFloat(formData.min_copy_amount),
      performance_fee: parseFloat(formData.performance_fee),
      max_drawdown: parseFloat(formData.max_drawdown),
      specialization: formData.specialization.split(',').map(s => s.trim()).filter(s => s)
    };

    try {
      if (editingTrader) {
        await adminService.updateTrader(editingTrader.id, payload);
        toast.success('Trader updated successfully');
      } else {
        await adminService.createTrader(payload);
        toast.success('Trader created successfully');
      }
      setShowModal(false);
      loadTraders();
    } catch (error) {
      toast.error(error.message || 'Failed to save trader');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trader?')) return;
    
    try {
      await adminService.deleteTrader(id);
      toast.success('Trader deleted successfully');
      loadTraders();
    } catch (error) {
      toast.error(error.message || 'Failed to delete trader');
    }
  };

  const filteredTraders = traders.filter(t => 
    t.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Master Traders</h1>
          <p className="text-white/60 mt-1">Manage public traders available for copy trading</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Trader
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-white/40">Total Traders</p>
            <h3 className="text-xl font-bold">{traders.length}</h3>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-profit/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-profit" />
          </div>
          <div>
            <p className="text-sm text-white/40">Active</p>
            <h3 className="text-xl font-bold">{traders.filter(t => t.is_active).length}</h3>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-white/40">Total Followers</p>
            <h3 className="text-xl font-bold">
              {traders.reduce((sum, t) => sum + (t.total_followers || 0), 0)}
            </h3>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm text-white/40">Avg Win Rate</p>
            <h3 className="text-xl font-bold">
              {traders.length > 0 
                ? (traders.reduce((sum, t) => sum + t.win_rate, 0) / traders.length).toFixed(1)
                : 0}%
            </h3>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </Card>

      {/* Traders Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-white/5 pb-4">
                <th className="pb-4 font-semibold text-white/60">Trader</th>
                <th className="pb-4 font-semibold text-white/60">Performance</th>
                <th className="pb-4 font-semibold text-white/60">Followers</th>
                <th className="pb-4 font-semibold text-white/60">Status</th>
                <th className="pb-4 font-semibold text-white/60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-white/40">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading traders...
                  </td>
                </tr>
              ) : filteredTraders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-white/40">No traders found</td>
                </tr>
              ) : (
                filteredTraders.map((trader) => (
                  <tr key={trader.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                          {trader.display_name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold">{trader.display_name}</span>
                            {trader.verified && <Shield className="w-3 h-3 text-profit" />}
                          </div>
                          <p className="text-xs text-white/40 truncate max-w-[200px]">{trader.bio}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/40">Win Rate:</span>
                          <span className="text-xs font-bold text-profit">{trader.win_rate}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/40">Risk:</span>
                          <span className={`text-xs font-bold ${
                            trader.risk_score <= 3 ? 'text-profit' : trader.risk_score <= 7 ? 'text-amber-500' : 'text-loss'
                          }`}>{trader.risk_score}/10</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="font-bold">{trader.total_followers || 0}</span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        trader.is_active ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'
                      }`}>
                        {trader.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(trader)}
                          className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(trader.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-white/60 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editingTrader ? 'Edit Master Trader' : 'Add New Master Trader'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-white/60">Display Name</label>
                    <Input 
                      required
                      value={formData.display_name}
                      onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                      placeholder="e.g. Crypto Whale"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/60">Specialization (comma separated)</label>
                    <Input 
                      value={formData.specialization}
                      onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      placeholder="Bitcoin, ETH, DeFi"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/60">Bio</label>
                  <textarea 
                    className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all resize-none h-24"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Trader history and strategy..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-white/60">Win Rate (%)</label>
                    <Input 
                      type="number" step="0.1"
                      value={formData.win_rate}
                      onChange={(e) => setFormData({...formData, win_rate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/60">Risk Score (1-10)</label>
                    <Input 
                      type="number" min="1" max="10"
                      value={formData.risk_score}
                      onChange={(e) => setFormData({...formData, risk_score: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/60">Max Drawdown (%)</label>
                    <Input 
                      type="number" step="0.1"
                      value={formData.max_drawdown}
                      onChange={(e) => setFormData({...formData, max_drawdown: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-white/60">Min Copy Amount ($)</label>
                    <Input 
                      type="number"
                      value={formData.min_copy_amount}
                      onChange={(e) => setFormData({...formData, min_copy_amount: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/60">Performance Fee (%)</label>
                    <Input 
                      type="number"
                      value={formData.performance_fee}
                      onChange={(e) => setFormData({...formData, performance_fee: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-12 h-6 rounded-full p-1 transition-all ${formData.verified ? 'bg-profit' : 'bg-white/10'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${formData.verified ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                    <input 
                      type="checkbox" className="hidden"
                      checked={formData.verified}
                      onChange={(e) => setFormData({...formData, verified: e.target.checked})}
                    />
                    <span className="text-sm font-semibold">Verified Badge</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-12 h-6 rounded-full p-1 transition-all ${formData.is_active ? 'bg-primary' : 'bg-white/10'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                    <input 
                      type="checkbox" className="hidden"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    <span className="text-sm font-semibold">Active Status</span>
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="flex-1"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingTrader ? 'Save Changes' : 'Create Trader'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminTraders;

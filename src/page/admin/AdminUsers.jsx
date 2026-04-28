import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit2, Trash2, Check, X, UserPlus, Download, Filter, RefreshCw } from 'lucide-react';
import { Card, Button, Input } from '../../component/shared/UI';
import { adminService } from '../../services/adminService';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Avatar from '../../component/Avatar';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [editingUser, setEditingUser] = useState(null);
  const [editBalance, setEditBalance] = useState('');
  const [editReason, setEditReason] = useState('');
  const [filterKYC, setFilterKYC] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    country: '',
    balance: '',
    profit: ''
  });

  // Check auth
  useEffect(() => {
    const session = localStorage.getItem('tradz_session');
    if (!session) {
      toast.error('Please login first');
      navigate('/admin/login');
      return;
    }
    // Load users immediately on mount
    loadUsers();
  }, [navigate]);

  useEffect(() => {
    if (page > 1 || searchTerm || filterKYC !== 'all') {
      loadUsers();
    }
  }, [page, searchTerm, filterKYC]);

  // Auto-refresh users every 15 seconds to show new signups
  useEffect(() => {
    const interval = setInterval(() => {
      if (page === 1 && !searchTerm && filterKYC === 'all') {
        loadUsers();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [page, searchTerm, filterKYC]);

  const loadUsers = async (retryCount = 0) => {
    try {
      setLoading(true);
      console.log('Loading users...', { page, searchTerm, filterKYC, retryCount });
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const url = `${API_URL}/admin/users?page=${page}&limit=20&search=${encodeURIComponent(searchTerm)}`;
      
      console.log('Fetching from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Users loaded:', data);
      
      let filteredUsers = data.users || [];
      
      // Apply KYC filter on frontend if needed
      if (filterKYC !== 'all') {
        filteredUsers = filteredUsers.filter(u => u.kyc_status === filterKYC);
      }
      
      setUsers(filteredUsers);
      setTotalPages(data.totalPages || 1);
      setTotalUsers(data.total || 0);
      
      if (filteredUsers.length === 0 && data.total > 0) {
        toast.info(`Found ${data.total} users total`);
      }
      
    } catch (error) {
      console.error('Failed to load users:', error);
      console.error('Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        code: error.code,
        stack: error.stack
      });
      
      // Retry logic - retry up to 3 times with exponential backoff
      if (retryCount < 3) {
        console.log(`Retrying... attempt ${retryCount + 1}`);
        setTimeout(() => loadUsers(retryCount + 1), 1000 * Math.pow(2, retryCount));
      } else {
        toast.error('Failed to load users. Please refresh the page.');
        setUsers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBalance = async (userId) => {
    if (!editBalance || !editReason) {
      toast.error('Please enter balance and reason');
      return;
    }

    try {
      await adminService.updateUserBalance(userId, parseFloat(editBalance), editReason);
      toast.success('Balance updated successfully');
      setEditingUser(null);
      setEditBalance('');
      setEditReason('');
      loadUsers();
    } catch (error) {
      toast.error('Failed to update balance');
    }
  };

  const handleUpdateKYC = async (userId, status) => {
    try {
      await adminService.updateKYCStatus(userId, status);
      toast.success('KYC status updated');
      loadUsers();
    } catch (error) {
      toast.error('Failed to update KYC status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || '',
      country: user.country || '',
      balance: user.balance || 0,
      profit: user.profit || 0
    });
    setShowEditModal(true);
  };

  const handleUpdateProfile = async () => {
    if (!selectedUser) return;

    try {
      await adminService.updateUserProfile(selectedUser.id, {
        name: editFormData.name,
        country: editFormData.country,
        balance: parseFloat(editFormData.balance),
        profit: parseFloat(editFormData.profit)
      });
      toast.success('User profile updated successfully');
      setShowEditModal(false);
      loadUsers();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const exportUsers = () => {
    const csv = [
      ['Name', 'Email', 'Balance', 'KYC Status', 'Created At'],
      ...users.map(u => [
        u.name,
        u.email,
        u.balance,
        u.kyc_status,
        new Date(u.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString()}.csv`;
    a.click();
    toast.success('Users exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-white/60 mt-1">
            Manage all platform users {totalUsers > 0 && `(${totalUsers} total)`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={loadUsers} 
            variant="secondary"
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportUsers} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <select
            value={filterKYC}
            onChange={(e) => setFilterKYC(e.target.value)}
            className="bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
          >
            <option value="all">All KYC Status</option>
            <option value="unverified">Unverified</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-4 md:p-6">
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 text-xs md:text-sm text-white/60 whitespace-nowrap">User</th>
                  <th className="text-left p-3 text-xs md:text-sm text-white/60 whitespace-nowrap hidden md:table-cell">Email</th>
                  <th className="text-left p-3 text-xs md:text-sm text-white/60 whitespace-nowrap">Balance</th>
                  <th className="text-left p-3 text-xs md:text-sm text-white/60 whitespace-nowrap">KYC</th>
                  <th className="text-left p-3 text-xs md:text-sm text-white/60 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span className="text-white/60">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-white/40">
                          {searchTerm ? `No users found matching "${searchTerm}"` : 'No users found'}
                        </span>
                        {totalUsers > 0 && (
                          <span className="text-white/20 text-sm">
                            Try adjusting your search or filters
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-3">
                        <div className="flex items-center gap-2 md:gap-3">
                          <Avatar 
                            user={user} 
                            size={32} 
                            className="flex-shrink-0" 
                          />
                          <div className="min-w-0">
                            <span className="font-medium text-sm md:text-base block truncate">{user.name}</span>
                            <span className="text-xs text-white/60 md:hidden block truncate">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-white/60 text-sm hidden md:table-cell">{user.email}</td>
                      <td className="p-3">
                        {editingUser === user.id ? (
                          <div className="flex flex-col gap-2 min-w-[120px]">
                            <Input
                              type="number"
                              value={editBalance}
                              onChange={(e) => setEditBalance(e.target.value)}
                              placeholder="New balance"
                              className="w-full text-sm"
                            />
                            <Input
                              type="text"
                              value={editReason}
                              onChange={(e) => setEditReason(e.target.value)}
                              placeholder="Reason"
                              className="w-full text-sm"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateBalance(user.id)}
                                className="p-1 text-profit hover:bg-profit/10 rounded"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingUser(null);
                                  setEditBalance('');
                                  setEditReason('');
                                }}
                                className="p-1 text-loss hover:bg-loss/10 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm md:text-base">${parseFloat(user.balance).toFixed(2)}</span>
                            <button
                              onClick={() => {
                                setEditingUser(user.id);
                                setEditBalance(user.balance);
                              }}
                              className="p-1 text-primary hover:bg-primary/10 rounded"
                            >
                              <Edit2 className="w-3 h-3 md:w-4 md:h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <select
                          value={user.kyc_status}
                          onChange={(e) => handleUpdateKYC(user.id, e.target.value)}
                          className="bg-surface border border-white/10 rounded px-2 py-1 text-xs md:text-sm"
                        >
                          <option value="unverified">Unverified</option>
                          <option value="pending">Pending</option>
                          <option value="verified">Verified</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-primary hover:bg-primary/10 rounded"
                            title="Edit user"
                          >
                            <Edit2 className="w-3 h-3 md:w-4 md:h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-loss hover:bg-loss/10 rounded"
                            title="Delete user"
                          >
                            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-white/10">
          <Button
            variant="secondary"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-full sm:w-auto"
          >
            Previous
          </Button>
          <span className="text-white/60 text-sm">Page {page} of {totalPages}</span>
          <Button
            variant="secondary"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-full sm:w-auto"
          >
            Next
          </Button>
        </div>
      </Card>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Edit User Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Name</label>
                <Input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="User name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Country</label>
                <Input
                  type="text"
                  value={editFormData.country}
                  onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                  placeholder="Country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Balance ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editFormData.balance}
                  onChange={(e) => setEditFormData({ ...editFormData, balance: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Profit/Loss ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editFormData.profit}
                  onChange={(e) => setEditFormData({ ...editFormData, profit: e.target.value })}
                  placeholder="0.00"
                />
                <p className="text-xs text-white/40 mt-1">Positive for profit, negative for loss</p>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleUpdateProfile}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit2, Trash2, Check, X, UserPlus, Download, Filter } from 'lucide-react';
import { Card, Button, Input } from '../../component/shared/UI';
import { adminService } from '../../services/adminService';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [editBalance, setEditBalance] = useState('');
  const [editReason, setEditReason] = useState('');
  const [filterKYC, setFilterKYC] = useState('all');

  // Check auth
  useEffect(() => {
    const session = localStorage.getItem('tradz_session');
    if (!session) {
      toast.error('Please login first');
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    loadUsers();
  }, [page, searchTerm, filterKYC]);

  const loadUsers = async () => {
    try {
      const data = await adminService.getUsers(page, 20, searchTerm);
      
      let filteredUsers = data.users || [];
      if (filterKYC !== 'all') {
        filteredUsers = filteredUsers.filter(u => u.kyc_status === filterKYC);
      }
      
      setUsers(filteredUsers);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Failed to load users:', error);
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
          <p className="text-white/60 mt-1">Manage all platform users</p>
        </div>
        <Button onClick={exportUsers} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
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
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-white/40">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-3">
                        <div className="flex items-center gap-2 md:gap-3">
                          <img
                            src={user.avatar_url || `https://i.pravatar.cc/40?u=${user.email}`}
                            alt={user.name}
                            className="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0"
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
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-loss hover:bg-loss/10 rounded"
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
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
    </div>
  );
};

export default AdminUsers;

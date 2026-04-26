import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Activity, Clock, Mail, MapPin, RefreshCw } from 'lucide-react';
import { Card, Button } from '../../component/shared/UI';
import toast from 'react-hot-toast';
import Avatar from '../../component/Avatar';

const AdminActivity = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('tradz_session');
    if (!session) {
      toast.error('Please login first');
      navigate('/admin/login');
      return;
    }
    loadUserActivity();
  }, [navigate]);

  const loadUserActivity = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users?page=1&limit=100');
      const data = await response.json();
      
      // Sort by creation date (newest first)
      const sortedUsers = (data.users || []).sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      setUsers(sortedUsers);
    } catch (error) {
      console.error('Failed to load user activity:', error);
      toast.error('Failed to load user activity');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Activity & Registrations</h1>
          <p className="text-white/60 mt-1">Track user registrations and activity</p>
        </div>
        <Button 
          onClick={loadUserActivity} 
          variant="secondary"
          className="flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Registrations</p>
              <p className="text-3xl font-bold mt-2">{users.length}</p>
            </div>
            <UserPlus className="w-12 h-12 text-primary opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">KYC Verified</p>
              <p className="text-3xl font-bold mt-2">
                {users.filter(u => u.kyc_status === 'verified').length}
              </p>
            </div>
            <Activity className="w-12 h-12 text-profit opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Pending KYC</p>
              <p className="text-3xl font-bold mt-2">
                {users.filter(u => u.kyc_status === 'pending').length}
              </p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* User Registrations Timeline */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6">Recent Registrations</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-white/40">
            No users found
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user, index) => (
              <div 
                key={user.id} 
                className="flex items-start gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                  {index < users.length - 1 && (
                    <div className="w-0.5 h-12 bg-white/10 my-2"></div>
                  )}
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar user={user} size={40} />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm md:text-base truncate">{user.name}</h3>
                      <p className="text-xs text-white/60 truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* User details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-xs">
                    <div className="flex items-center gap-2 text-white/60">
                      <Clock className="w-4 h-4" />
                      <span>Registered: {formatDate(user.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <MapPin className="w-4 h-4" />
                      <span>{user.country || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.kyc_status === 'verified' ? 'bg-profit/10 text-profit' :
                        user.kyc_status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        user.kyc_status === 'rejected' ? 'bg-loss/10 text-loss' :
                        'bg-white/10 text-white/60'
                      }`}>
                        {user.kyc_status}
                      </span>
                    </div>
                  </div>

                  {/* Additional info */}
                  <div className="mt-2 text-xs text-white/40">
                    Balance: ${parseFloat(user.balance || 0).toFixed(2)} • Last updated: {getTimeAgo(user.updated_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminActivity;

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, DollarSign, TrendingUp, Activity, Settings, FileText, ArrowRight, Edit2, MessageCircle } from 'lucide-react';
import { Card, Button } from '../../component/shared/UI';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import Avatar from '../../component/Avatar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrades: 0,
    totalVolume: '0.00',
    totalBalance: '0.00'
  });
  const [users, setUsers] = useState([]);

  // Check if user is logged in
  useEffect(() => {
    const session = localStorage.getItem('tradz_session');
    if (!session) {
      toast.error('Please login first');
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, usersData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getUsers(1, 10, '')
      ]);
      
      setStats(statsData);
      const usersList = usersData.users || usersData.data || [];
      
      // Sort users by creation date to show recent registrations
      const sortedUsers = usersList.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      setUsers(sortedUsers);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data: ' + error.message);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-white/60 mt-2">Manage users, settings, and platform operations</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Users</p>
              <p className="text-2xl md:text-3xl font-bold mt-2">{stats.totalUsers}</p>
            </div>
            <Users className="w-10 h-10 md:w-12 md:h-12 text-primary opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Trades</p>
              <p className="text-2xl md:text-3xl font-bold mt-2">{stats.totalTrades}</p>
            </div>
            <TrendingUp className="w-10 h-10 md:w-12 md:h-12 text-profit opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Volume</p>
              <p className="text-2xl md:text-3xl font-bold mt-2">${stats.totalVolume}</p>
            </div>
            <DollarSign className="w-10 h-10 md:w-12 md:h-12 text-primary opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Balance</p>
              <p className="text-2xl md:text-3xl font-bold mt-2">${stats.totalBalance}</p>
            </div>
            <Activity className="w-10 h-10 md:w-12 md:h-12 text-primary opacity-20" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Link to="/admin/users">
          <Card className="p-6 hover:bg-white/5 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Manage Users</h3>
                  <p className="text-sm text-white/60">View and edit all users</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-primary transition-all" />
            </div>
          </Card>
        </Link>

        <Link to="/admin/settings">
          <Card className="p-6 hover:bg-white/5 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Platform Settings</h3>
                  <p className="text-sm text-white/60">Configure platform parameters</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-primary transition-all" />
            </div>
          </Card>
        </Link>

        <Link to="/admin/logs">
          <Card className="p-6 hover:bg-white/5 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Activity Logs</h3>
                  <p className="text-sm text-white/60">View system activity</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-primary transition-all" />
            </div>
          </Card>
        </Link>

        <Link to="/admin/chat-support">
          <Card className="p-6 hover:bg-white/5 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Chat Support</h3>
                  <p className="text-sm text-white/60">Respond to user messages</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-primary transition-all" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Users Preview */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-bold">Recent User Registrations</h2>
          <Link to="/admin/users">
            <Button variant="secondary" className="flex items-center gap-2">
              View All Users
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 text-xs md:text-sm text-white/60 whitespace-nowrap">User</th>
                  <th className="text-left p-3 text-xs md:text-sm text-white/60 whitespace-nowrap hidden md:table-cell">Email</th>
                  <th className="text-left p-3 text-xs md:text-sm text-white/60 whitespace-nowrap">Balance</th>
                  <th className="text-left p-3 text-xs md:text-sm text-white/60 whitespace-nowrap">KYC</th>
                  <th className="text-left p-3 text-xs md:text-sm text-white/60 whitespace-nowrap">Registered</th>
                  <th className="text-left p-3 text-xs md:text-sm text-white/60 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-white/40">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.slice(0, 5).map((user) => (
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
                        <span className="font-bold text-sm md:text-base">${parseFloat(user.balance).toFixed(2)}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.kyc_status === 'verified' ? 'bg-profit/10 text-profit' :
                          user.kyc_status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                          user.kyc_status === 'rejected' ? 'bg-loss/10 text-loss' :
                          'bg-white/10 text-white/60'
                        }`}>
                          {user.kyc_status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-xs text-white/60">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-3">
                        <Link to="/admin/users">
                          <button className="p-2 text-primary hover:bg-primary/10 rounded transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Download } from 'lucide-react';
import { Card, Button } from '../../component/shared/UI';
import { adminService } from '../../services/adminService';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading] = useState(false);

  // Check auth
  useEffect(() => {
    const session = localStorage.getItem('tradz_session');
    if (!session) {
      toast.error('Please login first');
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    loadLogs();
  }, [page]);

  const loadLogs = async () => {
    try {
      const data = await adminService.getActivityLogs(page, 50);
      setLogs(data.logs || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Failed to load activity logs:', error);
    }
  };

  const exportLogs = () => {
    const csv = [
      ['Date', 'Admin', 'Action', 'Target User', 'Details'],
      ...logs.map(log => [
        new Date(log.created_at).toLocaleString(),
        log.admin?.email || 'System',
        log.action,
        log.target?.email || 'N/A',
        JSON.stringify(log.details)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString()}.csv`;
    a.click();
    toast.success('Logs exported successfully');
  };

  const getActionColor = (action) => {
    if (action.includes('DELETE')) return 'text-red-400';
    if (action.includes('UPDATE')) return 'text-yellow-400';
    if (action.includes('CREATE')) return 'text-green-400';
    return 'text-blue-400';
  };

  const getActionIcon = (action) => {
    if (action.includes('DELETE')) return '🗑️';
    if (action.includes('UPDATE')) return '✏️';
    if (action.includes('CREATE')) return '➕';
    if (action.includes('LOGIN')) return '🔐';
    return '📝';
  };

  if (loading && logs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Activity Logs</h1>
          <p className="text-white/60 mt-1">Monitor all admin actions and system events</p>
        </div>
        <Button onClick={exportLogs} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-white/60 text-sm">Total Logs</p>
          <p className="text-2xl font-bold mt-1">{logs.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-white/60 text-sm">Today's Actions</p>
          <p className="text-2xl font-bold mt-1">
            {logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-white/60 text-sm">Active Admins</p>
          <p className="text-2xl font-bold mt-1">
            {new Set(logs.map(l => l.admin?.email).filter(Boolean)).size}
          </p>
        </Card>
      </div>

      {/* Logs Timeline */}
      <Card className="p-6">
        <div className="space-y-4">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No activity logs yet</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-xl">
                  {getActionIcon(log.action)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-white/60 mt-1">
                        by <span className="text-white font-medium">{log.admin?.email || 'System'}</span>
                        {log.target && (
                          <>
                            {' '} → <span className="text-white font-medium">{log.target.email}</span>
                          </>
                        )}
                      </p>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-2 p-2 bg-black/20 rounded text-xs font-mono text-white/60">
                          {JSON.stringify(log.details, null, 2)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-white/40">
                        {new Date(log.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-white/40">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
            <Button
              variant="secondary"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-white/60 text-sm">Page {page} of {totalPages}</span>
            <Button
              variant="secondary"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminLogs;

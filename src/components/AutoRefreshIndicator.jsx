import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AutoRefreshIndicator = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  useEffect(() => {
    // Listen for profile refresh events
    const handleRefresh = () => {
      setIsRefreshing(true);
      setLastRefresh(Date.now());
      setTimeout(() => setIsRefreshing(false), 1000);
    };

    // Check for refresh every 10 seconds (matches UserContext refresh interval)
    const interval = setInterval(handleRefresh, 10000);

    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = () => {
    const seconds = Math.floor((Date.now() - lastRefresh) / 1000);
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <AnimatePresence>
      {isRefreshing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-4 right-4 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 flex items-center gap-2 z-50"
        >
          <RefreshCw className="w-4 h-4 text-primary animate-spin" />
          <span className="text-xs text-primary font-medium">Syncing data...</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AutoRefreshIndicator;

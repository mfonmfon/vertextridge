import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../config/supabase';
import { authService } from '../services/authService';
import { onboardingService } from '../services/onboardingService';
import { tradeService } from '../services/tradeService';
import { financeService } from '../services/financeService';
import { marketService } from '../services/marketService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Load all persisted state on mount - SIMPLE VERSION, NO EXPIRATION CHECKS
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      // Always check localStorage first for immediate restoration
      const savedSession = localStorage.getItem('tradz_session');
      const savedUser = localStorage.getItem('tradz_user');

      if (savedSession && savedUser) {
        try {
          const session = JSON.parse(savedSession);
          const parsedUser = JSON.parse(savedUser);
          
          // Set user and session immediately - NO CHECKS
          setSession(session);
          setUser(parsedUser);
          console.log('✅ User restored from localStorage:', parsedUser.email);
          
          // Try to restore Supabase session in background
          if (session.access_token && session.refresh_token) {
            supabase.auth.setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token
            }).catch(err => {
              console.warn('Could not restore Supabase session:', err);
            });
          }
          
          // Try to fetch fresh data in background (non-blocking)
          onboardingService.getProfile(parsedUser.id)
            .then(({ profile }) => {
              const userState = {
                ...parsedUser,
                ...profile,
                balance: profile?.balance || parsedUser.balance,
                kycStatus: profile?.kyc_status || parsedUser.kycStatus,
              };
              setUser(userState);
              persist('tradz_user', userState);
            })
            .catch(err => {
              console.warn('Could not fetch fresh profile:', err);
            });
            
        } catch (err) {
          console.error('Failed to restore session:', err);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // Persist helpers
  const persist = (key, data) => localStorage.setItem(key, JSON.stringify(data));

  const signup = async (userData) => {
    setLoading(true);
    setAuthError(null);
    try {
      // 1. Create account
      const data = await authService.signup(userData);
      
      if (!data.user || !data.session) {
        throw new Error('Signup failed - no user or session returned');
      }

      // 2. Set the session in Supabase client (this enables auto-refresh)
      if (data.session.access_token && data.session.refresh_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
        
        if (sessionError) {
          console.warn('Failed to set Supabase session:', sessionError);
        } else {
          console.log('✅ Supabase session set successfully');
        }
      }

      // 3. Set session first so subsequent requests are authenticated
      const sessionToStore = {
        ...data.session,
        access_token: data.session.access_token || data.session.token || data.token,
        user: data.user
      };
      
      setSession(sessionToStore);
      persist('tradz_session', sessionToStore);

      // 4. Now fetch the full profile with balance (this will work because session is set)
      try {
        const profileRes = await onboardingService.getProfile(data.user.id);
        
        const userState = {
          ...data.user,
          name: userData.fullName,
          country: userData.country,
          balance: profileRes.profile?.balance || 10000.00,
          kycStatus: profileRes.profile?.kyc_status || 'unverified',
          email: userData.email,
          profit: profileRes.profile?.profit || 0,
          total_holdings: profileRes.profile?.total_holdings || 0,
          portfolio_value: profileRes.profile?.portfolio_value || 0,
        };
        
        setUser(userState);
        persist('tradz_user', userState);
        
        toast.success('Welcome to Vertex Ridge! 🎉');
        return true;
      } catch (profileErr) {
        // If profile fetch fails, still log them in with basic info
        console.warn('Profile fetch failed, using basic info:', profileErr);
        
        const userState = {
          ...data.user,
          name: userData.fullName,
          country: userData.country,
          balance: 10000.00,
          kycStatus: 'unverified',
          email: userData.email
        };
        
        setUser(userState);
        persist('tradz_user', userState);
        
        toast.success('Account created! Welcome to Vertex Ridge! 🎉');
        return true;
      }
    } catch (err) {
      const errorMsg = err.message || 'Signup failed';
      setAuthError(errorMsg);
      toast.error(errorMsg);
      console.error('Signup error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    setAuthError(null);
    try {
      // 1. Login via backend
      const data = await authService.login(credentials);
      
      if (!data.user || !data.session) {
        throw new Error('Login failed - no user or session returned');
      }

      // 2. Set the session in Supabase client (this enables auto-refresh)
      if (data.session.access_token && data.session.refresh_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
        
        if (sessionError) {
          console.warn('Failed to set Supabase session:', sessionError);
        } else {
          console.log('✅ Supabase session set successfully');
        }
      }

      // 3. Store session in our custom storage
      const sessionToStore = {
        ...data.session,
        access_token: data.session.access_token || data.session.token || data.token,
        user: data.user
      };
      
      console.log('💾 Storing session with token:', {
        hasAccessToken: !!sessionToStore.access_token,
        hasRefreshToken: !!sessionToStore.refresh_token,
        expiresAt: sessionToStore.expires_at ? new Date(sessionToStore.expires_at * 1000) : 'N/A'
      });

      setSession(sessionToStore);
      persist('tradz_session', sessionToStore);

      // 4. Fetch full profile with balance
      try {
        const profileRes = await onboardingService.getProfile(data.user.id);
        
        const userState = {
          ...data.user,
          name: profileRes.profile?.name || data.user.user_metadata?.full_name,
          country: profileRes.profile?.country,
          balance: profileRes.profile?.balance || 10000.00,
          kycStatus: profileRes.profile?.kyc_status || 'unverified',
          profit: profileRes.profile?.profit || 0,
          total_holdings: profileRes.profile?.total_holdings || 0,
          portfolio_value: profileRes.profile?.portfolio_value || 0,
        };

        setUser(userState);
        persist('tradz_user', userState);
        
        toast.success('Welcome back! 👋');
        return true;
      } catch (profileErr) {
        // If profile fetch fails, still log them in
        console.warn('Profile fetch failed:', profileErr);
        
        const userState = {
          ...data.user,
          balance: 10000.00,
          kycStatus: 'unverified',
        };

        setUser(userState);
        persist('tradz_user', userState);
        
        toast.success('Login successful!');
        return true;
      }
    } catch (err) {
      const errorMsg = err.message || 'Authentication failed';
      setAuthError(errorMsg);
      toast.error(errorMsg);
      console.error('Login error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (credential, country = 'Not specified') => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await authService.googleLogin(credential, country);

      if (!data.user) {
        throw new Error('Google login failed - no user returned');
      }

      // Check if backend returned a session
      if (data.session) {
        // Use the proper session from backend
        setSession(data.session);
        persist('tradz_session', data.session);
      } else {
        // Fallback: create a fake session (for backward compatibility)
        const fakeSession = { 
          user: data.user, 
          access_token: credential,
          expires_at: Math.floor(Date.now() / 1000) + 3600
        };
        setSession(fakeSession);
        persist('tradz_session', fakeSession);
      }

      const googleUser = {
        ...data.user,
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        country: data.user.country,
        picture: data.user.picture,
        balance: data.user.balance || 50.00,
        kycStatus: data.user.kycStatus || 'unverified',
        isGoogle: true
      };

      setUser(googleUser);
      persist('tradz_user', googleUser);
      
      toast.success('Welcome! Signed in with Google 🎉');
      return true;
    } catch (err) {
      const errorMsg = err.message || 'Google authentication failed';
      setAuthError(errorMsg);
      toast.error(errorMsg);
      console.error('Google login error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout error:', err);
    }
    setUser(null);
    setSession(null);
    setAuthError(null);
    setHoldings([]);
    setWatchlist([]);
    setTradeHistory([]);
    setTransactions([]);
    localStorage.clear(); // Clear all
  };

  const updateBalance = async (amount, type = 'deposit', method = 'bank') => {
    if (!user) return false;
    
    try {
      let res;
      if (type === 'deposit') {
        res = await financeService.deposit(amount, method);
      } else {
        res = await financeService.withdraw(amount, method);
      }

      // Update balance from response
      const updatedUser = { ...user, balance: res.newBalance };
      setUser(updatedUser);
      persist('tradz_user', updatedUser);

      // Refresh transactions
      const txRes = await financeService.getTransactions();
      setTransactions(txRes.transactions);
      
      return true;
    } catch (err) {
      console.error('Balance update failed:', err.message);
      return false;
    }
  };

  const executeTransfer = async (recipient, amount, note) => {
    if (!user) return false;

    try {
      const res = await financeService.transfer(recipient, amount, note);
      
      const updatedUser = { ...user, balance: res.newBalance };
      setUser(updatedUser);
      persist('tradz_user', updatedUser);

      const txRes = await financeService.getTransactions();
      setTransactions(txRes.transactions);
      
      return true;
    } catch (err) {
      console.error('Transfer failed:', err.message);
      return false;
    }
  };

  const updateKYC = (status) => {
    const updatedUser = { ...user, kycStatus: status };
    setUser(updatedUser);
    persist('tradz_user', updatedUser);
  };

  // ═══════════════════════════════════════════
  // TRADING ENGINE
  // ═══════════════════════════════════════════

  const executeTrade = async (asset, type, quantity, price) => {
    if (!user) return false;

    try {
      const data = await tradeService.execute({
        asset,
        type,
        quantity,
        price
      });

      // Update local state with the new balance and fresh data
      const updatedUser = { ...user, balance: data.newBalance };
      setUser(updatedUser);
      persist('tradz_user', updatedUser);

      // Refresh holdings and history from backend to ensure consistency
      const [holdingsRes, tradesRes] = await Promise.all([
        tradeService.getHoldings(),
        tradeService.getHistory()
      ]);

      setHoldings(holdingsRes.holdings.map(h => ({
        ...h,
        assetId: h.asset_id,
        avgBuyPrice: h.avg_buy_price
      })));
      setTradeHistory(tradesRes.trades);

      return true;
    } catch (err) {
      console.error('Trade failed:', err.message);
      return false;
    }
  };

  // ═══════════════════════════════════════════
  // WATCHLIST
  // ═══════════════════════════════════════════

  const toggleWatchlist = async (assetId) => {
    if (!user) return;
    
    try {
      await marketService.toggleWatchlist(assetId);
      
      // Refresh watchlist from backend
      const res = await marketService.getWatchlist();
      setWatchlist(res.watchlist);
    } catch (err) {
      console.error('Watchlist toggle failed:', err.message);
    }
  };

  const isWatchlisted = (assetId) => watchlist.includes(assetId);

  return (
    <UserContext.Provider
      value={{
        user,
        session,
        signup,
        login,
        googleLogin,
        logout,
        authError,
        transactions,
        updateBalance,
        executeTransfer,
        updateKYC,
        loading,
        // Portfolio
        holdings,
        watchlist,
        tradeHistory,
        executeTrade,
        toggleWatchlist,
        isWatchlisted,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Card, Button, Input } from '../../component/shared/UI';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Call login API directly
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      console.log('=== LOGIN RESPONSE DEBUG ===');
      console.log('Response status:', response.status);
      console.log('Response OK:', response.ok);
      console.log('Data keys:', Object.keys(data));
      console.log('Has session:', !!data.session);
      console.log('Has user:', !!data.user);
      if (data.session) {
        console.log('Session keys:', Object.keys(data.session));
        console.log('Session structure:', {
          hasAccessToken: !!data.session.access_token,
          hasRefreshToken: !!data.session.refresh_token,
          expiresAt: data.session.expires_at,
          expiresIn: data.session.expires_in,
          tokenType: data.session.token_type
        });
      }

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store session in localStorage
      if (data.session) {
        console.log('Storing admin session with keys:', Object.keys(data.session));
        localStorage.setItem('tradz_session', JSON.stringify(data.session));
        localStorage.setItem('tradz_user', JSON.stringify(data.user));
        
        // Verify it was stored
        const stored = localStorage.getItem('tradz_session');
        const parsedStored = JSON.parse(stored);
        console.log('Verified stored session keys:', Object.keys(parsedStored));
        console.log('Verified access_token exists:', !!parsedStored.access_token);
      } else {
        console.error('No session in response:', data);
      }

      toast.success('Admin login successful!');
      
      // Small delay to ensure storage is complete
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 100);
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to User Login</span>
        </button>

        <Card className="p-8 md:p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Admin Access</h1>
            <p className="text-white/60 mt-2 text-center">Secure login for administrators</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@vertexridgee.com"
                  className="pl-12"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Your secure password"
                  className="pl-12 pr-12"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full py-4 text-base font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                'Login to Admin Panel'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-white/40 text-center">
              Admin access is restricted. Unauthorized access attempts are logged.
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/40">
            Need help? Contact system administrator
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;

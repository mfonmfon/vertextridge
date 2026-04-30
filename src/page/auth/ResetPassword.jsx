import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.jpeg';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[a-z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;
    return strength;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (getPasswordStrength(password) < 100) {
      toast.error('Please follow password strength requirements');
      return;
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success('Password reset successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white text-[#111111] overflow-hidden font-sans">
      {/* Left Panel: Form */}
      <div className="w-full lg:w-[45%] flex flex-col p-8 lg:p-12 relative z-10 bg-[#fafafa]">
        {/* Header/Logo */}
        <div className="flex items-center justify-between mb-6 lg:mb-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src={logo} alt="Vertex Ridge" className="w-9 h-9 rounded-xl object-cover" />
            <span className="text-2xl font-bold tracking-tight text-black">Vertex Ridge</span>
          </Link>
          <Link to="/login" className="text-sm font-bold text-black/40 hover:text-black transition-all bg-black/5 hover:bg-black/10 px-4 py-2 rounded-full">
            Back to Login
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center"
        >
          {!success ? (
            <>
              <div className="mb-8 text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl font-bold text-black tracking-tighter leading-none mb-4">
                  Reset Password
                </h1>
                <p className="text-black/40 text-lg font-medium">
                  Enter your new password below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-black/30 uppercase tracking-[0.15em] ml-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-white border border-black/[0.08] rounded-2xl pl-12 pr-6 py-4 text-base focus:outline-none focus:border-black/20 focus:ring-4 focus:ring-black/[0.02] transition-all font-medium text-black shadow-sm placeholder:text-black/20"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  {password && (
                    <div className="px-1 mt-1 flex flex-col gap-1.5">
                      <div className="h-1 w-full bg-black/[0.03] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${getPasswordStrength(password)}%` }}
                          className={`h-full ${
                            getPasswordStrength(password) <= 25 ? 'bg-red-500' :
                            getPasswordStrength(password) <= 50 ? 'bg-orange-500' :
                            getPasswordStrength(password) <= 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                        />
                      </div>
                      <p className="text-[9px] font-bold text-black/20 uppercase tracking-widest">
                        Requires: 8+ chars, Uppercase, Lowercase, Number
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-black/30 uppercase tracking-[0.15em] ml-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-white border border-black/[0.08] rounded-2xl pl-12 pr-6 py-4 text-base focus:outline-none focus:border-black/20 focus:ring-4 focus:ring-black/[0.02] transition-all font-medium text-black shadow-sm placeholder:text-black/20"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white font-bold py-5 rounded-2xl hover:bg-black/90 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
                  {!loading && <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-black mb-4">Password Reset!</h2>
              <p className="text-black/60 text-lg mb-8 leading-relaxed">
                Your password has been reset successfully. Redirecting to login...
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Right Panel: Image */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden bg-black">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.9 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          src="/auth_background.png"
          alt="Crypto Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/10 to-black/40" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute bottom-16 left-16 right-16 p-12 rounded-[40px] backdrop-blur-2xl bg-white/[0.03] border border-white/10 text-white"
        >
          <h2 className="text-4xl font-bold leading-tight tracking-tighter mb-4">
            Secure Your <span className="text-primary">Account</span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed font-medium">
            Create a strong password to keep your account safe and secure.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;

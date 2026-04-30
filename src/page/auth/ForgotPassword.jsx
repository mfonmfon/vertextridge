import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.jpeg';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      // Always show success message for security (don't reveal if email exists)
      if (response.ok || response.status === 400) {
        setEmailSent(true);
        toast.success('If an account exists with this email, you will receive a password reset link shortly.');
      } else {
        // For server errors, show a generic message
        setEmailSent(true);
        toast.success('Password reset request received. If an account exists with this email, you will receive a reset link shortly.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      // Still show success for security
      setEmailSent(true);
      toast.success('Password reset request received. If an account exists with this email, you will receive a reset link shortly.');
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
          {!emailSent ? (
            <>
              <div className="mb-8 text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl font-bold text-black tracking-tighter leading-none mb-4">
                  Forgot Password?
                </h1>
                <p className="text-black/40 text-lg font-medium">
                  No worries! Enter your email and we'll send you reset instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-black/30 uppercase tracking-[0.15em] ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
                    <input
                      type="email"
                      placeholder="john@vertextridge.com"
                      className="w-full bg-white border border-black/[0.08] rounded-2xl pl-12 pr-6 py-4 text-base focus:outline-none focus:border-black/20 focus:ring-4 focus:ring-black/[0.02] transition-all font-medium text-black shadow-sm placeholder:text-black/20"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                  <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
                  {!loading && <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>

              <p className="mt-8 text-center text-[13px] text-black/40 font-medium">
                Remember your password?{' '}
                <Link to="/login" className="text-black font-bold hover:underline">
                  Log in here
                </Link>
              </p>
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
              <h2 className="text-3xl font-bold text-black mb-4">Check Your Email</h2>
              <p className="text-black/60 text-lg mb-8 leading-relaxed">
                If an account exists with <span className="font-bold text-black">{email}</span>, you will receive password reset instructions shortly.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  <strong>Note:</strong> Email delivery may take a few minutes.
                </p>
                <p className="text-xs text-blue-700">
                  If you don't receive an email, please check your spam folder or contact support.
                </p>
              </div>
              <p className="text-sm text-black/40 mb-8">
                Didn't receive the email?{' '}
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                  className="text-black font-bold hover:underline"
                >
                  Try again
                </button>
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-black/90 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
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
            Secure Account <span className="text-primary">Recovery</span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed font-medium">
            Your security is our priority. We'll help you regain access to your account safely and quickly.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, ArrowLeft } from 'lucide-react';
import { Button } from '../../component/shared/UI';
import { useUser } from '../../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: ''
  });
  const { signup, googleLogin, authError, loading } = useUser();
  const navigate = useNavigate();

  const countries = [
    { name: 'United States', flag: '🇺🇸', code: 'US' },
    { name: 'United Kingdom', flag: '🇬🇧', code: 'GB' },
    { name: 'Canada', flag: '🇨🇦', code: 'CA' },
    { name: 'Australia', flag: '🇦🇺', code: 'AU' },
    { name: 'Germany', flag: '🇩🇪', code: 'DE' },
    { name: 'France', flag: '🇫🇷', code: 'FR' },
    { name: 'Spain', flag: '🇪🇸', code: 'ES' },
    { name: 'Italy', flag: '🇮🇹', code: 'IT' },
    { name: 'Netherlands', flag: '🇳🇱', code: 'NL' },
    { name: 'Belgium', flag: '🇧🇪', code: 'BE' },
    { name: 'Switzerland', flag: '🇨🇭', code: 'CH' },
    { name: 'Sweden', flag: '🇸🇪', code: 'SE' },
    { name: 'Norway', flag: '🇳🇴', code: 'NO' },
    { name: 'Denmark', flag: '🇩🇰', code: 'DK' },
    { name: 'Finland', flag: '🇫🇮', code: 'FI' },
    { name: 'Ireland', flag: '🇮🇪', code: 'IE' },
    { name: 'Portugal', flag: '🇵🇹', code: 'PT' },
    { name: 'Austria', flag: '🇦🇹', code: 'AT' },
    { name: 'Poland', flag: '🇵🇱', code: 'PL' },
    { name: 'Czech Republic', flag: '🇨🇿', code: 'CZ' },
    { name: 'Greece', flag: '🇬🇷', code: 'GR' },
    { name: 'Japan', flag: '🇯🇵', code: 'JP' },
    { name: 'South Korea', flag: '🇰🇷', code: 'KR' },
    { name: 'Singapore', flag: '🇸🇬', code: 'SG' },
    { name: 'Hong Kong', flag: '🇭🇰', code: 'HK' },
    { name: 'India', flag: '🇮🇳', code: 'IN' },
    { name: 'Brazil', flag: '🇧🇷', code: 'BR' },
    { name: 'Mexico', flag: '🇲🇽', code: 'MX' },
    { name: 'Argentina', flag: '🇦🇷', code: 'AR' },
    { name: 'Chile', flag: '🇨🇱', code: 'CL' },
    { name: 'Colombia', flag: '🇨🇴', code: 'CO' },
    { name: 'Nigeria', flag: '🇳🇬', code: 'NG' },
    { name: 'South Africa', flag: '🇿🇦', code: 'ZA' },
    { name: 'Kenya', flag: '🇰🇪', code: 'KE' },
    { name: 'Egypt', flag: '🇪🇬', code: 'EG' },
    { name: 'United Arab Emirates', flag: '🇦🇪', code: 'AE' },
    { name: 'Saudi Arabia', flag: '🇸🇦', code: 'SA' },
    { name: 'Israel', flag: '🇮🇱', code: 'IL' },
    { name: 'Turkey', flag: '🇹🇷', code: 'TR' },
    { name: 'Russia', flag: '🇷🇺', code: 'RU' },
    { name: 'Ukraine', flag: '🇺🇦', code: 'UA' },
    { name: 'New Zealand', flag: '🇳🇿', code: 'NZ' },
    { name: 'Philippines', flag: '🇵🇭', code: 'PH' },
    { name: 'Thailand', flag: '🇹🇭', code: 'TH' },
    { name: 'Vietnam', flag: '🇻🇳', code: 'VN' },
    { name: 'Indonesia', flag: '🇮🇩', code: 'ID' },
    { name: 'Malaysia', flag: '🇲🇾', code: 'MY' },
    { name: 'Pakistan', flag: '🇵🇰', code: 'PK' },
    { name: 'Bangladesh', flag: '🇧🇩', code: 'BD' },
    { name: 'China', flag: '🇨🇳', code: 'CN' },
    { name: 'Taiwan', flag: '🇹🇼', code: 'TW' },
    { name: 'Other', flag: '🌍', code: 'OT' }
  ].sort((a, b) => a.name.localeCompare(b.name));

  const getPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[a-z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;
    return strength;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!formData.country) {
      toast.error("Please select your country");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (getPasswordStrength(formData.password) < 100) {
      toast.error("Please follow password strength requirements");
      return;
    }
    
    const success = await signup({
      email: formData.email,
      password: formData.password,
      fullName: formData.name,
      country: formData.country
    });
    
    if (success) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    }
  };

  const handleGoogleSuccess = async (response) => {
    const success = await googleLogin(response.credential, formData.country || 'Not specified');
    if (success) {
      toast.success('Signed in with Google!');
      navigate('/dashboard');
    } else {
      toast.error('Google signin failed.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="min-h-screen flex bg-white text-[#111111] overflow-hidden font-sans">
      {/*  Left Panel: Auth Form */}
      <div className="w-full lg:w-[45%] flex flex-col p-8 lg:p-12 relative z-10 bg-[#fafafa]">
        {/* Header/Logo */}
        <div className="flex items-center justify-between mb-6 lg:mb-10">
          <Link to="/" className="flex items-center gap-2.5 group">
             <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-black/10">T</div>
             <span className="text-2xl font-bold tracking-tight text-black">TradZ.</span>
          </Link>
          <Link to="/login" className="text-sm font-bold text-black/40 hover:text-black transition-all bg-black/5 hover:bg-black/10 px-4 py-2 rounded-full">
            Log in
          </Link>
        </div>

        <motion.div 
           variants={containerVariants}
           initial="hidden"
           animate="show"
           className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center"
        >
          <motion.div variants={itemVariants} className="mb-8 text-center lg:text-left flex flex-col items-center lg:items-start gap-4">
             <h1 className="text-4xl lg:text-5xl font-bold text-black tracking-tighter leading-none">Create account</h1>
             <p className="text-black/40 text-lg font-medium">Join 50k+ traders starting today.</p>
          </motion.div>

          {/* Google Auth */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4 mb-8">
            <div className="w-full flex justify-center lg:justify-start">
               <div className="w-full relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/0 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative w-full rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-black/5">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error('Google sign-in failed')}
                      theme="filled_black"
                      shape="pill"
                      size="large"
                      text="signup_with"
                      width="400"
                    />
                  </div>
               </div>
            </div>
            {authError && <p className="text-red-500 text-xs font-bold mt-2 text-center lg:text-left">{authError}</p>}
          </motion.div>

          <motion.div variants={itemVariants} className="relative mb-8 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/[0.06]"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-extrabold"><span className="bg-[#fafafa] px-6 text-black/20">Secure registration</span></div>
          </motion.div>

          {/* Email Form */}
          <motion.form variants={itemVariants} onSubmit={handleSignup} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
               <label className="text-[10px] font-bold text-black/30 uppercase tracking-[0.15em] ml-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  className="w-full bg-white border border-black/[0.08] rounded-2xl px-6 py-4 text-base focus:outline-none focus:border-black/20 focus:ring-4 focus:ring-black/[0.02] transition-all font-medium text-black shadow-sm placeholder:text-black/20"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
            </div>
            <div className="flex flex-col gap-2">
               <label className="text-[10px] font-bold text-black/30 uppercase tracking-[0.15em] ml-1">Email address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full bg-white border border-black/[0.08] rounded-2xl px-6 py-4 text-base focus:outline-none focus:border-black/20 focus:ring-4 focus:ring-black/[0.02] transition-all font-medium text-black shadow-sm placeholder:text-black/20"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
            </div>
            <div className="flex flex-col gap-2">
               <label className="text-[10px] font-bold text-black/30 uppercase tracking-[0.15em] ml-1">Country</label>
                <select
                  className="w-full bg-white border border-black/[0.08] rounded-2xl px-6 py-4 text-base focus:outline-none focus:border-black/20 focus:ring-4 focus:ring-black/[0.02] transition-all font-medium text-black shadow-sm appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23000000' fill-opacity='0.3' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1.5rem center',
                    backgroundSize: '12px'
                  }}
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  required
                >
                  <option value="">🌍 Select your country</option>
                  {countries.map(country => (
                    <option key={country.code} value={country.name}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-black/30 uppercase tracking-[0.15em] ml-1">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-white border border-black/[0.08] rounded-2xl px-6 py-4 text-base focus:outline-none focus:border-black/20 focus:ring-4 focus:ring-black/[0.02] transition-all font-medium text-black shadow-sm placeholder:text-black/20"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                    {/* Strength Bar */}
                    {formData.password && (
                      <div className="px-1 mt-1 flex flex-col gap-1.5">
                        <div className="h-1 w-full bg-black/[0.03] rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${getPasswordStrength(formData.password)}%` }}
                             className={`h-full ${
                               getPasswordStrength(formData.password) <= 25 ? 'bg-red-500' :
                               getPasswordStrength(formData.password) <= 50 ? 'bg-orange-500' :
                               getPasswordStrength(formData.password) <= 75 ? 'bg-yellow-500' : 'bg-primary'
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
                    <label className="text-[10px] font-bold text-black/30 uppercase tracking-[0.15em] ml-1">Confirm</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-white border border-black/[0.08] rounded-2xl px-6 py-4 text-base focus:outline-none focus:border-black/20 focus:ring-4 focus:ring-black/[0.02] transition-all font-medium text-black shadow-sm placeholder:text-black/20"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                </div>
            </div>

            <button
               type="submit"
               disabled={loading}
               className="w-full bg-black text-white font-bold py-5 rounded-2xl hover:bg-black/90 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 mt-4 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Creating account...' : 'Create account'}</span>
              {!loading && <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />}
            </button>
          </motion.form>

          <motion.p variants={itemVariants} className="mt-8 text-center text-[13px] text-black/30 font-medium leading-relaxed leading-relaxed">
            By creating an account, you agree to our <a href="#" className="underline text-black/60 decoration-black/20 hover:decoration-black/40">Terms</a> and <a href="#" className="underline text-black/60 decoration-black/20 hover:decoration-black/40">Privacy Policy</a>.
          </motion.p>
        </motion.div>
        
        <div className="text-center mt-auto pt-8">
           <span className="text-[13px] text-black/40 font-medium tracking-tight">Already have an account? <Link to="/login" className="text-black font-bold hover:underline">Log in here</Link></span>
        </div>
      </div>

      {/* ═══ Right Panel: Image ═══ */}
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

        {/* Floating Quote/Stats */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute bottom-16 left-16 right-16 p-12 rounded-[40px] backdrop-blur-2xl bg-white/[0.03] border border-white/10 text-white flex flex-col gap-6"
        >
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center font-extrabold text-black text-xs shadow-lg shadow-primary/20">T</div>
             <span className="text-lg font-bold tracking-tight opacity-60">Join the Tribe</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight tracking-tighter">Experience <span className="text-primary tracking-normal">limitless</span> trading with TradZ.</h2>
          <p className="text-white/60 text-lg leading-relaxed font-medium">Get access to real-time market insights, secure wallet management, and a vibrant community of over 50,000 active traders worldwide.</p>
          <div className="h-px bg-white/10 w-full my-1" />
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full pulse-glow" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Global Network</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full pulse-glow" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Tier 1 Security</span>
             </div>
          </div>
        </motion.div>

        {/* Subtle decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      </div>
    </div>
  );
};

export default Signup;

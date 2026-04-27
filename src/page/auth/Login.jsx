import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { Button } from '../../component/shared/UI';
import { useUser } from '../../context/UserContext';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.jpeg';
import Avatar from '../../component/Avatar';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, googleLogin, authError, loading } = useUser();
  const navigate = useNavigate();

  // Clear auth errors on component mount
  useEffect(() => {
    // This helps clear stale error messages from previous attempts
    const timer = setTimeout(() => {
      // Error will be cleared by the context if needed
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const success = await login({ email, password });
    setIsSubmitting(false);
    
    if (success) {
      toast.success("Login successful")
      toast.success('Welcome back!');
      navigate('/dashboard');
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const success = await googleLogin(response.credential);
      if (success) {
        toast.success('Signed in with Google!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google sign-in failed. Please try again.');
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
      {/*Left Panel: Auth Form  */}
      <div className="w-full lg:w-[45%] flex flex-col p-8 lg:p-14 relative z-10 bg-[#fafafa]">
        {/* Header/Logo */}
        <div className="flex items-center justify-between mb-8 lg:mb-12">
          <Link to="/" className="flex items-center gap-2.5 group">
             <img src={logo} alt="Vertex Ridge" className="w-9 h-9 rounded-xl object-cover" />
             <span className="text-2xl font-bold tracking-tight text-black">Vertex Ridge</span>
          </Link>
          <Link to="/register" className="text-sm font-bold text-black/40 hover:text-black transition-all bg-black/5 hover:bg-black/10 px-4 py-2 rounded-full">
            Sign up
          </Link>
        </div>

        <motion.div 
           variants={containerVariants}
           initial="hidden"
           animate="show"
           className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center"
        >
          <motion.div variants={itemVariants} className="mb-10 text-center lg:text-left flex flex-col items-center lg:items-start gap-4">
             <h1 className="text-4xl lg:text-5xl font-bold text-black tracking-tighter leading-none">Welcome back</h1>
             <p className="text-black/40 text-lg font-medium">Log in to manage your crypto portfolio.</p>
          </motion.div>

          {/* Google Auth Container with Premium Styling */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4 mb-10">
            <div className="w-full flex justify-center lg:justify-start">
               {/* Custom wrapper for Google button to make it look smoother */}
               <div className="w-full relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/0 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative w-full rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-black/5">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error('Google sign-in failed')}
                      theme="filled_black"
                      shape="pill"
                      size="large"
                      text="continue_with"
                      width="400"
                    />
                  </div>
               </div>
            </div>
            {authError && <p className="text-red-500 text-xs font-bold mt-2 text-center lg:text-left">{authError}</p>}
          </motion.div>

          <motion.div variants={itemVariants} className="relative mb-10 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/[0.06]"></div></div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-[0.2em] font-extrabold"><span className="bg-[#fafafa] px-6 text-black/20">Authorized access</span></div>
          </motion.div>

          {/* Email Form */}
          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2.5">
               <label className="text-xs font-bold text-black/30 uppercase tracking-[0.15em] ml-1">Email address</label>
                <input
                  type="email"
                  placeholder="your.email@domain.com"
                  className="w-full bg-white border border-black/[0.08] rounded-2xl px-6 py-4.5 text-base focus:outline-none focus:border-black/20 focus:ring-4 focus:ring-black/[0.02] transition-all font-medium text-black shadow-sm placeholder:text-black/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
            </div>
            <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold text-black/30 uppercase tracking-[0.15em]">Password</label>
                  <button type="button" className="text-[11px] font-bold text-black/30 hover:text-black transition-colors uppercase tracking-widest">Forgot password?</button>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white border border-black/[0.08] rounded-2xl px-6 py-4.5 text-base focus:outline-none focus:border-black/20 focus:ring-4 focus:ring-black/[0.02] transition-all font-medium text-black shadow-sm placeholder:text-black/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
            </div>

            <button
               type="submit"
               disabled={loading}
               className="w-full bg-black text-white font-bold py-5 rounded-2xl hover:bg-black/90 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 mt-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Logging in...' : 'Continue with email'}</span>
              {!loading && <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />}
            </button>
          </motion.form>

          <motion.p variants={itemVariants} className="mt-12 text-center text-[13px] text-black/30 font-medium leading-relaxed">
            By continuing, you agree to our <a href="#" className="underline text-black/60 decoration-black/20 hover:decoration-black/40">Terms of Service</a> and <a href="#" className="underline text-black/60 decoration-black/20 hover:decoration-black/40">Privacy Policy</a>.
          </motion.p>
        </motion.div>
        
        <div className="text-center mt-auto pt-8">
           <span className="text-[13px] text-black/40 font-medium tracking-tight">Don't have an account? <Link to="/register" className="text-black font-bold hover:underline">Sign up for free</Link></span>
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
             <img src={logo} alt="Vertex Ridge" className="w-8 h-8 rounded-xl object-cover" />
             <span className="text-lg font-bold tracking-tight opacity-60">Success on Vertex Ridge</span>
          </div>
          <p className="text-2xl font-semibold leading-snug tracking-tight">"Vertex Ridge has completely simplified how I manage my investments. The data is real-time and the interface is incredibly smooth."</p>
          
          <div className="flex items-center gap-4">
             <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-surface overflow-hidden shadow-xl">
                     <Avatar 
                       user={{ name: `User ${i}`, email: `user${i}@example.com` }} 
                       size={36} 
                       className="w-full h-full" 
                     />
                  </div>
                ))}
             </div>
             <div className="flex flex-col">
                <span className="text-sm font-bold">Trusted by 50k+</span>
                <span className="text-[10px] uppercase font-extrabold text-primary tracking-[0.2em]">Verified Traders</span>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

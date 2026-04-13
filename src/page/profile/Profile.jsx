import React, { useState } from 'react';
import { User, Mail, Shield, Wallet, Camera, ChevronRight, LogOut, CreditCard, AlertCircle } from 'lucide-react';
import { Card, Button, Input } from '../../component/shared/UI';
import { useUser } from '../../context/UserContext';
import { userService } from '../../services/userService';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout, loading, setUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const updatedUser = await userService.updateProfile(formData);
      setUser({ ...user, ...updatedUser.profile });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const result = await userService.uploadAvatar(file);
      setUser({ ...user, avatar_url: result.avatar_url });
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  if (loading) return null;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto flex flex-col gap-8 pb-24 lg:pb-8"
    >
      {/* ═══ Profile Header ═══ */}
      <div className="flex flex-col md:flex-row items-center gap-8 bg-card border border-white/5 p-8 lg:p-12 rounded-[2.5rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:scale-110 transition-transform">
          <User className="w-48 h-48 text-primary" />
        </div>
        
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 p-1">
            <img 
              src={user?.avatar_url || user?.picture || `https://i.pravatar.cc/150?u=${user?.email}`} 
              alt="Profile" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <label className="absolute bottom-1 right-1 bg-primary text-dark p-2 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer">
            <Camera className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        <div className="flex-1 text-center md:text-left flex flex-col gap-2">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{user?.name || 'User'}</h1>
            {user?.kycStatus === 'verified' && (
              <div className="bg-profit/10 text-profit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <Shield className="w-3 h-3" /> Verified
              </div>
            )}
          </div>
          <p className="text-white/40 font-medium">{user?.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
             <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                <Wallet className="w-4 h-4 text-primary" />
                ${user?.balance?.toLocaleString()}
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                <CreditCard className="w-4 h-4 text-primary" />
                Member since 2024
             </div>
          </div>
        </div>

        <Button 
          variant="secondary" 
          onClick={logout}
          className="flex items-center gap-2 px-6 py-3 text-red-400 hover:bg-red-400/10 hover:border-red-400/20"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: General Settings */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="flex flex-col gap-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold">Account Information</h3>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-primary text-xs font-bold hover:underline"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Full Name</label>
                 <Input 
                   disabled={!isEditing}
                   value={formData.name}
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                   className={!isEditing ? 'opacity-60 cursor-not-allowed bg-transparent' : ''}
                 />
              </div>
              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Email Address</label>
                 <Input 
                   disabled
                   value={formData.email}
                   className="opacity-60 cursor-not-allowed bg-transparent"
                 />
              </div>
            </div>

            {isEditing && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Button onClick={handleUpdate} className="w-full py-4 mt-2">Save Changes</Button>
              </motion.div>
            )}
          </Card>

          <Card className="flex flex-col gap-6">
             <h3 className="text-lg font-bold">Preferences</h3>
             <div className="flex flex-col divide-y divide-white/5">
                {[
                  { label: 'Push Notifications', value: 'Enabled', active: true },
                  { label: 'Two-Factor Auth', value: 'Disabled', active: false },
                  { label: 'Currency Display', value: 'USD ($)', active: true },
                  { label: 'Market Alerts', value: 'Enabled', active: true }
                ].map((item, i) => (
                  <button key={i} className="py-4 flex items-center justify-between group">
                    <span className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">{item.label}</span>
                    <div className="flex items-center gap-2">
                       <span className={`text-xs font-bold ${item.active ? 'text-primary' : 'text-white/20'}`}>{item.value}</span>
                       <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/30 transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>
                ))}
             </div>
          </Card>
        </div>

        {/* Right: Verification Status */}
        <div className="flex flex-col gap-6">
           <Card className={`relative overflow-hidden border-none ${user?.kycStatus === 'verified' ? 'bg-profit/10' : 'bg-primary/10'}`}>
              <div className="flex flex-col gap-4 relative z-10">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${user?.kycStatus === 'verified' ? 'bg-profit text-dark' : 'bg-primary text-dark'}`}>
                    {user?.kycStatus === 'verified' ? <Shield className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                 </div>
                 <div>
                    <h3 className="text-lg font-bold">Verification</h3>
                    <p className="text-xs text-white/40 font-medium leading-relaxed mt-1">
                      {user?.kycStatus === 'verified' 
                        ? 'Your account is fully verified. Enjoy premium trading limits.' 
                        : 'Complete your identity verification to unlock full platform features.'}
                    </p>
                 </div>
                 {user?.kycStatus !== 'verified' && (
                   <Button onClick={() => window.location.href = '/onboarding'} className="w-full py-3 text-xs">Start KYC</Button>
                 )}
              </div>
           </Card>

           <Card className="flex flex-col gap-4 bg-white/[0.02]">
              <h3 className="text-sm font-bold opacity-60">Security Score</h3>
              <div className="flex items-end gap-2">
                 <span className="text-4xl font-bold font-mono tracking-tighter">85</span>
                 <span className="text-sm font-bold text-white/20 mb-1">/ 100</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <div className="w-[85%] h-full bg-gradient-to-r from-primary to-profit rounded-full" />
              </div>
              <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1">Status: Excellent</p>
           </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;

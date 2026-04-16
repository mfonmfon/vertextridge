import React, { useState } from 'react';
import { Bell, Shield, Globe, Mail, Lock, Eye, EyeOff, Smartphone, Save } from 'lucide-react';
import { Card, Button, Input } from '../../component/shared/UI';
import { useUser } from '../../context/UserContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService';

const Settings = () => {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    country: user?.country || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    tradeAlerts: true,
    priceAlerts: true,
    newsletterSubscription: false,
    twoFactorAuth: false,
    currency: 'USD',
    language: 'en',
    theme: 'dark'
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences({ ...preferences, [key]: value });
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const { name, email, country } = formData;
      
      const updatedUser = await userService.updateProfile({ name, country });
      setUser({ ...user, ...updatedUser.profile });
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      await userService.changePassword(formData.currentPassword, formData.newPassword);
      toast.success('Password changed successfully!');
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setLoading(true);
      await userService.updatePreferences(preferences);
      toast.success('Preferences saved successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 pb-24 lg:pb-8"
    >
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Settings</h1>
        <p className="text-white/60 mt-2">Manage your account settings and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-primary" />
          <h2 className="text-xl md:text-2xl font-bold">Profile Information</h2>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Full Name</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Full name"
              />
            </div>
            
            <div>
              <label className="block text-sm text-white/60 mb-2">Email Address</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@domain.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Country</label>
            <Input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder="Country name"
            />
          </div>

          <Button onClick={handleSaveProfile} disabled={loading} className="w-full md:w-auto">
            <Save className="w-4 h-4 mr-2" />
            Save Profile
          </Button>
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-6 h-6 text-primary" />
          <h2 className="text-xl md:text-2xl font-bold">Security</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Current Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Current password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">New Password</label>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="New password"
              />
            </div>
            
            <div>
              <label className="block text-sm text-white/60 mb-2">Confirm Password</label>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <Button onClick={handleChangePassword} disabled={loading} className="w-full md:w-auto">
            <Shield className="w-4 h-4 mr-2" />
            Change Password
          </Button>

          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-white/60">Add an extra layer of security</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.twoFactorAuth}
                  onChange={(e) => handlePreferenceChange('twoFactorAuth', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-primary" />
          <h2 className="text-xl md:text-2xl font-bold">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
            { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive push notifications' },
            { key: 'tradeAlerts', label: 'Trade Alerts', desc: 'Get notified about your trades' },
            { key: 'priceAlerts', label: 'Price Alerts', desc: 'Alerts for price movements' },
            { key: 'newsletterSubscription', label: 'Newsletter', desc: 'Subscribe to our newsletter' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-sm text-white/60">{desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences[key]}
                  onChange={(e) => handlePreferenceChange(key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>

        <Button onClick={handleSavePreferences} disabled={loading} className="w-full md:w-auto mt-6">
          <Save className="w-4 h-4 mr-2" />
          Save Preferences
        </Button>
      </Card>

      {/* Display Preferences */}
      <Card className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-6 h-6 text-primary" />
          <h2 className="text-xl md:text-2xl font-bold">Display Preferences</h2>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Currency</label>
              <select
                value={preferences.currency}
                onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Language</label>
              <select
                value={preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>

          <Button onClick={handleSavePreferences} disabled={loading} className="w-full md:w-auto">
            <Save className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default Settings;

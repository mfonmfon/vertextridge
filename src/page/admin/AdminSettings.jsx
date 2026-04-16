import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Save, DollarSign, Percent, AlertCircle, Building2, Copy, Check } from 'lucide-react';
import { Card, Button, Input } from '../../component/shared/UI';
import { adminService } from '../../services/adminService';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [settings, setSettings] = useState({
    signup_bonus: '50.00',
    trading_fee: '0.001',
    withdrawal_fee: '2.50',
    min_deposit: '10.00',
    min_withdrawal: '20.00',
    maintenance_mode: 'false',
    // Bank details
    bank_name: 'Vertex Ridge Bank',
    account_name: 'Vertex Ridge Trading Platform',
    account_number: '',
    routing_number: '',
    swift_code: '',
    iban: '',
    bank_address: '',
    payment_reference: 'VR-{USER_ID}'
  });

  // Check auth
  useEffect(() => {
    const session = localStorage.getItem('tradz_session');
    if (!session) {
      toast.error('Please login first');
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await adminService.getSettings();
      setSettings(data.settings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSave = async (key, value) => {
    try {
      setSaving(true);
      await adminService.updateSetting(key, value);
      toast.success('Setting updated successfully');
    } catch (error) {
      toast.error('Failed to update setting');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-white/60 mt-1">Configure platform-wide settings and parameters</p>
      </div>

      {/* Bank Details Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Bank Details</h2>
        </div>
        <p className="text-sm text-white/60 mb-6">
          Configure bank account details that users will see when making deposits
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Bank Name
            </label>
            <Input
              type="text"
              value={settings.bank_name || ''}
              onChange={(e) => handleChange('bank_name', e.target.value)}
              onBlur={(e) => handleSave('bank_name', e.target.value)}
              placeholder="JPMorgan Chase Bank"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Account Name
            </label>
            <Input
              type="text"
              value={settings.account_name || ''}
              onChange={(e) => handleChange('account_name', e.target.value)}
              onBlur={(e) => handleSave('account_name', e.target.value)}
              placeholder="Vertex Ridge Trading Platform"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Account Number
            </label>
            <div className="relative">
              <Input
                type="text"
                value={settings.account_number || ''}
                onChange={(e) => handleChange('account_number', e.target.value)}
                onBlur={(e) => handleSave('account_number', e.target.value)}
                placeholder="Account number"
                className="w-full pr-10"
              />
              {settings.account_number && (
                <button
                  onClick={() => copyToClipboard(settings.account_number, 'account_number')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-primary transition-colors"
                >
                  {copiedField === 'account_number' ? (
                    <Check className="w-4 h-4 text-profit" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Routing Number
            </label>
            <div className="relative">
              <Input
                type="text"
                value={settings.routing_number || ''}
                onChange={(e) => handleChange('routing_number', e.target.value)}
                onBlur={(e) => handleSave('routing_number', e.target.value)}
                placeholder="Routing number"
                className="w-full pr-10"
              />
              {settings.routing_number && (
                <button
                  onClick={() => copyToClipboard(settings.routing_number, 'routing_number')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-primary transition-colors"
                >
                  {copiedField === 'routing_number' ? (
                    <Check className="w-4 h-4 text-profit" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              SWIFT / BIC Code
            </label>
            <div className="relative">
              <Input
                type="text"
                value={settings.swift_code || ''}
                onChange={(e) => handleChange('swift_code', e.target.value)}
                onBlur={(e) => handleSave('swift_code', e.target.value)}
                placeholder="CHASUS33"
                className="w-full pr-10"
              />
              {settings.swift_code && (
                <button
                  onClick={() => copyToClipboard(settings.swift_code, 'swift_code')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-primary transition-colors"
                >
                  {copiedField === 'swift_code' ? (
                    <Check className="w-4 h-4 text-profit" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              IBAN
            </label>
            <div className="relative">
              <Input
                type="text"
                value={settings.iban || ''}
                onChange={(e) => handleChange('iban', e.target.value)}
                onBlur={(e) => handleSave('iban', e.target.value)}
                placeholder="GB29 NWBK 6016 1331 9268 19"
                className="w-full pr-10"
              />
              {settings.iban && (
                <button
                  onClick={() => copyToClipboard(settings.iban, 'iban')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-primary transition-colors"
                >
                  {copiedField === 'iban' ? (
                    <Check className="w-4 h-4 text-profit" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-white/60 mb-2">
              Bank Address
            </label>
            <Input
              type="text"
              value={settings.bank_address || ''}
              onChange={(e) => handleChange('bank_address', e.target.value)}
              onBlur={(e) => handleSave('bank_address', e.target.value)}
              placeholder="270 Park Avenue, New York, NY 10017"
              className="w-full"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-white/60 mb-2">
              Payment Reference Format
            </label>
            <Input
              type="text"
              value={settings.payment_reference || ''}
              onChange={(e) => handleChange('payment_reference', e.target.value)}
              onBlur={(e) => handleSave('payment_reference', e.target.value)}
              placeholder="VR-{USER_ID}"
              className="w-full"
            />
            <p className="text-xs text-white/40 mt-1">
              Use {'{USER_ID}'} as placeholder for user's unique ID
            </p>
          </div>
        </div>

        {/* Preview Card */}
        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-sm font-medium text-white/60 mb-3">Preview (What users will see)</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Bank Name:</span>
              <span className="font-medium">{settings.bank_name || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Account Name:</span>
              <span className="font-medium">{settings.account_name || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Account Number:</span>
              <span className="font-mono">{settings.account_number || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Routing Number:</span>
              <span className="font-mono">{settings.routing_number || 'Not set'}</span>
            </div>
            {settings.swift_code && (
              <div className="flex justify-between">
                <span className="text-white/60">SWIFT/BIC:</span>
                <span className="font-mono">{settings.swift_code}</span>
              </div>
            )}
            {settings.iban && (
              <div className="flex justify-between">
                <span className="text-white/60">IBAN:</span>
                <span className="font-mono">{settings.iban}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Financial Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Financial Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Signup Bonus ($)
            </label>
            <Input
              type="number"
              step="0.01"
              value={settings.signup_bonus}
              onChange={(e) => handleChange('signup_bonus', e.target.value)}
              onBlur={(e) => handleSave('signup_bonus', e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-white/40 mt-1">Initial balance given to new users</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Trading Fee (%)
            </label>
            <Input
              type="number"
              step="0.001"
              value={settings.trading_fee}
              onChange={(e) => handleChange('trading_fee', e.target.value)}
              onBlur={(e) => handleSave('trading_fee', e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-white/40 mt-1">Fee percentage per trade</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Withdrawal Fee ($)
            </label>
            <Input
              type="number"
              step="0.01"
              value={settings.withdrawal_fee}
              onChange={(e) => handleChange('withdrawal_fee', e.target.value)}
              onBlur={(e) => handleSave('withdrawal_fee', e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-white/40 mt-1">Fixed fee for withdrawals</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Minimum Deposit ($)
            </label>
            <Input
              type="number"
              step="0.01"
              value={settings.min_deposit}
              onChange={(e) => handleChange('min_deposit', e.target.value)}
              onBlur={(e) => handleSave('min_deposit', e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-white/40 mt-1">Minimum amount for deposits</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Minimum Withdrawal ($)
            </label>
            <Input
              type="number"
              step="0.01"
              value={settings.min_withdrawal}
              onChange={(e) => handleChange('min_withdrawal', e.target.value)}
              onBlur={(e) => handleSave('min_withdrawal', e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-white/40 mt-1">Minimum amount for withdrawals</p>
          </div>
        </div>
      </Card>

      {/* System Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">System Settings</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-sm text-white/60">Disable platform access for maintenance</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenance_mode === 'true'}
                onChange={(e) => {
                  const value = e.target.checked ? 'true' : 'false';
                  handleChange('maintenance_mode', value);
                  handleSave('maintenance_mode', value);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {settings.maintenance_mode === 'true' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
            >
              <p className="text-yellow-500 text-sm font-medium">
                ⚠️ Maintenance mode is enabled. Users cannot access the platform.
              </p>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-primary mb-1">Important Notes</h3>
            <ul className="text-sm text-white/60 space-y-1">
              <li>• Settings are saved automatically when you change them</li>
              <li>• Changes take effect immediately for all users</li>
              <li>• Be careful when modifying financial settings</li>
              <li>• All changes are logged in the activity logs</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminSettings;

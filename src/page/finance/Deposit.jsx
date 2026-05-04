import React, { useState, useEffect, useCallback } from 'react';
import { Card, Input, Button } from '../../component/shared/UI';
import { useUser } from '../../context/UserContext';
import {
  Globe,
  Bitcoin,
  CheckCircle2,
  DollarSign,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Loader2,
  ChevronLeft,
  Building2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { request } from '../../services/api';

// ── Bank details screen ───────────────────────────────────────────────────────
const BankDetailsScreen = ({ amount, onConfirm, onBack, confirming }) => {
  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    request('/finance/bank-details')
      .then(setBank)
      .catch(() => toast.error('Could not load bank details'))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (value, field) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    toast.success('Copied!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyRow = ({ label, value, field }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div>
        <p className="text-xs text-white/40 mb-0.5">{label}</p>
        <p className="font-mono font-bold text-sm">{value}</p>
      </div>
      <button
        onClick={() => handleCopy(value, field)}
        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-primary/20 flex items-center justify-center transition-all flex-shrink-0 ml-3"
      >
        {copiedField === field
          ? <Check className="w-3.5 h-3.5 text-primary" />
          : <Copy className="w-3.5 h-3.5 text-white/40" />
        }
      </button>
    </div>
  );

  if (loading) {
    return (
      <Card className="flex items-center justify-center py-20 max-w-xl mx-auto">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-6 max-w-xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold">Bank Transfer</h3>
      </div>

      {/* Amount */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Amount to Transfer</p>
        <p className="text-3xl font-bold font-mono text-primary">
          ${parseFloat(amount).toLocaleString()}
        </p>
      </div>

      {/* Bank details */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-bold">{bank?.bankName}</p>
            <p className="text-xs text-white/40">{bank?.branch}</p>
          </div>
        </div>

        <CopyRow label="Account Name" value={bank?.accountName} field="name" />
        <CopyRow label="Account Number" value={bank?.accountNumber} field="account" />
        <CopyRow label="Routing Number" value={bank?.routingNumber} field="routing" />
        <CopyRow label="SWIFT / BIC" value={bank?.swiftCode} field="swift" />
        <CopyRow label="IBAN" value={bank?.iban} field="iban" />
      </div>

      {/* Reference — most important */}
      <div className="bg-primary/5 border border-primary/30 rounded-2xl p-4">
        <p className="text-xs text-primary/60 uppercase tracking-widest mb-1">Payment Reference (Required)</p>
        <div className="flex items-center justify-between">
          <p className="font-mono font-bold text-lg text-primary">{bank?.reference}</p>
          <button
            onClick={() => handleCopy(bank?.reference, 'ref')}
            className="w-9 h-9 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all"
          >
            {copiedField === 'ref'
              ? <Check className="w-4 h-4 text-primary" />
              : <Copy className="w-4 h-4 text-primary" />
            }
          </button>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4">
        <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-500/80 leading-relaxed">
          You MUST include the reference code in your transfer description. Without it we cannot match your payment and credit your account.
        </p>
      </div>

      <div className="flex items-center gap-2 text-white/30">
        <Clock className="w-4 h-4" />
        <span className="text-xs">Processing time: 1–3 business days</span>
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={onConfirm} disabled={confirming}>
          {confirming ? 'Processing...' : "I've Made the Transfer"}
        </Button>
        <Button variant="secondary" onClick={onBack} disabled={confirming}>
          Go Back
        </Button>
      </div>
    </Card>
  );
};

// ── Crypto coin list with wallet addresses ────────────────────────────────────
// Replace the `address` values with your real wallet addresses
const CRYPTO_COINS = [
  {
    id: 'usdt-trc20',
    name: 'USDT',
    label: 'TRC-20',
    network: 'USDT (TRC-20)',
    address: 'TN3W4H6rK2ce4vX9YnFQHwKx7X9mrzeU35',
    color: '#26A17B',
    icon: '₮',
    tags: ['popular', 'stablecoin', 'low-fees'],
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    label: 'ERC-20',
    network: 'USDC (ERC-20)',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    color: '#2775CA',
    icon: '$',
    tags: ['stablecoin'],
  },
  {
    id: 'btc',
    name: 'Bitcoin',
    label: 'BTC',
    network: 'Bitcoin (BTC)',
    address: 'bc1q8mnrq2866x49ec6y0r22t2kfm9044svwzlmy0h',
    color: '#F7931A',
    icon: '₿',
    tags: ['popular'],
  },
  {
    id: 'eth',
    name: 'Ethereum',
    label: 'ERC-20',
    network: 'Ethereum (ERC-20)',
    address: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
    color: '#627EEA',
    icon: 'Ξ',
    tags: ['popular'],
  },
  {
    id: 'bnb',
    name: 'BNB',
    label: 'BEP-20',
    network: 'BNB (BEP-20)',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    color: '#F3BA2F',
    icon: 'B',
    tags: ['low-fees'],
  },
  {
    id: 'trx',
    name: 'TRX',
    label: 'TRC-20',
    network: 'TRON (TRC-20)',
    address: 'TYASr5UV6HEcXatwdFQfmLVUqQQQMUxHLS',
    color: '#EF0027',
    icon: 'T',
    tags: ['low-fees'],
  },
  {
    id: 'sol',
    name: 'Solana',
    label: 'SOL',
    network: 'Solana (SOL)',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    color: '#9945FF',
    icon: '◎',
    tags: [],
  },
  {
    id: 'ltc',
    name: 'Litecoin',
    label: 'LTC',
    network: 'Litecoin (LTC)',
    address: 'LTdsVS8VDw6syvfQADdhf2PHAm3rMGJvPX',
    color: '#BFBBBB',
    icon: 'Ł',
    tags: [],
  },
  {
    id: 'doge',
    name: 'Dogecoin',
    label: 'DOGE',
    network: 'Dogecoin (DOGE)',
    address: 'D7Y55Jr7oMFoB8FzGMoJhQFBBHMnFMkXFe',
    color: '#C2A633',
    icon: 'Ð',
    tags: [],
  },
];

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'popular', label: 'Popular' },
  { id: 'low-fees', label: 'Low fees' },
  { id: 'stablecoin', label: 'Stablecoins' },
];

// ── Coin icon circle ──────────────────────────────────────────────────────────
const CoinIcon = ({ coin, size = 'md' }) => {
  const sz = size === 'lg' ? 'w-16 h-16 text-2xl' : 'w-12 h-12 text-lg';
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: coin.color }}
    >
      {coin.icon}
    </div>
  );
};

// ── Crypto selector screen ────────────────────────────────────────────────────
const CryptoSelector = ({ onSelect, onBack }) => {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? CRYPTO_COINS
    : CRYPTO_COINS.filter(c => c.tags.includes(filter));

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold">Select Crypto</h2>
          <p className="text-white/40 text-sm">Choose the coin you want to deposit</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${
              filter === f.id
                ? 'bg-primary text-dark border-primary'
                : 'bg-white/5 text-white/50 border-white/10 hover:border-white/30'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Coin grid */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
        {filtered.map(coin => (
          <motion.button
            key={coin.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(coin)}
            className="bg-white/5 border border-white/5 hover:border-white/20 rounded-2xl p-5 flex flex-col items-center gap-3 transition-all"
          >
            <CoinIcon coin={coin} />
            <div className="text-center">
              <p className="font-bold text-sm">{coin.name}</p>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{coin.label}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// ── Wallet address screen ─────────────────────────────────────────────────────
const CryptoAddressScreen = ({ coin, amount, onConfirm, onBack, confirming }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coin.address);
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="flex flex-col gap-6 max-w-xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold">Deposit {coin.name}</h3>
      </div>

      {/* Coin + amount */}
      <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4">
        <CoinIcon coin={coin} size="lg" />
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-1">You are sending</p>
          <p className="text-2xl font-bold font-mono">${parseFloat(amount).toLocaleString()}</p>
          <p className="text-sm text-white/40">{coin.network}</p>
        </div>
      </div>

      {/* Address */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Deposit Address</p>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="flex-1 font-mono text-sm break-all leading-relaxed">{coin.address}</p>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 hover:bg-primary/20 border border-white/10 flex items-center justify-center transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-white/40" />}
          </button>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4">
        <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-500/80 leading-relaxed">
          Only send <span className="font-bold">{coin.network}</span> to this address.
          Sending any other coin will result in permanent loss of funds.
        </p>
      </div>

      <div className="flex items-center gap-2 text-white/30">
        <Clock className="w-4 h-4" />
        <span className="text-xs">Estimated confirmation: 10–30 minutes</span>
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={onConfirm} disabled={confirming}>
          {confirming ? 'Processing...' : "I've Sent the Payment"}
        </Button>
        <Button variant="secondary" onClick={onBack} disabled={confirming}>
          Go Back
        </Button>
      </div>
    </Card>
  );
};

// ── Main Deposit ──────────────────────────────────────────────────────────────
const Deposit = () => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(null);
  // steps: 'select-method' | 'select-coin' | 'crypto-address' | 'bank-review' | 'success'
  const [step, setStep] = useState('select-method');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [depositing, setDepositing] = useState(false);
  const { updateBalance } = useUser();

  const methods = [
    { id: 'bank', name: 'Bank Transfer', icon: Globe, fee: '0%' },
    { id: 'crypto', name: 'Cryptocurrency', icon: Bitcoin, fee: '0%' },
  ];

  const handleProceed = () => {
    if (method?.id === 'crypto') setStep('select-coin');
    else setStep('bank-review');
  };

  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin);
    setStep('crypto-address');
  };

  const handleDeposit = async () => {
    setDepositing(true);
    const success = await updateBalance(parseFloat(amount), 'deposit', method.id);
    setDepositing(false);
    if (success) {
      toast.success('Funds deposited successfully!');
      setStep('success');
    } else {
      toast.error('Deposit failed. Please try again.');
    }
  };

  const reset = () => {
    setStep('select-method');
    setAmount('');
    setMethod(null);
    setSelectedCoin(null);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      {step === 'select-method' && (
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Add Funds</h1>
          <p className="text-white/40">Select a payment method and enter the amount you wish to deposit.</p>
        </div>
      )}

      <AnimatePresence mode="wait">

        {/* ── Select method + amount ── */}
        {step === 'select-method' && (
          <motion.div key="select-method"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-6"
          >
            <div className="grid md:grid-cols-2 gap-4 max-w-xl">
              {methods.map((m) => (
                <button key={m.id} onClick={() => setMethod(m)}
                  className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-4 text-center group ${
                    method?.id === m.id
                      ? 'bg-primary border-primary text-dark'
                      : 'bg-white/5 border-white/5 hover:border-primary/50 text-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    method?.id === m.id ? 'bg-dark/10' : 'bg-white/5 group-hover:bg-primary/10'
                  }`}>
                    <m.icon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{m.name}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-widest ${
                      method?.id === m.id ? 'text-dark/40' : 'text-white/20'
                    }`}>Fee: {m.fee}</span>
                  </div>
                </button>
              ))}
            </div>

            <Card className="flex flex-col gap-8">
              <Input label="Amount to Deposit" type="number" placeholder="0.00"
                icon={DollarSign} value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Button disabled={!method || !amount} onClick={handleProceed} className="w-full">
                Proceed to Payment
              </Button>
            </Card>
          </motion.div>
        )}

        {/* ── Select coin ── */}
        {step === 'select-coin' && (
          <motion.div key="select-coin"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
          >
            <CryptoSelector onSelect={handleCoinSelect} onBack={() => setStep('select-method')} />
          </motion.div>
        )}

        {/* ── Crypto address ── */}
        {step === 'crypto-address' && selectedCoin && (
          <motion.div key="crypto-address"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
          >
            <CryptoAddressScreen
              coin={selectedCoin}
              amount={amount}
              onConfirm={handleDeposit}
              onBack={() => setStep('select-coin')}
              confirming={depositing}
            />
          </motion.div>
        )}

        {/* ── Bank details ── */}
        {step === 'bank-review' && (
          <motion.div key="bank-review"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          >
            <BankDetailsScreen
              amount={amount}
              onConfirm={handleDeposit}
              onBack={() => setStep('select-method')}
              confirming={depositing}
            />
          </motion.div>
        )}

        {/* ── Success ── */}
        {step === 'success' && (
          <motion.div key="success"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-20 text-center gap-8"
          >
            <div className="relative">
              <CheckCircle2 className="w-24 h-24 text-primary" />
              <motion.div
                initial={{ scale: 1 }} animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 bg-primary/20 rounded-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold">Deposit Successful!</h1>
              <p className="text-white/40 max-w-sm">
                Your funds have been added to your account. You can now start trading.
              </p>
            </div>
            <Button onClick={reset} variant="secondary" className="px-10">
              Make Another Deposit
            </Button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default Deposit;

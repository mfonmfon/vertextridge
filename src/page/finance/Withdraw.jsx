import React, { useState } from 'react';
import { Card, Input, Button } from '../../component/shared/UI';
import { useUser } from '../../context/UserContext';
import { 
  ArrowUpRight, 
  ShieldCheck, 
  AlertTriangle,
  Banknote,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import toast from 'react-hot-toast';

const Withdraw = () => {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState(1);
  const [withdrawing, setWithdrawing] = useState(false);
  const { user, updateBalance } = useUser();

  const handleWithdraw = async () => {
    setWithdrawing(true);
    const success = await updateBalance(parseFloat(amount), 'withdrawal', 'bank');
    setWithdrawing(false);
    
    if (success) {
      toast.success('Withdrawal request submitted!');
      setStep(3);
    } else {
      toast.error('Withdrawal failed. Please check your balance.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Withdraw Funds</h1>
        <p className="text-white/40">Request a payout to your designated bank account or wallet.</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-6"
          >
            <Card className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Available Balance</span>
                <span className="text-4xl font-mono font-bold text-primary tracking-tighter">
                  $ {user?.balance?.toLocaleString() || '0.00'}
                </span>
              </div>
              
              <Input 
                label="Amount to Withdraw"
                type="number"
                placeholder="0.00"
                icon={DollarSign}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex gap-3 italic">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-500/80 leading-relaxed">
                  Withdrawals can only be sent to accounts that have been verified. 
                  Fees may apply depending on your provider.
                </p>
              </div>

              <Button 
                disabled={!amount || parseFloat(amount) > user?.balance}
                onClick={() => setStep(2)}
              >
                Continue to Security
              </Button>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="flex flex-col gap-8 max-w-xl mx-auto">
              <div className="flex flex-col gap-2 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-2">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Secure Withdrawal</h3>
                <p className="text-white/40 text-sm">Please enter the destination details</p>
              </div>

              <div className="flex flex-col gap-4">
                <Input label="Wallet Address / Bank IBAN" placeholder="Enter details..." />
                <Input label="Security PIN" type="password" placeholder="••••" />
              </div>

              <div className="flex flex-col gap-4">
                <Button 
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                >
                  {withdrawing ? 'Processing...' : 'Request Payout'}
                </Button>
                <Button variant="secondary" onClick={() => setStep(1)} disabled={withdrawing}>Go Back</Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-20 text-center gap-8"
          >
            <div className="relative">
              <Banknote className="w-24 h-24 text-primary" />
              <motion.div 
                initial={{ scale: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 bg-primary/20 rounded-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold">Request Received!</h1>
              <p className="text-white/40 max-w-sm">
                Your withdrawal request of <span className="text-white font-bold">${parseFloat(amount).toLocaleString()}</span> has been submitted for processing.
              </p>
            </div>
            <Button onClick={() => setStep(1)} variant="secondary" className="px-10">Return to Dashboard</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Withdraw;

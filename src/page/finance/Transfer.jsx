import React, { useState } from 'react';
import { Card, Input, Button } from '../../component/shared/UI';
import { useUser } from '../../context/UserContext';
import { 
  Repeat, 
  User, 
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import toast from 'react-hot-toast';

const Transfer = () => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [step, setStep] = useState(1);
  const [transferring, setTransferring] = useState(false);
  const { user, executeTransfer } = useUser();

  const handleTransfer = async () => {
    setTransferring(true);
    const success = await executeTransfer(recipient, parseFloat(amount), 'Internal Transfer');
    setTransferring(false);
    
    if (success) {
      toast.success('Funds transferred successfully!');
      setStep(3);
    } else {
      toast.error('Transfer failed. Please check balance and recipient.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Transfer Funds</h1>
        <p className="text-white/40">Send money instantly to other Vertex Ridge users or between your wallets.</p>
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
              
              <div className="grid md:grid-cols-2 gap-6">
                <Input 
                  label="Recipient Email / User ID" 
                  placeholder="user@example.com" 
                  icon={Search}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
                <Input 
                  label="Amount to Transfer"
                  type="number"
                  placeholder="0.00"
                  icon={DollarSign}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="p-6 bg-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Transfer Type</p>
                    <p className="text-xs text-white/40">Internal Wallet Transfer</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">Free</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-white/20">Commission</p>
                </div>
              </div>

              <Button 
                disabled={!amount || !recipient || parseFloat(amount) > user?.balance}
                onClick={() => setStep(2)}
                className="flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
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
                <h3 className="text-xl font-bold">Confirm Transfer</h3>
                <p className="text-white/40 text-sm">Please review the transfer details</p>
              </div>

              <div className="bg-white/5 rounded-[2rem] p-8 flex flex-col gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Repeat className="w-24 h-24" />
                </div>
                
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="text-xs font-bold text-white/20 uppercase tracking-[0.2em]">Sending</span>
                  <span className="text-4xl font-mono font-bold text-primary">$ {parseFloat(amount).toLocaleString()}</span>
                </div>

                <div className="h-[1px] bg-white/10 w-full" />

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-sm">To Recipient</span>
                    <span className="font-bold text-sm">{recipient}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-sm">Fee</span>
                    <span className="text-primary font-bold text-sm">$ 0.00</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button 
                  onClick={handleTransfer}
                  disabled={transferring}
                >
                  {transferring ? 'Processing...' : 'Confirm & Send'}
                </Button>
                <Button variant="secondary" onClick={() => setStep(1)} disabled={transferring}>Go Back</Button>
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
              <CheckCircle2 className="w-24 h-24 text-primary" />
              <motion.div 
                initial={{ scale: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 bg-primary/20 rounded-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold">Transfer Complete!</h1>
              <p className="text-white/40 max-w-sm">
                Your transfer of <span className="text-white font-bold">${parseFloat(amount).toLocaleString()}</span> has been sent successfully.
              </p>
            </div>
            <Button onClick={() => setStep(1)} variant="secondary" className="px-10">Return to Dashboard</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transfer;

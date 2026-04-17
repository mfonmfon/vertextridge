import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Upload, User, MapPin, CheckCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import { Card, Input, Button } from '../../component/shared/UI';
import { useUser } from '../../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { onboardingService } from '../../services/onboardingService';

const KYCOnboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [kycData, setKycData] = useState({
    dob: '',
    nationality: '',
    phone: '',
    occupation: '',
    address: '',
    city: '',
    postalCode: '',
    state: '',
    country: ''
  });
  
  const { user, updateKYC } = useUser();
  const navigate = useNavigate();

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid document (JPG, PNG, or PDF)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadedDocument(file);
    toast.success('Document uploaded successfully!');
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      await onboardingService.submit({
        userId: user.id,
        experience: kycData.occupation,
        goals: 'growth',
        riskTolerance: 'medium',
        documentUploaded: !!uploadedDocument,
        ...kycData
      });
      
      toast.success('Onboarding completed! Welcome aboard.');
      updateKYC('verified');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Onboarding failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: 'Personal Info', icon: User, description: 'Basic details' },
    { title: 'Identity', icon: Shield, description: 'ID Verification' },
    { title: 'Address', icon: MapPin, description: 'Proof of residence' },
    { title: 'Verification', icon: CheckCircle, description: 'Final review' },
  ];

  return (
    <div className="min-h-screen bg-dark py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Button variant="secondary" onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-4 py-2">
            <ArrowLeft className="w-4 h-4" />
            Skip for now
          </Button>
          <div className="text-right">
            <h1 className="text-2xl font-bold">Identity Verification</h1>
            <p className="text-white/40 text-sm">Step {step} of 4</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-4 mb-12">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = i + 1 === step;
            const isCompleted = i + 1 < step;
            return (
              <div key={i} className="flex-1 flex flex-col gap-3">
                <div className={`h-1.5 rounded-full transition-all duration-500 ${
                  isActive || isCompleted ? 'bg-primary' : 'bg-white/10'
                }`} />
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isActive ? 'bg-primary text-dark' : isCompleted ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/20'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="hidden md:block">
                    <p className={`text-xs font-bold leading-none ${isActive ? 'text-white' : 'text-white/20'}`}>{s.title}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="flex flex-col gap-8">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                  {error}
                </div>
              )}

              {step === 1 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Input 
                    label="Date of Birth" 
                    type="date" 
                    placeholder="YYYY-MM-DD" 
                    value={kycData.dob} 
                    onChange={(e) => setKycData({...kycData, dob: e.target.value})} 
                  />
                  <Input 
                    label="Nationality" 
                    placeholder="United States" 
                    value={kycData.nationality} 
                    onChange={(e) => setKycData({...kycData, nationality: e.target.value})} 
                  />
                  <Input 
                    label="Phone Number" 
                    placeholder="+1 (555) 000-0000" 
                    value={kycData.phone} 
                    onChange={(e) => setKycData({...kycData, phone: e.target.value})} 
                  />
                  <Input 
                    label="Occupation" 
                    placeholder="Software Engineer" 
                    value={kycData.occupation} 
                    onChange={(e) => setKycData({...kycData, occupation: e.target.value})} 
                  />
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-6 text-center py-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                    <Shield className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold">Upload Government Issued ID</h3>
                  <p className="text-white/40 text-sm max-w-sm mx-auto">
                    Please upload a clear scan or photo of your Passport, National ID, or Driver's License.
                  </p>
                  
                  {!uploadedDocument ? (
                    <label className="mt-4 p-12 border-2 border-dashed border-white/10 rounded-[2rem] hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all flex flex-col items-center gap-4">
                      <Upload className="w-8 h-8 text-white/20" />
                      <span className="text-sm font-bold text-white/40">Drop your file here or click to browse</span>
                      <span className="text-xs text-white/20">Supported: JPG, PNG, PDF (Max 5MB)</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileUpload}
                      />
                    </label>
                  ) : (
                    <div className="mt-4 p-6 bg-primary/10 border border-primary/20 rounded-[2rem] flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-sm">{uploadedDocument.name}</p>
                          <p className="text-xs text-white/40">
                            {(uploadedDocument.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setUploadedDocument(null)}
                        className="text-white/40 hover:text-white text-sm font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Input 
                    label="Home Address" 
                    placeholder="123 Wall Street" 
                    className="md:col-span-2" 
                    value={kycData.address} 
                    onChange={(e) => setKycData({...kycData, address: e.target.value})} 
                  />
                  <Input 
                    label="City" 
                    placeholder="New York" 
                    value={kycData.city} 
                    onChange={(e) => setKycData({...kycData, city: e.target.value})} 
                  />
                  <Input 
                    label="Postal Code" 
                    placeholder="10001" 
                    value={kycData.postalCode} 
                    onChange={(e) => setKycData({...kycData, postalCode: e.target.value})} 
                  />
                  <Input 
                    label="State/Province" 
                    placeholder="New York" 
                    value={kycData.state} 
                    onChange={(e) => setKycData({...kycData, state: e.target.value})} 
                  />
                  <Input 
                    label="Country" 
                    placeholder="United States" 
                    value={kycData.country} 
                    onChange={(e) => setKycData({...kycData, country: e.target.value})} 
                  />
                </div>
              )}

              {step === 4 && (
                <div className="flex flex-col items-center gap-8 py-10 text-center">
                  <div className="relative">
                    <CheckCircle className="w-24 h-24 text-primary" />
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-primary/20 rounded-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-2xl font-bold">Everything looks good!</h3>
                    <p className="text-white/40 text-sm max-w-sm">
                      Our team will review your documents within 24 hours. You can already start exploring the platform.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-8 border-t border-white/5">
                <Button variant="secondary" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1 || loading}>
                  Previous
                </Button>
                <Button 
                  onClick={() => step < 4 ? setStep(step + 1) : handleComplete()} 
                  className="flex items-center gap-2"
                  loading={loading}
                  disabled={step === 2 && !uploadedDocument}
                >
                  {step === 4 ? 'Complete' : 'Continue'}
                  {step < 4 && <ChevronRight className="w-4 h-4" />}
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default KYCOnboarding;

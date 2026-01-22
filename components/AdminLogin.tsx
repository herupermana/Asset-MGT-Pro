
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, RefreshCw, AlertCircle, Loader2, ArrowLeft, Terminal } from 'lucide-react';
import { useApp } from '../AppContext';

interface AdminLoginProps {
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onBack }) => {
  const { loginAdmin } = useApp();
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  
  const [captcha, setCaptcha] = useState({ a: 0, b: 0, sum: 0 });

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    setCaptcha({ a, b, sum: a + b });
    setCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (parseInt(captchaInput) !== captcha.sum) {
      setError('Verification failed. Incorrect captcha.');
      generateCaptcha();
      return;
    }

    setIsLoggingIn(true);
    const success = await loginAdmin(password);
    if (!success) {
      setError('Invalid master password.');
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        <button 
          onClick={onBack}
          className="mb-8 text-slate-400 hover:text-white flex items-center gap-2 font-bold text-sm transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Gateway
        </button>

        <div className="bg-white p-10 rounded-[48px] shadow-2xl border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldCheck className="w-32 h-32 text-slate-900" />
          </div>

          <div className="space-y-8 relative z-10">
            <div className="space-y-2">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 mb-6">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Admin Console</h2>
              <p className="text-slate-500 font-medium">Verify credentials for Management Access.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Master Password</label>
                <div className="relative">
                  <Terminal className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-slate-800"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex justify-between">
                  Identity Verification
                  <button type="button" onClick={generateCaptcha} className="text-blue-500 hover:text-blue-700">
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </label>
                <div className="flex gap-4">
                  <div className="flex-[1] bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-600 text-lg">
                    {captcha.a} + {captcha.b} = ?
                  </div>
                  <input 
                    type="number" 
                    placeholder="Result" 
                    className="flex-[1.5] px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-slate-800 text-center"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black mt-2 uppercase tracking-widest px-2">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoggingIn || !password || !captchaInput}
                className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50"
              >
                {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                {isLoggingIn ? 'Verifying...' : 'Authorize Access'}
              </button>
              
              <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Demo Password: <span className="text-blue-500">admin123</span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

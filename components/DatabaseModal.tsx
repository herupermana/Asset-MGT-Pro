
import React, { useState, useEffect } from 'react';
import { 
  X, Database, Server, User, Key, ShieldCheck, 
  RefreshCw, Check, AlertCircle, Loader2, Link2, 
  Eye, EyeOff, Lock, Network
} from 'lucide-react';
import { useApp } from '../AppContext';
import { api } from '../services/apiService';
import { MySQLConfig } from '../types';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DatabaseModal: React.FC<DatabaseModalProps> = ({ isOpen, onClose }) => {
  const { mysqlConfig, setMysqlConfig } = useApp();
  const [localConfig, setLocalConfig] = useState<MySQLConfig>(mysqlConfig);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'fail'>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync with global state when opened
  useEffect(() => {
    if (isOpen) {
      setLocalConfig(mysqlConfig);
      setTestStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen, mysqlConfig]);

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setErrorMessage('');
    
    const ok = await api.testMySQLConnection(localConfig);
    
    if (ok) {
      setTestStatus('success');
    } else {
      setTestStatus('fail');
      setErrorMessage('Communication fault: Unable to establish handshake with MySQL node.');
    }
  };

  const handleSave = () => {
    setMysqlConfig(localConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#0a0f1d] border border-white/10 rounded-[48px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">MySQL <span className="text-blue-500">Node Configuration</span></h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Enterprise Data Persistence Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl text-slate-500 hover:text-white transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Database Host</label>
              <div className="relative group">
                <Server className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-700"
                  value={localConfig.host}
                  onChange={e => setLocalConfig({...localConfig, host: e.target.value})}
                  placeholder="e.g. 192.168.1.100"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Listen Port</label>
              <div className="relative group">
                <Network className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="number"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-700"
                  value={localConfig.port}
                  onChange={e => setLocalConfig({...localConfig, port: parseInt(e.target.value) || 3306})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Instance / Database Name</label>
            <div className="relative group">
              <Database className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
              <input 
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-700"
                value={localConfig.database}
                onChange={e => setLocalConfig({...localConfig, database: e.target.value})}
                placeholder="e.g. asset_management_prod"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Auth Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-700"
                  value={localConfig.user}
                  onChange={e => setLocalConfig({...localConfig, user: e.target.value})}
                  placeholder="db_admin"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secret Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-12 pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-700"
                  value={localConfig.password || ''}
                  onChange={e => setLocalConfig({...localConfig, password: e.target.value})}
                  placeholder="••••••••"
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${localConfig.ssl ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-slate-600'}`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-white uppercase tracking-widest">Encrypted Tunnel (SSL)</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Require secure TLS connection for data transit</p>
              </div>
            </div>
            <button 
              onClick={() => setLocalConfig({...localConfig, ssl: !localConfig.ssl})}
              className={`w-14 h-8 rounded-full relative transition-all ${localConfig.ssl ? 'bg-blue-600' : 'bg-slate-800'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${localConfig.ssl ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          {/* Test Status Indicator */}
          {testStatus !== 'idle' && (
            <div className={`p-6 rounded-3xl border animate-in slide-in-from-bottom-2 ${
              testStatus === 'testing' ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' :
              testStatus === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' :
              'bg-rose-500/5 border-rose-500/20 text-rose-400'
            }`}>
              <div className="flex items-center gap-4">
                {testStatus === 'testing' && <Loader2 className="w-5 h-5 animate-spin" />}
                {testStatus === 'success' && <Check className="w-5 h-5" />}
                {testStatus === 'fail' && <AlertCircle className="w-5 h-5" />}
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">
                    {testStatus === 'testing' ? 'Synchronizing with node...' : 
                     testStatus === 'success' ? 'Handshake Verified' : 'Handshake Rejected'}
                  </p>
                  {errorMessage && <p className="text-[10px] font-medium mt-1 opacity-70">{errorMessage}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-10 pb-10 pt-6 border-t border-white/5 bg-white/5 flex gap-4">
          <button 
            onClick={handleTestConnection}
            disabled={testStatus === 'testing'}
            className="flex-[1] py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
          >
            {testStatus === 'testing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Test Pulse
          </button>
          <button 
            onClick={handleSave}
            disabled={testStatus !== 'success'}
            className={`flex-[2] py-5 font-black rounded-2xl transition-all uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2
              ${testStatus === 'success' 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:bg-blue-500 active:scale-95' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'}`}
          >
            <Link2 className="w-4 h-4" />
            Save & Connect Node
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseModal;

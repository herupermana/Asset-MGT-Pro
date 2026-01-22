
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import BackupRestore from './BackupRestore';
import { 
  Settings as SettingsIcon, User, Shield, 
  Layers, MapPin, Plus, Trash2, Save, 
  Moon, Sun, Globe, Database, 
  Smartphone, Monitor, RefreshCw, X, Check,
  History, Loader2, Languages, Sparkles, Server, Network, 
  Activity, CloudUpload, ShieldCheck, DatabaseZap
} from 'lucide-react';

const SettingsView: React.FC = () => {
  const { 
    categories, addCategory, removeCategory, 
    locations, addLocation, removeLocation,
    theme, setTheme, language, setLanguage,
    isAutoTranslateEnabled, setAutoTranslate,
    storageMode, setStorageMode, setDbEndpoint, isDbConnected
  } = useApp();

  const [activeSection, setActiveSection] = useState<'system' | 'appearance' | 'infrastructure' | 'governance'>('system');
  const [newCatName, setNewCatName] = useState('');
  const [newLocName, setNewLocName] = useState('');
  const [dbUrl, setDbUrl] = useState(localStorage.getItem('ap_sql_endpoint') || 'http://localhost:3000/api');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGlobalSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setDbEndpoint(dbUrl);
      setIsSaving(false);
      setHasUnsavedChanges(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  useEffect(() => {
    if (dbUrl !== (localStorage.getItem('ap_sql_endpoint') || 'http://localhost:3000/api')) {
      setHasUnsavedChanges(true);
    }
  }, [dbUrl]);

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'system':
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Categories */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Classification Matrix</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Asset Category Definitions</p>
                </div>
              </div>
              
              <div className="glass-card p-8 rounded-[32px] border-white/5 space-y-6">
                <div className="flex gap-3">
                  <input 
                    placeholder="New classification..." 
                    className="flex-1 px-6 py-4 rounded-2xl outline-none text-white font-bold text-sm bg-white/5 border border-white/10"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                  />
                  <button 
                    onClick={() => { if(newCatName.trim()){ addCategory(newCatName.trim()); setNewCatName(''); setHasUnsavedChanges(true); } }}
                    className="px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                  >
                    Add
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <div key={cat} className="group flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-xl hover:border-blue-500/30 transition-all">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{cat}</span>
                      <button onClick={() => { removeCategory(cat); setHasUnsavedChanges(true); }} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-500 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Deployment Zones</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Global Asset Locations</p>
                </div>
              </div>
              
              <div className="glass-card p-8 rounded-[32px] border-white/5 space-y-6">
                <div className="flex gap-3">
                  <input 
                    placeholder="New site location..." 
                    className="flex-1 px-6 py-4 rounded-2xl outline-none text-white font-bold text-sm bg-white/5 border border-white/10"
                    value={newLocName}
                    onChange={e => setNewLocName(e.target.value)}
                  />
                  <button 
                    onClick={() => { if(newLocName.trim()){ addLocation(newLocName.trim()); setNewLocName(''); setHasUnsavedChanges(true); } }}
                    className="px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    Add
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {locations.map(loc => (
                    <div key={loc} className="group flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-xl hover:border-emerald-500/30 transition-all">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{loc}</span>
                      <button onClick={() => { removeLocation(loc); setHasUnsavedChanges(true); }} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-500 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 gap-6">
              <button 
                onClick={() => { setTheme('light'); setHasUnsavedChanges(true); }}
                className={`p-10 rounded-[40px] border-2 text-left transition-all space-y-4 ${theme === 'light' ? 'bg-white border-blue-600 text-slate-900' : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'}`}
              >
                <Sun className={`w-8 h-8 ${theme === 'light' ? 'text-blue-600' : 'text-slate-600'}`} />
                <div>
                  <h4 className="font-black uppercase tracking-widest text-sm">Light Interface</h4>
                  <p className="text-xs opacity-70 mt-1">Maximum visibility for field operations.</p>
                </div>
              </button>
              <button 
                onClick={() => { setTheme('dark'); setHasUnsavedChanges(true); }}
                className={`p-10 rounded-[40px] border-2 text-left transition-all space-y-4 ${theme === 'dark' ? 'bg-slate-900 border-blue-600 text-white' : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'}`}
              >
                <Moon className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-slate-600'}`} />
                <div>
                  <h4 className="font-black uppercase tracking-widest text-sm">Dark Interface</h4>
                  <p className="text-xs opacity-70 mt-1">High-contrast specialized command view.</p>
                </div>
              </button>
            </div>

            <div className="glass-card p-10 rounded-[48px] border-white/5 space-y-8">
              <div className="flex items-center gap-4">
                <Globe className="w-6 h-6 text-blue-500" />
                <h4 className="text-xl font-black text-white uppercase">Regional Sync</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['en', 'id'].map(l => (
                  <button 
                    key={l}
                    onClick={() => { setLanguage(l as any); setHasUnsavedChanges(true); }}
                    className={`p-5 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${language === l ? 'bg-blue-600/10 border-blue-600 text-white' : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'}`}
                  >
                    {l === 'en' ? 'English - Global' : 'Bahasa Indonesia'}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${isAutoTranslateEnabled ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-slate-600'}`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight">AI Content translation</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Use Gemini to localize asset data</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setAutoTranslate(!isAutoTranslateEnabled); setHasUnsavedChanges(true); }}
                  className={`w-14 h-8 rounded-full relative transition-all ${isAutoTranslateEnabled ? 'bg-blue-600' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isAutoTranslateEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        );
      case 'infrastructure':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-[32px] flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl">
                <DatabaseZap className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white uppercase tracking-tight">Enterprise Persistence Hub</h4>
                <p className="text-sm text-slate-400 font-medium">Switch between local sandbox and corporate production database.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <button 
                onClick={() => { setStorageMode('local'); setHasUnsavedChanges(true); }}
                className={`p-10 rounded-[40px] border-2 text-left transition-all space-y-4 ${storageMode === 'local' ? 'bg-blue-600/10 border-blue-600' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
              >
                <Smartphone className="w-10 h-10 text-blue-500" />
                <div>
                  <h4 className="text-lg font-black text-white uppercase">Local Ledger</h4>
                  <p className="text-xs text-slate-500 font-bold mt-1">Safe browser-based persistence for testing.</p>
                </div>
              </button>
              <button 
                onClick={() => { setStorageMode('sql_remote'); setHasUnsavedChanges(true); }}
                className={`p-10 rounded-[40px] border-2 text-left transition-all space-y-4 ${storageMode === 'sql_remote' ? 'bg-blue-600/10 border-blue-600' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
              >
                <Server className="w-10 h-10 text-indigo-500" />
                <div>
                  <h4 className="text-lg font-black text-white uppercase">Corporate SQL</h4>
                  <p className="text-xs text-slate-500 font-bold mt-1">Connect to your real central database.</p>
                </div>
              </button>
            </div>

            {storageMode === 'sql_remote' && (
              <div className="glass-card p-10 rounded-[48px] border-white/5 space-y-8 animate-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-black text-white uppercase tracking-tight">API Connectivity Configuration</h4>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isDbConnected ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                    <Activity className={`w-3.5 h-3.5 ${isDbConnected ? 'animate-pulse' : ''}`} />
                    {isDbConnected ? 'Secure Node Online' : 'Persistence Node Disconnected'}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Central API REST Endpoint</label>
                    <input 
                      className="w-full px-6 py-4 rounded-2xl outline-none text-white font-bold bg-white/5 border border-white/10 focus:ring-4 focus:ring-blue-500/20"
                      value={dbUrl}
                      onChange={(e) => setDbUrl(e.target.value)}
                    />
                  </div>
                  <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl text-sm text-slate-400 font-medium">
                    <p className="flex items-center gap-2 text-blue-400 font-black uppercase text-[10px] tracking-widest mb-2"><Network className="w-4 h-4" />Integration Protocol</p>
                    The Enterprise System will send JSON POST/PUT/DELETE requests to this endpoint. Historical logs are automatically synchronized upon successful authorization.
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'governance':
        return <BackupRestore />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-32">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-900 rounded-[24px] flex items-center justify-center text-blue-500 shadow-xl border border-white/5">
            <SettingsIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase text-glow-blue">System <span className="text-blue-500">Architecture</span></h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Configure global operational & persistence parameters</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-3 space-y-2">
          {[
            { id: 'system', icon: Database, label: 'Asset Core' },
            { id: 'appearance', icon: Monitor, label: 'Interface' },
            { id: 'infrastructure', icon: Server, label: 'Persistence' },
            { id: 'governance', icon: ShieldCheck, label: 'Data Security' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border ${
                activeSection === item.id 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-500/10' 
                  : 'bg-white/5 border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/10'}`}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-9">
          {renderSectionContent()}
        </div>
      </div>

      {/* FIXED SAVE BUTTON (Floating Bar) */}
      {(hasUnsavedChanges || isSaving) && (
        <div className="fixed bottom-10 right-10 left-[300px] flex justify-center z-[60] animate-in slide-in-from-bottom-10 duration-500 no-print">
          <div className="glass-card px-10 py-5 rounded-[40px] border-blue-500/30 flex items-center gap-12 shadow-2xl shadow-blue-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <CloudUpload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black text-white uppercase tracking-tight">Persistence Pending</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Commit changes to permanent storage</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all"
              >
                Abort
              </button>
              <button 
                onClick={handleGlobalSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/40 flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Synchronizing...' : 'Commit Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-10 right-10 z-[100] glass-card px-6 py-4 rounded-2xl border-emerald-500/30 flex items-center gap-4 animate-in slide-in-from-right-10">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-black text-white uppercase">Ledger Sync Complete</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase">All activities archived to primary node</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;

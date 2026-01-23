
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import BackupRestore from './BackupRestore';
import DatabaseModal from './DatabaseModal';
import { api } from '../services/apiService';
import { 
  Settings as SettingsIcon, User, Shield, 
  Layers, MapPin, Plus, Trash2, Save, 
  Moon, Sun, Globe, Database, 
  Smartphone, Monitor, RefreshCw, X, Check,
  History, Loader2, Languages, Sparkles, Server, Network, 
  Activity, CloudUpload, ShieldCheck, DatabaseZap, Terminal,
  ArrowRight, HardHat, Box, ClipboardList, AlertCircle, Cpu,
  Lock, Zap, ToggleLeft, ToggleRight, Key, ShieldAlert, Settings2
} from 'lucide-react';

const SettingsView: React.FC = () => {
  const { 
    assets, spks, technicians,
    categories, addCategory, removeCategory, 
    locations, addLocation, removeLocation,
    theme, setTheme, language, setLanguage,
    isAutoTranslateEnabled, setAutoTranslate,
    storageMode, setStorageMode, setDbEndpoint, isDbConnected,
    redisConfig, setRedisConfig, mysqlConfig
  } = useApp();

  const [activeSection, setActiveSection] = useState<'system' | 'appearance' | 'infrastructure' | 'governance'>('system');
  const [newCatName, setNewCatName] = useState('');
  const [newLocName, setNewLocName] = useState('');
  const [dbUrl, setDbUrl] = useState(api.getEndpoint());
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [testResult, setTestResult] = useState<'none' | 'success' | 'fail' | 'testing'>('none');
  const [redisTestStatus, setRedisTestStatus] = useState<'none' | 'success' | 'fail' | 'testing'>('none');
  const [localRedis, setLocalRedis] = useState(redisConfig);

  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState('');
  const [remoteStats, setRemoteStats] = useState<any>(null);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    if (storageMode === 'sql_remote' && isDbConnected) {
      fetchRemoteStats();
    } else {
      setRemoteStats(null);
      setStatsError(false);
    }
  }, [storageMode, isDbConnected]);

  const fetchRemoteStats = async () => {
    setStatsError(false);
    const stats = await api.fetchDbStats();
    if (stats) {
      setRemoteStats(stats);
    } else {
      setRemoteStats(null);
      setStatsError(true);
    }
  };

  const handleGlobalSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setDbEndpoint(dbUrl);
      setRedisConfig(localRedis);
      setIsSaving(false);
      setHasUnsavedChanges(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  const testApiBridge = async () => {
    setTestResult('testing');
    try {
      const oldUrl = api.getEndpoint();
      api.setEndpoint(dbUrl);
      const ok = await api.checkConnection();
      setTestResult(ok ? 'success' : 'fail');
      api.setEndpoint(oldUrl);
    } catch (e) {
      setTestResult('fail');
    }
  };

  const testRedis = async () => {
    setRedisTestStatus('testing');
    const ok = await api.testRedisConnection(localRedis);
    setRedisTestStatus(ok ? 'success' : 'fail');
    setTimeout(() => setRedisTestStatus('none'), 4000);
  };

  const startMigration = async () => {
    if (!window.confirm("CRITICAL ACTION: This will overwrite remote data with your current local state. Continue?")) return;
    setIsMigrating(true);
    setMigrationStatus('Establishing handshake...');
    try {
      await api.migrateToRemote({ assets, spks, technicians });
      setMigrationStatus('Sync complete.');
      setTimeout(() => {
        setIsMigrating(false);
        setMigrationStatus('');
        fetchRemoteStats();
      }, 2000);
    } catch (e: any) {
      setMigrationStatus(`Error: ${e.message}`);
      setTimeout(() => setIsMigrating(false), 5000);
    }
  };

  useEffect(() => {
    const redisChanged = JSON.stringify(localRedis) !== JSON.stringify(redisConfig);
    const bridgeChanged = dbUrl !== api.getEndpoint();
    setHasUnsavedChanges(redisChanged || bridgeChanged);
  }, [dbUrl, localRedis, redisConfig]);

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
                    onClick={() => { if(newCatName.trim()){ addCategory(newCatName.trim()); setNewCatName(''); } }}
                    className="px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <div key={cat} className="group flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-xl hover:border-blue-500/30 transition-all">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{cat}</span>
                      <button onClick={() => { removeCategory(cat); }} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-500 transition-all">
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
                    onClick={() => { if(newLocName.trim()){ addLocation(newLocName.trim()); setNewLocName(''); } }}
                    className="px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {locations.map(loc => (
                    <div key={loc} className="group flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-xl hover:border-emerald-500/30 transition-all">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{loc}</span>
                      <button onClick={() => { removeLocation(loc); }} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-500 transition-all">
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
                onClick={() => setTheme('light')}
                className={`p-10 rounded-[40px] border-2 text-left transition-all space-y-4 ${theme === 'light' ? 'bg-white border-blue-600 text-slate-900' : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'}`}
              >
                <Sun className={`w-8 h-8 ${theme === 'light' ? 'text-blue-600' : 'text-slate-600'}`} />
                <div>
                  <h4 className="font-black uppercase tracking-widest text-sm">Light Interface</h4>
                  <p className="text-xs opacity-70 mt-1">Maximum visibility for field operations.</p>
                </div>
              </button>
              <button 
                onClick={() => setTheme('dark')}
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
                    onClick={() => setLanguage(l as any)}
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
                  onClick={() => setAutoTranslate(!isAutoTranslateEnabled)}
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
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-[32px] flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl">
                <DatabaseZap className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white uppercase tracking-tight">Persistence Protocol</h4>
                <p className="text-sm text-slate-400 font-medium">Configure where the enterprise ledger is stored and processed.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={() => setStorageMode('local')}
                className={`p-10 rounded-[40px] border-2 text-left transition-all space-y-4 ${storageMode === 'local' ? 'bg-blue-600/10 border-blue-600' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
              >
                <Smartphone className="w-10 h-10 text-blue-500" />
                <div>
                  <h4 className="text-lg font-black text-white uppercase">Local Ledger</h4>
                  <p className="text-xs text-slate-500 font-bold mt-1">Browser storage (Demo sandbox).</p>
                </div>
              </button>
              <button 
                onClick={() => setStorageMode('sql_remote')}
                className={`p-10 rounded-[40px] border-2 text-left transition-all space-y-4 ${storageMode === 'sql_remote' ? 'bg-blue-600/10 border-blue-600' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
              >
                <Server className="w-10 h-10 text-indigo-500" />
                <div>
                  <h4 className="text-lg font-black text-white uppercase">Enterprise SQL</h4>
                  <p className="text-xs text-slate-500 font-bold mt-1">Production MySQL Infrastructure.</p>
                </div>
              </button>
            </div>

            {/* PERSISTENCE NODE MONITOR */}
            <div className="glass-card p-10 rounded-[48px] border-white/5 space-y-8 overflow-hidden relative">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white uppercase tracking-tight">MySQL Infrastructure Node</h4>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Production Persistence Settings</p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border ${isDbConnected ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                  <Activity className={`w-3.5 h-3.5 ${isDbConnected ? 'animate-pulse' : ''}`} />
                  {isDbConnected ? 'Active Connection' : 'Node Disconnected'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="p-8 bg-white/5 rounded-[32px] border border-white/5 space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Linked Host</p>
                    <span className="text-xs font-bold text-white bg-white/10 px-3 py-1 rounded-lg">{mysqlConfig.host || 'Not Configured'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Instance</p>
                    <span className="text-xs font-bold text-white bg-white/10 px-3 py-1 rounded-lg">{mysqlConfig.database || 'None'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Connect User</p>
                    <div className="flex items-center gap-2">
                       <User className="w-3 h-3 text-slate-600" />
                       <span className="text-xs font-bold text-white">{mysqlConfig.user || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-4">
                  <button 
                    onClick={() => setIsDbModalOpen(true)}
                    className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl hover:bg-blue-500 shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                  >
                    <Settings2 className="w-5 h-5" />
                    Configure SQL Node
                  </button>
                  <p className="text-center text-[10px] text-slate-500 font-medium px-8 leading-relaxed">
                    Update credentials, host endpoints, and secure tunnel parameters for the enterprise data node.
                  </p>
                </div>
              </div>
            </div>

            {/* API BRIDGE SETTINGS */}
            <div className="glass-card p-10 rounded-[48px] border-white/5 space-y-10">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-black text-white uppercase tracking-tight">API REST Bridge</h4>
                <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border ${isDbConnected ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                  <Activity className={`w-3.5 h-3.5 ${isDbConnected ? 'animate-pulse' : ''}`} />
                  {isDbConnected ? 'Bridge Online' : 'Bridge Fault'}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Central Server Endpoint</label>
                <div className="flex gap-4">
                  <input 
                    className="flex-1 px-8 py-5 rounded-[24px] outline-none text-white font-black bg-white/5 border border-white/10 focus:ring-[12px] focus:ring-blue-500/10 text-lg placeholder:text-slate-800"
                    value={dbUrl}
                    onChange={(e) => setDbUrl(e.target.value)}
                    placeholder="http://localhost:3000/api"
                  />
                  <button 
                    onClick={testApiBridge}
                    disabled={testResult === 'testing'}
                    className={`px-8 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] transition-all border flex items-center gap-3
                      ${testResult === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 
                        testResult === 'fail' ? 'bg-rose-600 border-rose-500 text-white' : 
                        'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                  >
                    {testResult === 'testing' ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                     testResult === 'success' ? <Check className="w-4 h-4" /> : 
                     testResult === 'fail' ? <X className="w-4 h-4" /> : <Network className="w-4 h-4" />}
                    Test Bridge
                  </button>
                </div>
              </div>
            </div>

            {/* REDIS ACCELERATOR SECTION */}
            <div className="glass-card p-10 rounded-[48px] border-white/5 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white uppercase tracking-tight">Real-time Accelerator (Redis)</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">High-speed telemetry & session cache</p>
                  </div>
                </div>
                <button 
                  onClick={() => setLocalRedis({...localRedis, enabled: !localRedis.enabled})}
                  className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border ${localRedis.enabled ? 'bg-rose-600/10 border-rose-500/30 text-rose-400' : 'bg-white/5 border-white/5 text-slate-500'}`}
                >
                  {localRedis.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  {localRedis.enabled ? 'Cache Active' : 'Cache Disabled'}
                </button>
              </div>

              {localRedis.enabled && (
                <div className="space-y-8 animate-in slide-in-from-top-2 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Redis Server Host</label>
                      <input 
                        className="w-full px-6 py-4 rounded-2xl outline-none text-white font-bold bg-white/5 border border-white/10 placeholder:text-slate-800"
                        value={localRedis.host}
                        onChange={e => setLocalRedis({...localRedis, host: e.target.value})}
                        placeholder="127.0.0.1"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Listen Port</label>
                      <input 
                        type="number"
                        className="w-full px-6 py-4 rounded-2xl outline-none text-white font-bold bg-white/5 border border-white/10"
                        value={localRedis.port}
                        onChange={e => setLocalRedis({...localRedis, port: parseInt(e.target.value) || 6379})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Auth Credentials</label>
                      <input 
                        type="password"
                        className="w-full px-6 py-4 rounded-2xl outline-none text-white font-bold bg-white/5 border border-white/10 placeholder:text-slate-800"
                        value={localRedis.password || ''}
                        onChange={e => setLocalRedis({...localRedis, password: e.target.value})}
                        placeholder="Redis password (optional)"
                      />
                    </div>
                    <div className="flex items-end pb-1">
                      <button 
                        onClick={testRedis}
                        disabled={redisTestStatus === 'testing'}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border w-full justify-center
                          ${redisTestStatus === 'success' ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/20 shadow-lg' : 
                            redisTestStatus === 'fail' ? 'bg-rose-600 border-rose-500 text-white shadow-rose-500/20 shadow-lg' : 
                            'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                      >
                        {redisTestStatus === 'testing' ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                         redisTestStatus === 'success' ? <Check className="w-4 h-4" /> : 
                         redisTestStatus === 'fail' ? <X className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                        {redisTestStatus === 'testing' ? 'Testing Ping...' : 
                         redisTestStatus === 'success' ? 'Redis Reachable' : 
                         redisTestStatus === 'fail' ? 'Redis Handshake Failed' : 'Test Node Connectivity'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PRODUCTION MIGRATION ZONE */}
            <div className="p-10 bg-slate-900 border border-white/5 rounded-[40px] space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                       <CloudUpload className="w-32 h-32" />
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-white font-black text-lg uppercase tracking-tight flex items-center gap-3">
                        <Network className="w-5 h-5 text-indigo-500" />
                        Data Migration Protocol
                      </h5>
                      <p className="text-sm text-slate-500 font-medium">Transfer all local demonstration objects to the production enterprise SQL ledger.</p>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-8">
                       <div className="flex-1 flex items-center justify-between gap-6 p-6 bg-white/5 rounded-3xl border border-white/5 w-full">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                              <Smartphone className="w-6 h-6" />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sandbox</p>
                               <p className="text-sm font-black text-white">{assets.length + spks.length + technicians.length} Objects</p>
                            </div>
                          </div>
                          <ArrowRight className="w-6 h-6 text-slate-700" />
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
                              <Server className="w-6 h-6" />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target SQL</p>
                               <p className="text-sm font-black text-white">Production Node</p>
                            </div>
                          </div>
                       </div>
                       <button 
                        onClick={startMigration}
                        disabled={isMigrating || !isDbConnected}
                        className={`px-10 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center gap-3 shrink-0
                          ${isMigrating ? 'bg-indigo-600 text-white cursor-wait' : 
                            !isDbConnected ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' : 
                            'bg-white text-slate-900 hover:bg-slate-100 shadow-indigo-500/10'}`}
                       >
                         {isMigrating ? <Loader2 className="w-5 h-5 animate-spin" /> : <DatabaseZap className="w-5 h-5" />}
                         {isMigrating ? 'Transferring...' : 'Execute Migration'}
                       </button>
                    </div>

                    {isMigrating && (
                      <div className="space-y-4 animate-in fade-in">
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-500 animate-[progress_3s_infinite]" />
                        </div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                           <Cpu className="w-3.5 h-3.5 animate-spin" />
                           {migrationStatus}
                        </p>
                      </div>
                    )}
            </div>
          </div>
        );
      case 'governance':
        return <BackupRestore />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-32">
      <DatabaseModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} />
      
      <div className="flex items-center justify-between mb-12 no-print">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-900 rounded-[24px] flex items-center justify-center text-blue-500 shadow-xl border border-white/5">
            <SettingsIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase text-glow-blue">System <span className="text-blue-500">Architecture</span></h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Global persistence & infrastructure configuration</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-3 space-y-2 no-print">
          {[
            { id: 'system', icon: Database, label: 'Asset Matrix' },
            { id: 'appearance', icon: Monitor, label: 'Interface' },
            { id: 'infrastructure', icon: Server, label: 'Infrastructure' },
            { id: 'governance', icon: ShieldCheck, label: 'Security' },
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

      {/* Floating Save Prompt */}
      {(hasUnsavedChanges || isSaving) && (
        <div className="fixed bottom-10 right-10 left-[300px] flex justify-center z-[60] animate-in slide-in-from-bottom-10 duration-500 no-print">
          <div className="glass-card px-10 py-5 rounded-[40px] border-blue-500/30 flex items-center gap-12 shadow-2xl shadow-blue-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <CloudUpload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black text-white uppercase tracking-tight">Persistence Pending</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Commit changes to the primary node</p>
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
                {isSaving ? 'Synchronizing...' : 'Commit Protocol'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed top-10 right-10 z-[100] glass-card px-6 py-4 rounded-2xl border-emerald-500/30 flex items-center gap-4 animate-in slide-in-from-right-10">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-black text-white uppercase">Ledger Sync Success</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Infrastructure parameters verified</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;

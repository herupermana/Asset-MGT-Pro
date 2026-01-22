
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AssetList from './components/AssetList';
import SPKManager from './components/SPKManager';
import ImageAIRefiner from './components/ImageAIRefiner';
import VoiceAssistant from './components/VoiceAssistant';
import TechnicianWorkspace from './components/TechnicianWorkspace';
import TechnicianManager from './components/TechnicianManager';
import AdminLogin from './components/AdminLogin';
import ReportCenter from './components/ReportCenter';
import SettingsView from './components/Settings';
import { User, Bell, Search, X, UserCircle, LayoutDashboard, HardHat, ArrowRight, ShieldCheck, Box, LogOut, ChevronDown } from 'lucide-react';
import { useApp } from './AppContext';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'gateway' | 'admin' | 'technician'>('gateway');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { globalSearchQuery, setGlobalSearchQuery, currentTechnician, logout, isAdminLoggedIn, logoutAdmin } = useApp();

  useEffect(() => {
    if (currentTechnician) {
      setViewMode('technician');
    }
  }, [currentTechnician]);

  const handleLogout = () => {
    logout();
    setViewMode('gateway');
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setIsProfileMenuOpen(false);
    setViewMode('gateway');
  };

  if (viewMode === 'gateway') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 animate-in fade-in zoom-in-95 duration-1000">
          <div className="col-span-full text-center mb-12 space-y-6">
            <div className="flex justify-center">
              <div className="bg-blue-600/20 p-5 rounded-[32px] border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.2)] backdrop-blur-xl">
                <Box className="w-12 h-12 text-blue-400" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase text-glow">Asset<span className="text-blue-500">Pro</span></h1>
            <p className="text-slate-400 font-medium max-w-lg mx-auto text-lg">Next-gen enterprise asset intelligence node. Choose your access vector.</p>
          </div>

          <button 
            onClick={() => setViewMode('admin')}
            className="group relative glass-card p-12 rounded-[48px] text-left transition-all hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(59,130,246,0.15)] active:scale-95 overflow-hidden border-white/5 hover:border-blue-500/30"
          >
            <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck className="w-48 h-48 text-white" />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-3xl font-extrabold text-white mb-3">Executive Console</h3>
                <p className="text-slate-400 text-base leading-relaxed">Full orchestration over global inventory, work order dispatch, and deep analytics.</p>
              </div>
              <div className="flex items-center gap-3 text-blue-400 font-bold text-sm uppercase tracking-widest pt-4">
                Access HQ
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </button>

          <button 
            onClick={() => setViewMode('technician')}
            className="group relative glass-card p-12 rounded-[48px] text-left transition-all hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(16,185,129,0.15)] active:scale-95 overflow-hidden border-white/5 hover:border-emerald-500/30"
          >
            <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <HardHat className="w-48 h-48 text-white" />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(5,150,105,0.4)]">
                <UserCircle className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-3xl font-extrabold text-white mb-3">Specialist Portal</h3>
                <p className="text-slate-400 text-base leading-relaxed">Field-ready node for maintenance tasks, real-time logging, and asset diagnostics.</p>
              </div>
              <div className="flex items-center gap-3 text-emerald-400 font-bold text-sm uppercase tracking-widest pt-4">
                Sync Personnel
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </button>

          <div className="col-span-full flex justify-center pt-16">
            <div className="px-6 py-2 rounded-full glass-card border-white/5">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.6em]">System Protocol 2.5-Stable • AnyGravity Engine</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'technician') {
    return (
      <div className="min-h-screen">
        <header className="h-20 glass-card border-x-0 border-t-0 px-10 flex items-center justify-between sticky top-0 z-40 no-print">
           <div className="flex items-center gap-4">
             <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30">
               <HardHat className="w-6 h-6 text-emerald-400" />
             </div>
             <h2 className="text-xl font-black text-white tracking-tight uppercase">Specialist <span className="text-emerald-500">Node</span></h2>
           </div>
           {!currentTechnician && (
             <button 
              onClick={() => setViewMode('gateway')}
              className="text-sm font-bold text-slate-400 hover:text-white flex items-center gap-3 px-6 py-2.5 glass-card-hover rounded-2xl transition-all border-white/5"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Exit Vector
            </button>
           )}
           {currentTechnician && (
             <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{currentTechnician.name}</p>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-2 justify-end">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Online
                  </p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="glass-card-hover p-2.5 rounded-2xl text-slate-400 hover:text-rose-400 transition-all border-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
             </div>
           )}
        </header>
        <div className="max-w-7xl mx-auto p-10">
          <TechnicianWorkspace />
        </div>
      </div>
    );
  }

  if (viewMode === 'admin' && !isAdminLoggedIn) {
    return <AdminLogin onBack={() => setViewMode('gateway')} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'assets': return <AssetList />;
      case 'spk': return <SPKManager />;
      case 'technicians': return <TechnicianManager />;
      case 'reports': return <ReportCenter />;
      case 'settings': return <SettingsView />;
      case 'image-ai': return <ImageAIRefiner />;
      case 'voice-ai': return <VoiceAssistant />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex animate-in fade-in duration-1000">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onExit={() => setViewMode('gateway')} />
      
      <main className="flex-1 ml-64 min-h-screen flex flex-col relative z-10">
        <header className="h-20 glass-card border-x-0 border-t-0 flex items-center justify-between px-10 sticky top-0 z-40 no-print">
          <div className="flex items-center gap-5 text-slate-400 max-w-md w-full group">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 transition-all group-within:border-blue-500/50 group-within:bg-blue-500/10">
              <Search className={`w-5 h-5 transition-colors ${globalSearchQuery ? 'text-blue-400' : 'text-slate-500'}`} />
            </div>
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Search global ledger..." 
                className="bg-transparent focus:outline-none text-white w-full py-2 font-medium placeholder:text-slate-600"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
              />
              {globalSearchQuery && (
                <button 
                  onClick={() => setGlobalSearchQuery('')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-full transition-all"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-10">
            <button className="relative p-2.5 text-slate-400 hover:text-white glass-card-hover rounded-2xl transition-all border-white/5">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0f172a] shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-4 pl-8 border-l border-white/10 group"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-black text-white uppercase tracking-tighter">Administrator</p>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Master Auth Level</p>
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center glass-card border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)] cursor-pointer hover:scale-105 transition-all relative overflow-hidden">
                  <User className="text-blue-400 w-6 h-6" />
                  <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
                </div>
              </button>

              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)}></div>
                  <div className="absolute top-full right-0 mt-4 w-64 glass-card rounded-3xl shadow-2xl py-3 z-50 animate-in zoom-in-95 duration-200 origin-top-right border-white/10">
                    <div className="px-6 py-4 border-b border-white/5 mb-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Authenticated Node</p>
                      <p className="text-sm font-bold text-white truncate">admin@hq.assetpro.ai</p>
                    </div>
                    <button className="w-full flex items-center gap-4 px-6 py-3 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm font-bold group">
                      <User className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                      Protocol Profile
                    </button>
                    <div className="h-px bg-white/5 my-2 mx-4" />
                    <button 
                      onClick={handleAdminLogout}
                      className="w-full flex items-center gap-4 px-6 py-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-sm font-black group"
                    >
                      <LogOut className="w-4 h-4" />
                      Sever Connection
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="p-10 flex-1">
          <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

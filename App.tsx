
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
import { User, Bell, Search, X, UserCircle, LayoutDashboard, HardHat, ArrowRight, ShieldCheck, Box, LogOut, ChevronDown, Database, Globe } from 'lucide-react';
import { useApp } from './AppContext';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'gateway' | 'admin' | 'technician'>('gateway');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { globalSearchQuery, setGlobalSearchQuery, currentTechnician, logout, isAdminLoggedIn, logoutAdmin, isDbConnected, storageMode, t } = useApp();

  // Handle technician login persistence: if a tech is logged in, force technician view
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 animate-in fade-in zoom-in-95 duration-700">
          <div className="col-span-full text-center mb-8 space-y-4">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 p-4 rounded-[24px] shadow-2xl shadow-blue-500/20">
                <Box className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">AssetPro <span className="text-blue-500">Enterprise</span></h1>
            <p className="text-slate-400 font-medium max-w-lg mx-auto">Select your operational environment to access the asset management ledger.</p>
          </div>

          {/* Admin Entry Card */}
          <button 
            onClick={() => setViewMode('admin')}
            className="group relative bg-slate-800/50 backdrop-blur-xl border border-slate-700 hover:border-blue-500/50 p-10 rounded-[48px] text-left transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10 active:scale-95 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <LayoutDashboard className="w-32 h-32 text-white" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-900/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Management Console</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Oversee inventory, approve work orders, and analyze enterprise performance metrics.</p>
              </div>
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-widest pt-4">
                Enter Admin Suite
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </button>

          {/* Technician Entry Card */}
          <button 
            onClick={() => setViewMode('technician')}
            className="group relative bg-slate-800/50 backdrop-blur-xl border border-slate-700 hover:border-emerald-500/50 p-10 rounded-[48px] text-left transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/10 active:scale-95 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <HardHat className="w-32 h-32 text-white" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-900/20">
                <UserCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Specialist Portal</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Access maintenance tasks, update asset progress, and manage field service orders.</p>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-widest pt-4">
                Log into Workspace
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </button>

          <div className="col-span-full flex justify-center pt-8">
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.4em]">AssetPro AI Systems • v2.5 Stable</p>
          </div>
        </div>
      </div>
    );
  }

  // Technician View (Fullscreen context)
  if (viewMode === 'technician') {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm no-print">
           <div className="flex items-center gap-3">
             <div className="bg-emerald-600 p-1.5 rounded-lg">
               <HardHat className="w-5 h-5 text-white" />
             </div>
             <h2 className="text-lg font-black text-slate-800 tracking-tight">Specialist Portal</h2>
           </div>
           {!currentTechnician && (
             <button 
              onClick={() => setViewMode('gateway')}
              className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-xl transition-all"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Exit to Gateway
            </button>
           )}
           {currentTechnician && (
             <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800">{currentTechnician.name}</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Connected Specialist</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-slate-100 p-2 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
             </div>
           )}
        </header>
        <div className="max-w-7xl mx-auto p-8">
          <TechnicianWorkspace />
        </div>
      </div>
    );
  }

  // Admin View (Protected)
  if (viewMode === 'admin' && !isAdminLoggedIn) {
    return <AdminLogin onBack={() => setViewMode('gateway')} />;
  }

  // Admin Dashboard Content
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
    <div className="min-h-screen flex animate-in fade-in duration-500">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onExit={() => setViewMode('gateway')} />
      
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10 no-print">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 text-slate-400 max-w-xs w-full group">
              <Search className={`w-5 h-5 transition-colors ${globalSearchQuery ? 'text-blue-500' : 'text-slate-400'}`} />
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder={t('search_ledger')} 
                  className="bg-transparent focus:outline-none text-slate-600 w-full py-2 font-medium"
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                />
                {globalSearchQuery && (
                  <button 
                    onClick={() => setGlobalSearchQuery('')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Infrastructure Status */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 bg-slate-50 rounded-2xl border border-slate-100">
              <Database className={`w-3.5 h-3.5 ${isDbConnected ? 'text-blue-500' : 'text-rose-500'}`} />
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {storageMode === 'local' ? 'Local Ledger' : 'SQL Node'}: 
                <span className={`ml-1 ${isDbConnected ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isDbConnected ? 'Active' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors group">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-3 pl-6 border-l border-slate-100 group"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-slate-800">Administrator</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Master Access</p>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-blue-600 shadow-blue-200 cursor-pointer hover:scale-105 transition-transform relative">
                  <User className="text-white w-5 h-5" />
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)}></div>
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in zoom-in-95 duration-200 origin-top-right">
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium">
                      <User className="w-4 h-4 text-slate-400" />
                      View Profile
                    </button>
                    <button 
                      onClick={handleAdminLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-sm font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="p-8 flex-1">
          <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

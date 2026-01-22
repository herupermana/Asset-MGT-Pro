
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AssetList from './components/AssetList';
import SPKManager from './components/SPKManager';
import ImageAIRefiner from './components/ImageAIRefiner';
import VoiceAssistant from './components/VoiceAssistant';
import TechnicianWorkspace from './components/TechnicianWorkspace';
import { User, Bell, Search, X, UserCircle } from 'lucide-react';
import { useApp } from './AppContext';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { globalSearchQuery, setGlobalSearchQuery, currentTechnician } = useApp();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'assets': return <AssetList />;
      case 'spk': return <SPKManager />;
      case 'technician': return <TechnicianWorkspace />;
      case 'image-ai': return <ImageAIRefiner />;
      case 'voice-ai': return <VoiceAssistant />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 text-slate-400 max-w-md w-full group">
            <Search className={`w-5 h-5 transition-colors ${globalSearchQuery ? 'text-blue-500' : 'text-slate-400'}`} />
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Search assets, technicians or orders..." 
                className="bg-transparent focus:outline-none text-slate-600 w-full py-2"
                value={globalSearchQuery}
                onChange={(e) => {
                  setGlobalSearchQuery(e.target.value);
                  if (activeTab !== 'assets' && activeTab !== 'spk') {
                    setActiveTab('assets'); // Auto-switch to assets for search results
                  }
                }}
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

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors group">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-4 z-50">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Recent Notifications</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <p className="text-xs text-slate-600 leading-tight">New SPK assigned to <b>Andi Wijaya</b> for Asset AST-001</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <p className="text-xs text-slate-600 leading-tight">Maintenance overdue for <b>Industrial HVAC Unit</b></p>
                  </div>
                </div>
              </div>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
              <div className="text-right hidden md:block">
                {currentTechnician ? (
                  <>
                    <p className="text-sm font-bold text-blue-600">{currentTechnician.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{currentTechnician.specialty} Specialist</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-slate-800">Administrator</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Super Administrator</p>
                  </>
                )}
              </div>
              <div 
                onClick={() => setActiveTab('technician')}
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform ${
                  currentTechnician ? 'bg-emerald-500 shadow-emerald-100' : 'bg-blue-600 shadow-blue-200'
                }`}
              >
                {currentTechnician ? <UserCircle className="text-white w-6 h-6" /> : <User className="text-white w-5 h-5" />}
              </div>
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

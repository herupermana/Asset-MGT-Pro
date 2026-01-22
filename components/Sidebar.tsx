
import React from 'react';
import { LayoutDashboard, Box, ClipboardList, PenTool, Mic, Settings, LogOut, Users, FileText } from 'lucide-react';
import { useApp } from '../AppContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onExit: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onExit }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'assets', icon: Box, label: 'Assets' },
    { id: 'spk', icon: ClipboardList, label: 'SPK & Repair' },
    { id: 'technicians', icon: Users, label: 'Personnel' },
    { id: 'reports', icon: FileText, label: 'Reports' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'image-ai', icon: PenTool, label: 'Image AI' },
    { id: 'voice-ai', icon: Mic, label: 'Voice AI' },
  ];

  return (
    <div className="w-64 glass-card h-screen border-r-0 flex flex-col fixed left-0 top-0 no-print z-30">
      <div className="p-8 flex items-center gap-4">
        <div className="bg-blue-600/20 p-2.5 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Box className="text-blue-400 w-6 h-6" />
        </div>
        <h1 className="text-xl font-extrabold text-white tracking-tight uppercase">Asset<span className="text-blue-500">Pro</span></h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
              activeTab === item.id
                ? 'bg-blue-600/20 text-white font-bold border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {activeTab === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_#3b82f6]" />
            )}
            <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-300'}`} />
            <span className="text-sm tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 space-y-2">
        <button 
          onClick={onExit}
          className="w-full flex items-center gap-4 px-5 py-3.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-2xl transition-all font-bold group border border-transparent hover:border-rose-500/20"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Exit Terminal</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

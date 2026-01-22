
import React from 'react';
import { LayoutDashboard, Box, ClipboardList, PenTool, Mic, Settings, LogOut, Circle, Users, FileText } from 'lucide-react';
import { useApp } from '../AppContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onExit: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onExit }) => {
  const { currentTechnician } = useApp();
  
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'assets', icon: Box, label: 'Assets' },
    { id: 'spk', icon: ClipboardList, label: 'SPK & Repair' },
    { id: 'technicians', icon: Users, label: 'Personnel' },
    { id: 'reports', icon: FileText, label: 'Reports' }, // New Reports Item
    { id: 'image-ai', icon: PenTool, label: 'Image AI Refiner' },
    { id: 'voice-ai', icon: Mic, label: 'Voice Assistant' },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-slate-200 flex flex-col fixed left-0 top-0 no-print">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Box className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">AssetPro AI</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group ${
              activeTab === item.id
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span className="flex-1 text-left">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <button 
          onClick={onExit}
          className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors font-bold"
        >
          <LogOut className="w-5 h-5" />
          <span>Exit Console</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

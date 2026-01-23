
import React from 'react';
import { 
  LayoutDashboard, Box, ClipboardList, PenTool, Mic, 
  Settings, LogOut, Users, FileText, ChevronRight,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useApp } from '../AppContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onExit: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onExit, isCollapsed, toggleCollapse }) => {
  const { t } = useApp();
  
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { id: 'assets', icon: Box, label: t('assets') },
    { id: 'spk', icon: ClipboardList, label: t('spk') },
    { id: 'technicians', icon: Users, label: t('personnel') },
    { id: 'reports', icon: FileText, label: t('reports') },
    { id: 'settings', icon: Settings, label: t('settings') },
    { id: 'image-ai', icon: PenTool, label: t('image_ai') },
    { id: 'voice-ai', icon: Mic, label: t('voice_ai') },
  ];

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} glass-card h-screen border-r border-white/5 flex flex-col fixed left-0 top-0 no-print z-30 transition-all duration-300`}>
      <div className={`p-8 ${isCollapsed ? 'px-5' : 'pb-10'} transition-all`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-blue-600 rounded-[12px] flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)] shrink-0">
            <Box className="text-white w-6 h-6" />
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
              <h1 className="text-lg font-black text-white tracking-tighter uppercase leading-none">Asset<span className="text-blue-500">Pro</span></h1>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Enterprise v2.5</p>
            </div>
          )}
        </div>
      </div>
      
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            title={isCollapsed ? item.label : ''}
            className={`w-full flex items-center justify-between px-5 py-3 rounded-xl transition-all duration-300 group ${
              activeTab === item.id
                ? 'bg-blue-600/10 text-white border border-blue-500/20 shadow-sm'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <item.icon className={`w-4.5 h-4.5 transition-colors ${activeTab === item.id ? 'text-blue-500' : 'text-slate-600 group-hover:text-slate-400'}`} />
              {!isCollapsed && (
                <span className={`text-[11px] font-black uppercase tracking-[0.1em] animate-in fade-in slide-in-from-left-1 duration-300 ${activeTab === item.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                  {item.label}
                </span>
              )}
            </div>
            {!isCollapsed && activeTab === item.id && <ChevronRight className="w-3.5 h-3.5 text-blue-500" />}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-2">
        <button 
          onClick={onExit}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-5'} py-3 text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all font-black text-[10px] uppercase tracking-[0.2em] group`}
          title={isCollapsed ? "Exit System" : ""}
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {!isCollapsed && <span>{t('exit_terminal')}</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

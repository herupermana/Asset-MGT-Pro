
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import BackupRestore from './BackupRestore';
import { 
  Settings as SettingsIcon, User, Shield, 
  Layers, MapPin, Plus, Trash2, Save, 
  Moon, Sun, Bell, Globe, Database, 
  Smartphone, Monitor, RefreshCw, X, Check,
  History, Loader2
} from 'lucide-react';

const SettingsView: React.FC = () => {
  const { 
    categories, addCategory, removeCategory, 
    locations, addLocation, removeLocation 
  } = useApp();

  const [activeSection, setActiveSection] = useState<'system' | 'profile' | 'appearance' | 'governance'>('system');
  const [newCatName, setNewCatName] = useState('');
  const [newLocName, setNewLocName] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  const triggerSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleReload = () => {
    setIsReloading(true);
    setTimeout(() => {
      setIsReloading(false);
      window.location.reload();
    }, 1200);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addCategory(newCatName.trim());
      setNewCatName('');
    }
  };

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLocName.trim()) {
      addLocation(newLocName.trim());
      setNewLocName('');
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'governance':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="bg-slate-900 p-8 rounded-[40px] text-white relative overflow-hidden mb-4">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <Shield className="w-32 h-32" />
                </div>
                <h3 className="text-xl font-black mb-2">Data Governance</h3>
                <p className="text-slate-400 text-sm max-w-md">Manage the integrity of the enterprise ledger. Use these tools to perform routine snapshots or emergency restorations.</p>
             </div>
             <BackupRestore />
          </div>
        );
      case 'system':
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Categories Management */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Asset Categories</h3>
                    <p className="text-xs text-slate-400 font-medium">Define classification for physical inventory</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 space-y-4">
                <form onSubmit={handleAddCategory} className="flex gap-3">
                  <input 
                    placeholder="New category name..." 
                    className="flex-1 px-5 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-purple-100 transition-all font-medium text-sm"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                  />
                  <button type="submit" className="bg-slate-900 text-white px-5 py-3 rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
                    <Plus className="w-5 h-5" />
                  </button>
                </form>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {categories.map(cat => (
                    <div key={cat} className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-sm transition-all">
                      <span className="text-xs font-bold text-slate-600">{cat}</span>
                      <button 
                        onClick={() => removeCategory(cat)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Location Management */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Physical Locations</h3>
                    <p className="text-xs text-slate-400 font-medium">Manage operational sites and storage areas</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 space-y-4">
                <form onSubmit={handleAddLocation} className="flex gap-3">
                  <input 
                    placeholder="New site location..." 
                    className="flex-1 px-5 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-100 transition-all font-medium text-sm"
                    value={newLocName}
                    onChange={e => setNewLocName(e.target.value)}
                  />
                  <button type="submit" className="bg-slate-900 text-white px-5 py-3 rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
                    <Plus className="w-5 h-5" />
                  </button>
                </form>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {locations.map(loc => (
                    <div key={loc} className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-sm transition-all">
                      <span className="text-xs font-bold text-slate-600">{loc}</span>
                      <button 
                        onClick={() => removeLocation(loc)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
              <div className="flex flex-col items-center text-center space-y-4">
                 <div className="w-24 h-24 bg-blue-600 rounded-[32px] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-200 relative group cursor-pointer">
                    A
                    <div className="absolute inset-0 bg-black/40 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>
                 </div>
                 <div>
                   <h3 className="text-xl font-black text-slate-800">System Administrator</h3>
                   <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Master Access Node</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Display Name</label>
                    <input defaultValue="Administrator" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-700" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Email Endpoint</label>
                    <input defaultValue="admin@assetpro.ai" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-700" />
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex justify-end">
                <button onClick={triggerSave} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95">
                  <Save className="w-4 h-4" />
                  Sync Credentials
                </button>
              </div>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button className="p-8 bg-white border-4 border-blue-600 rounded-[40px] text-left shadow-xl shadow-blue-50/50 space-y-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Sun className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-black text-slate-800">Light Protocol</p>
                  <p className="text-xs text-slate-400 font-medium">Standard enterprise clarity</p>
                </div>
                <div className="pt-2">
                  <div className="bg-blue-600 text-white w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Active Mode</div>
                </div>
              </button>

              <button className="p-8 bg-slate-900 border-4 border-transparent hover:border-slate-700 rounded-[40px] text-left space-y-4 transition-all">
                <div className="w-12 h-12 bg-white/5 text-slate-400 rounded-2xl flex items-center justify-center">
                  <Moon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-black text-white">Dark Protocol</p>
                  <p className="text-xs text-slate-500 font-medium">Low-light maintenance mode</p>
                </div>
              </button>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
               <h3 className="font-black text-slate-800 flex items-center gap-3">
                 <Monitor className="w-5 h-5 text-slate-400" />
                 Display Configurations
               </h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                       <Smartphone className="w-4 h-4 text-slate-400" />
                       <span className="text-sm font-bold text-slate-700">Compact View Mode</span>
                    </div>
                    <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-not-allowed">
                       <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                       <Globe className="w-4 h-4 text-slate-400" />
                       <span className="text-sm font-bold text-slate-700">Auto-Translation (Multi-lang)</span>
                    </div>
                    <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                       <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
               </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-3 rounded-2xl shadow-xl shadow-slate-200">
            <SettingsIcon className="text-white w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">System Control</h2>
            <p className="text-slate-500 font-medium">Configure enterprise operational parameters</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2">
           {[
             { id: 'system', icon: Database, label: 'Asset Core' },
             { id: 'profile', icon: User, label: 'Account Identity' },
             { id: 'governance', icon: History, label: 'Data Governance' },
             { id: 'appearance', icon: Monitor, label: 'Interface' },
           ].map(item => (
             <button
               key={item.id}
               onClick={() => setActiveSection(item.id as any)}
               className={`w-full flex items-center gap-3 px-6 py-4 rounded-[20px] font-black text-sm transition-all border-2
                 ${activeSection === item.id 
                   ? 'bg-white border-slate-900 text-slate-900 shadow-xl shadow-slate-100' 
                   : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
             >
               <item.icon className={`w-5 h-5 ${activeSection === item.id ? 'text-blue-600' : ''}`} />
               {item.label}
             </button>
           ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          {renderSection()}
        </div>
      </div>

      <div className="mt-12 p-8 rounded-[40px] bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5">
           <Shield className="w-64 h-64" />
        </div>
        <div className="relative z-10 space-y-4 max-w-xl">
           <h4 className="text-xl font-black">Technical Support & Diagnostics</h4>
           <p className="text-slate-400 text-sm leading-relaxed font-medium">
             Need to integrate with external ERP systems or reset your enterprise ledger? Contact your organization's IT lead for API token provisioning or database snapshots.
           </p>
           <button 
            disabled={isReloading}
            onClick={handleReload}
            className="flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-widest pt-4 hover:text-blue-300 transition-colors disabled:opacity-50"
          >
             {isReloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
             Reload Global Ledger
           </button>
        </div>
      </div>

      {/* Save Toast */}
      {showToast && (
        <div className="fixed bottom-10 right-10 z-[100] bg-slate-900 text-white px-6 py-4 rounded-[24px] shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10">
           <div className="bg-emerald-50 p-1 rounded-full">
             <Check className="w-4 h-4 text-white" />
           </div>
           <p className="text-sm font-bold">Configurations synced successfully</p>
           <button onClick={() => setShowToast(false)} className="ml-2 opacity-50 hover:opacity-100">
             <X className="w-4 h-4" />
           </button>
        </div>
      )}
    </div>
  );
};

export default SettingsView;

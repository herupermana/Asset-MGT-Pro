
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, User, AlertCircle, Calendar, Box, UserCog, X, UserCheck, ExternalLink, ChevronRight, Timer, Plus, Hammer, ClipboardList, Wrench, FileText, ShieldCheck, Loader2, Signal } from 'lucide-react';
import { useApp } from '../AppContext';
import { SPKStatus, SPK, AssetStatus } from '../types';
import SPKDetail from './SPKDetail';

// Sub-component for a modernized status indicator
const StatusBadge: React.FC<{ status: SPKStatus }> = ({ status }) => {
  const styles = {
    [SPKStatus.OPEN]: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    [SPKStatus.IN_PROGRESS]: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    [SPKStatus.COMPLETED]: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    [SPKStatus.CANCELLED]: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  };

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${styles[status]}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${status === SPKStatus.OPEN || status === SPKStatus.IN_PROGRESS ? 'animate-pulse' : ''} bg-current`} />
      {status}
    </div>
  );
};

const SPKManager: React.FC = () => {
  const { spks, assets, technicians, reassignSPK, createSPK, globalSearchQuery, setGlobalSearchQuery, t } = useApp();
  const [selectedSPKForReassign, setSelectedSPKForReassign] = useState<SPK | null>(null);
  const [viewingSPK, setViewingSPK] = useState<SPK | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New SPK Form State
  const [newSPK, setNewSPK] = useState({
    assetId: '',
    title: '',
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    technicianId: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Effect to catch pre-filled search
  useEffect(() => {
    if (globalSearchQuery.startsWith('AST-')) {
      const asset = assets.find(a => a.id === globalSearchQuery);
      if (asset) {
        setNewSPK(prev => ({ ...prev, assetId: asset.id, title: `Service for ${asset.name}` }));
        setIsCreateModalOpen(true);
        setGlobalSearchQuery('');
      }
    }
  }, [globalSearchQuery]);

  const handleCreateSPK = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSPK.assetId || !newSPK.technicianId) return;

    createSPK({
      id: `SPK-2025-${Math.floor(Math.random() * 9000 + 1000)}`,
      assetId: newSPK.assetId,
      technicianId: newSPK.technicianId,
      title: newSPK.title,
      description: newSPK.description,
      priority: newSPK.priority,
      status: SPKStatus.OPEN,
      createdAt: new Date().toISOString(),
      dueDate: newSPK.dueDate
    });

    setIsCreateModalOpen(false);
    setNewSPK({
      assetId: '',
      title: '',
      description: '',
      priority: 'Medium',
      technicianId: '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  const filteredSPKs = spks.filter(s => 
    s.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  if (viewingSPK) return <SPKDetail spk={viewingSPK} onBack={() => setViewingSPK(null)} onReassign={(spk) => setSelectedSPKForReassign(spk)} />;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 text-blue-400 font-black text-xs uppercase tracking-[0.3em] mb-2">
            <Hammer className="w-4 h-4" />
            Operations Command
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase text-glow">Dispatch <span className="text-blue-500">Center</span></h2>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs hover:bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create Order
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          {filteredSPKs.map((spk) => {
            const asset = assets.find(a => a.id === spk.assetId);
            const tech = technicians.find(t => t.id === spk.technicianId);
            const isHighPriority = spk.priority === 'High';

            return (
              <div 
                key={spk.id} 
                onClick={() => setViewingSPK(spk)}
                className={`glass-card p-1 rounded-[40px] border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group relative overflow-hidden`}
              >
                {/* Visual Accent */}
                <div className={`absolute top-0 left-0 w-2 h-full ${
                  isHighPriority ? 'bg-rose-500' : 'bg-blue-500'
                } opacity-20 group-hover:opacity-100 transition-opacity`} />
                
                <div className="p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
                  <div className="flex-1 space-y-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {spk.id}
                      </div>
                      <StatusBadge status={spk.status} />
                      <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                        isHighPriority ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-white/5 text-slate-400 border-white/10'
                      }`}>
                        {spk.priority} Priority
                      </div>
                    </div>

                    <div>
                      <h4 className="text-2xl font-extrabold text-white group-hover:text-blue-400 transition-colors leading-tight mb-2">
                        {spk.title}
                      </h4>
                      <p className="text-sm text-slate-500 font-medium line-clamp-1 max-w-xl">{spk.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-x-8 gap-y-3 pt-2">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                            <Box className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Asset node</p>
                            <p className="text-xs font-bold text-white line-clamp-1">{asset?.name || 'Unknown'}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Specialist</p>
                            <p className="text-xs font-bold text-white">{tech?.name || 'Unassigned'}</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 w-full md:w-auto shrink-0 md:pl-8 md:border-l border-white/5">
                     <div className="text-left md:text-right">
                        <div className="flex items-center gap-2 text-slate-500 mb-1 md:justify-end">
                           <Timer className="w-3.5 h-3.5" />
                           <p className="text-[10px] font-black uppercase tracking-widest">Deadline</p>
                        </div>
                        <p className="text-sm font-black text-white">{new Date(spk.dueDate).toLocaleDateString()}</p>
                     </div>
                     <div className="p-3.5 rounded-2xl bg-white/5 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                        <ChevronRight className="w-6 h-6" />
                     </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredSPKs.length === 0 && (
            <div className="glass-card p-20 rounded-[48px] border-white/5 text-center space-y-6">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-slate-700">
                <ClipboardList className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">No work orders found</h3>
                <p className="text-slate-500 mt-1">Refine your query or create a new service ticket.</p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="glass-card p-10 rounded-[48px] border-white/5 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Active Load</h3>
                <Signal className="w-5 h-5 text-blue-500/50" />
              </div>
              <div className="space-y-6">
                {technicians.map(tech => (
                   <div key={tech.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                         <div className="w-11 h-11 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-blue-400 border border-white/5 group-hover:border-blue-500/30 transition-all">
                            {tech.name[0]}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{tech.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{tech.specialty}</p>
                         </div>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-[10px] font-black border transition-all ${
                        tech.activeTasks > 2 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                         {tech.activeTasks} TASKS
                      </div>
                   </div>
                ))}
              </div>
           </div>
           
           <div className="bg-blue-600 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <ShieldCheck className="w-24 h-24" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest mb-4 opacity-70">Fleet Analytics</p>
              <h4 className="text-2xl font-black leading-tight mb-4">Enterprise Node Health</h4>
              <p className="text-sm text-blue-100 font-medium leading-relaxed">
                Dispatch efficiency is up 12% this quarter. High priority nodes are being addressed within the 4-hour SLA window.
              </p>
           </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
           <div className="max-w-3xl w-full glass-card rounded-[48px] overflow-hidden border-white/10 animate-in zoom-in-95">
              <div className="p-10 border-b border-white/5 flex justify-between items-center">
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight">Dispatch Service Protocol</h3>
                 <button onClick={() => setIsCreateModalOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors"><X className="w-8 h-8" /></button>
              </div>
              <form onSubmit={handleCreateSPK} className="p-10 md:p-12 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Node</label>
                       <select required className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none appearance-none" value={newSPK.assetId} onChange={e => setNewSPK({...newSPK, assetId: e.target.value})}>
                          <option value="" className="bg-slate-900 text-slate-500">Select Physical Node...</option>
                          {assets.map(a => <option key={a.id} value={a.id} className="bg-slate-900">{a.id} - {a.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Specialist</label>
                       <select required className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none appearance-none" value={newSPK.technicianId} onChange={e => setNewSPK({...newSPK, technicianId: e.target.value})}>
                          <option value="" className="bg-slate-900 text-slate-500">Select Personnel...</option>
                          {technicians.map(t => <option key={t.id} value={t.id} className="bg-slate-900">{t.name} ({t.activeTasks} active)</option>)}
                       </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Service Title</label>
                    <input required placeholder="Brief summary of requirements..." className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-4 focus:ring-blue-500/20" value={newSPK.title} onChange={e => setNewSPK({...newSPK, title: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Operational Instructions</label>
                    <textarea required placeholder="Detailed task list and findings..." className="w-full h-32 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-4 focus:ring-blue-500/20 resize-none" value={newSPK.description} onChange={e => setNewSPK({...newSPK, description: e.target.value})} />
                 </div>
                 <div className="pt-4 flex gap-4">
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-5 bg-white/5 text-slate-400 font-black rounded-2xl hover:bg-white/10 transition-colors">Discard</button>
                    <button type="submit" className="flex-[2] py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-500 active:scale-95 transition-all">Authorize Work Order</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SPKManager;

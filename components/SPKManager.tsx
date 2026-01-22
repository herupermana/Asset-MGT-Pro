
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, User, AlertCircle, Calendar, Box, UserCog, X, UserCheck, ExternalLink, ChevronRight, Timer, Plus, Hammer, ClipboardList, Wrench, FileText, ShieldCheck, Loader2 } from 'lucide-react';
import { useApp } from '../AppContext';
import { SPKStatus, SPK, AssetStatus } from '../types';
import SPKDetail from './SPKDetail';

// Sub-component for the Work Order Flow Stepper (Simplified version)
const WorkOrderFlow: React.FC<{ status: SPKStatus }> = ({ status }) => {
  const isCompleted = status === SPKStatus.COMPLETED;
  const isInProgress = status === SPKStatus.IN_PROGRESS;
  const isOpen = status === SPKStatus.OPEN;

  return (
    <div className="flex items-center gap-1.5 py-1">
       <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
       <div className={`w-4 h-[1px] ${isInProgress || isCompleted ? 'bg-emerald-500' : 'bg-slate-700'}`} />
       <div className={`w-2 h-2 rounded-full ${isInProgress ? 'bg-blue-500 animate-pulse' : (isCompleted ? 'bg-emerald-500' : 'bg-slate-700')}`} />
       <div className={`w-4 h-[1px] ${isCompleted ? 'bg-emerald-500' : 'bg-slate-700'}`} />
       <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-slate-700'}`} />
    </div>
  );
};

const SPKManager: React.FC = () => {
  const { spks, assets, technicians, reassignSPK, createSPK, globalSearchQuery, setGlobalSearchQuery } = useApp();
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

  // Effect to catch pre-filled search (useful when navigating from Asset Detail "Report Issue")
  useEffect(() => {
    if (globalSearchQuery.startsWith('AST-')) {
      const asset = assets.find(a => a.id === globalSearchQuery);
      if (asset) {
        setNewSPK(prev => ({ ...prev, assetId: asset.id, title: `Service for ${asset.name}` }));
        setIsCreateModalOpen(true);
        // Clear query after catching it so it doesn't stay pre-filled forever
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
          className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs hover:bg-blue-500 shadow-xl transition-all active:scale-95"
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
            return (
              <div 
                key={spk.id} 
                onClick={() => setViewingSPK(spk)}
                className="glass-card p-8 rounded-[40px] border-white/5 hover:border-blue-500/20 transition-all cursor-pointer group flex flex-col md:flex-row gap-8 items-start md:items-center"
              >
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-tighter border ${
                      spk.priority === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {spk.priority} Priority
                    </span>
                    <WorkOrderFlow status={spk.status} />
                  </div>
                  <h4 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">
                    {spk.title}
                  </h4>
                  <div className="flex flex-wrap gap-6 pt-2">
                     <div className="flex items-center gap-2 text-slate-500">
                        <Box className="w-4 h-4" />
                        <span className="text-xs font-bold">{asset?.name || 'Unknown'}</span>
                     </div>
                     <div className="flex items-center gap-2 text-slate-500">
                        <User className="w-4 h-4" />
                        <span className="text-xs font-bold">{tech?.name || 'Unassigned'}</span>
                     </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 bg-white/5 p-4 rounded-3xl border border-white/5">
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deadline</p>
                      <p className="text-sm font-bold text-white">{new Date(spk.dueDate).toLocaleDateString()}</p>
                   </div>
                   <ChevronRight className="w-6 h-6 text-slate-700 group-hover:text-blue-500 transition-all" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="glass-card p-10 rounded-[48px] border-white/5 space-y-8">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Active Load</h3>
              <div className="space-y-6">
                {technicians.map(tech => (
                   <div key={tech.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center font-black text-blue-400 border border-blue-500/20">
                            {tech.name[0]}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">{tech.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">{tech.specialty}</p>
                         </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black border ${tech.activeTasks > 2 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                         {tech.activeTasks}
                      </div>
                   </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
           <div className="max-w-3xl w-full glass-card rounded-[48px] overflow-hidden border-white/10 animate-in zoom-in-95">
              <div className="p-10 border-b border-white/5 flex justify-between items-center">
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight">Dispatch Service Protocol</h3>
                 <button onClick={() => setIsCreateModalOpen(false)} className="p-2 text-slate-500 hover:text-white"><X className="w-8 h-8" /></button>
              </div>
              <form onSubmit={handleCreateSPK} className="p-12 space-y-8">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset ID</label>
                       <select required className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none" value={newSPK.assetId} onChange={e => setNewSPK({...newSPK, assetId: e.target.value})}>
                          <option value="" className="bg-slate-900">Select Physical Node...</option>
                          {assets.map(a => <option key={a.id} value={a.id} className="bg-slate-900">{a.id} - {a.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Specialist</label>
                       <select required className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none" value={newSPK.technicianId} onChange={e => setNewSPK({...newSPK, technicianId: e.target.value})}>
                          <option value="" className="bg-slate-900">Select Personnel...</option>
                          {technicians.map(t => <option key={t.id} value={t.id} className="bg-slate-900">{t.name} ({t.activeTasks} active)</option>)}
                       </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Service Title</label>
                    <input required placeholder="Brief summary of requirements..." className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-blue-500/50" value={newSPK.title} onChange={e => setNewSPK({...newSPK, title: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Operational Instructions</label>
                    <textarea required placeholder="Detailed task list and findings..." className="w-full h-32 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-blue-500/50 resize-none" value={newSPK.description} onChange={e => setNewSPK({...newSPK, description: e.target.value})} />
                 </div>
                 <div className="pt-4 flex gap-4">
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-5 bg-white/5 text-slate-400 font-black rounded-2xl">Cancel</button>
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


import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, User, AlertCircle, Calendar, Box, UserCog, X, UserCheck, ExternalLink, ChevronRight, Timer, Plus, Hammer, ClipboardList, Wrench, FileText, ShieldCheck, Loader2, Signal, AlertTriangle } from 'lucide-react';
import { useApp } from '../AppContext';
import { SPKStatus, SPK, AssetStatus } from '../types';
import SPKDetail from './SPKDetail';

// Sub-component for a modernized status indicator with live pulse
const StatusBadge: React.FC<{ status: SPKStatus }> = ({ status }) => {
  const styles = {
    [SPKStatus.OPEN]: 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    [SPKStatus.IN_PROGRESS]: 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
    [SPKStatus.COMPLETED]: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    [SPKStatus.CANCELLED]: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  };

  return (
    <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest backdrop-blur-md transition-all ${styles[status]}`}>
      <div className={`w-2 h-2 rounded-full ${status === SPKStatus.OPEN || status === SPKStatus.IN_PROGRESS ? 'animate-pulse' : ''} bg-current shadow-[0_0_8px_currentColor]`} />
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

  // Effect to catch pre-filled search for asset fault reporting
  useEffect(() => {
    if (globalSearchQuery.startsWith('AST-')) {
      const asset = assets.find(a => a.id === globalSearchQuery);
      if (asset) {
        setNewSPK(prev => ({ ...prev, assetId: asset.id, title: `Emergency Service: ${asset.name}` }));
        setIsCreateModalOpen(true);
        setGlobalSearchQuery('');
      }
    }
  }, [globalSearchQuery, assets, setGlobalSearchQuery]);

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
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase text-glow-blue">Dispatch <span className="text-blue-500">Center</span></h2>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs hover:bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all active:scale-95 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          Generate Work Order
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          {filteredSPKs.map((spk) => {
            const asset = assets.find(a => a.id === spk.assetId);
            const tech = technicians.find(t => t.id === spk.technicianId);
            const isHighPriority = spk.priority === 'High';
            const isOverdue = new Date(spk.dueDate) < new Date() && spk.status !== SPKStatus.COMPLETED;

            return (
              <div 
                key={spk.id} 
                onClick={() => setViewingSPK(spk)}
                className="glass-card rounded-[32px] border-white/5 hover:border-blue-500/40 transition-all duration-500 cursor-pointer group relative overflow-hidden active:scale-[0.99]"
              >
                {/* Visual Priority Sidebar */}
                <div className={`absolute top-0 left-0 w-1.5 h-full transition-all duration-500 ${
                  isHighPriority ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 
                  spk.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                } group-hover:w-2`} />
                
                <div className="p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black text-blue-400 uppercase tracking-widest">
                        {spk.id}
                      </div>
                      <StatusBadge status={spk.status} />
                      <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${
                        isHighPriority ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                        spk.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {isHighPriority && <AlertTriangle className="w-3 h-3 animate-pulse" />}
                        {spk.priority} Priority
                      </div>
                    </div>

                    <div>
                      <h4 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors leading-tight mb-2 uppercase tracking-tight">
                        {spk.title}
                      </h4>
                      <p className="text-sm text-slate-500 font-medium line-clamp-1 max-w-xl italic">"{spk.description}"</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                       <div className="flex items-center gap-4 p-3.5 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-colors">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                            <Box className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Asset Target</p>
                            <p className="text-xs font-black text-white truncate">{asset?.name || 'Decommissioned Node'}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4 p-3.5 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-colors">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">
                            <User className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Assigned Specialist</p>
                            <p className="text-xs font-black text-white truncate">{tech?.name || 'Awaiting Resource'}</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-6 w-full md:w-auto shrink-0 md:pl-10 md:border-l border-white/5">
                     <div className="text-left md:text-right space-y-1">
                        <div className={`flex items-center gap-2 mb-1 md:justify-end ${isOverdue ? 'text-rose-500' : 'text-slate-500'}`}>
                           <Timer className={`w-3.5 h-3.5 ${isOverdue ? 'animate-bounce' : ''}`} />
                           <p className="text-[10px] font-black uppercase tracking-[0.2em]">{isOverdue ? 'CRITICAL OVERDUE' : 'SLA DEADLINE'}</p>
                        </div>
                        <p className={`text-sm font-black tracking-widest ${isOverdue ? 'text-rose-400' : 'text-white'}`}>
                          {new Date(spk.dueDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                     </div>
                     <div className="p-4 rounded-2xl bg-white/5 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:translate-x-2 shadow-lg">
                        <ChevronRight className="w-6 h-6" />
                     </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredSPKs.length === 0 && (
            <div className="glass-card p-24 rounded-[48px] border-white/5 text-center space-y-8 animate-in fade-in duration-500">
              <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto text-slate-700 border border-white/5 shadow-2xl">
                <ClipboardList className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Quiet on the Wire</h3>
                <p className="text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">No service tickets matching your parameters were found in the active terminal.</p>
              </div>
              <button onClick={() => setGlobalSearchQuery('')} className="text-blue-500 font-black text-xs uppercase tracking-[0.2em] hover:text-blue-400 transition-colors">Clear active filters</button>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8 no-print">
           <div className="glass-card p-10 rounded-[48px] border-white/5 space-y-10 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl" />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Active Load</h3>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Resource allocation monitor</p>
                </div>
                <Signal className="w-5 h-5 text-blue-500 animate-pulse" />
              </div>
              
              <div className="space-y-6">
                {technicians.map(tech => (
                   <div key={tech.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-blue-400 border border-white/10 group-hover:border-blue-500/50 transition-all shadow-xl">
                            {tech.name[0]}
                         </div>
                         <div>
                            <p className="text-sm font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{tech.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{tech.specialty}</p>
                         </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${
                        tech.activeTasks > 2 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                         {tech.activeTasks} UNITS
                      </div>
                   </div>
                ))}
              </div>
           </div>
           
           <div className="bg-blue-600 rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-900/40 group hover:scale-[1.02] transition-transform duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-24 h-24" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.3em] mb-4 opacity-70">Fleet Intelligence</p>
              <h4 className="text-2xl font-black leading-tight mb-4 tracking-tighter uppercase">Enterprise Integrity</h4>
              <p className="text-sm text-blue-100 font-medium leading-relaxed opacity-80">
                Dispatch efficiency is trending upward. High priority remediation is currently within the 4-hour SLA operational window.
              </p>
           </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl">
           <div className="max-w-3xl w-full glass-card rounded-[56px] overflow-hidden border-white/10 animate-in zoom-in-95 duration-300 shadow-[0_0_80px_rgba(0,0,0,0.5)]">
              <div className="p-12 border-b border-white/5 flex justify-between items-center bg-white/5">
                 <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Dispatch Protocol</h3>
                  <p className="text-xs text-blue-400 font-black uppercase tracking-widest mt-1">Initiating New Service Entry</p>
                 </div>
                 <button onClick={() => setIsCreateModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl text-slate-500 hover:text-white transition-all">
                  <X className="w-8 h-8" />
                 </button>
              </div>
              <form onSubmit={handleCreateSPK} className="p-12 space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Asset Node Selection</label>
                       <select required className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-[20px] text-white font-black outline-none appearance-none focus:ring-4 focus:ring-blue-500/20 transition-all" value={newSPK.assetId} onChange={e => setNewSPK({...newSPK, assetId: e.target.value})}>
                          <option value="" className="bg-slate-950 text-slate-500">Select Physical Node...</option>
                          {assets.map(a => <option key={a.id} value={a.id} className="bg-slate-950">{a.id} - {a.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Technician Deployment</label>
                       <select required className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-[20px] text-white font-black outline-none appearance-none focus:ring-4 focus:ring-blue-500/20 transition-all" value={newSPK.technicianId} onChange={e => setNewSPK({...newSPK, technicianId: e.target.value})}>
                          <option value="" className="bg-slate-950 text-slate-500">Select Personnel...</option>
                          {technicians.map(t => <option key={t.id} value={t.id} className="bg-slate-950">{t.name} ({t.activeTasks} active)</option>)}
                       </select>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Operational Title</label>
                    <input required placeholder="Brief mission summary..." className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-[20px] text-white font-black outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-slate-700" value={newSPK.title} onChange={e => setNewSPK({...newSPK, title: e.target.value})} />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Service Instructions</label>
                    <textarea required placeholder="Technical requirements and safety protocols..." className="w-full h-40 px-8 py-5 bg-white/5 border border-white/10 rounded-[24px] text-white font-black outline-none focus:ring-4 focus:ring-blue-500/20 transition-all resize-none placeholder:text-slate-700" value={newSPK.description} onChange={e => setNewSPK({...newSPK, description: e.target.value})} />
                 </div>
                 <div className="pt-6 flex gap-6">
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-5 bg-white/5 text-slate-500 font-black rounded-[20px] hover:bg-white/10 transition-all uppercase tracking-widest text-xs">Abort Operation</button>
                    <button type="submit" className="flex-[2] py-5 bg-blue-600 text-white font-black rounded-[20px] shadow-2xl shadow-blue-500/30 hover:bg-blue-500 active:scale-95 transition-all uppercase tracking-[0.2em] text-xs">Authorize Work Order</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SPKManager;

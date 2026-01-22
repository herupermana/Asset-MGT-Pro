
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, User, AlertCircle, Calendar, Box, UserCog, X, UserCheck, ExternalLink, ChevronRight, Timer, Plus, Hammer, ClipboardList, Wrench, FileText, ShieldCheck, Loader2, Signal, AlertTriangle, Pencil, Save, HardHat, Activity } from 'lucide-react';
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
  const { spks, assets, technicians, reassignSPK, createSPK, updateSPK, globalSearchQuery, setGlobalSearchQuery, currentTechnician, t } = useApp();
  const [selectedSPKForReassign, setSelectedSPKForReassign] = useState<SPK | null>(null);
  const [viewingSPK, setViewingSPK] = useState<SPK | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSPK, setEditingSPK] = useState<SPK | null>(null);

  const isAdmin = !currentTechnician;

  // SPK Form State
  const [spkForm, setSpkForm] = useState({
    assetId: '',
    title: '',
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    technicianId: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Load editing data into form
  useEffect(() => {
    if (editingSPK) {
      setSpkForm({
        assetId: editingSPK.assetId,
        title: editingSPK.title,
        description: editingSPK.description,
        priority: editingSPK.priority,
        technicianId: editingSPK.technicianId,
        dueDate: editingSPK.dueDate.split('T')[0]
      });
      setIsModalOpen(true);
    }
  }, [editingSPK]);

  // Effect to catch pre-filled search for asset fault reporting
  useEffect(() => {
    if (globalSearchQuery.startsWith('AST-')) {
      const asset = assets.find(a => a.id === globalSearchQuery);
      if (asset) {
        setSpkForm(prev => ({ ...prev, assetId: asset.id, title: `Emergency Service: ${asset.name}` }));
        setIsModalOpen(true);
        setGlobalSearchQuery('');
      }
    }
  }, [globalSearchQuery, assets, setGlobalSearchQuery]);

  const handleSaveSPK = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spkForm.assetId || !spkForm.technicianId) return;

    if (editingSPK) {
      updateSPK({
        ...editingSPK,
        ...spkForm
      });
    } else {
      createSPK({
        id: `SPK-2025-${Math.floor(Math.random() * 9000 + 1000)}`,
        assetId: spkForm.assetId,
        technicianId: spkForm.technicianId,
        title: spkForm.title,
        description: spkForm.description,
        priority: spkForm.priority,
        status: SPKStatus.OPEN,
        createdAt: new Date().toISOString(),
        dueDate: spkForm.dueDate
      });
    }

    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSPK(null);
    setSpkForm({
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
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs hover:bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all active:scale-95 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Generate Work Order
          </button>
        )}
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
                className="glass-card rounded-[40px] border-white/5 hover:border-blue-500/40 transition-all duration-500 cursor-pointer group relative overflow-hidden active:scale-[0.99]"
              >
                {/* Visual Priority Accent */}
                <div className={`absolute top-0 left-0 w-2 h-full transition-all duration-500 ${
                  isHighPriority ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]' : 
                  spk.priority === 'Medium' ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 
                  'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                }`} />
                
                <div className="p-10 flex flex-col md:flex-row gap-10">
                  {/* Left Column: Mission Content */}
                  <div className="flex-1 space-y-8" onClick={() => setViewingSPK(spk)}>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="bg-slate-900 border border-white/10 px-3.5 py-1.5 rounded-xl text-[10px] font-black text-blue-400 uppercase tracking-widest shadow-inner">
                        {spk.id}
                      </div>
                      <StatusBadge status={spk.status} />
                      <div className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 transition-all ${
                        isHighPriority ? 'bg-rose-500/20 text-rose-500 border-rose-500/30' : 
                        spk.priority === 'Medium' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' :
                        'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}>
                        {isHighPriority ? <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                        {spk.priority} Priority
                      </div>
                    </div>

                    <div>
                      <h4 className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors leading-none tracking-tight mb-4 uppercase">
                        {spk.title}
                      </h4>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/10 rounded-full" />
                        <p className="text-sm text-slate-400 font-medium line-clamp-2 max-w-2xl italic pl-6 border-l border-white/5">
                          "{spk.description}"
                        </p>
                      </div>
                    </div>

                    {/* Entities Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                       <div className="glass-card p-5 rounded-3xl border-white/5 group-hover:border-blue-500/20 transition-all flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform">
                            <Box className="w-7 h-7" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Target Asset</p>
                            <p className="text-sm font-black text-white truncate">{asset?.name || 'Null Node'}</p>
                            <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">{asset?.id}</p>
                          </div>
                       </div>
                       <div className="glass-card p-5 rounded-3xl border-white/5 group-hover:border-emerald-500/20 transition-all flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform">
                            <HardHat className="w-7 h-7" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Assigned Unit</p>
                            <p className="text-sm font-black text-white truncate">{tech?.name || 'Awaiting Sync'}</p>
                            <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{tech?.specialty}</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Right Column: Meta & Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-10 w-full md:w-56 shrink-0 md:pl-10 md:border-l border-white/5">
                     <div className="text-left md:text-right space-y-2" onClick={() => setViewingSPK(spk)}>
                        <div className={`flex items-center gap-2.5 mb-1 md:justify-end ${isOverdue ? 'text-rose-500' : 'text-slate-500'}`}>
                           <Timer className={`w-4 h-4 ${isOverdue ? 'animate-pulse' : ''}`} />
                           <p className="text-[10px] font-black uppercase tracking-[0.3em]">{isOverdue ? 'CRITICAL OVERDUE' : 'SLA DEADLINE'}</p>
                        </div>
                        <p className={`text-xl font-black tracking-tighter uppercase ${isOverdue ? 'text-rose-400 text-glow-rose' : 'text-white'}`}>
                          {new Date(spk.dueDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        {isOverdue && (
                          <div className="px-3 py-1 bg-rose-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest inline-block md:ml-auto">
                            Breach Detected
                          </div>
                        )}
                     </div>
                     <div className="flex items-center gap-4">
                        {isAdmin && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingSPK(spk); }} 
                            className="p-5 rounded-2xl glass-card border-white/5 text-slate-400 hover:border-blue-500/50 hover:text-blue-400 transition-all shadow-2xl active:scale-90"
                          >
                             <Pencil className="w-6 h-6" />
                          </button>
                        )}
                        <div onClick={() => setViewingSPK(spk)} className="p-5 rounded-2xl bg-blue-600 text-white shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:bg-blue-500 transition-all transform group-hover:translate-x-3 active:scale-90">
                           <ChevronRight className="w-8 h-8" />
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredSPKs.length === 0 && (
            <div className="glass-card p-32 rounded-[64px] border-white/5 text-center space-y-10 animate-in fade-in duration-500">
              <div className="w-32 h-32 bg-white/5 rounded-[48px] flex items-center justify-center mx-auto text-slate-800 border border-white/5 shadow-[0_0_100px_rgba(255,255,255,0.02)]">
                <ClipboardList className="w-16 h-16" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-white uppercase tracking-tight">Zero Results Found</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">The global ledger contains no active service tickets matching your current telemetry query.</p>
              </div>
              <button onClick={() => setGlobalSearchQuery('')} className="bg-white/5 hover:bg-white/10 text-blue-500 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all border border-white/5">Reset All Monitors</button>
            </div>
          )}
        </div>

        {/* Sidebar Monitors */}
        <div className="lg:col-span-4 space-y-8 no-print">
           <div className="glass-card p-10 rounded-[56px] border-white/5 space-y-12 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px]" />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Fleet Health</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-blue-500" />
                    Resource Monitoring
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                  <Signal className="w-6 h-6 text-blue-500 animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-8">
                {technicians.map(tech => (
                   <div key={tech.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-5">
                         <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-blue-400 border border-white/10 group-hover:border-blue-500/50 group-hover:bg-blue-600/10 transition-all shadow-2xl relative">
                            {tech.name[0]}
                            {tech.activeTasks > 2 && <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full border-2 border-[#020617] animate-ping" />}
                         </div>
                         <div>
                            <p className="text-base font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{tech.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{tech.specialty}</p>
                         </div>
                      </div>
                      <div className={`px-5 py-2.5 rounded-xl text-[10px] font-black border transition-all ${
                        tech.activeTasks > 2 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                         {tech.activeTasks} UNITS
                      </div>
                   </div>
                ))}
              </div>
           </div>
           
           <div className="bg-slate-900 rounded-[56px] p-12 text-white relative overflow-hidden shadow-2xl group hover:scale-[1.02] transition-transform duration-700">
              <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-32 h-32" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-blue-500">Security & Integrity</p>
              <h4 className="text-3xl font-black leading-none mb-6 tracking-tighter uppercase">Enterprise Protocol</h4>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Dispatch latency is optimized. Critical maintenance window is 240 minutes. Ensure all personnel log biometric entry for every site visit.
              </p>
           </div>
        </div>
      </div>

      {/* DISPATCH/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl">
           <div className="max-w-4xl w-full glass-card rounded-[64px] overflow-hidden border-white/10 animate-in zoom-in-95 duration-300 shadow-[0_0_120px_rgba(0,0,0,0.6)]">
              <div className="p-14 border-b border-white/5 flex justify-between items-center bg-white/5">
                 <div>
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">{editingSPK ? 'Refine Entry' : 'New Dispatch'}</h3>
                  <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.3em] mt-3">
                    {editingSPK ? `Targeting Ledger: ${editingSPK.id}` : 'Initializing Global Work Order'}
                  </p>
                 </div>
                 <button onClick={closeModal} className="p-5 hover:bg-white/10 rounded-3xl text-slate-500 hover:text-white transition-all">
                  <X className="w-10 h-10" />
                 </button>
              </div>
              <form onSubmit={handleSaveSPK} className="p-14 space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Physical Node Identification</label>
                       <div className="relative group">
                          <Box className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                          <select required className="w-full pl-16 pr-8 py-6 bg-white/5 border border-white/10 rounded-3xl text-white font-black outline-none appearance-none focus:ring-[12px] focus:ring-blue-500/10 transition-all text-lg" value={spkForm.assetId} onChange={e => setSpkForm({...spkForm, assetId: e.target.value})}>
                            <option value="" className="bg-slate-950 text-slate-500 italic">Select Physical Asset...</option>
                            {assets.map(a => <option key={a.id} value={a.id} className="bg-slate-950">{a.id} • {a.name}</option>)}
                          </select>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Assigned Personnel</label>
                       <div className="relative group">
                          <HardHat className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                          <select required className="w-full pl-16 pr-8 py-6 bg-white/5 border border-white/10 rounded-3xl text-white font-black outline-none appearance-none focus:ring-[12px] focus:ring-blue-500/10 transition-all text-lg" value={spkForm.technicianId} onChange={e => setSpkForm({...spkForm, technicianId: e.target.value})}>
                            <option value="" className="bg-slate-950 text-slate-500 italic">Assign Specialist...</option>
                            {technicians.map(t => <option key={t.id} value={t.id} className="bg-slate-950">{t.name} [{t.activeTasks} Load]</option>)}
                          </select>
                       </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Operational Title</label>
                       <input required placeholder="Enter technical summary..." className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-3xl text-white font-black outline-none focus:ring-[12px] focus:ring-blue-500/10 transition-all text-lg placeholder:text-slate-800" value={spkForm.title} onChange={e => setSpkForm({...spkForm, title: e.target.value})} />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">SLA Resolution Deadline</label>
                       <div className="relative group">
                          <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                          <input required type="date" className="w-full pl-16 pr-8 py-6 bg-white/5 border border-white/10 rounded-3xl text-white font-black outline-none focus:ring-[12px] focus:ring-blue-500/10 transition-all text-lg" value={spkForm.dueDate} onChange={e => setSpkForm({...spkForm, dueDate: e.target.value})} />
                       </div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Technical Directives</label>
                    <textarea required placeholder="Outline procedure and safety requirements..." className="w-full h-44 px-8 py-7 bg-white/5 border border-white/10 rounded-[40px] text-white font-bold outline-none focus:ring-[12px] focus:ring-blue-500/10 transition-all resize-none text-lg leading-relaxed placeholder:text-slate-800" value={spkForm.description} onChange={e => setSpkForm({...spkForm, description: e.target.value})} />
                 </div>
                 <div className="pt-8 flex gap-8">
                    <button type="button" onClick={closeModal} className="flex-1 py-7 bg-white/5 text-slate-500 font-black rounded-3xl hover:bg-white/10 transition-all uppercase tracking-[0.4em] text-xs">Abort Operation</button>
                    <button type="submit" className="flex-[2] py-7 bg-blue-600 text-white font-black rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.4)] hover:bg-blue-500 active:scale-95 transition-all uppercase tracking-[0.5em] text-xs flex items-center justify-center gap-4">
                       {editingSPK ? <><Save className="w-6 h-6" /> Commit Record</> : <><Plus className="w-6 h-6" /> Authorize Dispatch</>}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SPKManager;

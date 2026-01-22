
import React, { useState, useRef } from 'react';
import { ArrowLeft, User, Box, Calendar, Clock, AlertCircle, CheckCircle2, MoreVertical, PenTool, UserCog, MapPin, Tag, Timer, Play, X, CheckCircle, AlertTriangle, Camera, Trash2, Image as ImageIcon, HardHat, ShieldCheck, Activity } from 'lucide-react';
import { useApp } from '../AppContext';
import { SPK, SPKStatus, AssetStatus } from '../types';

interface SPKDetailProps {
  spk: SPK;
  onBack: () => void;
  onReassign: (spk: SPK) => void;
}

const SPKDetail: React.FC<SPKDetailProps> = ({ spk, onBack, onReassign }) => {
  const { assets, technicians, currentTechnician, updateSPKStatus } = useApp();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNote, setEditNote] = useState(spk.completionNote || '');
  const [editStatus, setEditStatus] = useState<SPKStatus>(spk.status);
  const [editEvidence, setEditEvidence] = useState<string[]>(spk.evidence || []);
  const [showNoteError, setShowNoteError] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const asset = assets.find(a => a.id === spk.assetId);
  const technician = technicians.find(t => t.id === spk.technicianId);

  const isAssignedToMe = currentTechnician && currentTechnician.id === spk.technicianId;

  // Calculate days remaining
  const today = new Date();
  const dueDate = new Date(spk.dueDate);
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0 && spk.status !== SPKStatus.COMPLETED;

  const getStatusStyle = (status: SPKStatus) => {
    switch (status) {
      case SPKStatus.IN_PROGRESS: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case SPKStatus.COMPLETED: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case SPKStatus.OPEN: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case SPKStatus.CANCELLED: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'Medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditEvidence(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSaveProgress = () => {
    if (editStatus === SPKStatus.COMPLETED && !editNote.trim()) {
      setShowNoteError(true);
      return;
    }
    updateSPKStatus(spk.id, editStatus, editNote, editEvidence);
    setIsEditModalOpen(false);
    setShowNoteError(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Dynamic Header Section */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-6">
            <button 
              onClick={onBack}
              className="p-4 glass-card rounded-2xl border-white/5 hover:border-blue-500/30 transition-all text-slate-400 mt-1 shadow-xl"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-black px-3 py-1.5 bg-slate-900 text-white rounded-xl uppercase tracking-widest border border-white/10">{spk.id}</span>
                <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border backdrop-blur-md ${getStatusStyle(spk.status)}`}>
                  {spk.status}
                </span>
                <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border backdrop-blur-md ${getPriorityStyle(spk.priority)}`}>
                  {spk.priority} Priority
                </span>
              </div>
              <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-tight max-w-2xl text-glow-blue">{spk.title}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pt-2 no-print">
            {isAssignedToMe && spk.status !== SPKStatus.COMPLETED && (
              <button 
                onClick={() => {
                  setIsEditModalOpen(true);
                  setShowNoteError(false);
                }}
                className="bg-emerald-600 text-white px-10 py-4 rounded-2xl flex items-center gap-3 hover:bg-emerald-500 transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] active:scale-95 font-black uppercase tracking-[0.2em] text-xs"
              >
                <Play className="w-5 h-5 fill-current" />
                Update Log
              </button>
            )}
            {!isAssignedToMe && spk.status !== SPKStatus.COMPLETED && (
              <button 
                onClick={() => onReassign(spk)}
                className="glass-card border-white/10 text-white px-10 py-4 rounded-2xl flex items-center gap-3 hover:bg-white/5 transition-all active:scale-95 font-black uppercase tracking-[0.2em] text-xs"
              >
                <UserCog className="w-5 h-5 text-blue-400" />
                Reassign
              </button>
            )}
            <button className="p-4 glass-card border-white/5 text-slate-500 rounded-2xl hover:text-white transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Operational Focal Point - Asset & Technician prominent cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-1000 delay-200">
           <div className="glass-card p-8 rounded-[40px] border-white/5 flex items-center gap-6 group hover:border-blue-500/30 transition-all shadow-2xl">
              <div className="w-24 h-24 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shrink-0">
                <img src={asset?.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                  <Box className="w-3.5 h-3.5" />
                  Target Node
                </p>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter truncate leading-none mb-2">{asset?.name || 'Unknown Node'}</h3>
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                      <Tag className="w-3 h-3" />
                      {asset?.category}
                   </div>
                   <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                      <MapPin className="w-3 h-3" />
                      {asset?.location}
                   </div>
                </div>
              </div>
           </div>

           <div className="glass-card p-8 rounded-[40px] border-white/5 flex items-center gap-6 group hover:border-emerald-500/30 transition-all shadow-2xl">
              <div className="w-24 h-24 rounded-3xl bg-slate-900 flex items-center justify-center font-black text-emerald-400 text-3xl border border-white/10 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shrink-0 relative">
                 {technician?.name.split(' ').map(n => n[0]).join('')}
                 {isAssignedToMe && (
                   <div className="absolute -top-3 -right-3 bg-blue-600 w-8 h-8 rounded-full border-4 border-[#020617] flex items-center justify-center shadow-lg">
                     <CheckCircle2 className="w-4 h-4 text-white" />
                   </div>
                 )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                  <HardHat className="w-3.5 h-3.5" />
                  Primary Specialist
                </p>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter truncate leading-none mb-2">{technician?.name || 'Unassigned'}</h3>
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                      <ShieldCheck className="w-3 h-3" />
                      {technician?.rank || 'Qualified Personnel'}
                   </div>
                   <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                      <Activity className="w-3 h-3" />
                      {technician?.activeTasks} ACTIVE LOAD
                   </div>
                </div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {/* Main Description Card */}
          <div className="glass-card p-12 rounded-[56px] border-white/5 space-y-12">
            <section>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Service Instructions</h3>
              <div className="relative">
                <div className="absolute -left-6 top-0 bottom-0 w-1 bg-blue-500/50 rounded-full" />
                <p className="text-slate-300 leading-relaxed font-medium text-xl italic pl-6 border-l border-white/10">
                  "{spk.description}"
                </p>
              </div>
            </section>

            {spk.completionNote && (
              <section className="pt-12 border-t border-white/5">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Remediation Log</h3>
                <div className="p-8 bg-emerald-500/5 rounded-[32px] border border-emerald-500/10">
                  <p className="text-slate-200 leading-relaxed font-bold text-lg">{spk.completionNote}</p>
                </div>
              </section>
            )}

            {spk.evidence && spk.evidence.length > 0 && (
              <section className="pt-12 border-t border-white/5">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Physical Evidence</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {spk.evidence.map((img, i) => (
                    <div key={i} className="aspect-video rounded-[32px] overflow-hidden border border-white/5 shadow-2xl group relative">
                      <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" alt="Evidence" />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm" onClick={() => window.open(img)}>
                        <ImageIcon className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="glass-card p-12 rounded-[56px] border-white/5">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-12">System Lifecycle Audit</h3>
             <div className="space-y-12 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
                <div className="relative flex items-start gap-10 pl-2">
                   <div className="w-6 h-6 rounded-full bg-slate-800 border-4 border-[#020617] ring-4 ring-white/5 z-10 flex-shrink-0" />
                   <div>
                     <p className="font-black text-white text-sm uppercase tracking-wider mb-2">Order Registration</p>
                     <p className="text-xs text-slate-500 font-medium leading-relaxed">System authorized and registered work order into the global enterprise ledger.</p>
                     <div className="mt-4 inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-white/5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(spk.createdAt).toLocaleString()}
                     </div>
                   </div>
                </div>

                <div className="relative flex items-start gap-10 pl-2">
                   <div className={`w-6 h-6 rounded-full border-4 border-[#020617] ring-4 z-10 flex-shrink-0 transition-all duration-700 ${
                     spk.status === SPKStatus.IN_PROGRESS || spk.status === SPKStatus.COMPLETED ? 'bg-blue-500 ring-blue-500/20' : 'bg-slate-700 ring-white/5'
                   }`} />
                   <div className={spk.status === SPKStatus.OPEN ? 'opacity-30' : ''}>
                     <p className="font-black text-white text-sm uppercase tracking-wider mb-2">Technical Engagement</p>
                     <p className="text-xs text-slate-500 font-medium leading-relaxed">Personnel acknowledged assignment and initiated remediation procedures.</p>
                     {spk.status !== SPKStatus.OPEN && (
                       <div className="mt-4 inline-flex items-center gap-3 px-4 py-2 bg-blue-500/10 rounded-xl text-[10px] font-black text-blue-400 uppercase tracking-widest border border-blue-500/20">
                          <Clock className="w-3.5 h-3.5" />
                          Validated Activity
                       </div>
                     )}
                   </div>
                </div>

                <div className="relative flex items-start gap-10 pl-2">
                   <div className={`w-6 h-6 rounded-full border-4 border-[#020617] ring-4 z-10 flex-shrink-0 transition-all duration-700 ${
                     spk.status === SPKStatus.COMPLETED ? 'bg-emerald-500 ring-emerald-500/20' : 'bg-slate-700 ring-white/5'
                   }`} />
                   <div className={spk.status !== SPKStatus.COMPLETED ? 'opacity-30' : ''}>
                     <p className="font-black text-white text-sm uppercase tracking-wider mb-2">Ledger Finalization</p>
                     <p className="text-xs text-slate-500 font-medium leading-relaxed">Asset integrity confirmed. Final resolution logged and verified by central authority.</p>
                     {spk.completedAt && (
                       <div className="mt-4 inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/10 rounded-xl text-[10px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {new Date(spk.completedAt).toLocaleString()}
                       </div>
                     )}
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* SLA and Metrics Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-card rounded-[56px] p-12 text-white shadow-2xl relative overflow-hidden border-white/5">
             <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px]" />
             <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-10">Dispatch Analytics</h4>
             <div className="space-y-10">
               <div className="flex items-center justify-between border-b border-white/5 pb-8">
                 <div className="flex items-center gap-5">
                   <div className={`p-4 rounded-2xl ${isOverdue ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'}`}>
                    <Timer className={`w-7 h-7 ${isOverdue ? 'animate-pulse' : ''}`} />
                   </div>
                   <span className="text-sm font-black text-slate-400 uppercase tracking-widest">SLA Deadline</span>
                 </div>
                 <div className="text-right">
                    <span className={`font-black text-lg block uppercase tracking-tight ${isOverdue ? 'text-rose-400' : 'text-amber-400'}`}>
                      {new Date(spk.dueDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                      {isOverdue ? 'REMEDIATION OVERDUE' : `${diffDays} DAYS REMAINING`}
                    </span>
                 </div>
               </div>
               <div className="flex items-center justify-between border-b border-white/5 pb-8">
                 <div className="flex items-center gap-5">
                   <div className="p-4 bg-blue-500/20 text-blue-400 rounded-2xl">
                    <Clock className="w-7 h-7" />
                   </div>
                   <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Est. Downtime</span>
                 </div>
                 <span className="font-black text-lg text-white uppercase tracking-tight">6.5 Hours</span>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-5">
                   <div className="p-4 bg-rose-500/20 text-rose-400 rounded-2xl">
                    <AlertCircle className="w-7 h-7" />
                   </div>
                   <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Security Tier</span>
                 </div>
                 <span className="font-black text-lg text-white uppercase tracking-tight">Level 4 Restricted</span>
               </div>
             </div>
             
             <div className="mt-12 p-8 bg-white/5 rounded-[32px] border border-white/5">
               <p className="text-[10px] text-blue-500 font-black uppercase mb-3 tracking-[0.3em]">Operational Protocol</p>
               <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
                 "Specialist must maintain active biometric logging during the entire procedure. All removed modules require individual scanning."
               </p>
             </div>
          </div>

          <div className="bg-blue-600 rounded-[56px] p-12 text-white shadow-2xl shadow-blue-900/40 group hover:scale-[1.02] transition-transform duration-700 cursor-default overflow-hidden relative">
             <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
               <PenTool className="w-32 h-32" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 opacity-70">Fleet Intelligence</p>
             <h4 className="text-3xl font-black leading-[1.1] mb-6 uppercase tracking-tighter">Advanced Diagnostics</h4>
             <p className="text-sm text-blue-50/80 font-medium leading-relaxed">
               System correlates this failure pattern with a 15% increase in operational heat in Zone {asset?.location.split(' ').pop()}. Consider secondary thermal inspection.
             </p>
          </div>
        </div>
      </div>

      {/* Progress Update Modal for Logged in Tech */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl">
          <div className="bg-white rounded-[64px] shadow-[0_0_120px_rgba(0,0,0,0.5)] w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col border border-white/10">
            <div className="px-14 pt-14 pb-10 flex justify-between items-center border-b border-slate-100 shrink-0 bg-slate-50/50">
              <div>
                <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Terminal Update</h3>
                <p className="text-[10px] text-blue-600 mt-2 uppercase font-black tracking-[0.3em]">Specialist Session: {spk.id}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-5 hover:bg-slate-200 rounded-3xl transition-all">
                <X className="w-10 h-10 text-slate-400" />
              </button>
            </div>
            
            <div className="p-14 space-y-12 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Engagement Status</label>
                <div className="grid grid-cols-3 gap-6">
                  {[SPKStatus.OPEN, SPKStatus.IN_PROGRESS, SPKStatus.COMPLETED].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setEditStatus(status);
                        if (status !== SPKStatus.COMPLETED) setShowNoteError(false);
                      }}
                      className={`py-6 rounded-[32px] font-black text-xs uppercase tracking-widest border-2 transition-all active:scale-95
                        ${editStatus === status 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-500/40' 
                          : 'bg-slate-100 border-slate-100 text-slate-400 hover:border-blue-300 hover:text-blue-600'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Field Observations</label>
                  {editStatus === SPKStatus.COMPLETED && (
                    <span className="text-[10px] font-black text-rose-500 uppercase flex items-center gap-2 animate-pulse">
                      <AlertTriangle className="w-4 h-4" />
                      Remediation Detail Mandatory
                    </span>
                  )}
                </div>
                <textarea 
                  className={`w-full h-56 px-10 py-8 bg-slate-50 border-2 rounded-[40px] outline-none focus:ring-[12px] transition-all text-slate-800 resize-none font-bold text-lg
                    ${showNoteError ? 'border-rose-500 focus:ring-rose-500/10' : 'border-slate-100 focus:ring-blue-500/10'}`}
                  placeholder={editStatus === SPKStatus.COMPLETED ? "Document mission success and detailed asset telemetry..." : "Input current technical status..."}
                  value={editNote}
                  onChange={(e) => {
                    setEditNote(e.target.value);
                    if (e.target.value.trim()) setShowNoteError(false);
                  }}
                />
                {showNoteError && (
                  <p className="text-[10px] font-black text-rose-500 uppercase px-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Formal remediation log is required for completion authorization
                  </p>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Visual Verification
                  </label>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{editEvidence.length} OBJECTS ATTACHED</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {editEvidence.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-[32px] overflow-hidden border-2 border-slate-100 shadow-xl">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button onClick={() => setEditEvidence(prev => prev.filter((_, i) => i !== idx))} className="absolute top-4 right-4 p-3 bg-rose-600 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  
                  <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 group">
                    <div className="p-5 bg-slate-100 rounded-3xl group-hover:bg-blue-100 transition-colors shadow-inner">
                      <Camera className="w-10 h-10" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Attach Media</span>
                  </button>
                </div>
                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
            </div>
            
            <div className="px-14 pb-14 flex gap-6 shrink-0 border-t border-slate-100 pt-10 bg-slate-50/50">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-6 text-slate-400 font-black bg-white border border-slate-200 hover:bg-slate-100 rounded-[32px] transition-all uppercase tracking-[0.3em] text-xs shadow-sm"
              >
                Abort
              </button>
              <button 
                onClick={handleSaveProgress}
                className={`flex-[2] py-6 font-black rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.1)] transition-all flex items-center justify-center gap-4 active:scale-95 uppercase tracking-[0.3em] text-xs
                  ${editStatus === SPKStatus.COMPLETED ? 'bg-emerald-600 text-white shadow-emerald-500/40 hover:bg-emerald-500' : 'bg-blue-600 text-white shadow-blue-500/40 hover:bg-blue-500'}`}
              >
                <CheckCircle className="w-6 h-6" />
                {editStatus === SPKStatus.COMPLETED ? 'Authorize Resolution' : 'Sync Progress'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SPKDetail;

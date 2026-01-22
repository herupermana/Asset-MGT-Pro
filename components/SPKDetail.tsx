
import React, { useState, useRef } from 'react';
import { ArrowLeft, User, Box, Calendar, Clock, AlertCircle, CheckCircle2, MoreVertical, PenTool, UserCog, MapPin, Tag, Timer, Play, X, CheckCircle, AlertTriangle, Camera, Trash2, Image as ImageIcon } from 'lucide-react';
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

  const getStatusStyle = (status: SPKStatus) => {
    switch (status) {
      case SPKStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700 border-blue-200';
      case SPKStatus.COMPLETED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case SPKStatus.OPEN: return 'bg-amber-100 text-amber-700 border-amber-200';
      case SPKStatus.CANCELLED: return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-rose-600 bg-rose-50';
      case 'Medium': return 'text-amber-600 bg-amber-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  // Fixed error by explicitly typing 'file' as File
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all text-slate-500"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-500 uppercase tracking-widest">{spk.id}</span>
              <h2 className="text-3xl font-bold text-slate-800">{spk.title}</h2>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${getStatusStyle(spk.status)}`}>
                {spk.status}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getPriorityStyle(spk.priority)}`}>
                {spk.priority} Priority
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAssignedToMe && spk.status !== SPKStatus.COMPLETED && (
            <button 
              onClick={() => {
                setIsEditModalOpen(true);
                setShowNoteError(false);
              }}
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95 font-bold"
            >
              <Play className="w-5 h-5 fill-current" />
              Update My Progress
            </button>
          )}
          {!isAssignedToMe && spk.status !== SPKStatus.COMPLETED && (
            <button 
              onClick={() => onReassign(spk)}
              className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95 font-bold"
            >
              <UserCog className="w-5 h-5" />
              Reassign Order
            </button>
          )}
          <button className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Content Card */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Description</h3>
              <p className="text-slate-700 leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-50 italic">
                "{spk.description}"
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Asset Snapshot */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Target Asset</h3>
                <div className="p-5 rounded-3xl border border-slate-100 bg-white flex items-center gap-4 group hover:border-blue-200 transition-all">
                  <img src={asset?.imageUrl} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-slate-800 truncate">{asset?.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <Tag className="w-3 h-3" />
                      {asset?.category}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 uppercase font-bold">
                      <MapPin className="w-3 h-3" />
                      {asset?.location}
                    </div>
                  </div>
                </div>
              </section>

              {/* Technician Snapshot */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Assigned Specialist</h3>
                <div className="p-5 rounded-3xl border border-slate-100 bg-white flex items-center gap-4 group hover:border-emerald-200 transition-all">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors relative">
                    {technician?.name.split(' ').map(n => n[0]).join('')}
                    {isAssignedToMe && (
                      <div className="absolute -top-1 -right-1 bg-blue-600 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{technician?.name} {isAssignedToMe && "(You)"}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{technician?.specialty}</p>
                    <div className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded">
                      {technician?.activeTasks} ACTIVE TASKS
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {spk.completionNote && (
              <section className="pt-8 border-t border-slate-50">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Work Observations</h3>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-sm text-slate-600 leading-relaxed">{spk.completionNote}</p>
                </div>
              </section>
            )}

            {spk.evidence && spk.evidence.length > 0 && (
              <section className="pt-8 border-t border-slate-50">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Captured Evidence</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {spk.evidence.map((img, i) => (
                    <div key={i} className="aspect-video rounded-2xl overflow-hidden border border-slate-100 shadow-sm group relative">
                      <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Evidence" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => window.open(img)}>
                        <ImageIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Work Order Progression timeline remains same */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Work Order Progression</h3>
             <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                <div className="relative flex items-start gap-6 pl-2">
                   <div className="w-6 h-6 rounded-full bg-blue-500 border-4 border-white ring-1 ring-blue-100 z-10 flex-shrink-0" />
                   <div>
                     <p className="font-bold text-slate-800 text-sm">Order Created</p>
                     <p className="text-xs text-slate-500 mt-0.5">Ticket was initially logged by system administrator</p>
                     <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">{new Date(spk.createdAt).toLocaleString()}</p>
                   </div>
                </div>

                <div className="relative flex items-start gap-6 pl-2">
                   <div className={`w-6 h-6 rounded-full border-4 border-white ring-1 z-10 flex-shrink-0 ${
                     spk.status === SPKStatus.IN_PROGRESS || spk.status === SPKStatus.COMPLETED ? 'bg-blue-500 ring-blue-100' : 'bg-slate-200 ring-slate-100'
                   }`} />
                   <div className={spk.status === SPKStatus.OPEN ? 'opacity-40' : ''}>
                     <p className="font-bold text-slate-800 text-sm">Work Commenced</p>
                     <p className="text-xs text-slate-500 mt-0.5">Technician {technician?.name} acknowledged and started tasks</p>
                     {spk.status !== SPKStatus.OPEN && <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">Processed</p>}
                   </div>
                </div>

                <div className="relative flex items-start gap-6 pl-2">
                   <div className={`w-6 h-6 rounded-full border-4 border-white ring-1 z-10 flex-shrink-0 ${
                     spk.status === SPKStatus.COMPLETED ? 'bg-emerald-500 ring-emerald-100' : 'bg-slate-200 ring-slate-100'
                   }`} />
                   <div className={spk.status !== SPKStatus.COMPLETED ? 'opacity-40' : ''}>
                     <p className="font-bold text-slate-800 text-sm">Final Inspection & Completion</p>
                     <p className="text-xs text-slate-500 mt-0.5">Verification complete. Asset returned to operational status.</p>
                     {spk.completedAt && <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">{new Date(spk.completedAt).toLocaleString()}</p>}
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Info remains same */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Execution Summary</h4>
             <div className="space-y-6">
               <div className="flex items-center justify-between border-b border-white/5 pb-4">
                 <div className="flex items-center gap-3">
                   <Timer className="w-5 h-5 text-amber-400" />
                   <span className="text-sm text-slate-300">Deadline</span>
                 </div>
                 <span className="font-bold text-sm text-amber-400">{new Date(spk.dueDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
               </div>
               <div className="flex items-center justify-between border-b border-white/5 pb-4">
                 <div className="flex items-center gap-3">
                   <Clock className="w-5 h-5 text-blue-400" />
                   <span className="text-sm text-slate-300">Est. Duration</span>
                 </div>
                 <span className="font-bold text-sm">2.5 Hours</span>
               </div>
               <div className="flex items-center justify-between border-b border-white/5 pb-4">
                 <div className="flex items-center gap-3">
                   <AlertCircle className="w-5 h-5 text-amber-400" />
                   <span className="text-sm text-slate-300">Safety Tier</span>
                 </div>
                 <span className="font-bold text-sm">Level 2</span>
               </div>
               <div className="flex items-center justify-between border-b border-white/5 pb-4">
                 <div className="flex items-center gap-3">
                   <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                   <span className="text-sm text-slate-300">Auth Required</span>
                 </div>
                 <span className="font-bold text-sm">Yes</span>
               </div>
             </div>
             
             <div className="mt-8 pt-6 border-t border-white/10">
               <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Service Note</p>
               <p className="text-xs text-slate-400 leading-relaxed italic">
                 Personnel must wear Level 2 PPE during this procedure. All power must be locked out before casing removal.
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* Progress Update Modal for Logged in Tech */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-10 pt-10 pb-6 flex justify-between items-center border-b border-slate-50 shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Direct Progress Update</h3>
                <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">{spk.id}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <X className="w-7 h-7 text-slate-400" />
              </button>
            </div>
            <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Work Status</label>
                <div className="grid grid-cols-3 gap-3">
                  {[SPKStatus.OPEN, SPKStatus.IN_PROGRESS, SPKStatus.COMPLETED].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setEditStatus(status);
                        if (status !== SPKStatus.COMPLETED) setShowNoteError(false);
                      }}
                      className={`py-3 rounded-2xl font-bold text-xs border-2 transition-all
                        ${editStatus === status 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                          : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end px-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Observations & Notes</label>
                  {editStatus === SPKStatus.COMPLETED && (
                    <span className="text-[10px] font-black text-rose-500 uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Mandatory Completion Note
                    </span>
                  )}
                </div>
                <textarea 
                  className={`w-full h-40 px-6 py-4 bg-slate-50 border rounded-[24px] outline-none focus:ring-4 transition-all text-slate-700 resize-none font-medium
                    ${showNoteError ? 'border-rose-500 focus:ring-rose-100' : 'border-slate-100 focus:ring-blue-100'}`}
                  placeholder={editStatus === SPKStatus.COMPLETED ? "Please document your work results to finalize this order..." : "Summarize your work findings..."}
                  value={editNote}
                  onChange={(e) => {
                    setEditNote(e.target.value);
                    if (e.target.value.trim()) setShowNoteError(false);
                  }}
                />
                {showNoteError && (
                  <p className="text-[10px] font-black text-rose-500 uppercase px-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Operational documentation is required for closing
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5" />
                    Capture Evidence
                  </label>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{editEvidence.length} Photos</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {editEvidence.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-100">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button onClick={() => setEditEvidence(prev => prev.filter((_, i) => i !== idx))} className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all">
                    <Camera className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase">Upload</span>
                  </button>
                </div>
                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
            </div>
            <div className="px-10 pb-10 flex gap-4 shrink-0 border-t border-slate-50 pt-6">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-4 text-slate-500 font-bold bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProgress}
                className={`flex-[2] py-4 font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95
                  ${editStatus === SPKStatus.COMPLETED ? 'bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700' : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'}`}
              >
                <CheckCircle className="w-5 h-5" />
                {editStatus === SPKStatus.COMPLETED ? 'Finalize & Close' : 'Apply Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SPKDetail;

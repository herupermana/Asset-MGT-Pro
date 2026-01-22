
import React, { useState } from 'react';
import { Clock, CheckCircle2, User, AlertCircle, Calendar, Box, UserCog, X, UserCheck, ExternalLink, ChevronRight, Timer, Plus, Hammer, ClipboardList, Wrench, FileText, ShieldCheck } from 'lucide-react';
import { useApp } from '../AppContext';
import { SPKStatus, SPK, AssetStatus } from '../types';
import SPKDetail from './SPKDetail';

// Sub-component for the Work Order Flow Stepper
const WorkOrderFlow: React.FC<{ status: SPKStatus }> = ({ status }) => {
  const isCompleted = status === SPKStatus.COMPLETED;
  const isInProgress = status === SPKStatus.IN_PROGRESS;
  const isOpen = status === SPKStatus.OPEN;

  const steps = [
    { 
      id: 'open', 
      label: 'Registered', 
      icon: FileText, 
      active: isOpen || isInProgress || isCompleted,
      current: isOpen,
      color: isOpen ? 'text-amber-500 bg-amber-50 border-amber-200' : (isInProgress || isCompleted ? 'text-emerald-500 bg-emerald-50 border-emerald-200' : 'text-slate-300 bg-slate-50 border-slate-100')
    },
    { 
      id: 'progress', 
      label: 'Executing', 
      icon: Wrench, 
      active: isInProgress || isCompleted,
      current: isInProgress,
      color: isInProgress ? 'text-blue-500 bg-blue-50 border-blue-200' : (isCompleted ? 'text-emerald-500 bg-emerald-50 border-emerald-200' : 'text-slate-300 bg-slate-50 border-slate-100')
    },
    { 
      id: 'completed', 
      label: 'Validated', 
      icon: ShieldCheck, 
      active: isCompleted,
      current: isCompleted,
      color: isCompleted ? 'text-emerald-500 bg-emerald-50 border-emerald-200' : 'text-slate-300 bg-slate-50 border-slate-100'
    }
  ];

  return (
    <div className="flex items-center gap-1.5 py-1">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          {/* Node */}
          <div className="flex items-center gap-2 group/node">
            <div className={`
              w-7 h-7 rounded-lg border flex items-center justify-center transition-all duration-500 relative
              ${step.color}
              ${step.current ? 'ring-4 ring-current/10' : ''}
            `}>
              <step.icon className={`w-3.5 h-3.5 ${step.current && step.id === 'open' ? 'animate-pulse' : (step.current && step.id === 'progress' ? 'animate-bounce' : '')}`} />
              
              {/* Tooltip on hover */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover/node:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest z-10">
                {step.label}
              </div>
            </div>
          </div>

          {/* Connector Line */}
          {idx < steps.length - 1 && (
            <div className="w-6 h-[2px] relative overflow-hidden bg-slate-100 rounded-full">
               <div 
                 className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                   (idx === 0 && (isInProgress || isCompleted)) || (idx === 1 && isCompleted) 
                     ? 'translate-x-0 bg-emerald-400' 
                     : (idx === 0 && isOpen ? 'bg-amber-200 translate-x-[-100%] animate-[shimmer_2s_infinite]' : '-translate-x-full bg-slate-100')
                 }`}
               />
               <style>{`
                 @keyframes shimmer {
                   0% { transform: translateX(-100%); }
                   100% { transform: translateX(100%); }
                 }
               `}</style>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const SPKManager: React.FC = () => {
  const { spks, assets, technicians, reassignSPK, createSPK, globalSearchQuery } = useApp();
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

  const getStatusIcon = (status: SPKStatus) => {
    switch (status) {
      case SPKStatus.IN_PROGRESS: return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case SPKStatus.COMPLETED: return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case SPKStatus.OPEN: return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default: return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleReassign = (techId: string) => {
    if (selectedSPKForReassign) {
      reassignSPK(selectedSPKForReassign.id, techId);
      setSelectedSPKForReassign(null);
      if (viewingSPK && viewingSPK.id === selectedSPKForReassign.id) {
        setViewingSPK({ ...viewingSPK, technicianId: techId });
      }
    }
  };

  const handleCreateSPK = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSPK.assetId || !newSPK.technicianId) return;

    createSPK({
      id: `SPK-${Date.now()}`,
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

  if (viewingSPK) {
    return (
      <SPKDetail 
        spk={viewingSPK} 
        onBack={() => setViewingSPK(null)} 
        onReassign={(spk) => setSelectedSPKForReassign(spk)} 
      />
    );
  }

  const filteredSPKs = spks.filter(s => 
    s.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Maintenance & Repair</h2>
          <p className="text-slate-500 font-medium">Service Orders (SPK) tracking system</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 font-bold"
        >
          <Plus className="w-5 h-5" />
          Create New Order
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-semibold text-slate-700">Order History</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredSPKs.length} RESULTS</span>
          </div>
          {filteredSPKs.map((spk) => {
            const asset = assets.find(a => a.id === spk.assetId);
            const tech = technicians.find(t => t.id === spk.technicianId);
            
            return (
              <div 
                key={spk.id} 
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all relative cursor-pointer group"
                onClick={() => setViewingSPK(spk)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-4 mb-1">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-tighter ${
                        spk.priority === 'High' ? 'bg-rose-50 text-rose-600 border border-rose-100' : spk.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {spk.priority} Priority
                      </span>
                      <WorkOrderFlow status={spk.status} />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors flex items-center gap-2 leading-none pt-1">
                      {spk.title}
                      <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-400" />
                    </h4>
                    <p className="text-slate-500 text-sm line-clamp-1 leading-relaxed">{spk.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg text-sm text-slate-600 font-medium capitalize border border-slate-100">
                      {getStatusIcon(spk.status)}
                      {spk.status.replace('_', ' ')}
                    </div>
                    <div className="flex items-center gap-1">
                      {spk.status !== SPKStatus.COMPLETED && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSPKForReassign(spk);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Reassign Technician"
                        >
                          <UserCog className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           setViewingSPK(spk);
                         }}
                         className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                         <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-50 mt-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600"><Box className="w-4 h-4" /></div>
                    <span className="text-sm font-semibold">{asset?.name || 'Unknown Asset'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="p-1.5 bg-slate-100 rounded-lg"><User className="w-4 h-4" /></div>
                    <span className="text-sm font-medium">{tech?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 ml-auto bg-amber-50 px-3 py-1 rounded-full">
                    <Timer className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter">Due {new Date(spk.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredSPKs.length === 0 && (
            <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[32px] p-20 text-center">
              <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">No matching service orders found.</p>
            </div>
          )}
        </div>

        {/* Technician Side Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 px-1">Technician Workload</h3>
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
            {technicians.map((tech) => (
              <div key={tech.id} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {tech.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-sm">{tech.name}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{tech.specialty}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-700">{tech.activeTasks} tasks</div>
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${tech.activeTasks > 2 ? 'bg-rose-500' : 'bg-blue-500'}`} 
                      style={{ width: `${Math.min(100, (tech.activeTasks / 4) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CREATE NEW SPK MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-10 pt-10 pb-6 flex justify-between items-center border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-2xl">
                  <Hammer className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Dispatch New Order</h3>
                  <p className="text-slate-500 text-sm font-medium">Schedule maintenance or repair task</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-full transition-colors"
              >
                <X className="w-7 h-7 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleCreateSPK} className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Target Asset</label>
                  <select 
                    required 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-slate-700"
                    value={newSPK.assetId}
                    onChange={e => setNewSPK({...newSPK, assetId: e.target.value})}
                  >
                    <option value="">Select Asset...</option>
                    {assets.map(asset => (
                      <option key={asset.id} value={asset.id}>{asset.name} ({asset.id})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Assign Technician</label>
                  <select 
                    required 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-slate-700"
                    value={newSPK.technicianId}
                    onChange={e => setNewSPK({...newSPK, technicianId: e.target.value})}
                  >
                    <option value="">Select Specialist...</option>
                    {technicians.map(tech => (
                      <option key={tech.id} value={tech.id}>{tech.name} - {tech.activeTasks} active tasks</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Order Title</label>
                <input 
                  required 
                  placeholder="e.g. Compressor Filter Replacement"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-slate-700"
                  value={newSPK.title}
                  onChange={e => setNewSPK({...newSPK, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Work Description</label>
                <textarea 
                  required 
                  placeholder="Describe the tasks to be performed..."
                  className="w-full h-32 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-slate-700 resize-none"
                  value={newSPK.description}
                  onChange={e => setNewSPK({...newSPK, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Priority Tier</label>
                  <div className="flex gap-2">
                    {(['Low', 'Medium', 'High'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewSPK({...newSPK, priority: p})}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border-2
                          ${newSPK.priority === p 
                            ? (p === 'High' ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-100' : p === 'Medium' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-100' : 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100')
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Target Completion Date</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-slate-700"
                    value={newSPK.dueDate}
                    onChange={e => setNewSPK({...newSPK, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-4 text-slate-500 font-bold bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Dispatch Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reassign Technician Modal */}
      {selectedSPKForReassign && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 pt-8 pb-4 flex justify-between items-center border-b border-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Reassign Order</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedSPKForReassign.id}: {selectedSPKForReassign.title}</p>
              </div>
              <X className="w-6 h-6 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => setSelectedSPKForReassign(null)} />
            </div>
            <div className="p-8 space-y-4">
              <p className="text-sm font-medium text-slate-600 mb-2">Select new technician:</p>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {technicians.map((tech) => (
                  <button
                    key={tech.id}
                    disabled={tech.id === selectedSPKForReassign.technicianId}
                    onClick={() => handleReassign(tech.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left
                      ${tech.id === selectedSPKForReassign.technicianId 
                        ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed' 
                        : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-md active:scale-98'}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {tech.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                        {tech.name}
                        {tech.id === selectedSPKForReassign.technicianId && <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">CURRENT</span>}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">{tech.specialty} • {tech.activeTasks} tasks</div>
                    </div>
                    <UserCheck className={`w-5 h-5 ${tech.id === selectedSPKForReassign.technicianId ? 'text-slate-300' : 'text-blue-600 opacity-0 group-hover:opacity-100'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedSPKForReassign(null)}
                className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SPKManager;

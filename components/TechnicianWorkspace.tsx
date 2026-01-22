
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { SPKStatus, SPK } from '../types';
import { CheckCircle, Play, Clipboard, UserCircle, Briefcase, LogIn, Loader2, X, AlertCircle, MessageSquare } from 'lucide-react';

const TechnicianWorkspace: React.FC = () => {
  const { spks, assets, updateSPKStatus, loginTechnician, logout, currentTechnician } = useApp();
  const [loginId, setLoginId] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const [editingSPK, setEditingSPK] = useState<SPK | null>(null);
  const [editNote, setEditNote] = useState('');
  const [editStatus, setEditStatus] = useState<SPKStatus>(SPKStatus.OPEN);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    const success = await loginTechnician(loginId);
    if (!success) {
      setLoginError('Invalid Technician ID. Try TECH-01, TECH-02, or TECH-03.');
    }
    setIsLoggingIn(false);
  };

  const openEditModal = (spk: SPK) => {
    setEditingSPK(spk);
    setEditNote(spk.completionNote || '');
    setEditStatus(spk.status);
  };

  const saveProgress = () => {
    if (editingSPK) {
      updateSPKStatus(editingSPK.id, editStatus, editNote);
      setEditingSPK(null);
    }
  };

  const myTasks = currentTechnician ? spks.filter(s => s.technicianId === currentTechnician.id) : [];

  if (!currentTechnician) {
    return (
      <div className="max-w-md mx-auto py-20 animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100 text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-200">
            <UserCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Personnel Login</h2>
          <p className="text-slate-500 mb-8">Access your assigned service orders</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Enter Technician ID (e.g. TECH-01)" 
                className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-slate-800
                  ${loginError ? 'border-rose-300' : 'border-slate-100'}`}
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                disabled={isLoggingIn}
              />
              {loginError && (
                <div className="flex items-center gap-1.5 text-rose-500 text-[10px] font-bold mt-2 uppercase tracking-wider px-2">
                  <AlertCircle className="w-3 h-3" />
                  {loginError}
                </div>
              )}
            </div>
            <button 
              type="submit"
              disabled={isLoggingIn || !loginId}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50"
            >
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              {isLoggingIn ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-slate-50">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enterprise Security Active</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-4">
        <div className="flex items-center gap-4">
           <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-100">
             {currentTechnician.name[0]}
           </div>
           <div>
             <h2 className="text-2xl font-bold text-slate-800">Operational Workspace</h2>
             <p className="text-slate-500 font-medium">Specialist: {currentTechnician.name} • {currentTechnician.specialty}</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Shift</p>
            <p className="text-sm font-bold text-emerald-600">Online</p>
          </div>
          <button 
            onClick={logout}
            className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myTasks.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
            <Clipboard className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold text-lg">No active service orders assigned</p>
            <p className="text-slate-300 text-sm">Contact supervisor if you believe this is an error</p>
          </div>
        )}
        
        {myTasks.map(task => {
          const asset = assets.find(a => a.id === task.assetId);
          return (
            <div key={task.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
              <div className={`h-2 ${task.priority === 'High' ? 'bg-rose-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
              <div className="p-8 flex-1 space-y-5">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold bg-slate-50 px-2.5 py-1 rounded text-slate-400 uppercase tracking-widest border border-slate-100">{task.id}</span>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                    task.status === SPKStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {task.status}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xl leading-tight">{task.title}</h4>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">{task.description}</p>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Briefcase className="w-4 h-4" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Target Asset</p>
                      <p className="text-xs font-bold">{asset?.name}</p>
                    </div>
                  </div>
                  {task.completionNote && (
                    <div className="flex items-start gap-3 text-slate-600 bg-slate-50 p-3 rounded-2xl">
                      <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Work Note</p>
                        <p className="text-xs italic text-slate-600 line-clamp-2">{task.completionNote}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-8 pb-8 pt-2">
                <button 
                  onClick={() => openEditModal(task)}
                  className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Manage Progress
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Edit Modal */}
      {editingSPK && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-10 pt-10 pb-6 flex justify-between items-center border-b border-slate-50">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Update SPK</h3>
                <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">{editingSPK.id}</p>
              </div>
              <button onClick={() => setEditingSPK(null)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <X className="w-7 h-7 text-slate-400" />
              </button>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Work Status</label>
                <div className="grid grid-cols-3 gap-3">
                  {[SPKStatus.OPEN, SPKStatus.IN_PROGRESS, SPKStatus.COMPLETED].map((status) => (
                    <button
                      key={status}
                      onClick={() => setEditStatus(status)}
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
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Work Notes / Observation</label>
                <textarea 
                  className="w-full h-40 px-6 py-4 bg-slate-50 border border-slate-100 rounded-[24px] outline-none focus:ring-4 focus:ring-blue-100 transition-all text-slate-700 resize-none font-medium"
                  placeholder="Describe parts replaced, steps taken, or issues found..."
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                />
              </div>
            </div>
            <div className="px-10 pb-10 flex gap-4">
              <button 
                onClick={() => setEditingSPK(null)}
                className="flex-1 py-4 text-slate-500 font-bold bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all"
              >
                Discard Changes
              </button>
              <button 
                onClick={saveProgress}
                className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Commit Updates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianWorkspace;


import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';
import { SPKStatus, SPK } from '../types';
import { 
  CheckCircle, Play, Clipboard, UserCircle, Briefcase, 
  LogIn, Loader2, X, AlertCircle, MessageSquare, 
  ShieldCheck, Zap, ClipboardCheck, ArrowRight, 
  Settings, Terminal, HardHat, RefreshCw, Lock, 
  History, LayoutGrid, Clock, AlertTriangle, Camera, Trash2, Image as ImageIcon
} from 'lucide-react';

const TechnicianWorkspace: React.FC = () => {
  const { spks, assets, updateSPKStatus, loginTechnician, logout, currentTechnician } = useApp();
  const [activeView, setActiveView] = useState<'active' | 'history'>('active');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const [captcha, setCaptcha] = useState({ a: 0, b: 0, sum: 0 });

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    setCaptcha({ a, b, sum: a + b });
    setCaptchaInput('');
  };

  useEffect(() => {
    if (!currentTechnician) generateCaptcha();
  }, [currentTechnician]);

  const [editingSPK, setEditingSPK] = useState<SPK | null>(null);
  const [viewingSPK, setViewingSPK] = useState<SPK | null>(null);
  const [editNote, setEditNote] = useState('');
  const [editStatus, setEditStatus] = useState<SPKStatus>(SPKStatus.OPEN);
  const [editEvidence, setEditEvidence] = useState<string[]>([]);
  const [showNoteError, setShowNoteError] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (parseInt(captchaInput) !== captcha.sum) {
      setLoginError('Verification failed. Incorrect captcha result.');
      generateCaptcha();
      return;
    }

    setIsLoggingIn(true);
    const success = await loginTechnician(loginId, password);
    if (!success) {
      setLoginError('Authentication failed. Verify Specialist ID and Password.');
      generateCaptcha();
    }
    setIsLoggingIn(false);
  };

  const openEditModal = (spk: SPK) => {
    setEditingSPK(spk);
    setEditNote(spk.completionNote || '');
    setEditStatus(spk.status);
    setEditEvidence(spk.evidence || []);
    setShowNoteError(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditEvidence(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeEvidence = (index: number) => {
    setEditEvidence(prev => prev.filter((_, i) => i !== index));
  };

  const saveProgress = () => {
    if (editingSPK) {
      if (editStatus === SPKStatus.COMPLETED && !editNote.trim()) {
        setShowNoteError(true);
        return;
      }
      updateSPKStatus(editingSPK.id, editStatus, editNote, editEvidence);
      setEditingSPK(null);
      setShowNoteError(false);
    }
  };

  const myActiveTasks = currentTechnician 
    ? spks.filter(s => s.technicianId === currentTechnician.id && s.status !== SPKStatus.COMPLETED) 
    : [];
  
  const myHistory = currentTechnician 
    ? spks.filter(s => s.technicianId === currentTechnician.id && s.status === SPKStatus.COMPLETED)
    : [];

  if (!currentTechnician) {
    return (
      <div className="max-w-6xl mx-auto py-4 md:py-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* Login screens omitted for brevity as they remain same, just logic above added */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-12 py-6">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100/50 rounded-full border border-blue-200">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Enterprise Field Service Node</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
                Specialist <span className="text-blue-600">Command</span> Portal.
              </h1>
              <p className="text-xl text-slate-500 max-w-xl leading-relaxed">
                Connect your technical expertise with the core asset ledger. Track progress, manage orders, and sync documentation in real-time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3 group hover:border-blue-200 transition-all">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Real-time Dispatch</h3>
                <p className="text-sm text-slate-500">Receive instant updates on new work orders directly to your terminal.</p>
              </div>
              <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3 group hover:border-blue-200 transition-all">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Safety Verified</h3>
                <p className="text-sm text-slate-500">Access integrated safety protocols and PPE requirements for every asset.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />
            <div className="relative bg-white p-10 rounded-[48px] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="space-y-8 relative z-10">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Personnel Access</h2>
                  <p className="text-slate-500 font-medium">Identify yourself to access the work stack.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Specialist ID Code</label>
                    <div className="relative">
                      <Terminal className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input type="text" required placeholder="e.g. TECH-01" className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-slate-800" value={loginId} onChange={(e) => setLoginId(e.target.value.toUpperCase())} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input type="password" required placeholder="••••••••" className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-slate-800" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex justify-between">Identity Verification <button type="button" onClick={generateCaptcha} className="text-blue-500 hover:text-blue-700"><RefreshCw className="w-3 h-3" /></button></label>
                    <div className="flex gap-3">
                      <div className="flex-1 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-600 text-lg border border-slate-200">{captcha.a} + {captcha.b} =</div>
                      <input type="number" required placeholder="Result" className="flex-1 px-4 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-slate-800 text-center" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} />
                    </div>
                  </div>
                  {loginError && <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black mt-2 uppercase tracking-widest px-2"><AlertCircle className="w-3.5 h-3.5" />{loginError}</div>}
                  <button type="submit" disabled={isLoggingIn} className="w-full bg-slate-900 text-white py-4.5 rounded-[20px] font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50">
                    {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />} {isLoggingIn ? 'Authenticating...' : 'Enter Workspace'}
                  </button>
                </form>
                <div className="pt-6 border-t border-slate-50">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mb-3">Quick Sign-in (Demo)</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['TECH-01', 'TECH-02', 'TECH-03'].map(id => (
                      <button key={id} onClick={() => { setLoginId(id); setPassword('password123'); setCaptchaInput((captcha.sum).toString()); }} className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg text-[10px] font-bold border border-slate-100 transition-all flex items-center gap-1">{id}<ArrowRight className="w-2.5 h-2.5" /></button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-4">
        <div className="flex items-center gap-4">
           <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-slate-100">{currentTechnician.name[0]}</div>
           <div>
             <h2 className="text-2xl font-bold text-slate-800">Operational Workspace</h2>
             <p className="text-slate-500 font-medium">Specialist: {currentTechnician.name} • {currentTechnician.specialty}</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Shift</p>
            <p className="text-sm font-bold text-emerald-600 flex items-center gap-1 justify-end"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />Connected</p>
          </div>
          <button onClick={logout} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">Log Out</button>
        </div>
      </div>

      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-[20px] w-fit">
        <button onClick={() => setActiveView('active')} className={`px-6 py-3 rounded-[14px] font-bold text-xs flex items-center gap-2 transition-all ${activeView === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><LayoutGrid className="w-4 h-4" />Active Tasks <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeView === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200'}`}>{myActiveTasks.length}</span></button>
        <button onClick={() => setActiveView('history')} className={`px-6 py-3 rounded-[14px] font-bold text-xs flex items-center gap-2 transition-all ${activeView === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><History className="w-4 h-4" />Service History <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeView === 'history' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200'}`}>{myHistory.length}</span></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeView === 'active' && myActiveTasks.map(task => {
          const asset = assets.find(a => a.id === task.assetId);
          return (
            <div key={task.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md animate-in slide-in-from-bottom-2">
              <div className={`h-2 ${task.priority === 'High' ? 'bg-rose-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
              <div className="p-8 flex-1 space-y-5">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold bg-slate-50 px-2.5 py-1 rounded text-slate-400 uppercase tracking-widest border border-slate-100">{task.id}</span>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${task.status === SPKStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{task.status}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xl leading-tight">{task.title}</h4>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">{task.description}</p>
                </div>
                <div className="space-y-3 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Briefcase className="w-4 h-4" /></div>
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Target Asset</p><p className="text-xs font-bold">{asset?.name}</p></div>
                  </div>
                  {task.evidence && task.evidence.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{task.evidence.length} Evidence Photos</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-8 pb-8 pt-2">
                <button onClick={() => openEditModal(task)} className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95"><Play className="w-4 h-4 fill-current" />Manage Progress</button>
              </div>
            </div>
          );
        })}
        
        {activeView === 'history' && myHistory.map(task => {
          const asset = assets.find(a => a.id === task.assetId);
          return (
            <div key={task.id} className="bg-white/60 rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col grayscale-[0.5] hover:grayscale-0 transition-all hover:shadow-md animate-in slide-in-from-bottom-2">
              <div className="h-2 bg-emerald-500/30" />
              <div className="p-8 flex-1 space-y-5">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold bg-slate-50 px-2.5 py-1 rounded text-slate-400 uppercase tracking-widest border border-slate-100">{task.id}</span>
                  <div className="flex items-center gap-1.5 text-emerald-600"><CheckCircle className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-widest">Done</span></div>
                </div>
                <div><h4 className="font-bold text-slate-800 text-lg leading-tight">{task.title}</h4><p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{task.description}</p></div>
                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-slate-600"><div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Briefcase className="w-4 h-4" /></div><div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Target Asset</p><p className="text-[10px] font-bold">{asset?.name}</p></div></div>
                  {task.completionNote && <div className="flex items-start gap-3 text-slate-600 bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/30"><MessageSquare className="w-4 h-4 text-emerald-600/50 mt-0.5" /><div><p className="text-[10px] font-bold text-emerald-600/50 uppercase tracking-tighter">Final Note</p><p className="text-xs italic text-slate-600 line-clamp-3">{task.completionNote}</p></div></div>}
                  <div className="flex items-center gap-2 text-slate-400"><Clock className="w-3.5 h-3.5" /><p className="text-[10px] font-bold uppercase tracking-widest">Completed {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'Unknown Date'}</p></div>
                </div>
              </div>
              <div className="px-8 pb-8 pt-2"><button onClick={() => setViewingSPK(task)} className="w-full py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2">View Completion Details</button></div>
            </div>
          );
        })}
      </div>

      {/* Progress Edit Modal */}
      {editingSPK && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-10 pt-10 pb-6 flex justify-between items-center border-b border-slate-50 shrink-0">
              <div><h3 className="text-2xl font-bold text-slate-800">Update SPK Progress</h3><p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">{editingSPK.id}</p></div>
              <button onClick={() => setEditingSPK(null)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X className="w-7 h-7 text-slate-400" /></button>
            </div>
            
            <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Work Status</label>
                <div className="grid grid-cols-3 gap-3">
                  {[SPKStatus.OPEN, SPKStatus.IN_PROGRESS, SPKStatus.COMPLETED].map((status) => (
                    <button key={status} onClick={() => { setEditStatus(status); if (status !== SPKStatus.COMPLETED) setShowNoteError(false); }} className={`py-3 rounded-2xl font-bold text-xs border-2 transition-all ${editStatus === status ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'}`}>{status}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end px-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Work Notes / Observation</label>
                  {editStatus === SPKStatus.COMPLETED && <span className="text-[10px] font-black text-rose-500 uppercase flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Required for Completion</span>}
                </div>
                <textarea className={`w-full h-32 px-6 py-4 bg-slate-50 border rounded-[24px] outline-none focus:ring-4 transition-all text-slate-700 resize-none font-medium ${showNoteError ? 'border-rose-500 focus:ring-rose-100' : 'border-slate-100 focus:ring-blue-100'}`} placeholder={editStatus === SPKStatus.COMPLETED ? "Please provide a final report..." : "Describe current findings..."} value={editNote} onChange={(e) => { setEditNote(e.target.value); if (e.target.value.trim()) setShowNoteError(false); }} />
                {showNoteError && <p className="text-[10px] font-black text-rose-500 uppercase px-2 flex items-center gap-1 animate-pulse"><AlertCircle className="w-3 h-3" />Operational log is required to finalize this SPK</p>}
              </div>

              {/* Photo Evidence Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Camera className="w-3.5 h-3.5" />Photo Evidence</label>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{editEvidence.length} Attachments</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {editEvidence.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button onClick={() => removeEvidence(idx)} className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all group">
                    <div className="p-3 bg-slate-50 rounded-full group-hover:bg-blue-100 transition-colors"><Camera className="w-6 h-6" /></div>
                    <span className="text-[10px] font-black uppercase">Add Photo</span>
                  </button>
                </div>
                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
            </div>

            <div className="px-10 pb-10 flex gap-4 shrink-0 bg-white border-t border-slate-50 pt-6">
              <button onClick={() => setEditingSPK(null)} className="flex-1 py-4 text-slate-500 font-bold bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">Discard</button>
              <button onClick={saveProgress} className={`flex-[2] py-4 font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 ${editStatus === SPKStatus.COMPLETED ? 'bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700' : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'}`}><CheckCircle className="w-5 h-5" />{editStatus === SPKStatus.COMPLETED ? 'Finalize & Close' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal for History with evidence display */}
      {viewingSPK && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-10 pt-10 pb-6 flex justify-between items-center border-b border-slate-50">
              <div><h3 className="text-2xl font-bold text-slate-800">Task Audit</h3><p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">{viewingSPK.id}</p></div>
              <button onClick={() => setViewingSPK(null)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X className="w-7 h-7 text-slate-400" /></button>
            </div>
            <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-4">
                <div className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Completion Summary</p></div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <h4 className="font-bold text-slate-800 text-lg mb-2">{viewingSPK.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{viewingSPK.description}</p>
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Final Report</p>
                    <p className="text-sm text-slate-800 italic bg-white p-4 rounded-xl border border-slate-100">{viewingSPK.completionNote || "No notes."}</p>
                  </div>
                </div>
              </div>

              {viewingSPK.evidence && viewingSPK.evidence.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Attached Evidence</p></div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {viewingSPK.evidence.map((img, i) => (
                      <div key={i} className="aspect-video rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                        <img src={img} className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer" alt="Evidence" onClick={() => window.open(img)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-10 pb-10"><button onClick={() => setViewingSPK(null)} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all">Close Audit</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianWorkspace;

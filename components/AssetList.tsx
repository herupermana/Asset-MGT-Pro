
import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, X, Scan, Pencil, Trash2, Box, Layers, MapPin, Activity, Terminal, ExternalLink, Loader2, CameraOff, Camera, Upload, Image as ImageIcon, Save, Check, ShieldAlert, RefreshCw } from 'lucide-react';
import { useApp } from '../AppContext';
import { Asset, AssetStatus, SPKStatus } from '../types';
import AssetDetail from './AssetDetail';
import SPKDetail from './SPKDetail';
import jsQR from 'jsqr';

const AssetList: React.FC = () => {
  const { assets, addAsset, updateAsset, deleteAsset, categories, locations, createSPK, technicians, globalSearchQuery, setGlobalSearchQuery, currentTechnician, t } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [viewingSPKInDetail, setViewingSPKInDetail] = useState<any>(null);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);

  const isAdmin = !currentTechnician;

  // Form State for Add/Edit
  const [assetForm, setAssetForm] = useState({ 
    id: '',
    name: '', 
    category: categories[0] || '', 
    location: locations[0] || '', 
    status: AssetStatus.OPERATIONAL,
    imageUrl: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    arrivedDate: new Date().toISOString().split('T')[0],
    lastMaintenance: ''
  });

  const assetFileInputRef = useRef<HTMLInputElement>(null);

  // Scanner Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanFrameRef = useRef<number>(0);

  useEffect(() => {
    if (isScannerOpen) {
      startScanner();
    } else {
      stopScanner();
    }
    return () => stopScanner();
  }, [isScannerOpen]);

  useEffect(() => {
    if (assetToEdit) {
      setAssetForm({
        id: assetToEdit.id,
        name: assetToEdit.name,
        category: assetToEdit.category,
        location: assetToEdit.location,
        status: assetToEdit.status,
        imageUrl: assetToEdit.imageUrl,
        purchaseDate: assetToEdit.purchaseDate,
        arrivedDate: assetToEdit.arrivedDate,
        lastMaintenance: assetToEdit.lastMaintenance
      });
      setIsModalOpen(true);
    }
  }, [assetToEdit]);

  const startScanner = async () => {
    setPermissionStatus('pending');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        setPermissionStatus('granted');
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.play();
        scanFrameRef.current = requestAnimationFrame(tick);
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setPermissionStatus('denied');
    }
  };

  const stopScanner = () => {
    if (scanFrameRef.current) cancelAnimationFrame(scanFrameRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          const found = assets.find(a => a.id === code.data);
          if (found) {
            setViewingAsset(found);
            setIsScannerOpen(false);
            return;
          }
        }
      }
    }
    scanFrameRef.current = requestAnimationFrame(tick);
  };

  const handleAssetImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAssetForm(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (assetToEdit) {
      updateAsset({
        ...assetForm,
        id: assetToEdit.id
      });
      if (viewingAsset && viewingAsset.id === assetToEdit.id) {
        setViewingAsset({ ...assetForm, id: assetToEdit.id });
      }
    } else {
      const id = `AST-${Math.floor(1000 + Math.random() * 9000)}`;
      addAsset({
        ...assetForm,
        id,
        imageUrl: assetForm.imageUrl || `https://picsum.photos/seed/${id}/400/300`,
        lastMaintenance: 'Never'
      });
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAssetToEdit(null);
    setAssetForm({
      id: '',
      name: '', 
      category: categories[0] || '', 
      location: locations[0] || '', 
      status: AssetStatus.OPERATIONAL,
      imageUrl: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      arrivedDate: new Date().toISOString().split('T')[0],
      lastMaintenance: ''
    });
  };

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes((searchTerm || globalSearchQuery).toLowerCase()) ||
    a.id.toLowerCase().includes((searchTerm || globalSearchQuery).toLowerCase())
  );

  if (viewingSPKInDetail) return <SPKDetail spk={viewingSPKInDetail} onBack={() => setViewingSPKInDetail(null)} onReassign={() => {}} />;
  if (viewingAsset) return <AssetDetail asset={viewingAsset} onBack={() => setViewingAsset(null)} onEdit={setAssetToEdit} onReportIssue={(a) => { setViewingAsset(null); setGlobalSearchQuery(a.id); }} onViewSPK={setViewingSPKInDetail} />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 text-blue-400 font-black text-xs uppercase tracking-[0.3em] mb-2">
            <Layers className="w-4 h-4" />
            Central Data Ledger
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase text-glow-blue">Physical <span className="text-blue-500">Inventory</span></h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="px-6 py-3.5 glass-card rounded-2xl flex items-center gap-3 text-slate-300 font-bold border border-white/5 transition-all hover:border-blue-500/30 active:scale-95 shadow-xl shadow-black/20"
          >
            <Scan className="w-5 h-5 text-blue-400" />
            Launch Scanner
          </button>
          {isAdmin && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs hover:bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Register Asset
            </button>
          )}
        </div>
      </div>

      <div className="glass-card p-4 rounded-[32px] border-white/5 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/5 border border-white/5 transition-all group-within:border-blue-500/50">
            <Search className="text-slate-500 w-4 h-4" />
          </div>
          <input 
            type="text" 
            placeholder="Query inventory records by name or ID..."
            className="w-full pl-16 pr-6 py-4 bg-transparent text-white rounded-2xl outline-none placeholder:text-slate-600 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {(globalSearchQuery) && (
          <div className="flex items-center gap-3 px-6 py-2 bg-blue-500/10 text-blue-400 rounded-2xl text-xs font-black uppercase border border-blue-500/20">
            Active Filter: {globalSearchQuery}
            <button onClick={() => setGlobalSearchQuery('')} className="hover:text-white transition-colors"><X className="w-4 h-4"/></button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredAssets.map((asset) => (
          <div 
            key={asset.id} 
            onClick={() => setViewingAsset(asset)}
            className="glass-card rounded-[40px] border-white/5 overflow-hidden group cursor-pointer hover:border-blue-500/30 transition-all duration-500 relative"
          >
            <div className="absolute top-4 right-4 z-10">
              <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border backdrop-blur-md ${
                asset.status === AssetStatus.OPERATIONAL ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                asset.status === AssetStatus.MAINTENANCE ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                asset.status === AssetStatus.REPAIR ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {asset.status}
              </span>
            </div>
            
            <div className="h-56 overflow-hidden relative">
              <img src={asset.imageUrl} alt={asset.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent opacity-60" />
            </div>

            <div className="p-8 space-y-6">
              <div>
                <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">{asset.id}</div>
                <h3 className="text-xl font-extrabold text-white group-hover:text-blue-400 transition-colors leading-tight line-clamp-1">{asset.name}</h3>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-500">
                  <Layers className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-tight">{asset.category}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="w-4 h-4 text-rose-500/50" />
                  <span className="text-xs font-bold uppercase tracking-tight">{asset.location}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400/50" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Diagnostics: OK</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QR SCANNER MODAL */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl">
          <div className="max-w-xl w-full glass-card rounded-[48px] overflow-hidden border-white/10 animate-in zoom-in-95">
             <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="p-2.5 bg-blue-500/20 rounded-2xl text-blue-400">
                      <Scan className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-white">Asset Identity Scan</h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Pointing camera at QR Tag</p>
                   </div>
                </div>
                <button onClick={() => setIsScannerOpen(false)} className="p-3 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-all">
                   <X className="w-6 h-6" />
                </button>
             </div>
             
             <div className="relative aspect-square bg-black overflow-hidden">
                {permissionStatus === 'denied' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-6">
                    <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 border border-rose-500/20">
                      <ShieldAlert className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-black text-white uppercase tracking-tight">Access Interrupted</h4>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed">The browser denied camera access. Please update your permission settings for this site to use the scanner.</p>
                    </div>
                    <button 
                      onClick={startScanner}
                      className="px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs border border-white/10 transition-all active:scale-95"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Grant Permission
                    </button>
                  </div>
                ) : (
                  <>
                    <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Scanner Overlay UI */}
                    <div className="absolute inset-0 border-[60px] border-black/40 pointer-events-none flex items-center justify-center">
                       <div className="w-full h-full border-2 border-blue-500/50 rounded-3xl relative">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-blue-500 shadow-[0_0_15px_#3b82f6] animate-[scanline_2s_infinite]" />
                       </div>
                    </div>
                  </>
                )}
                
                <style>{`
                   @keyframes scanline {
                      0% { top: 0; }
                      100% { top: 100%; }
                   }
                `}</style>
             </div>
             
             <div className="p-10 text-center">
                <div className="flex items-center justify-center gap-3 text-slate-400">
                   {permissionStatus === 'pending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4 text-blue-500" />}
                   <p className="text-sm font-bold">{permissionStatus === 'granted' ? 'Parsing physical tag data...' : 'Awaiting sensor authorization...'}</p>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* MANAGE ASSET MODAL (ADD/EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto custom-scrollbar">
           <div className="max-w-3xl w-full glass-card rounded-[48px] overflow-hidden border-white/10 animate-in zoom-in-95 my-8">
              <div className="p-10 border-b border-white/5 flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                        {assetToEdit ? 'Update Asset Record' : 'Register New Asset'}
                    </h3>
                    {assetToEdit && <p className="text-xs text-blue-500 font-black uppercase mt-1 tracking-widest">Target Node: {assetToEdit.id}</p>}
                 </div>
                 <button onClick={closeModal} className="p-2 text-slate-500 hover:text-white transition-colors"><X className="w-8 h-8" /></button>
              </div>
              <form onSubmit={handleSaveAsset} className="p-10 md:p-12 space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Identity Photo</label>
                    <div 
                       onClick={() => assetFileInputRef.current?.click()}
                       className={`relative group aspect-video rounded-[32px] border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center
                          ${assetForm.imageUrl ? 'border-blue-500/50' : 'border-white/10 hover:border-blue-500/30 bg-white/5 hover:bg-white/10'}`}
                    >
                       {assetForm.imageUrl ? (
                          <>
                             <img src={assetForm.imageUrl} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <p className="text-white font-black text-xs uppercase tracking-widest">Change Image</p>
                             </div>
                          </>
                       ) : (
                          <div className="text-center space-y-4 p-8">
                             <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mx-auto transition-transform group-hover:scale-110">
                                <Camera className="w-8 h-8" />
                             </div>
                             <div>
                                <p className="text-white font-bold">Capture or Upload Photo</p>
                                <p className="text-slate-500 text-xs mt-1">Provide visual evidence for the global ledger</p>
                             </div>
                          </div>
                       )}
                    </div>
                    <input 
                       ref={assetFileInputRef} 
                       type="file" 
                       accept="image/*" 
                       className="hidden" 
                       onChange={handleAssetImageChange} 
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Nomenclature</label>
                    <input 
                       required 
                       placeholder="e.g. Cisco Nexus 9000 Switch" 
                       className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/20 outline-none text-white font-bold" 
                       value={assetForm.name} 
                       onChange={e => setAssetForm({...assetForm, name: e.target.value})} 
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Classification</label>
                       <select className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none appearance-none" value={assetForm.category} onChange={e => setAssetForm({...assetForm, category: e.target.value})}>
                          {categories.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Deployment Zone</label>
                       <select className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none appearance-none" value={assetForm.location} onChange={e => setAssetForm({...assetForm, location: e.target.value})}>
                          {locations.map(l => <option key={l} value={l} className="bg-slate-900">{l}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Operational Status</label>
                       <select className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none appearance-none" value={assetForm.status} onChange={e => setAssetForm({...assetForm, status: e.target.value as AssetStatus})}>
                          {Object.values(AssetStatus).map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Purchase Log Date</label>
                       <input 
                          type="date"
                          className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none" 
                          value={assetForm.purchaseDate} 
                          onChange={e => setAssetForm({...assetForm, purchaseDate: e.target.value})} 
                       />
                    </div>
                 </div>

                 <div className="pt-8 flex gap-4">
                    <button type="button" onClick={closeModal} className="flex-1 py-5 bg-white/5 text-slate-400 font-black rounded-2xl hover:bg-white/10 transition-colors uppercase tracking-widest text-xs">Abort</button>
                    <button type="submit" className="flex-[2] py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                       {assetToEdit ? <><Save className="w-5 h-5" /> Commit Updates</> : <><Plus className="w-5 h-5" /> Authorize Registration</>}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AssetList;


import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, X, Scan, Pencil, Trash2, Box, Layers, MapPin, Activity, Terminal, ExternalLink, Loader2, CameraOff } from 'lucide-react';
import { useApp } from '../AppContext';
import { Asset, AssetStatus, SPKStatus } from '../types';
import AssetDetail from './AssetDetail';
import SPKDetail from './SPKDetail';
import jsQR from 'jsqr';

const AssetList: React.FC = () => {
  const { assets, addAsset, updateAsset, deleteAsset, categories, locations, createSPK, technicians, globalSearchQuery, setGlobalSearchQuery, currentTechnician } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [viewingSPKInDetail, setViewingSPKInDetail] = useState<any>(null);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);

  const isAdmin = !currentTechnician;

  const [newAsset, setNewAsset] = useState({ 
    name: '', 
    category: categories[0] || '', 
    location: locations[0] || '', 
    status: AssetStatus.OPERATIONAL,
    purchaseDate: new Date().toISOString().split('T')[0],
    arrivedDate: new Date().toISOString().split('T')[0]
  });

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

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.play();
        scanFrameRef.current = requestAnimationFrame(tick);
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Unable to access camera. Please check permissions.");
      setIsScannerOpen(false);
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

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `AST-${Math.floor(1000 + Math.random() * 9000)}`;
    addAsset({
      ...newAsset,
      id,
      imageUrl: `https://picsum.photos/seed/${id}/400/300`,
      lastMaintenance: 'Never'
    });
    setIsModalOpen(false);
  };

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes((searchTerm || globalSearchQuery).toLowerCase()) ||
    a.id.toLowerCase().includes((searchTerm || globalSearchQuery).toLowerCase())
  );

  if (viewingSPKInDetail) return <SPKDetail spk={viewingSPKInDetail} onBack={() => setViewingSPKInDetail(null)} onReassign={() => {}} />;
  if (viewingAsset) return <AssetDetail asset={viewingAsset} onBack={() => setViewingAsset(found => { if(found?.id === viewingAsset.id) return null; return found; })} onEdit={setAssetToEdit} onReportIssue={(a) => { setViewingAsset(null); setGlobalSearchQuery(a.id); /* This forces navigation elsewhere if needed */ }} onViewSPK={setViewingSPKInDetail} />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 text-blue-400 font-black text-xs uppercase tracking-[0.3em] mb-2">
            <Layers className="w-4 h-4" />
            Central Data Ledger
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase text-glow">Physical <span className="text-blue-500">Inventory</span></h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="px-6 py-3.5 glass-card-hover rounded-2xl flex items-center gap-3 text-slate-300 font-bold border border-white/5 transition-all active:scale-95 shadow-xl shadow-black/20"
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
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Scanner Overlay UI */}
                <div className="absolute inset-0 border-[60px] border-black/40 pointer-events-none flex items-center justify-center">
                   <div className="w-full h-full border-2 border-blue-500/50 rounded-3xl relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-blue-500 shadow-[0_0_15px_#3b82f6] animate-[scanline_2s_infinite]" />
                   </div>
                </div>
                
                <style>{`
                   @keyframes scanline {
                      0% { top: 0; }
                      100% { top: 100%; }
                   }
                `}</style>
             </div>
             
             <div className="p-10 text-center">
                <div className="flex items-center justify-center gap-3 text-slate-400">
                   <Loader2 className="w-4 h-4 animate-spin" />
                   <p className="text-sm font-bold">Parsing physical tag data...</p>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* REGISTRATION MODAL (Same as previous but harmonized theme) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
           <div className="max-w-2xl w-full glass-card rounded-[48px] overflow-hidden border-white/10 animate-in zoom-in-95">
              <div className="p-10 border-b border-white/5 flex justify-between items-center">
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight">Register New Asset</h3>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-500 hover:text-white"><X className="w-8 h-8" /></button>
              </div>
              <form onSubmit={handleAddAsset} className="p-12 space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Nomenclature</label>
                    <input required placeholder="e.g. Cisco Nexus 9000 Switch" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/20 outline-none text-white font-bold" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Classification</label>
                       <select className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none" value={newAsset.category} onChange={e => setNewAsset({...newAsset, category: e.target.value})}>
                          {categories.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Deployment Zone</label>
                       <select className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none" value={newAsset.location} onChange={e => setNewAsset({...newAsset, location: e.target.value})}>
                          {locations.map(l => <option key={l} value={l} className="bg-slate-900">{l}</option>)}
                       </select>
                    </div>
                 </div>
                 <div className="pt-8 flex gap-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-white/5 text-slate-400 font-black rounded-2xl hover:bg-white/10">Abort</button>
                    <button type="submit" className="flex-[2] py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-500 active:scale-95 transition-all">Authorize Registration</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AssetList;

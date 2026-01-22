
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Tag, Box, PenTool, CheckCircle2, Clock, AlertCircle, Info, ChevronRight, History, User, QrCode, Download, ShieldCheck, Pencil, Trash2, Truck } from 'lucide-react';
import { useApp } from '../AppContext';
import { Asset, SPK, SPKStatus, AssetStatus } from '../types';
import QRCode from 'qrcode';

interface AssetDetailProps {
  asset: Asset;
  onBack: () => void;
  onEdit: (asset: Asset) => void;
  onReportIssue: (asset: Asset) => void;
  onViewSPK: (spk: SPK) => void;
}

const AssetDetail: React.FC<AssetDetailProps> = ({ asset, onBack, onEdit, onReportIssue, onViewSPK }) => {
  const { spks, technicians, currentTechnician, deleteAsset, setGlobalSearchQuery } = useApp();
  const [showTooltip, setShowTooltip] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const isAdmin = !currentTechnician;

  const assetHistory = spks
    .filter(s => s.assetId === asset.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const latestActiveSPK = assetHistory.find(s => s.status !== SPKStatus.COMPLETED && s.status !== SPKStatus.CANCELLED);
  
  // Find the most relevant note for the status tooltip
  const lastSpk = assetHistory[0];
  const maintenanceNote = lastSpk 
    ? (lastSpk.status === SPKStatus.COMPLETED ? (lastSpk.completionNote || "Service completed without specific notes.") : lastSpk.description)
    : "No maintenance history recorded for this node.";

  useEffect(() => {
    const generateQr = async () => {
      try {
        const url = await QRCode.toDataURL(asset.id, {
          margin: 2, width: 400,
          color: { dark: '#ffffff', light: '#020617' },
        });
        setQrDataUrl(url);
      } catch (err) { console.error(err); }
    };
    generateQr();
  }, [asset.id]);

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `Tag-${asset.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReportIssue = () => {
    // Set a global flag that SPK Manager can pick up
    setGlobalSearchQuery(asset.id);
    onReportIssue(asset);
  };

  const isOffline = asset.status === AssetStatus.MAINTENANCE || asset.status === AssetStatus.REPAIR;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-slate-400">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{asset.name}</h2>
              <div 
                className="relative inline-block"
                onMouseEnter={() => isOffline && setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border cursor-help ${
                  asset.status === AssetStatus.OPERATIONAL ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                  asset.status === AssetStatus.MAINTENANCE ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  asset.status === AssetStatus.REPAIR ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {asset.status}
                </span>

                {showTooltip && (
                  <div className="absolute left-0 top-full mt-3 z-50 w-64 p-5 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center gap-2 mb-3 text-blue-400">
                      <Info className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Service Context</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed italic font-medium">
                      "{maintenanceNote}"
                    </p>
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                       <span className="text-[9px] font-bold text-slate-500 uppercase">Last Log: {lastSpk?.id || 'N/A'}</span>
                    </div>
                    {/* Tooltip Arrow */}
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-slate-900 border-t border-l border-white/10 rotate-45" />
                  </div>
                )}
              </div>
            </div>
            <p className="text-slate-500 font-bold tracking-widest uppercase text-xs mt-1">Unique Identifier: {asset.id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {!isAdmin && (
             <button 
              onClick={handleReportIssue}
              className="px-8 py-4 bg-amber-600 text-white rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs hover:bg-amber-500 shadow-xl active:scale-95 transition-all"
            >
              <PenTool className="w-5 h-5" />
              Signal Fault
            </button>
          )}
          {isAdmin && (
            <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
               <button onClick={() => onEdit(asset)} className="p-4 hover:bg-blue-500/10 text-blue-400 rounded-xl transition-all"><Pencil className="w-5 h-5" /></button>
               <button onClick={() => setConfirmDelete(true)} className="p-4 hover:bg-rose-500/10 text-rose-400 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
           <div className="glass-card rounded-[48px] overflow-hidden border-white/5 h-[450px]">
              <img src={asset.imageUrl} className="w-full h-full object-cover" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="glass-card p-10 rounded-[48px] border-white/5 space-y-8">
                 <h3 className="text-xl font-black text-white uppercase flex items-center gap-3">
                   <ShieldCheck className="w-5 h-5 text-blue-400" />
                   Ledger Specs
                 </h3>
                 <div className="space-y-6">
                    <div className="flex items-start gap-4">
                       <div className="p-3 bg-white/5 rounded-2xl text-slate-500"><Tag className="w-5 h-5" /></div>
                       <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</p><p className="text-lg font-bold text-white">{asset.category}</p></div>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="p-3 bg-white/5 rounded-2xl text-slate-500"><MapPin className="w-5 h-5" /></div>
                       <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Zone</p><p className="text-lg font-bold text-white">{asset.location}</p></div>
                    </div>
                 </div>
              </div>

              <div className="glass-card p-10 rounded-[48px] border-white/5 flex flex-col items-center justify-center text-center space-y-6">
                 <div className="p-4 bg-white rounded-3xl group cursor-pointer relative shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                    <img src={qrDataUrl} className="w-32 h-32" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Encrypted Tag</p>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{asset.id}</p>
                 </div>
                 <button onClick={handleDownloadQr} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all">Download Media Tag</button>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4">
           <div className="glass-card p-10 rounded-[48px] border-white/5 h-full space-y-8">
              <h3 className="text-xl font-black text-white uppercase flex items-center gap-3">
                 <History className="w-5 h-5 text-slate-500" />
                 Audit Trail
              </h3>
              <div className="space-y-4">
                 {assetHistory.map(spk => (
                    <button key={spk.id} onClick={() => onViewSPK(spk)} className="w-full p-6 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/5 text-left transition-all group">
                       <div className="flex justify-between items-center mb-2">
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{spk.id}</p>
                          <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-blue-500 transition-all" />
                       </div>
                       <p className="font-bold text-white line-clamp-1">{spk.title}</p>
                       <p className="text-xs text-slate-500 font-bold mt-1 uppercase">{new Date(spk.createdAt).toLocaleDateString()}</p>
                    </button>
                 ))}
                 {assetHistory.length === 0 && <p className="text-center py-20 text-slate-700 font-bold text-sm">No maintenance logged</p>}
              </div>
           </div>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
           <div className="max-w-md w-full glass-card p-10 rounded-[48px] text-center border-white/10 space-y-8 animate-in zoom-in-95">
              <div className="w-20 h-20 bg-rose-500/20 rounded-3xl flex items-center justify-center text-rose-500 mx-auto border border-rose-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                 <AlertCircle className="w-10 h-10" />
              </div>
              <div>
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight">Sever Asset Node?</h3>
                 <p className="text-slate-400 font-medium mt-2 leading-relaxed">This action will remove <b>{asset.name}</b> and all associated service logs from the global terminal. This cannot be reversed.</p>
              </div>
              <div className="flex flex-col gap-3">
                 <button onClick={() => { deleteAsset(asset.id); onBack(); }} className="w-full py-5 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-500 shadow-xl shadow-rose-900/20">Authorize Deletion</button>
                 <button onClick={() => setConfirmDelete(false)} className="w-full py-5 bg-white/5 text-slate-400 font-black rounded-2xl hover:bg-white/10">Abort</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetail;

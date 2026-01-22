
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
  const { spks, technicians, currentTechnician, deleteAsset } = useApp();
  const [showTooltip, setShowTooltip] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const isAdmin = !currentTechnician;

  // Filter SPKs related to this specific asset
  const assetHistory = spks
    .filter(s => s.assetId === asset.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Find the latest active SPK for maintenance/repair details
  const latestActiveSPK = assetHistory.find(s => s.status !== SPKStatus.COMPLETED && s.status !== SPKStatus.CANCELLED);

  useEffect(() => {
    const generateQr = async () => {
      try {
        const url = await QRCode.toDataURL(asset.id, {
          margin: 2,
          width: 400,
          color: {
            dark: '#0f172a', // slate-900
            light: '#ffffff',
          },
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error(err);
      }
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

  const getStatusIcon = (status: SPKStatus) => {
    switch (status) {
      case SPKStatus.IN_PROGRESS: return <Clock className="w-4 h-4 text-blue-500" />;
      case SPKStatus.COMPLETED: return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case SPKStatus.OPEN: return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default: return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getAssetStatusColor = (status: AssetStatus) => {
    switch (status) {
      case AssetStatus.OPERATIONAL: return 'bg-emerald-100 text-emerald-700';
      case AssetStatus.MAINTENANCE: return 'bg-amber-100 text-amber-700';
      case AssetStatus.REPAIR: return 'bg-orange-100 text-orange-700';
      case AssetStatus.BROKEN: return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleDelete = () => {
    deleteAsset(asset.id);
    onBack();
  };

  const needsTooltip = asset.status === AssetStatus.MAINTENANCE || asset.status === AssetStatus.REPAIR;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all text-slate-500"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-3 relative">
              <h2 className="text-3xl font-bold text-slate-800">{asset.name}</h2>
              <div 
                className="relative"
                onMouseEnter={() => needsTooltip && setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 cursor-help ${getAssetStatusColor(asset.status)}`}>
                  {asset.status}
                  {needsTooltip && <Info className="w-3 h-3 opacity-60" />}
                </span>

                {/* Status Tooltip */}
                {showTooltip && latestActiveSPK && (
                  <div className="absolute top-full left-0 mt-2 w-64 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl z-20 animate-in zoom-in-95 duration-200 origin-top-left">
                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Current Task</div>
                    <div className="font-bold text-sm mb-1">{latestActiveSPK.title}</div>
                    <div className="text-xs text-slate-300 leading-relaxed mb-2">{latestActiveSPK.description}</div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                       <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px]">
                         {technicians.find(t => t.id === latestActiveSPK.technicianId)?.name[0] || '?'}
                       </div>
                       <div className="text-[10px] text-slate-400">Assigned to: <span className="text-slate-200">{technicians.find(t => t.id === latestActiveSPK.technicianId)?.name || 'Unassigned'}</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-slate-500 font-medium mt-1">Asset ID: {asset.id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
               <button 
                 onClick={() => onEdit(asset)} 
                 className="p-3 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors"
                 title="Edit Specifications"
               >
                 <Pencil className="w-5 h-5" />
               </button>
               <button 
                 onClick={() => setConfirmDelete(true)} 
                 className="p-3 hover:bg-rose-50 text-rose-600 rounded-xl transition-colors"
                 title="Delete Asset"
               >
                 <Trash2 className="w-5 h-5" />
               </button>
            </div>
          ) : (
            <button 
              onClick={() => onReportIssue(asset)}
              className="bg-amber-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-amber-700 transition-all shadow-lg shadow-amber-200 active:scale-95 font-bold"
            >
              <PenTool className="w-5 h-5" />
              Report Maintenance Issue
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visual & Core Data */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm">
            <img 
              src={asset.imageUrl} 
              alt={asset.name} 
              className="w-full h-96 object-cover bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Technical Specs */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm h-full">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Box className="w-5 h-5 text-blue-600" />
                Specifications
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-2xl">
                    <Tag className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Category</p>
                    <p className="text-lg font-semibold text-slate-700">{asset.category}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-50 rounded-2xl">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Physical Location</p>
                    <p className="text-lg font-semibold text-slate-700">{asset.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-2xl">
                    <Calendar className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Acquisition Date</p>
                    <p className="text-lg font-semibold text-slate-700">{new Date(asset.purchaseDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                  </div>
                </div>
                {/* Arrival Info Section */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 rounded-2xl">
                    <Truck className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Arrival Date</p>
                    <p className="text-lg font-semibold text-slate-700">{new Date(asset.arrivedDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Asset Tag Identity */}
            <div className="bg-slate-900 p-8 rounded-[32px] shadow-xl text-white flex flex-col items-center justify-center text-center">
              <div className="bg-white p-3 rounded-2xl mb-4 group cursor-pointer relative shadow-2xl shadow-white/5 overflow-hidden">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Tag" className="w-40 h-40 transition-transform group-hover:scale-105" />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-slate-200 animate-pulse" />
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Download className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-2">Digital Asset Identity</p>
                <p className="text-lg font-bold tracking-tight">{asset.id}</p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Enterprise Verified Tag
                </div>
              </div>
              <button 
                onClick={handleDownloadQr}
                className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-white/5 active:scale-95"
              >
                <Download className="w-4 h-4" />
                Download Tag
              </button>
            </div>
          </div>
        </div>

        {/* Chronological Service History Sidebar */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-800 px-2 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            Service History
          </h3>
          <div className="space-y-4">
            {assetHistory.length > 0 ? (
              assetHistory.map((spk) => {
                const tech = technicians.find(t => t.id === spk.technicianId);
                return (
                  <button 
                    key={spk.id} 
                    onClick={() => onViewSPK(spk)}
                    className="w-full text-left bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group flex flex-col relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {spk.id}
                      </div>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(spk.status)}
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{spk.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{spk.title}</h4>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">{spk.description}</p>
                    
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-50">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[12px] font-bold text-blue-600 border border-blue-100">
                        {tech?.name[0]}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-slate-700 truncate">{tech?.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{new Date(spk.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400">No maintenance records found for this asset.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation in Detail View */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">Confirm Deletion</h3>
                <p className="text-slate-500 leading-relaxed">
                  Removing <b>{asset.name}</b> will archive its data and disconnect it from active tracking. Continue?
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDelete}
                  className="w-full py-4 bg-rose-600 text-white font-bold rounded-2xl shadow-xl shadow-rose-100 hover:bg-rose-700 active:scale-95 transition-all"
                >
                  Confirm Removal
                </button>
                <button 
                  onClick={() => setConfirmDelete(false)}
                  className="w-full py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetail;

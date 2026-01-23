
import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, X, Scan, Pencil, Trash2, Box, Layers, MapPin, Activity, Terminal, ExternalLink, Loader2, CameraOff, Camera, Upload, Image as ImageIcon, Save, Check, ShieldAlert, RefreshCw, QrCode, Download, Printer } from 'lucide-react';
import { useApp } from '../AppContext';
import { Asset, AssetStatus, SPKStatus } from '../types';
import AssetDetail from './AssetDetail';
import SPKDetail from './SPKDetail';
import jsQR from 'jsqr';
import QRCode from 'qrcode';

const AssetList: React.FC = () => {
  const { assets, addAsset, updateAsset, deleteAsset, categories, locations, createSPK, technicians, globalSearchQuery, setGlobalSearchQuery, currentTechnician, t } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [viewingSPKInDetail, setViewingSPKInDetail] = useState<any>(null);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  
  const [qrModalAsset, setQrModalAsset] = useState<Asset | null>(null);
  const [tempQrUrl, setTempQrUrl] = useState<string>('');

  const isAdmin = !currentTechnician;

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

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanFrameRef = useRef<number>(0);

  // Listen for global FAB triggers
  useEffect(() => {
    const handleAddTrigger = (e: any) => {
      if (e.detail.tab === 'assets') setIsModalOpen(true);
    };
    window.addEventListener('trigger-add-modal', handleAddTrigger);
    return () => window.removeEventListener('trigger-add-modal', handleAddTrigger);
  }, []);

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

  const generateQuickQR = async (asset: Asset) => {
    try {
      const url = await QRCode.toDataURL(asset.id, {
        margin: 2,
        width: 600,
        color: { dark: '#020617', light: '#ffffff' },
      });
      setTempQrUrl(url);
      setQrModalAsset(asset);
    } catch (err) {
      console.error(err);
    }
  };

  const downloadQuickQr = () => {
    if (!tempQrUrl || !qrModalAsset) return;
    const link = document.createElement('a');
    link.href = tempQrUrl;
    link.download = `QR-${qrModalAsset.id}-${qrModalAsset.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Physical <span className="text-blue-600">Inventory</span></h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="px-6 py-3.5 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 text-slate-600 font-bold transition-all hover:border-blue-500/30 active:scale-95 shadow-xl shadow-slate-200/50"
          >
            <Scan className="w-5 h-5 text-blue-600" />
            Launch Scanner
          </button>
          {isAdmin && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs hover:bg-slate-800 shadow-xl shadow-slate-300 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Register Asset
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-[32px] border border-slate-100 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="relative flex-1 group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-slate-50 border border-slate-100 transition-all group-within:border-blue-500/50">
            <Search className="text-slate-400 w-4 h-4" />
          </div>
          <input 
            type="text" 
            placeholder="Query inventory records by name or ID..."
            className="w-full pl-16 pr-6 py-4 bg-transparent text-slate-800 rounded-2xl outline-none placeholder:text-slate-400 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {(globalSearchQuery) && (
          <div className="flex items-center gap-3 px-6 py-2 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase border border-blue-100">
            Active Filter: {globalSearchQuery}
            <button onClick={() => setGlobalSearchQuery('')} className="hover:text-blue-800 transition-colors"><X className="w-4 h-4"/></button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredAssets.map((asset) => (
          <div 
            key={asset.id} 
            className="bg-white rounded-[40px] border border-slate-100 overflow-hidden group cursor-pointer hover:border-blue-500/30 transition-all duration-500 relative shadow-sm hover:shadow-xl"
          >
            <div className="absolute top-4 right-4 z-10" onClick={(e) => { e.stopPropagation(); setViewingAsset(asset); }}>
              <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border backdrop-blur-md ${
                asset.status === AssetStatus.OPERATIONAL ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                asset.status === AssetStatus.MAINTENANCE ? 'bg-amber-50 text-amber-600 border-amber-100' :
                asset.status === AssetStatus.REPAIR ? 'bg-blue-50 text-blue-600 border-blue-100' :
                'bg-rose-50 text-rose-600 border-rose-100'
              }`}>
                {asset.status}
              </span>
            </div>
            
            <div className="h-52 overflow-hidden relative" onClick={() => setViewingAsset(asset)}>
              <img src={asset.imageUrl} alt={asset.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="p-8 space-y-5">
              <div onClick={() => setViewingAsset(asset)}>
                <div className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">{asset.id}</div>
                <h3 className="text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors leading-tight line-clamp-1 uppercase tracking-tight">{asset.name}</h3>
              </div>

              <div className="flex items-center gap-6" onClick={() => setViewingAsset(asset)}>
                <div className="flex items-center gap-2 text-slate-400">
                  <Layers className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">{asset.category}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-rose-400/50" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">{asset.location}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2" onClick={() => setViewingAsset(asset)}>
                  <Activity className="w-3.5 h-3.5 text-emerald-500/50" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Health: Nominal</span>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); generateQuickQR(asset); }}
                      className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100"
                      title="Generate Asset Label QR"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  )}
                  <div 
                    onClick={(e) => { e.stopPropagation(); setViewingAsset(asset); }}
                    className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* ... rest of existing modals ... */}
      {/* (Adding only necessary changes, keep existing modal code) */}
    </div>
  );
};

export default AssetList;

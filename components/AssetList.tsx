
import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Plus, MoreVertical, X, PenTool, Scan, Camera, ExternalLink, Calendar as CalendarIcon, Pencil, Trash2, AlertTriangle, Box, Truck, Layers, Hash } from 'lucide-react';
import { useApp } from '../AppContext';
import { Asset, AssetStatus, SPKStatus, SPK } from '../types';
import AssetDetail from './AssetDetail';
import SPKDetail from './SPKDetail';
import jsQR from 'jsqr';

const AssetList: React.FC = () => {
  const { assets, addAsset, updateAsset, deleteAsset, categories, addCategory, removeCategory, createSPK, technicians, globalSearchQuery, setGlobalSearchQuery, currentTechnician } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSPKModalOpen, setIsSPKModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [viewingSPKInDetail, setViewingSPKInDetail] = useState<SPK | null>(null);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  
  const [newCatName, setNewCatName] = useState('');

  const isAdmin = !currentTechnician;

  const [newAsset, setNewAsset] = useState({ 
    name: '', 
    category: categories[0] || '', 
    location: '', 
    status: AssetStatus.OPERATIONAL,
    purchaseDate: new Date().toISOString().split('T')[0],
    arrivedDate: new Date().toISOString().split('T')[0]
  });

  // QR Scanner Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getStatusColor = (status: AssetStatus) => {
    switch (status) {
      case AssetStatus.OPERATIONAL: return 'bg-emerald-100 text-emerald-700';
      case AssetStatus.MAINTENANCE: return 'bg-amber-100 text-amber-700';
      case AssetStatus.REPAIR: return 'bg-orange-100 text-orange-700';
      case AssetStatus.BROKEN: return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
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
    resetForm();
  };

  const handleUpdateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (assetToEdit) {
      updateAsset(assetToEdit);
      // Sync the detail view if it's currently open
      if (viewingAsset && viewingAsset.id === assetToEdit.id) {
        setViewingAsset(assetToEdit);
      }
      setAssetToEdit(null);
    }
  };

  const handleDeleteAsset = () => {
    if (assetToDelete) {
      deleteAsset(assetToDelete.id);
      setAssetToDelete(null);
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addCategory(newCatName.trim());
      setNewCatName('');
    }
  };

  const resetForm = () => {
    setNewAsset({ 
      name: '', 
      category: categories[0] || '', 
      location: '', 
      status: AssetStatus.OPERATIONAL,
      purchaseDate: new Date().toISOString().split('T')[0],
      arrivedDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleCreateSPK = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    createSPK({
      id: `SPK-${Date.now()}`,
      assetId: selectedAsset.id,
      technicianId: newSPK.technicianId,
      title: newSPK.title,
      description: newSPK.description,
      priority: newSPK.priority,
      status: SPKStatus.OPEN,
      createdAt: new Date().toISOString(),
      dueDate: newSPK.dueDate
    });
    setIsSPKModalOpen(false);
    setSelectedAsset(null);
  };

  const [newSPK, setNewSPK] = useState({ 
    title: '', 
    description: '', 
    technicianId: '', 
    priority: 'Medium' as const,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // QR Scanner logic
  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    const startScanner = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.play();
          requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setIsScannerOpen(false);
      }
    };

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.height = videoRef.current.videoHeight;
          canvas.width = videoRef.current.videoWidth;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });
          if (code) {
            setGlobalSearchQuery(code.data);
            setIsScannerOpen(false);
            return;
          }
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    if (isScannerOpen) {
      startScanner();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [isScannerOpen]);

  const activeSearch = searchTerm || globalSearchQuery;
  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
    a.id.toLowerCase().includes(activeSearch.toLowerCase())
  );

  // Main render logic for Content
  const renderViewContent = () => {
    if (viewingSPKInDetail) {
      return (
        <SPKDetail 
          spk={viewingSPKInDetail} 
          onBack={() => setViewingSPKInDetail(null)} 
          onReassign={() => {}} 
        />
      );
    }

    if (viewingAsset) {
      return (
        <AssetDetail 
          asset={viewingAsset} 
          onBack={() => setViewingAsset(null)}
          onEdit={(asset) => setAssetToEdit(asset)}
          onReportIssue={(asset) => {
            setSelectedAsset(asset);
            setIsSPKModalOpen(true);
          }}
          onViewSPK={(spk) => setViewingSPKInDetail(spk)}
        />
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Inventory Management</h2>
            <p className="text-slate-500">Track and manage corporate physical assets</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button 
                onClick={() => setIsCategoryModalOpen(true)}
                className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
              >
                <Layers className="w-5 h-5 text-purple-500" />
                <span>Categories</span>
              </button>
            )}
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
            >
              <Scan className="w-5 h-5 text-blue-500" />
              <span>Scan QR</span>
            </button>
            {isAdmin && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 active:scale-95 font-bold"
              >
                <Plus className="w-5 h-5" />
                <span>Register Asset</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search assets locally..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {(globalSearchQuery) && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold border border-blue-100">
              Global Search: {globalSearchQuery}
              <button onClick={() => setGlobalSearchQuery('')} className="hover:text-blue-800"><X className="w-3 h-3"/></button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Asset Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.map((asset) => (
                <tr 
                  key={asset.id} 
                  className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  onClick={() => setViewingAsset(asset)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={asset.imageUrl} alt={asset.name} className="w-12 h-12 rounded-xl object-cover bg-slate-100 shadow-sm" />
                      <div>
                        <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{asset.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{asset.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{asset.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${getStatusColor(asset.status)}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingAsset(asset);
                        }}
                        className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-100 transition-colors"
                        title="View Details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      {isAdmin ? (
                        <>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssetToEdit(asset);
                            }}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Edit Asset"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssetToDelete(asset);
                            }}
                            className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                            title="Delete Asset"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        asset.status === AssetStatus.OPERATIONAL && (
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation();
                              setSelectedAsset(asset); 
                              setIsSPKModalOpen(true); 
                            }}
                            className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1.5 text-xs font-bold"
                          >
                            <PenTool className="w-3.5 h-3.5" />
                            Report Issue
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <Box className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">No assets found</p>
                    <p className="text-slate-300 text-sm">Try a different search term or scan a QR code</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {renderViewContent()}

      {/* Registry Modal (Create) - Moved outside conditional return to be globally accessible */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-10 pt-10 pb-6 flex justify-between items-center border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-2xl">
                  <Box className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">New Asset Registry</h3>
                  <p className="text-slate-500 text-sm">Onboard a new physical asset to the system</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <X className="w-7 h-7 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleAddAsset} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Asset Name</label>
                <input required placeholder="e.g. Cisco Catalyst Switch" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-slate-700" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Category</label>
                  <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-slate-700" value={newAsset.category} onChange={e => setNewAsset({...newAsset, category: e.target.value})}>
                    {categories.map(cat => <option key={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Purchase Date</label>
                  <input type="date" required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-slate-700" value={newAsset.purchaseDate} onChange={e => setNewAsset({...newAsset, purchaseDate: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Arrival Date</label>
                  <input type="date" required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-slate-700" value={newAsset.arrivedDate} onChange={e => setNewAsset({...newAsset, arrivedDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Physical Location</label>
                  <input required placeholder="Server Room 1" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-slate-700" value={newAsset.location} onChange={e => setNewAsset({...newAsset, location: e.target.value})} />
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">Cancel</button>
                <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">Confirm Registry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-8 pt-8 pb-4 flex justify-between items-center border-b border-slate-50">
              <div className="flex items-center gap-3">
                <Layers className="w-6 h-6 text-purple-500" />
                <h3 className="text-xl font-bold text-slate-800">Category Manager</h3>
              </div>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input 
                  required 
                  placeholder="New category name..." 
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-purple-100 outline-none"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                />
                <button type="submit" className="bg-purple-600 text-white p-2 rounded-xl hover:bg-purple-700 transition-all">
                  <Plus className="w-6 h-6" />
                </button>
              </form>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {categories.map(cat => (
                  <div key={cat} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group border border-transparent hover:border-purple-100 transition-all">
                    <span className="text-sm font-bold text-slate-700">{cat}</span>
                    <button 
                      onClick={() => removeCategory(cat)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 bg-slate-50 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Changes reflect instantly in registry forms</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Globally accessible */}
      {assetToEdit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-10 pt-10 pb-6 flex justify-between items-center border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-2xl">
                  <Pencil className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Edit Asset Details</h3>
                  <p className="text-slate-500 text-sm">Update technical specifications for {assetToEdit.id}</p>
                </div>
              </div>
              <button onClick={() => setAssetToEdit(null)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <X className="w-7 h-7 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleUpdateAsset} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Asset Name</label>
                <input required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-slate-700" value={assetToEdit.name} onChange={e => setAssetToEdit({...assetToEdit, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Category</label>
                  <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-slate-700" value={assetToEdit.category} onChange={e => setAssetToEdit({...assetToEdit, category: e.target.value})}>
                    {categories.map(cat => <option key={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Current Status</label>
                  <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-slate-700" value={assetToEdit.status} onChange={e => setAssetToEdit({...assetToEdit, status: e.target.value as AssetStatus})}>
                    {Object.values(AssetStatus).map(status => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Arrival Date</label>
                  <input type="date" required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-slate-700" value={assetToEdit.arrivedDate} onChange={e => setAssetToEdit({...assetToEdit, arrivedDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Physical Location</label>
                  <input required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-slate-700" value={assetToEdit.location} onChange={e => setAssetToEdit({...assetToEdit, location: e.target.value})} />
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setAssetToEdit(null)} className="flex-1 py-4 text-slate-500 font-bold bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">Cancel</button>
                <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">Apply Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {assetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">Permanently Delete?</h3>
                <p className="text-slate-500 leading-relaxed">
                  You are about to remove <b>{assetToDelete.name}</b> from the enterprise ledger. This action cannot be undone.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDeleteAsset}
                  className="w-full py-4 bg-rose-600 text-white font-bold rounded-2xl shadow-xl shadow-rose-100 hover:bg-rose-700 active:scale-95 transition-all"
                >
                  Yes, Delete Asset
                </button>
                <button 
                  onClick={() => setAssetToDelete(null)}
                  className="w-full py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all"
                >
                  Cancel and Keep
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 relative">
             <button onClick={() => setIsScannerOpen(false)} className="absolute top-6 right-6 z-10 p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur transition-all">
                <X className="w-6 h-6 text-white" />
             </button>
             <div className="relative aspect-square bg-black">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-2 border-blue-500 rounded-[32px] relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Targeting QR</div>
                    <div className="absolute inset-0 animate-pulse bg-blue-500/10 rounded-[30px]" />
                  </div>
                </div>
             </div>
             <div className="p-8 text-center bg-slate-900 text-white">
                <p className="font-bold text-lg mb-1">Point at an Asset Tag</p>
                <p className="text-slate-400 text-xs">Scanning for Enterprise QR signatures...</p>
             </div>
          </div>
        </div>
      )}

      {/* SPK Modal */}
      {isSPKModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
             <div className="px-10 pt-10 pb-6 flex justify-between items-center border-b border-slate-50">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Dispatch Request</h3>
                <p className="text-slate-500 text-sm">Corrective maintenance for {selectedAsset?.id}</p>
              </div>
              <button onClick={() => setIsSPKModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <X className="w-7 h-7 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateSPK} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Summary of Issue</label>
                <input required placeholder="Short summary" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none" value={newSPK.title} onChange={e => setNewSPK({...newSPK, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Incident Description</label>
                <textarea placeholder="Detailed description..." className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl h-32 resize-none" value={newSPK.description} onChange={e => setNewSPK({...newSPK, description: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Deadline</label>
                  <input type="date" required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl" value={newSPK.dueDate} onChange={e => setNewSPK({...newSPK, dueDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Priority</label>
                  <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl" value={newSPK.priority} onChange={e => setNewSPK({...newSPK, priority: e.target.value as any})}>
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Assign Specialist</label>
                <select required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl" value={newSPK.technicianId} onChange={e => setNewSPK({...newSPK, technicianId: e.target.value})}>
                  <option value="">Select Personnel...</option>
                  {technicians.map(t => <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>)}
                </select>
              </div>
              <button type="submit" className="w-full py-4 bg-amber-600 text-white font-bold rounded-2xl shadow-xl shadow-amber-100 active:scale-95 transition-all">Submit Order</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetList;

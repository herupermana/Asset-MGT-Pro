
import React, { useState, useRef } from 'react';
import { useApp } from '../AppContext';
import { 
  Download, Upload, Database, AlertTriangle, 
  CheckCircle2, X, FileJson, ShieldAlert, 
  History, Loader2, Save
} from 'lucide-react';

const BackupRestore: React.FC = () => {
  const { assets, spks, technicians, categories, locations, bulkRestoreData } = useApp();
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'processing'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = () => {
    const backupData = {
      assets,
      spks,
      technicians,
      categories,
      locations,
      exportDate: new Date().toISOString(),
      version: "2.5"
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AssetPro_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setStatus('success');
    setTimeout(() => setStatus('idle'), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        // Basic schema validation
        if (!data.assets || !data.technicians || !data.spks) {
          throw new Error("Invalid backup file: Missing required data collections.");
        }

        setPendingData(data);
        setShowRestoreConfirm(true);
        setStatus('idle');
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to parse backup file.");
        setStatus('error');
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be picked again
    e.target.value = '';
  };

  const executeRestore = () => {
    setStatus('processing');
    setTimeout(() => {
      bulkRestoreData(pendingData);
      setStatus('success');
      setShowRestoreConfirm(false);
      setPendingData(null);
      setTimeout(() => setStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Card */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6 group hover:border-blue-200 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Export Ledger</h3>
              <p className="text-xs text-slate-400 font-medium">Download full system state as JSON</p>
            </div>
          </div>
          
          <p className="text-sm text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-50">
            Securely packages all assets, work orders, personnel data, and system configurations into a portable file for archival or migration.
          </p>

          <button 
            onClick={handleBackup}
            className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
          >
            <Save className="w-4 h-4" />
            Generate Backup
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6 group hover:border-amber-200 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Restore Data</h3>
              <p className="text-xs text-slate-400 font-medium">Roll back or import from file</p>
            </div>
          </div>
          
          <p className="text-sm text-slate-500 leading-relaxed bg-amber-50/30 p-4 rounded-2xl border border-amber-100/30">
            <span className="text-amber-700 font-bold block mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Warning
            </span>
            Restoring data will overwrite all current assets and active service orders. This action cannot be undone.
          </p>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
          >
            <FileJson className="w-4 h-4" />
            Upload Backup File
          </button>
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".json"
            className="hidden" 
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Success/Error Toasts inside the component context */}
      {status === 'success' && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-bold">Operation successful. The enterprise ledger has been updated.</span>
        </div>
      )}

      {status === 'error' && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 animate-in fade-in slide-in-from-top-2">
          <ShieldAlert className="w-5 h-5" />
          <span className="text-sm font-bold">{errorMessage}</span>
          <button onClick={() => setStatus('idle')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">Overwrite Active Ledger?</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  The uploaded backup contains <b>{pendingData?.assets?.length} assets</b> and <b>{pendingData?.spks?.length} service orders</b>. Proceeding will replace all current data.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={executeRestore}
                  disabled={status === 'processing'}
                  className="w-full py-4 bg-amber-600 text-white font-bold rounded-2xl shadow-xl shadow-amber-100 hover:bg-amber-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {status === 'processing' ? <Loader2 className="w-5 h-5 animate-spin" /> : <History className="w-5 h-5" />}
                  Confirm Full Restoration
                </button>
                <button 
                  onClick={() => { setShowRestoreConfirm(false); setPendingData(null); }}
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

export default BackupRestore;

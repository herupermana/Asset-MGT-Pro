
import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { SPKStatus, SPK } from '../types';
import { 
  FileDown, FileSpreadsheet, Printer, Filter, 
  Search, X, Calendar, User, Box, MapPin, 
  ChevronDown, HardHat, ClipboardList, RefreshCw,
  FileText
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ReportCenter: React.FC = () => {
  const { spks, assets, technicians, locations } = useApp();
  
  const [filterAsset, setFilterAsset] = useState('All');
  const [filterTech, setFilterTech] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    return spks.filter(spk => {
      const asset = assets.find(a => a.id === spk.assetId);
      const matchesAsset = filterAsset === 'All' || spk.assetId === filterAsset;
      const matchesTech = filterTech === 'All' || spk.technicianId === filterTech;
      const matchesLocation = filterLocation === 'All' || asset?.location === filterLocation;
      const matchesStatus = filterStatus === 'All' || spk.status === filterStatus;
      const matchesSearch = spk.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          spk.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesAsset && matchesTech && matchesLocation && matchesStatus && matchesSearch;
    });
  }, [spks, assets, filterAsset, filterTech, filterLocation, filterStatus, searchTerm]);

  const exportPDF = () => {
    const doc = new jsPDF() as any;
    doc.setFontSize(18);
    doc.text('AssetPro Enterprise - Service Order Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Records: ${filteredData.length}`, 14, 35);

    const tableColumn = ["ID", "Title", "Asset", "Technician", "Status", "Created", "Priority"];
    const tableRows = filteredData.map(spk => [
      spk.id,
      spk.title,
      assets.find(a => a.id === spk.assetId)?.name || 'Unknown',
      technicians.find(t => t.id === spk.technicianId)?.name || 'Unassigned',
      spk.status,
      new Date(spk.createdAt).toLocaleDateString(),
      spk.priority
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`AssetPro_Report_${Date.now()}.pdf`);
  };

  const exportExcel = () => {
    const data = filteredData.map(spk => ({
      'SPK ID': spk.id,
      'Title': spk.title,
      'Asset Name': assets.find(a => a.id === spk.assetId)?.name || 'Unknown',
      'Location': assets.find(a => a.id === spk.assetId)?.location || 'N/A',
      'Specialist': technicians.find(t => t.id === spk.technicianId)?.name || 'Unassigned',
      'Status': spk.status,
      'Priority': spk.priority,
      'Creation Date': new Date(spk.createdAt).toLocaleDateString(),
      'Due Date': new Date(spk.dueDate).toLocaleDateString(),
      'Completion Note': spk.completionNote || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Service Orders");
    XLSX.writeFile(workbook, `AssetPro_ServiceOrders_${Date.now()}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reporting Center</h2>
          <p className="text-slate-500 font-medium">Generate enterprise analytics and service logs</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold border border-emerald-100 hover:bg-emerald-100 transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold border border-blue-100 hover:bg-blue-100 transition-all active:scale-95"
          >
            <FileDown className="w-4 h-4" />
            PDF
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6 no-print">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
          <Filter className="w-3.5 h-3.5" />
          Filter Parameters
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Target Asset</label>
            <select 
              className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-bold text-slate-700 text-sm"
              value={filterAsset}
              onChange={(e) => setFilterAsset(e.target.value)}
            >
              <option value="All">All Assets</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Specialist</label>
            <select 
              className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-bold text-slate-700 text-sm"
              value={filterTech}
              onChange={(e) => setFilterTech(e.target.value)}
            >
              <option value="All">All Technicians</option>
              {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Location</label>
            <select 
              className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-bold text-slate-700 text-sm"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            >
              <option value="All">All Locations</option>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Order Status</label>
            <select 
              className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-bold text-slate-700 text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {Object.values(SPKStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search within these results..." 
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-medium text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between no-print">
           <div className="flex items-center gap-3">
             <ClipboardList className="w-5 h-5 text-slate-400" />
             <span className="text-sm font-bold text-slate-700">{filteredData.length} Records Found</span>
           </div>
           <button 
             onClick={() => {
               setFilterAsset('All');
               setFilterTech('All');
               setFilterLocation('All');
               setFilterStatus('All');
               setSearchTerm('');
             }}
             className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:text-blue-700"
           >
             <RefreshCw className="w-3 h-3" />
             Reset Filters
           </button>
        </div>

        {/* PRINT ONLY HEADER */}
        <div className="print-only p-8 text-center border-b-2 border-slate-900 mb-8">
           <h1 className="text-3xl font-black uppercase tracking-tighter">AssetPro Enterprise Report</h1>
           <p className="text-sm font-bold text-slate-500 mt-2">Confidential Service Ledger • {new Date().toLocaleString()}</p>
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ID/Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order Title</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset/Location</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Specialist</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((spk) => {
              const asset = assets.find(a => a.id === spk.assetId);
              const tech = technicians.find(t => t.id === spk.technicianId);
              return (
                <tr key={spk.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-black text-slate-900 text-sm uppercase tracking-tighter">{spk.id}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-0.5">{new Date(spk.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 text-sm leading-tight max-w-xs">{spk.title}</div>
                    <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">{spk.priority} Priority</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <Box className="w-3.5 h-3.5 text-slate-400" />
                       <span className="font-bold text-slate-700 text-xs">{asset?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 opacity-60">
                       <MapPin className="w-3 h-3 text-slate-400" />
                       <span className="text-[10px] font-bold text-slate-500 uppercase">{asset?.location || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <HardHat className="w-3.5 h-3.5 text-slate-400" />
                       <span className="font-bold text-slate-700 text-xs">{tech?.name || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border ${
                      spk.status === SPKStatus.COMPLETED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      spk.status === SPKStatus.IN_PROGRESS ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {spk.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={5} className="py-24 text-center">
                   <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold text-lg">No records match your criteria</p>
                   <p className="text-slate-300 text-sm">Adjust your filters to see more orders</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div className="p-8 print-only mt-8 border-t-2 border-slate-100">
           <div className="grid grid-cols-2 gap-12">
              <div>
                 <p className="text-[10px] font-black uppercase text-slate-400 mb-8 tracking-widest">Authorized By</p>
                 <div className="w-48 h-px bg-slate-900 mb-2" />
                 <p className="text-sm font-bold">System Administrator</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black uppercase text-slate-400 mb-8 tracking-widest">End of Record Verification</p>
                 <p className="text-sm font-bold">{new Date().toLocaleDateString()}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-blue-600 rounded-[32px] p-10 text-white relative overflow-hidden no-print">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <FileText className="w-48 h-48" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-2xl font-black mb-3">Enterprise Compliance</h3>
          <p className="text-blue-100 leading-relaxed font-medium">
            Generate formal documentation for insurance audits, safety compliance checks, or maintenance budget reviews. Use the filters above to isolate high-priority repairs or track technician efficiency over specific locations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportCenter;

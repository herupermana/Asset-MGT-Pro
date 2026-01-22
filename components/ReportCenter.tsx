
import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { SPKStatus, SPK, Technician } from '../types';
import { 
  FileDown, FileSpreadsheet, Printer, Filter, 
  Search, X, Calendar, User, Box, MapPin, 
  ChevronDown, HardHat, ClipboardList, RefreshCw,
  FileText, TrendingUp, Star, Clock, Award
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ReportCenter: React.FC = () => {
  const { spks, assets, technicians, locations } = useApp();
  
  const [activeTab, setActiveTab] = useState<'orders' | 'performance'>('orders');
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

  // Performance calculations for each technician
  const techPerformance = useMemo(() => {
    return technicians.map(tech => {
      const techSpks = spks.filter(s => s.technicianId === tech.id && s.status === SPKStatus.COMPLETED);
      
      let avgResolutionTime = 0;
      if (techSpks.length > 0) {
        const totalMs = techSpks.reduce((acc, s) => {
          if (s.completedAt) {
            return acc + (new Date(s.completedAt).getTime() - new Date(s.createdAt).getTime());
          }
          return acc;
        }, 0);
        // Convert to hours
        avgResolutionTime = totalMs / techSpks.length / (1000 * 60 * 60);
      }

      return {
        ...tech,
        completedCount: techSpks.length,
        avgResolutionTime: avgResolutionTime.toFixed(1),
        rating: tech.averageRating || 0
      };
    });
  }, [spks, technicians]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    const title = activeTab === 'orders' ? 'AssetPro - Service Order Report' : 'AssetPro - Technician Performance Report';
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    if (activeTab === 'orders') {
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
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });
    } else {
      const tableColumn = ["ID", "Name", "Rank", "Completed Tasks", "Avg. Time (hrs)", "Satisfaction"];
      const tableRows = techPerformance.map(tech => [
        tech.id,
        tech.name,
        tech.rank || 'N/A',
        tech.completedCount,
        tech.avgResolutionTime,
        tech.rating.toFixed(1)
      ]);
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] }
      });
    }

    doc.save(`AssetPro_Report_${activeTab}_${Date.now()}.pdf`);
  };

  const exportExcel = () => {
    let data;
    if (activeTab === 'orders') {
      data = filteredData.map(spk => ({
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
    } else {
      data = techPerformance.map(tech => ({
        'Technician ID': tech.id,
        'Name': tech.name,
        'Specialty': tech.specialty,
        'Rank': tech.rank,
        'Completed Tasks': tech.completedCount,
        'Avg. Resolution (hrs)': tech.avgResolutionTime,
        'Satisfaction Rating': tech.rating
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab === 'orders' ? "Service Orders" : "Performance");
    XLSX.writeFile(workbook, `AssetPro_${activeTab}_${Date.now()}.xlsx`);
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

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit no-print">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <ClipboardList className="w-4 h-4 inline-block mr-2" />
          Service Orders
        </button>
        <button 
          onClick={() => setActiveTab('performance')}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'performance' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <TrendingUp className="w-4 h-4 inline-block mr-2" />
          Specialist Performance
        </button>
      </div>

      {activeTab === 'orders' ? (
        <>
          {/* Filter Bar for Orders */}
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

          {/* Service Orders Table */}
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
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          {/* Performance Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Performer</p>
                <p className="text-xl font-black text-slate-800">
                  {techPerformance.reduce((prev, current) => (prev.completedCount > current.completedCount) ? prev : current).name}
                </p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Star className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. Satisfaction</p>
                <p className="text-xl font-black text-slate-800">
                  {(techPerformance.reduce((acc, t) => acc + t.rating, 0) / techPerformance.length).toFixed(1)} / 5.0
                </p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. Res. Time</p>
                <p className="text-xl font-black text-slate-800">
                  {(techPerformance.reduce((acc, t) => acc + parseFloat(t.avgResolutionTime), 0) / techPerformance.length).toFixed(1)} hrs
                </p>
              </div>
            </div>
          </div>

          {/* Performance Table */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 no-print">
               <h3 className="font-bold text-slate-700 flex items-center gap-2">
                 <TrendingUp className="w-5 h-5 text-emerald-500" />
                 Specialist Efficiency Matrix
               </h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Specialist</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Completed Tasks</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Avg. Resolution</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Satisfaction</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Load Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {techPerformance.map((tech) => (
                  <tr key={tech.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-sm">{tech.name[0]}</div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{tech.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{tech.rank}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-lg">{tech.completedCount}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Units</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-black text-slate-700 text-sm">{tech.avgResolutionTime} hrs</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                        <span className="font-black text-slate-900 text-sm">{tech.rating.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-400 font-bold">/ 5.0</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border ${
                         tech.activeTasks > 3 ? 'bg-rose-50 text-rose-700 border-rose-100' :
                         tech.activeTasks > 0 ? 'bg-blue-50 text-blue-700 border-blue-100' :
                         'bg-emerald-50 text-emerald-700 border-emerald-100'
                       }`}>
                         {tech.activeTasks === 0 ? 'Available' : `${tech.activeTasks} Active Orders`}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINT ONLY FOOTER */}
      <div className="print-only p-8 mt-12 border-t-2 border-slate-100">
         <div className="grid grid-cols-2 gap-12">
            <div>
               <p className="text-[10px] font-black uppercase text-slate-400 mb-8 tracking-widest">Authorized By</p>
               <div className="w-48 h-px bg-slate-900 mb-2" />
               <p className="text-sm font-bold">System Administrator</p>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black uppercase text-slate-400 mb-8 tracking-widest">End of Record Verification</p>
               <p className="text-sm font-bold">{new Date().toLocaleString()}</p>
            </div>
         </div>
      </div>

      <div className="bg-blue-600 rounded-[32px] p-10 text-white relative overflow-hidden no-print">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <FileText className="w-48 h-48" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-2xl font-black mb-3">Operational Intelligence</h3>
          <p className="text-blue-100 leading-relaxed font-medium">
            These metrics provide an objective view of resource deployment effectiveness. Use the performance data to identify training needs, optimize assignment logic, and ensure high quality of service across all deployment zones.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportCenter;

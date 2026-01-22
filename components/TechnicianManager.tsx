
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Technician } from '../types';
import { 
  UserPlus, Search, X, Trash2, UserCog, 
  ShieldCheck, Briefcase, Plus, Terminal, Lock,
  Award, Star, Zap, HardHat, TrendingUp, Info, ChevronRight,
  UserCheck, ShieldAlert
} from 'lucide-react';

const RANKS = [
  'Junior Associate',
  'Field Technician',
  'Senior Specialist',
  'Expert Advisor',
  'Master Craftsman',
  'Principal Engineer'
];

const TechnicianManager: React.FC = () => {
  const { technicians, addTechnician, deleteTechnician, updateTechnicianRank, spks } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingTech, setViewingTech] = useState<Technician | null>(null);
  
  const [newTech, setNewTech] = useState({
    id: '',
    name: '',
    specialty: '',
    password: 'password123',
    rank: RANKS[0]
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addTechnician({
      ...newTech,
      activeTasks: 0
    });
    setIsModalOpen(false);
    setNewTech({ id: '', name: '', specialty: '', password: 'password123', rank: RANKS[0] });
  };

  const getRankBadgeStyles = (rank: string) => {
    if (rank.includes('Junior') || rank.includes('Associate')) return 'bg-slate-100 text-slate-600 border-slate-200';
    if (rank.includes('Senior')) return 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm shadow-blue-100';
    if (rank.includes('Expert') || rank.includes('Advisor')) return 'bg-amber-100 text-amber-700 border-amber-200 shadow-sm shadow-amber-100';
    if (rank.includes('Master') || rank.includes('Principal')) return 'bg-rose-100 text-rose-700 border-rose-200 shadow-lg shadow-rose-100';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const getRankIcon = (rank: string) => {
    if (rank.includes('Junior')) return <Zap className="w-3.5 h-3.5" />;
    if (rank.includes('Senior')) return <Star className="w-3.5 h-3.5" />;
    if (rank.includes('Expert')) return <ShieldCheck className="w-3.5 h-3.5" />;
    if (rank.includes('Master')) return <Award className="w-3.5 h-3.5" />;
    return <Zap className="w-3.5 h-3.5" />;
  };

  const filteredTechs = technicians.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Specialist Management</h2>
          <p className="text-slate-500 font-medium">Manage enterprise field service personnel & ranking</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 font-bold"
        >
          <UserPlus className="w-5 h-5" />
          Register Personnel
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search personnel by ID, Name or Rank..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Specialist</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Rank Badge</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Specialty</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTechs.map((tech) => (
              <tr 
                key={tech.id} 
                className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                onClick={() => setViewingTech(tech)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 shadow-sm relative overflow-hidden">
                      {tech.name[0]}
                      {tech.rank?.includes('Master') && <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 to-transparent pointer-events-none" />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{tech.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tech.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border flex items-center gap-1.5 w-fit ${getRankBadgeStyles(tech.rank || RANKS[0])}`}>
                    {getRankIcon(tech.rank || RANKS[0])}
                    {tech.rank || RANKS[0]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-600">{tech.specialty}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Profile"
                    >
                      <UserCog className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTechnician(tech.id);
                      }}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      title="Deregister"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Specialist Profile Modal */}
      {viewingTech && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="relative h-40 bg-slate-900 overflow-hidden">
               <div className="absolute inset-0 opacity-20">
                 <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.5),transparent)]" />
                 <div className="grid grid-cols-12 gap-1 h-full rotate-12 scale-150">
                    {[...Array(24)].map((_, i) => <div key={i} className="border-l border-white/5 h-full" />)}
                 </div>
               </div>
               <button onClick={() => setViewingTech(null)} className="absolute top-8 right-8 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all z-20">
                 <X className="w-6 h-6" />
               </button>
             </div>

             <div className="px-12 relative pb-12">
               {/* Profile Header */}
               <div className="flex items-end gap-6 -mt-16 relative z-10 mb-8">
                 <div className="w-32 h-32 rounded-[40px] bg-white p-2 shadow-2xl">
                   <div className="w-full h-full rounded-[32px] bg-slate-100 flex items-center justify-center text-4xl font-black text-slate-800 border-4 border-white shadow-inner">
                     {viewingTech.name[0]}
                   </div>
                 </div>
                 <div className="pb-4">
                   <h3 className="text-3xl font-black text-slate-800 tracking-tight">{viewingTech.name}</h3>
                   <div className="flex items-center gap-2 text-slate-500 font-bold text-sm uppercase tracking-widest">
                     <HardHat className="w-4 h-4" />
                     {viewingTech.specialty} Specialist
                   </div>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 {/* Stats Column */}
                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <TrendingUp className="w-5 h-5 text-blue-500 mb-2" />
                        <div className="text-2xl font-black text-slate-800">{viewingTech.activeTasks}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Orders</div>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <Star className="w-5 h-5 text-amber-500 mb-2" />
                        <div className="text-2xl font-black text-slate-800">4.9</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rating</div>
                      </div>
                    </div>

                    <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-3">
                       <h4 className="text-xs font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
                         <Info className="w-4 h-4" />
                         Specialist Metrics
                       </h4>
                       <p className="text-sm text-blue-800/70 leading-relaxed font-medium">
                         Assigned to enterprise node <b>{viewingTech.id}</b>. Currently managing {viewingTech.activeTasks} critical service tickets with 98.4% uptime stability.
                       </p>
                    </div>
                 </div>

                 {/* Action Column (Rank management) */}
                 <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 space-y-6">
                    <div className="space-y-4">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Authority Badge Rank</label>
                      <div className={`p-6 rounded-3xl border-2 flex flex-col items-center justify-center text-center gap-3 transition-all duration-500 ${getRankBadgeStyles(viewingTech.rank || RANKS[0])}`}>
                         <div className="w-16 h-16 rounded-full bg-white/50 flex items-center justify-center text-current shadow-inner border border-current/10">
                           {getRankIcon(viewingTech.rank || RANKS[0])}
                         </div>
                         <div className="font-black text-lg tracking-tight uppercase">{viewingTech.rank || RANKS[0]}</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Modify Seniority</p>
                      <select 
                        className="w-full bg-white border border-slate-200 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-700"
                        value={viewingTech.rank || RANKS[0]}
                        onChange={(e) => updateTechnicianRank(viewingTech.id, e.target.value)}
                      >
                        {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                 </div>
               </div>
               
               <div className="mt-10 pt-8 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <ShieldAlert className="w-4 h-4" />
                    Security Clearance Level 4
                  </div>
                  <button 
                    onClick={() => setViewingTech(null)}
                    className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
                  >
                    Update Profile
                  </button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-10 pt-10 pb-6 flex justify-between items-center border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-2xl">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Register Specialist</h3>
                  <p className="text-slate-500 text-sm">Add new technical personnel to the ledger</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full">
                <X className="w-7 h-7 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                <input required placeholder="Personnel Name" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium" value={newTech.name} onChange={e => setNewTech({...newTech, name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Specialist ID</label>
                  <div className="relative">
                    <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input required placeholder="TECH-XX" className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-800 uppercase" value={newTech.id} onChange={e => setNewTech({...newTech, id: e.target.value.toUpperCase()})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Specialty</label>
                  <input required placeholder="e.g. HVAC" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium" value={newTech.specialty} onChange={e => setNewTech({...newTech, specialty: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex justify-between">
                   Base Ranking
                   <Award className="w-3 h-3 text-blue-500" />
                </label>
                <select 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                  value={newTech.rank}
                  onChange={e => setNewTech({...newTech, rank: e.target.value})}
                >
                  {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Assigned Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input required type="text" placeholder="Access code" className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium" value={newTech.password} onChange={e => setNewTech({...newTech, password: e.target.value})} />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">Cancel</button>
                <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">Register Now</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianManager;

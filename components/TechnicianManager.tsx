
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Technician } from '../types';
import { 
  UserPlus, Search, X, Trash2, UserCog, 
  ShieldCheck, Briefcase, Plus, Terminal, Lock
} from 'lucide-react';

const TechnicianManager: React.FC = () => {
  const { technicians, addTechnician, deleteTechnician } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newTech, setNewTech] = useState({
    id: '',
    name: '',
    specialty: '',
    password: 'password123'
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addTechnician({
      ...newTech,
      activeTasks: 0
    });
    setIsModalOpen(false);
    setNewTech({ id: '', name: '', specialty: '', password: 'password123' });
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
          <p className="text-slate-500 font-medium">Manage enterprise field service personnel</p>
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
            placeholder="Search personnel by ID, Name or Specialty..."
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
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">ID Code</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Specialty</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Load</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTechs.map((tech) => (
              <tr key={tech.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 shadow-sm">
                      {tech.name[0]}
                    </div>
                    <div className="font-bold text-slate-800">{tech.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase tracking-wider">{tech.id}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-600">{tech.specialty}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      tech.activeTasks > 2 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {tech.activeTasks} Active
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => deleteTechnician(tech.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      title="Deregister Personnel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTechs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">
                  No specialists found in the directory.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
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

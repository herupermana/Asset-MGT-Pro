
import React from 'react';
import { Clock, CheckCircle2, User, AlertCircle, Calendar } from 'lucide-react';
import { MOCK_SPKS, MOCK_TECHNICIANS, MOCK_ASSETS } from '../constants';
import { SPKStatus } from '../types';

const SPKManager: React.FC = () => {
  const getStatusIcon = (status: SPKStatus) => {
    switch (status) {
      case SPKStatus.IN_PROGRESS: return <Clock className="w-4 h-4 text-blue-500" />;
      case SPKStatus.COMPLETED: return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Maintenance & Repair</h2>
          <p className="text-slate-500">Service Orders (SPK) management</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-200">
          Create New SPK
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active SPKs */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 px-1">Active Orders</h3>
          {MOCK_SPKS.map((spk) => {
            const asset = MOCK_ASSETS.find(a => a.id === spk.assetId);
            const tech = MOCK_TECHNICIANS.find(t => t.id === spk.technicianId);
            return (
              <div key={spk.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tighter">
                      {spk.priority} Priority
                    </span>
                    <h4 className="text-xl font-bold text-slate-800">{spk.title}</h4>
                    <p className="text-slate-500 text-sm">{spk.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg text-sm text-slate-600 font-medium">
                    {getStatusIcon(spk.status)}
                    {spk.status}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-50 mt-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="p-1.5 bg-slate-100 rounded-lg">
                      <Box className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{asset?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="p-1.5 bg-slate-100 rounded-lg">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{tech?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="p-1.5 bg-slate-100 rounded-lg">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Target: Feb 22, 2024</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Technician Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 px-1">Technician Load</h3>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            {MOCK_TECHNICIANS.map((tech) => (
              <div key={tech.id} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                  {tech.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">{tech.name}</div>
                  <div className="text-xs text-slate-500">{tech.specialty}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-700">{tech.activeTasks} tasks</div>
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${(tech.activeTasks / 3) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full mt-4 py-2 text-sm text-blue-600 font-semibold hover:bg-blue-50 rounded-xl transition-colors">
              View All Personnel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper icon import from Lucide
import { Box } from 'lucide-react';

export default SPKManager;

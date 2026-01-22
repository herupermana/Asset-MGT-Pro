
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, CheckCircle2, Clock, Package } from 'lucide-react';
import { useApp } from '../AppContext';
import { AssetStatus, SPKStatus } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard: React.FC = () => {
  const { assets, spks } = useApp();

  const activeOrders = spks.filter(s => s.status !== SPKStatus.COMPLETED).length;
  const operationalCount = assets.filter(a => a.status === AssetStatus.OPERATIONAL).length;
  const operationalRate = assets.length > 0 ? Math.round((operationalCount / assets.length) * 100) : 0;
  const criticalCount = assets.filter(a => a.status === AssetStatus.BROKEN).length;

  const stats = [
    { label: 'Total Assets', value: assets.length.toLocaleString(), icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active SPKs', value: activeOrders.toString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Operational', value: `${operationalRate}%`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Critical Faults', value: criticalCount.toString(), icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const chartData = [
    { name: 'Operational', value: operationalCount },
    { name: 'Maintenance', value: assets.filter(a => a.status === AssetStatus.MAINTENANCE).length },
    { name: 'Repair', value: assets.filter(a => a.status === AssetStatus.REPAIR).length },
    { name: 'Broken', value: criticalCount },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Operational Overview</h2>
        <div className="text-sm text-slate-500">Real-time enterprise metrics</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6 text-slate-800">Condition Snapshot</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6 text-slate-800">Asset Distribution</h3>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, CheckCircle2, Clock, Package, Activity } from 'lucide-react';
import { useApp } from '../AppContext';
import { AssetStatus, SPKStatus } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard: React.FC = () => {
  const { assets, spks, t } = useApp();

  const activeOrders = spks.filter(s => s.status !== SPKStatus.COMPLETED).length;
  const operationalCount = assets.filter(a => a.status === AssetStatus.OPERATIONAL).length;
  const operationalRate = assets.length > 0 ? Math.round((operationalCount / assets.length) * 100) : 0;
  const criticalCount = assets.filter(a => a.status === AssetStatus.BROKEN).length;

  const stats = [
    { label: t('total_assets'), value: assets.length.toLocaleString(), icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    { label: t('active_tasks'), value: activeOrders.toString(), icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    { label: t('system_uptime'), value: `${operationalRate}%`, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    { label: t('critical_faults'), value: criticalCount.toString(), icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  ];

  const chartData = [
    { name: t('operational'), value: operationalCount },
    { name: t('maintenance'), value: assets.filter(a => a.status === AssetStatus.MAINTENANCE).length },
    { name: t('repair'), value: assets.filter(a => a.status === AssetStatus.REPAIR).length },
    { name: t('broken'), value: criticalCount },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 text-blue-400 font-black text-xs uppercase tracking-[0.3em] mb-2">
            <Activity className="w-4 h-4" />
            Live System Pulse
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Enterprise <span className="text-glow text-blue-500">Overwatch</span></h2>
        </div>
        <div className="text-right hidden sm:block">
          <div className="px-5 py-2 glass-card rounded-2xl border-white/5">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Status</p>
            <p className="text-sm font-black text-emerald-400">NOMINAL</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`glass-card p-8 rounded-[40px] border-white/5 relative overflow-hidden group hover:border-white/20 transition-all`}>
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className={`${stat.bg} ${stat.border} border w-12 h-12 rounded-2xl flex items-center justify-center mb-6`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-4xl font-black text-white mb-2 tracking-tighter">{stat.value}</div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-10 rounded-[48px] border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Status Distribution</h3>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]" />
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[10, 10, 0, 0]} barSize={50} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-10 rounded-[48px] border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">System Integrity</h3>
            <div className="flex gap-1.5">
              {[...Array(3)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-blue-500/30 rounded-full" />)}
            </div>
          </div>
          <div className="h-[350px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      style={{ filter: `drop-shadow(0 0 10px ${COLORS[index % COLORS.length]}44)` }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

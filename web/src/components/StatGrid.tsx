import React from 'react';
import { Target, DollarSign, Activity } from 'lucide-react';
import { Lead } from '@/lib/supabase';

interface StatGridProps {
  leads: Lead[];
}

export const StatGrid: React.FC<StatGridProps> = ({ leads }) => {
  const totalLeads = leads.length;
  const highValueLeads = leads.filter(l => l.wtp_signal).length;
  // Calculate average pain (safely)
  const avgPain = totalLeads > 0 
    ? (leads.reduce((acc, curr) => acc + (curr.pain_score || 0), 0) / totalLeads).toFixed(1) 
    : '0';

  const stats = [
    {
      label: "Total Signals",
      value: totalLeads,
      icon: Activity,
      desc: "Discussions analyzed"
    },
    {
      label: "High Intent",
      value: highValueLeads,
      icon: DollarSign,
      desc: "Willingness to pay detected"
    },
    {
      label: "Avg Pain Level",
      value: avgPain,
      icon: Target,
      desc: "Intensity of problem (0-10)"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className={`relative overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-all duration-300 ${
            stat.icon === DollarSign ? 'hover:border-emerald-500/50' : 'hover:border-zinc-400 dark:hover:border-zinc-600'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
             <div className={`p-2 rounded-lg text-foreground ${stat.icon === DollarSign ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-secondary'}`}>
                 <stat.icon size={18} />
             </div>
             <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{stat.label}</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums tracking-tight text-foreground">
                {stat.value}
            </div>
            <div className="text-xs text-zinc-400 mt-1 truncate">
                {stat.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
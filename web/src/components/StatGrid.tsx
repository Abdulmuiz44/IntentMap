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
      label: "TOTAL SIGNALS",
      value: totalLeads,
      icon: Activity,
      desc: "Discussions analyzed"
    },
    {
      label: "HIGH INTENT",
      value: highValueLeads,
      icon: DollarSign,
      desc: "Willingness to pay detected"
    },
    {
      label: "AVG PAIN LEVEL",
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
          className={`group relative overflow-hidden bg-card p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-out hover:scale-[1.01] hover:border-zinc-400 dark:hover:border-zinc-700 shadow-sm dark:shadow-none hover:shadow-md dark:hover:bg-zinc-800/50`}
        >
          <div className="flex items-center justify-between mb-4">
             <div className={`p-2 rounded-lg transition-colors ${
                 stat.icon === DollarSign 
                 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20' 
                 : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
             } ${stat.icon === DollarSign && highValueLeads > 0 ? 'animate-pulse' : ''}`}>
                 <stat.icon size={18} />
             </div>
             <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</div>
          </div>
          <div>
            <div className="text-3xl font-bold font-mono tabular-nums tracking-tighter text-foreground">
                {stat.value}
            </div>
            <div className="text-xs font-medium text-zinc-500 mt-1 truncate">
                {stat.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

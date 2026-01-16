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
          className="bg-card hover:bg-zinc-50 dark:hover:bg-zinc-800/50 p-6 rounded-2xl shadow-sm transition-all duration-200 border border-border"
        >
          <div className="flex items-start justify-between mb-4">
             <div className="p-2 bg-secondary rounded-xl text-foreground">
                 <stat.icon size={20} />
             </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground mb-1">
                {stat.value}
            </div>
            <div className="text-sm font-medium text-muted-foreground">
                {stat.label}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
                {stat.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
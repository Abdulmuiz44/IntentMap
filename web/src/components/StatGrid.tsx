import React from 'react';

interface StatProps {
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatProps> = ({ label, value }) => (
  <div className="border border-slate-500 p-4 flex flex-col justify-between h-24">
    <span className="text-sm text-slate-500 uppercase tracking-widest">{label}</span>
    <span className="text-3xl font-bold">{value}</span>
  </div>
);

interface StatGridProps {
  totalLeads: number;
  highIntent: number;
  avgPain: number;
}

export const StatGrid: React.FC<StatGridProps> = ({ totalLeads, highIntent, avgPain }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <StatCard label="Total Leads" value={totalLeads} />
      <StatCard label="High Intent Signals" value={highIntent} />
      <StatCard label="Avg. Pain Score" value={avgPain.toFixed(1)} />
    </div>
  );
};

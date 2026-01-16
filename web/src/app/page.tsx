import React from 'react';
import { supabase, Lead } from '@/lib/supabase';
import { StatGrid } from '@/components/StatGrid';
import { LeadTable } from '@/components/LeadTable';

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic';

async function getLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', error);
    return [];
  }

  return data as Lead[];
}

export default async function DashboardPage() {
  const leads = await getLeads();

  // Calculate Stats
  const totalLeads = leads.length;
  const highIntent = leads.filter(l => l.pain_score >= 8 || l.wtp_signal).length;
  const avgPain = leads.length > 0 
    ? leads.reduce((acc, curr) => acc + curr.pain_score, 0) / leads.length 
    : 0;

  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 border-b border-slate-500 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">
              INTENTMAP
              <span className="text-slate-500 text-lg md:text-xl font-normal ml-2 tracking-normal">
                / leads
              </span>
            </h1>
            <p className="text-slate-500 max-w-lg">
              Real-time feed of high-intent revenue signals from Reddit. 
              Validated by AI.
            </p>
          </div>
          <div className="hidden md:block text-right">
             <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">System Status</div>
             <div className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                 <span className="font-bold">LIVE</span>
             </div>
          </div>
        </header>

        {/* Stats */}
        <StatGrid 
            totalLeads={totalLeads} 
            highIntent={highIntent} 
            avgPain={avgPain} 
        />

        {/* Main Feed */}
        <section>
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold uppercase tracking-widest">Incoming Signals</h2>
          </div>
          <LeadTable initialLeads={leads} />
        </section>
      </div>
    </main>
  );
}
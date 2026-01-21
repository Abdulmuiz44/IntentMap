"use client"

import { useEffect, useState } from "react";
import { supabase, Lead, isSupabaseConfigured } from "@/lib/supabase";
import { StatGrid } from "@/components/StatGrid";
import LeadFeed from "@/components/LeadFeed";
import { LeadDrawer } from "@/components/LeadDrawer";
import { Header } from "@/components/Header";
import { AlertTriangle } from "lucide-react";

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isConfigured, setIsConfigured] = useState(true);

  const fetchLeads = async () => {
    if (!isSupabaseConfigured()) {
        setIsConfigured(false);
        setLoading(false);
        return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('intent_leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching leads:', JSON.stringify(error, null, 2));
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Check configuration immediately
    if (!isSupabaseConfigured()) {
        setIsConfigured(false);
        setLoading(false);
        return;
    }

    fetchLeads();

    // Realtime subscription
    const channel = supabase
      .channel('intent_leads_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'intent_leads' }, (payload) => {
          setLeads(prev => [payload.new as Lead, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'intent_leads' }, (payload) => {
          setLeads(prev => prev.map(l => l.id === payload.new.id ? payload.new as Lead : l));
          // Also update selected lead if open
          if (selectedLead?.id === payload.new.id) {
             setSelectedLead(payload.new as Lead);
          }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedLead?.id]); 

  const handleContactUpdate = (id: string, status: boolean) => {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, synced: status } : l));
      if (selectedLead && selectedLead.id === id) {
          setSelectedLead({ ...selectedLead, synced: status });
      }
  };

  if (!isConfigured) {
      return (
        <div className="min-h-screen bg-white dark:bg-black">
          <Header />
          <main className="px-6 py-20 max-w-5xl mx-auto text-center space-y-6 animate-in fade-in duration-500">
             <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto text-yellow-600 dark:text-yellow-500">
                <AlertTriangle size={32} />
             </div>
             <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">Supabase Not Configured</h2>
             <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
                We couldn't connect to your database. <br/>
                Please ensure you have added your 
                <code className="mx-1 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-sm text-zinc-900 dark:text-zinc-200">NEXT_PUBLIC_SUPABASE_URL</code> 
                and 
                <code className="mx-1 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-sm text-zinc-900 dark:text-zinc-200">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> 
                to your <code>web/.env.local</code> file.
             </p>
             <div className="pt-4">
                 <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity"
                 >
                     Retry Connection
                 </button>
             </div>
          </main>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header isFetching={loading} />
      
      <main className="px-6 py-8 max-w-5xl mx-auto space-y-8 pb-32">
        {/* Intro */}
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              Live Signals
            </h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400">
              Real-time feed of high-intent discussions from social media.
            </p>
        </div>

        {/* Stats */}
        <StatGrid leads={leads} />

        {/* Content Feed */}
        <LeadFeed leads={leads} onSelectLead={setSelectedLead} isLoading={loading} />
      </main>


      {/* Detail Drawer */}
      <LeadDrawer 
        lead={selectedLead} 
        onClose={() => setSelectedLead(null)} 
        onContactUpdate={handleContactUpdate}
      />
    </div>
  );
}

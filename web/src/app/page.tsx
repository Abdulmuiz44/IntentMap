"use client"

import { useEffect, useState } from "react";
import { supabase, Lead } from "@/lib/supabase";
import { StatGrid } from "@/components/StatGrid";
import { LeadFeed } from "@/components/LeadFeed";
import { LeadDrawer } from "@/components/LeadDrawer";
import { Header } from "@/components/Header";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching leads:', error);
    else setLeads(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();

    // Realtime subscription
    const channel = supabase
      .channel('leads_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
          setLeads(prev => [payload.new as Lead, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leads' }, (payload) => {
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
  }, [selectedLead?.id]); // Add dependency to ensure state consistency

  const handleContactUpdate = (id: string, status: boolean) => {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, contacted: status } : l));
      if (selectedLead && selectedLead.id === id) {
          setSelectedLead({ ...selectedLead, contacted: status });
      }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="px-6 py-8 max-w-5xl mx-auto space-y-8">
        {/* Intro */}
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Live Signals
            </h1>
            <p className="text-lg text-muted-foreground">
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

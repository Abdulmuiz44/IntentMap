'use client';

import React, { useState, useMemo } from 'react';
import { Lead } from '@/lib/supabase';
import { LeadDrawer } from './LeadDrawer';
import { Filter, ArrowUpDown } from 'lucide-react';
import clsx from 'clsx';

interface LeadTableProps {
  initialLeads: Lead[];
}

export const LeadTable: React.FC<LeadTableProps> = ({ initialLeads }) => {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterSubreddit, setFilterSubreddit] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Extract unique subreddits (Assuming subreddit is part of platform or needs to be parsed, 
  // actually schema says 'platform' but earlier scraper code saves 'reddit'.
  // Wait, the scraper saves "subreddit" in "platform"? No, schema says `platform TEXT`.
  // Scraper: `platform: 'reddit'`. 
  // Ah, the scraper doesn't save subreddit in a separate column in the DB schema I wrote earlier!
  // It saves `platform: 'reddit'` and `post_url`. 
  // I should extract subreddit from URL or add a column.
  // For now, I will extract from URL if possible, or just ignore subreddit filter or mock it.
  // Actually, let's just filter by "Pain > 8" vs "All".
  // Or check if I can parse subreddit from URL: `reddit.com/r/SaaS/...`
  
  const subreddits = useMemo(() => {
     const subs = new Set<string>();
     leads.forEach(l => {
         const match = l.post_url.match(/reddit\.com\/r\/([^/]+)/);
         if (match && match[1]) subs.add(match[1]);
     });
     return ['All', ...Array.from(subs)];
  }, [leads]);

  const filteredLeads = useMemo(() => {
    let result = [...leads];

    if (filterSubreddit !== 'All') {
        result = result.filter(l => l.post_url.includes(`/r/${filterSubreddit}`));
    }

    result.sort((a, b) => {
        return sortOrder === 'desc' 
            ? b.pain_score - a.pain_score 
            : a.pain_score - b.pain_score;
    });

    return result;
  }, [leads, filterSubreddit, sortOrder]);

  const handleContactUpdate = (id: string, status: boolean) => {
      setLeads(current => 
        current.map(l => l.id === id ? { ...l, contacted: status } : l)
      );
      if (selectedLead && selectedLead.id === id) {
          setSelectedLead(prev => prev ? { ...prev, contacted: status } : null);
      }
  };

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
         <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 border border-slate-500 px-3 py-2">
                <Filter size={16} />
                <select 
                    value={filterSubreddit}
                    onChange={(e) => setFilterSubreddit(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm uppercase tracking-wider font-bold appearance-none pr-4"
                >
                    {subreddits.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>

             <button 
                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-2 border border-slate-500 px-3 py-2 text-sm uppercase tracking-wider font-bold hover:bg-slate-100 dark:hover:bg-slate-900"
             >
                 <ArrowUpDown size={16} />
                 Pain Score
             </button>
         </div>
         
         <div className="text-sm text-slate-500">
             Showing {filteredLeads.length} leads
         </div>
      </div>

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 border-b border-slate-500 text-xs uppercase tracking-widest text-slate-500 font-bold">
          <div className="col-span-1">Score</div>
          <div className="col-span-1">WTP</div>
          <div className="col-span-6">Topic</div>
          <div className="col-span-2">Platform</div>
          <div className="col-span-2 text-right">Status</div>
      </div>

      {/* List */}
      <div className="space-y-0">
          {filteredLeads.map((lead) => (
              <div 
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className={clsx(
                    "grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-4 border-b border-slate-500 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group items-center",
                    lead.contacted && "opacity-50 grayscale"
                )}
              >
                  {/* Mobile Mobile Label */}
                  <div className="md:hidden text-xs text-slate-500 uppercase">Pain Score</div>
                  <div className="col-span-1 font-mono font-bold text-lg flex items-center">
                      {lead.pain_score}
                      <span className="text-slate-400 text-xs ml-1">/10</span>
                  </div>

                  <div className="md:hidden text-xs text-slate-500 uppercase">WTP Signal</div>
                  <div className="col-span-1">
                      {lead.wtp_signal && <span className="text-xs font-bold px-1 border border-black dark:border-white">$$$</span>}
                  </div>

                  <div className="col-span-6">
                      <h4 className="font-medium truncate pr-4">{lead.title}</h4>
                      <p className="text-xs text-slate-500 truncate mt-1 md:hidden lg:block">
                          {lead.ai_analysis.hard_pain_summary}
                      </p>
                  </div>

                  <div className="col-span-2 text-xs uppercase tracking-wider text-slate-500">
                      Reddit
                  </div>

                  <div className="col-span-2 flex justify-end">
                      {lead.contacted ? (
                          <span className="text-xs border border-slate-500 px-2 py-1 uppercase">Contacted</span>
                      ) : (
                           <span className="hidden group-hover:inline-block text-xs border border-black dark:border-white px-2 py-1 uppercase">
                               View
                           </span>
                      )}
                  </div>
              </div>
          ))}
      </div>

      {/* Detail Drawer */}
      {selectedLead && (
          <LeadDrawer 
            lead={selectedLead} 
            onClose={() => setSelectedLead(null)} 
            onContactUpdate={handleContactUpdate}
          />
      )}
    </div>
  );
};

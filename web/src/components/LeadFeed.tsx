import React from 'react';
import { DollarSign, Flame, Activity } from 'lucide-react';
import { Lead } from '@/lib/supabase';

interface LeadFeedProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  isLoading?: boolean;
}

const LeadSkeleton = () => (
    <div className="flex flex-col gap-3 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 animate-pulse">
        <div className="flex items-center gap-2">
            <div className="h-5 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full"></div>
            <div className="h-5 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full"></div>
            <div className="ml-auto h-4 w-20 bg-zinc-100 dark:bg-zinc-800 rounded"></div>
        </div>
        <div className="space-y-2 mt-2">
            <div className="h-5 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded"></div>
            <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded"></div>
        </div>
    </div>
);

export const LeadFeed: React.FC<LeadFeedProps> = ({ leads, onSelectLead, isLoading }) => {
  if (isLoading) {
      return (
          <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => <LeadSkeleton key={i} />)}
          </div>
      );
  }

  if (leads.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900/20 animate-pulse">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl"></div>
                <div className="relative bg-white dark:bg-black p-4 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <Activity size={28} className="text-zinc-900 dark:text-zinc-100 animate-pulse" />
                </div>
            </div>
            <div className="flex flex-col items-center gap-1">
                <p className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">Scanning for signals...</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-[250px] text-center font-medium">
                    Monitoring social discussions in real-time.
                </p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {leads.map((lead) => (
        <div 
          key={lead.id}
          onClick={() => onSelectLead(lead)}
          className="group relative flex flex-col gap-3 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:scale-[1.01] transition-all duration-300 ease-out cursor-pointer"
        >
          {/* Header Badges */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 uppercase tracking-wider text-[10px]">
              {lead.platform}
            </span>
            <span className={`px-2.5 py-1 rounded-full flex items-center gap-1 border ${
                lead.pain_score >= 8 
                ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-transparent dark:border-rose-500/50 dark:text-rose-400' 
                : lead.pain_score >= 5 
                ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-transparent dark:border-orange-500/50 dark:text-orange-400' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-transparent dark:border-emerald-500/50 dark:text-emerald-400'
            }`}>
               <Flame size={12} /> Pain: {lead.pain_score}
            </span>
            {lead.wtp_signal && (
               <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-transparent dark:border-emerald-500/50 dark:text-emerald-400 flex items-center gap-1">
                 <DollarSign size={12} /> WTP
               </span>
            )}
            <span className="ml-auto text-zinc-400 dark:text-zinc-500 tabular-nums text-[10px] font-medium uppercase tracking-widest">
                {new Date(lead.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Content */}
          <div>
            <h3 className="text-lg font-bold leading-tight mb-2 text-zinc-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {lead.title}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-medium">
                {lead.ai_analysis.hard_pain_summary || lead.selftext}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

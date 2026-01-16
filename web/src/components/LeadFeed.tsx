import React from 'react';
import { ExternalLink, MessageCircle, DollarSign, Flame, Activity } from 'lucide-react';
import { Lead } from '@/lib/supabase';

interface LeadFeedProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  isLoading?: boolean;
}

const LeadSkeleton = () => (
    <div className="flex flex-col gap-3 p-6 bg-card rounded-2xl border border-border/50 animate-pulse">
        <div className="flex items-center gap-2">
            <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
            <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
            <div className="ml-auto h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
        <div className="space-y-2 mt-1">
            <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
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
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/30 dark:bg-zinc-900/10">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative bg-white dark:bg-zinc-900 p-5 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-xl">
                    <Activity size={32} className="text-blue-500 animate-[pulse_2s_infinite]" />
                </div>
            </div>
            <div className="flex flex-col items-center gap-1">
                <p className="text-lg font-semibold tracking-tight">Scanning for signals...</p>
                <p className="text-sm text-zinc-500 max-w-[250px] text-center">
                    IntentMap is monitoring social discussions in real-time.
                </p>
            </div>
            <div className="mt-8 flex gap-1">
                <div className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full animate-bounce"></div>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {leads.map((lead) => (
        <div 
          key={lead.id}
          onClick={() => onSelectLead(lead)}
          className="group relative flex flex-col gap-3 p-6 bg-card hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-200 cursor-pointer"
        >
          {/* Header Badges */}
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground uppercase tracking-wider">
              {lead.platform}
            </span>
            <span className={`px-2.5 py-1 rounded-full flex items-center gap-1 border ${
                lead.pain_score >= 8 
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/20' 
                : lead.pain_score >= 5 
                ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200/20' 
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/20'
            }`}>
               <Flame size={12} /> Pain: {lead.pain_score}/10
            </span>
            {lead.wtp_signal && (
               <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/20 flex items-center gap-1">
                 <DollarSign size={12} /> WTP
               </span>
            )}
            <span className="ml-auto text-muted-foreground">
                {new Date(lead.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Content */}
          <div>
            <h3 className="text-lg font-semibold leading-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {lead.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
                {lead.ai_analysis.hard_pain_summary || lead.selftext}
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center pt-2 mt-2 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-medium text-blue-600 flex items-center gap-1">
                  View Analysis &rarr;
              </span>
          </div>
        </div>
      ))}
    </div>
  );
};


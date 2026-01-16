import React from 'react';
import { ExternalLink, MessageCircle, DollarSign, Flame } from 'lucide-react';
import { Lead } from '@/lib/supabase';

interface LeadFeedProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

export const LeadFeed: React.FC<LeadFeedProps> = ({ leads, onSelectLead }) => {
  if (leads.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="bg-secondary p-4 rounded-full mb-4">
                <MessageCircle size={32} />
            </div>
            <p>No signals found yet.</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {leads.map((lead) => (
        <div 
          key={lead.id}
          onClick={() => onSelectLead(lead)}
          className="group relative flex flex-col gap-3 p-6 bg-card hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          {/* Header Badges */}
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground uppercase tracking-wider">
              {lead.platform}
            </span>
            <span className={`px-2.5 py-1 rounded-full flex items-center gap-1 ${
                lead.pain_score >= 8 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                lead.pain_score >= 5 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            }`}>
               <Flame size={12} /> Pain: {lead.pain_score}/10
            </span>
            {lead.wtp_signal && (
               <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-1">
                 <DollarSign size={12} /> WTP Detected
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

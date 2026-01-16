import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Lead } from '@/lib/supabase';
import { ActionButtons } from './ActionButtons';

interface LeadDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onContactUpdate: (id: string, status: boolean) => void;
}

export const LeadDrawer: React.FC<LeadDrawerProps> = ({ lead, onClose, onContactUpdate }) => {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full md:w-[600px] h-full bg-white dark:bg-black border-l border-slate-500 p-8 overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Lead Analysis</h2>
          <button onClick={onClose} className="p-2 border border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8">
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 border border-slate-500 text-xs uppercase font-bold">
                Pain Score: {lead.pain_score}/10
              </span>
              {lead.wtp_signal && (
                <span className="px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black text-xs uppercase font-bold">
                  $$$ WTP Signal
                </span>
              )}
            </div>
            <h3 className="text-xl font-medium mb-2">{lead.title}</h3>
            <a 
              href={lead.post_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-slate-500 hover:underline flex items-center gap-1"
            >
              View on Reddit <ExternalLink size={12} />
            </a>
          </div>

          {/* AI Analysis */}
          <div className="p-4 border border-slate-500 bg-slate-50 dark:bg-slate-900/50">
            <h4 className="text-sm uppercase tracking-widest text-slate-500 mb-2">The Pain</h4>
            <p className="text-base leading-relaxed">
              {lead.ai_analysis.hard_pain_summary}
            </p>
          </div>

          {/* Mom Test Question */}
          <div>
             <h4 className="text-sm uppercase tracking-widest text-slate-500 mb-2">The &apos;Mom Test&apos; Opener</h4>
             <div className="p-6 border border-slate-500 bg-white dark:bg-black text-lg font-mono">
               &quot;{lead.ai_analysis.mom_test_question}&quot;
             </div>
          </div>
          
           {/* Actions */}
           <div className="pt-8 border-t border-slate-500">
              <ActionButtons 
                leadId={lead.id} 
                dmQuestion={lead.ai_analysis.mom_test_question} 
                isContacted={lead.contacted}
                onContactUpdate={(status) => onContactUpdate(lead.id, status)}
              />
           </div>

           {/* Original Post Content */}
           <div className="pt-8 opacity-50">
             <h4 className="text-xs uppercase tracking-widest mb-2">Original Post</h4>
             <p className="text-sm whitespace-pre-wrap font-mono">{lead.selftext}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { X, ExternalLink, CheckCircle2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full md:w-[650px] h-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 p-8 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-1">
              <h2 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Lead Analysis</h2>
              <div className="text-xs text-zinc-500 font-mono">{lead.id.slice(0, 8)}...</div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-10">
          {/* Title Section */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
               {lead.synced && (
                   <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold flex items-center gap-1">
                       <CheckCircle2 size={12} /> SYNCED
                   </span>
               )}
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                   lead.score >= 8 ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-transparent dark:border-rose-500/50 dark:text-rose-400' : 'bg-zinc-50 border-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300'
              }`}>
                Intent Score: {lead.score}/10
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold">
                  {lead.intent_category}
              </span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-3 leading-snug text-zinc-950 dark:text-white">
                Signal from {lead.author}
            </h3>
            <a 
              href={lead.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline"
            >
              Open Source <ExternalLink size={14} />
            </a>
          </div>

          {/* AI Analysis Card */}
          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">The Pain Point</h4>
            <p className="text-base leading-7 text-zinc-900 dark:text-zinc-100">
              {lead.pain_point}
            </p>
          </div>

          {/* Mom Test Question */}
          <div>
             <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Suggested Reply</h4>
             <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-lg font-medium text-zinc-950 dark:text-white relative">
               <div className="absolute -left-3 top-6 w-1 h-8 bg-blue-500 rounded-full"></div>
               &quot;{lead.drafted_reply}&quot;
             </div>
          </div>
          
           {/* Actions */}
           <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
              <ActionButtons 
                leadId={lead.id} 
                draftedReply={lead.drafted_reply}
                isSynced={lead.synced}
                onSyncUpdate={(status) => onContactUpdate(lead.id, status)}
              />
           </div>

           {/* Original Post Content */}
           <div className="pt-8 opacity-60 hover:opacity-100 transition-opacity">
             <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Original Post Context</h4>
             <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 text-sm whitespace-pre-wrap font-mono text-zinc-600 dark:text-zinc-400">
                {lead.content}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
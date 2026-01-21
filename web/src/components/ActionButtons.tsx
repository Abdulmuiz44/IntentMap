import React from 'react';
import { MessageSquare, Check, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ActionButtonsProps {
  leadId: string;
  draftedReply: string;
  isSynced: boolean;
  onSyncUpdate: (status: boolean) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ leadId, draftedReply, isSynced, onSyncUpdate }) => {
  const [loading, setLoading] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(draftedReply);
    // Could add toast here
  };

  const markSynced = async () => {
    setLoading(true);
    try {
        const { error } = await supabase
            .from('intent_leads')
            .update({ synced: !isSynced })
            .eq('id', leadId);
            
        if (!error) {
            onSyncUpdate(!isSynced);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={handleCopy}
        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-medium hover:bg-foreground/90 transition-all shadow-sm active:scale-[0.98] border border-transparent bg-zinc-900 text-white dark:bg-white dark:text-black"
      >
        <MessageSquare size={18} />
        Copy Draft
      </button>
      
      <button 
        onClick={markSynced}
        disabled={loading}
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium border transition-all shadow-sm active:scale-[0.98] ${
            isSynced 
            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
            : 'bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800'
        }`}
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : (isSynced ? <Check size={18} /> : <RefreshCw size={18} />)}
        {isSynced ? 'Synced to CRM' : 'Sync to CRM'}
      </button>
    </div>
  );
};

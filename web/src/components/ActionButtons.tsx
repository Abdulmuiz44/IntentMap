import React from 'react';
import { MessageSquare, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ActionButtonsProps {
  leadId: string;
  dmQuestion: string;
  isContacted: boolean;
  onContactUpdate: (status: boolean) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ leadId, dmQuestion, isContacted, onContactUpdate }) => {
  const [loading, setLoading] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(dmQuestion);
    // Could add toast here
  };

  const markContacted = async () => {
    setLoading(true);
    try {
        const { error } = await supabase
            .from('leads')
            .update({ contacted: !isContacted })
            .eq('id', leadId);
            
        if (!error) {
            onContactUpdate(!isContacted);
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
        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-medium hover:bg-foreground/90 transition-all shadow-sm active:scale-[0.98]"
      >
        <MessageSquare size={18} />
        Copy Opener
      </button>
      
      <button 
        onClick={markContacted}
        disabled={loading}
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium border transition-all shadow-sm active:scale-[0.98] ${
            isContacted 
            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
            : 'bg-background text-foreground border-border hover:bg-secondary'
        }`}
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
        {isContacted ? 'Contacted' : 'Mark Contacted'}
      </button>
    </div>
  );
};
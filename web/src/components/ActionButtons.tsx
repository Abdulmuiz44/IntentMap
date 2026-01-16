'use client';

import React from 'react';
import { Copy, CheckCircle, Circle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ActionButtonsProps {
  leadId: string;
  dmQuestion: string;
  isContacted: boolean;
  onContactUpdate: (newStatus: boolean) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ leadId, dmQuestion, isContacted, onContactUpdate }) => {
  const [copying, setCopying] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(dmQuestion);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const toggleContacted = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !isContacted;
    // Optimistic update
    onContactUpdate(newStatus);
    
    const { error } = await supabase
      .from('leads')
      .update({ contacted: newStatus })
      .eq('id', leadId);

    if (error) {
      console.error('Error updating status:', error);
      // Revert if error (optional, but good practice)
      onContactUpdate(!newStatus);
    }
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleCopy} 
        className="flex items-center gap-2 px-3 py-1 border border-slate-500 text-xs uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
      >
        <Copy size={14} />
        {copying ? 'Copied' : 'Copy DM'}
      </button>

      <button 
        onClick={toggleContacted}
        className="flex items-center gap-2 px-3 py-1 border border-slate-500 text-xs uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
      >
        {isContacted ? <CheckCircle size={14} /> : <Circle size={14} />}
        {isContacted ? 'Contacted' : 'Mark Done'}
      </button>
    </div>
  );
};

'use client';

import React from 'react';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  MessageSquare, 
  MoreHorizontal, 
  Twitter, 
  Linkedin, 
  Globe 
} from 'lucide-react';
import { Lead } from '@/lib/supabase';

// Helper components
const SourceIcon = ({ source }: { source: string }) => {
  const s = source.toLowerCase();
  if (s.includes('twitter') || s.includes('x')) return <Twitter className="w-4 h-4 text-blue-400" />;
  if (s.includes('linkedin')) return <Linkedin className="w-4 h-4 text-blue-600" />;
  if (s.includes('reddit')) return <Globe className="w-4 h-4 text-orange-500" />;
  return <Globe className="w-4 h-4 text-gray-400" />;
};

const ScoreBadge = ({ score }: { score: number }) => {
  const isHigh = score > 8;
  return (
    <div className={`
      flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
      ${isHigh 
        ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_10px_-3px_rgba(74,222,128,0.5)]' 
        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}
    `}>
      <span>{score}/10 Intent</span>
    </div>
  );
};

interface LeadFeedProps {
  leads?: Lead[];
  onSelectLead?: (lead: Lead) => void;
  isLoading?: boolean;
}

export default function LeadFeed({ leads = [], onSelectLead, isLoading }: LeadFeedProps) {

  if (isLoading) {
    return <div className="text-center text-gray-500 py-10">Loading signals...</div>;
  }

  if (!leads || leads.length === 0) {
    return <div className="text-center text-gray-500 py-10">No leads found yet. Waiting for signals...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {leads.map((lead) => (
        <div 
          key={lead.id}
          className="group relative flex flex-col justify-between p-5 bg-[#1F1F1F] rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 cursor-pointer"
          onClick={() => onSelectLead?.(lead)}
        >
          {/* Card Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                  <SourceIcon source={lead.source} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white truncate max-w-[150px]">{lead.author}</h3>
                <span className="text-xs text-gray-500">
                  {new Date(lead.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button className="text-gray-600 hover:text-white transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-sm text-gray-300 leading-relaxed line-clamp-4">
              "{lead.content}"
            </p>
          </div>

          {/* Metadata Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <ScoreBadge score={lead.score} />
            <span className="px-2 py-1 rounded-full text-xs bg-white/5 text-gray-400 border border-white/5">
              {lead.intent_category}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
            <div className="flex gap-3">
                <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-400 transition-colors">
                <MessageSquare className="w-3.5 h-3.5" />
                Draft
              </button>
              <a 
                href={lead.url} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-400 transition-colors"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Source
              </a>
            </div>

            <div className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${lead.synced 
                  ? 'bg-green-500/10 text-green-500 cursor-default' 
                  : 'bg-white/10 text-gray-400'}
              `}
            >
              {lead.synced ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Synced
                </>
              ) : (
                'Unsynced'
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

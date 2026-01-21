'use client';

import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  MessageSquare, 
  MoreHorizontal, 
  RefreshCw, 
  Twitter, 
  Linkedin, 
  Globe 
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming standard shadcn/ui utils exist or I will inline a simple helper if strict

// Inline utility for class merging if specific lib path varies, 
// but using standard clsx/tailwind-merge pattern is safer if the project has it.
// Given package.json has clsx and tailwind-merge, I'll rely on imports or fallback.
// Since I can't be 100% sure of @/lib/utils content, I'll implement a local helper if imports fail, 
// but for this file I will assume standard usage or provide a safe version.

// Mock Data Interface
interface Lead {
  id: string;
  author: string;
  source: 'Twitter' | 'Reddit' | 'LinkedIn';
  content: string;
  score: number;
  pain_point: string;
  category: 'Switching' | 'NewSearch' | 'Complaint';
  timestamp: string;
  synced: boolean;
}

const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    author: '@alex_founder',
    source: 'Twitter',
    content: "Salesforce is just too complex for our 10-person team. We need something simpler that just works for outbound.",
    score: 9,
    pain_point: "Complexity/Cost",
    category: 'Switching',
    timestamp: '2m ago',
    synced: false,
  },
  {
    id: '2',
    author: 'u/saas_wizard',
    source: 'Reddit',
    content: "Looking for recommendations on intent data providers. ZoomInfo is way out of budget.",
    score: 8,
    pain_point: "Budget constraints",
    category: 'NewSearch',
    timestamp: '15m ago',
    synced: true,
  },
  {
    id: '3',
    author: 'Sarah Jenkins',
    source: 'LinkedIn',
    content: "Does anyone know a tool that can track buyer signals from social media automatically?",
    score: 10,
    pain_point: "Automation need",
    category: 'NewSearch',
    timestamp: '1h ago',
    synced: false,
  },
  {
    id: '4',
    author: '@dev_marketer',
    source: 'Twitter',
    content: "My current CRM keeps crashing. Need a reliable alternative ASAP.",
    score: 7,
    pain_point: "Stability",
    category: 'Complaint',
    timestamp: '3h ago',
    synced: false,
  }
];

const SourceIcon = ({ source }: { source: Lead['source'] }) => {
  switch (source) {
    case 'Twitter': return <Twitter className="w-4 h-4 text-blue-400" />;
    case 'LinkedIn': return <Linkedin className="w-4 h-4 text-blue-600" />;
    case 'Reddit': return <Globe className="w-4 h-4 text-orange-500" />;
    default: return <Globe className="w-4 h-4 text-gray-400" />;
  }
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

export default function LeadFeed() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);

  const handleSync = (id: string) => {
    setLeads(leads.map(lead => 
      lead.id === id ? { ...lead, synced: true } : lead
    ));
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-gray-300 p-6 font-sans selection:bg-purple-500/30">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Lead Feed</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time intent signals from across the web.</p>
        </div>
        <div className="flex gap-3">
          <button className="p-2 bg-[#1F1F1F] hover:bg-[#2A2A2A] rounded-lg border border-white/5 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leads.map((lead) => (
          <div 
            key={lead.id}
            className="group relative flex flex-col justify-between p-5 bg-[#1F1F1F] rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5"
          >
            {/* Card Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                   <SourceIcon source={lead.source} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">{lead.author}</h3>
                  <span className="text-xs text-gray-500">{lead.timestamp}</span>
                </div>
              </div>
              <button className="text-gray-600 hover:text-white transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-sm text-gray-300 leading-relaxed">
                "{lead.content}"
              </p>
            </div>

            {/* Metadata Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <ScoreBadge score={lead.score} />
              <span className="px-2 py-1 rounded-full text-xs bg-white/5 text-gray-400 border border-white/5">
                {lead.category}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
              <div className="flex gap-3">
                 <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-400 transition-colors">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Draft Reply
                </button>
                <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-400 transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  View Source
                </button>
              </div>

              <button 
                onClick={() => handleSync(lead.id)}
                disabled={lead.synced}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${lead.synced 
                    ? 'bg-green-500/10 text-green-500 cursor-default' 
                    : 'bg-white text-black hover:bg-gray-200'}
                `}
              >
                {lead.synced ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Synced
                  </>
                ) : (
                  'Sync to CRM'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
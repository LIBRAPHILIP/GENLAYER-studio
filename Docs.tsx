import React from 'react';
import { 
  Terminal, 
  Cpu, 
  Globe, 
  ShieldCheck, 
  ChevronRight,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

export default function Docs() {
  return (
    <div className="h-full flex bg-[#0B0E14]">
      <div className="w-80 border-r border-slate-800 hidden lg:flex flex-col bg-[#12161F]">
        <ScrollArea className="flex-1 p-8">
          <div className="space-y-10">
            <div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Getting Started</h3>
              <div className="space-y-1">
                {['Introduction', 'Quickstart', 'Intelligent Contracts'].map(item => (
                  <button key={item} className="w-full text-left px-4 py-2.5 text-sm text-slate-400 font-bold hover:text-white hover:bg-slate-800/50 rounded-lg transition-all">
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">GenLayer SDK</h3>
              <div className="space-y-1">
                {['Installation', 'Contract Anatomy', 'State Management'].map(item => (
                  <button key={item} className="w-full text-left px-4 py-2.5 text-sm text-slate-400 font-bold hover:text-white hover:bg-slate-800/50 rounded-lg transition-all">
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 overflow-auto p-16 lg:p-24 bg-[#0B0E14]">
        <div className="max-w-3xl space-y-12">
          <div className="space-y-6">
            <div className="text-indigo-400 font-black tracking-[0.3em] text-[10px] uppercase">Documentation / Introduction</div>
            <h1 className="text-7xl font-black tracking-tighter leading-none text-white">GenLayer Protocol</h1>
            <p className="text-2xl text-slate-400 leading-relaxed font-medium">
              The first decentralized protocol for <span className="text-white underline decoration-indigo-500/50 decoration-4 underline-offset-8">Intelligent Contracts</span>. 
              Real-time reasoning, verified by the network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12 border-b border-slate-800">
            <DocCard title="Web-Native Oracles" desc="Connect to any HTTP API or Social Media platform securely." />
            <DocCard title="Consensus Reasoning" desc="LLM outputs are verified across multiple validator nodes." />
          </div>

          <div className="pt-8 space-y-6">
            <h2 className="text-3xl font-black text-white tracking-tight">Quick Start</h2>
            <div className="bg-[#12161F] rounded-2xl p-8 font-mono text-sm border border-slate-800 shadow-xl overflow-hidden relative group">
              <div className="text-slate-500 mb-2 font-bold tracking-tight"># Install the SDK</div>
              <div className="text-indigo-400 font-bold">$ npm install @genlayer/sdk</div>
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-white">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-8 rounded-2xl border border-slate-800 bg-[#12161F] space-y-3 hover:border-slate-600 transition-all shadow-lg group">
      <h3 className="font-black text-white text-xl tracking-tight group-hover:text-indigo-400 transition-colors">{title}</h3>
      <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

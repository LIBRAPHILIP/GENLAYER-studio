import React from 'react';
import { 
  Vote, 
  Users, 
  BarChart3, 
  ChevronRight, 
  MessageCircle, 
  Clock,
  ShieldCheck,
  Filter,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function Governance() {
  const proposals = [
    {
      id: "GP-42",
      title: "Integrate Pyth Network Oracle as a Core Provider",
      description: "Proposed integration of Pyth high-frequency data for lower latency intelligent contracts.",
      votesFor: 65,
      votesAgainst: 12,
      endsIn: "2 days",
      status: "Active",
      category: "Infrastructure"
    },
    {
      id: "GP-41",
      title: "Adjust Testnet Faucet Daily Limit to 20 GEN",
      description: "Increase daily request limit to accommodate larger-scale dApp simulation tests.",
      votesFor: 89,
      votesAgainst: 2,
      endsIn: "6 hours",
      status: "Executing",
      category: "Economic"
    },
    {
      id: "GP-40",
      title: "Establish Decentralized Validator Council (DVC)",
      description: "Create a formal structure for node operators to coordinate upgrades and security.",
      votesFor: 44,
      votesAgainst: 31,
      endsIn: "Closed",
      status: "Passed",
      category: "Governance"
    }
  ];

  const handleNewProposal = () => {
    toast.info("Governance proposal submission is currently restricted to verified validators with > 10,000 GEN staked.");
  };

  return (
    <div className="h-full overflow-auto p-10 max-w-5xl mx-auto space-y-10 pb-20 bg-[#0B0E14]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-indigo-500/10 text-indigo-400 border-none font-black tracking-widest text-[9px] px-3 py-1">GEN_DAO</Badge>
            <span className="text-slate-700 text-sm">•</span>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Decentralized Governance</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white">Governance</h1>
          <p className="text-slate-400 text-lg">Participate in the evolution of GenLayer through transparent voting.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button 
            onClick={handleNewProposal}
            className="bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 px-6 font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Proposal
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <GovStat icon={<Users className="w-4 h-4" />} label="Token Holders" value="1,492" />
        <GovStat icon={<Vote className="w-4 h-4" />} label="Active Proposals" value="2" />
        <GovStat icon={<ShieldCheck className="w-4 h-4" />} label="Treasury" value="2.4M GEN" />
      </div>

      {/* Proposals List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2 pb-4 border-b border-slate-800/50">
          <h2 className="text-sm font-bold flex items-center gap-2 text-white uppercase tracking-widest">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Active Proposals
          </h2>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sorted by Activity</span>
        </div>

        <div className="space-y-6">
          {proposals.map((proposal) => (
            <ProposalCard key={proposal.id} {...proposal} />
          ))}
        </div>
      </div>
    </div>
  );
}

function GovStat({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-[#12161F] flex items-center gap-6 group hover:border-slate-600 transition-all shadow-xl">
      <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors border border-slate-800">
        {icon}
      </div>
      <div>
        <div className="text-[10px] uppercase font-black tracking-[0.15em] text-slate-500 mb-1">{label}</div>
        <div className="text-2xl font-black text-white tracking-tight">{value}</div>
      </div>
    </div>
  );
}

function ProposalCard({ id, title, description, votesFor, votesAgainst, endsIn, status, category }: any) {
  const totalVotes = votesFor + votesAgainst;
  const forPercentage = (votesFor / totalVotes) * 100;

  return (
    <Card className="bg-[#12161F] border-slate-800 hover:border-slate-600 transition-all cursor-pointer group shadow-xl">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-slate-500 font-mono text-[10px] font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{id}</span>
              <Badge variant="outline" className="bg-slate-900 border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-widest">{category}</Badge>
              <div className={`ml-auto flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                status === 'Active' ? 'bg-indigo-500/10 text-indigo-400' :
                status === 'Executing' ? 'bg-amber-500/10 text-amber-400' :
                'bg-emerald-500/10 text-emerald-400'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  status === 'Active' ? 'bg-indigo-400 animate-pulse' :
                  status === 'Executing' ? 'bg-amber-400' :
                  'bg-emerald-400'
                }`} />
                {status}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black text-white mb-3 group-hover:text-indigo-400 transition-colors tracking-tight">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">{description}</p>
            </div>

            <div className="flex items-center gap-8 pt-2">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                {endsIn === 'Closed' ? 'Voting ended' : `Ends in ${endsIn}`}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                <MessageCircle className="w-3.5 h-3.5" />
                12 Comments
              </div>
            </div>
          </div>

          <div className="w-full lg:w-72 space-y-6 border-l border-slate-800 lg:pl-10 flex flex-col justify-center">
             <div className="space-y-3">
               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                 <span className="text-emerald-400">For</span>
                 <span className="text-white">{votesFor}%</span>
               </div>
               <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${forPercentage}%` }}
                    className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                  />
               </div>
             </div>
             <div className="space-y-3">
               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-50">
                 <span className="text-rose-400 shrink-0">Against</span>
                 <span className="text-white">{votesAgainst}%</span>
               </div>
               <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 opacity-50">
                 <div className="h-full bg-rose-500/50 w-[12%]" />
               </div>
             </div>
             <Button 
               onClick={() => toast.success(`Viewing details for ${id}`)}
               size="sm" 
               className="w-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all mt-2 font-bold text-xs h-10"
             >
               VIEW DETAILS
               <ChevronRight className="w-4 h-4 ml-1" />
             </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

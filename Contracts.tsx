import React from 'react';
import { 
  FileCode, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Search,
  Layers,
  Zap,
  Globe,
  Database
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Contracts() {
  const contracts = [
    {
      id: "0x7a2...b4e1",
      name: "WeatherBet_v2",
      type: "Intelligent Contract",
      status: "Verified",
      deployedAt: "2 hours ago",
      oracles: ["Weather Oracle", "Price Feed"],
      consensusNodes: 12,
      owner: "0x123...456"
    },
    {
      id: "0x3c1...9d2a",
      name: "DynamicTokenDistributor",
      type: "Yield Optimization",
      status: "Active",
      deployedAt: "1 day ago",
      oracles: ["Price Feed"],
      consensusNodes: 8,
      owner: "0x123...456"
    },
    {
      id: "0x9f1...8c4b",
      name: "SocialSentimentDAO",
      type: "Governance",
      status: "Verified",
      deployedAt: "3 days ago",
      oracles: ["X Sentiment API"],
      consensusNodes: 16,
      owner: "0x123...456"
    }
  ];

  return (
    <div className="h-full overflow-auto p-10 max-w-6xl mx-auto space-y-10 bg-[#0B0E14] pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-indigo-500/10 text-indigo-400 border-none font-black tracking-widest text-[9px] px-3 py-1">GEN_SCAN</Badge>
            <span className="text-slate-700 text-sm">•</span>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Chain ID: 4221</span>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest opacity-50">https://zksync-os-testnet-genlayer.zksync.dev</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white">Deployed Contracts</h1>
          <p className="text-slate-400 text-lg">Manage and monitor your intelligent contracts on the GenLayer Testnet Chain.</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400" />
          <input 
            type="text" 
            placeholder="Search by address or name..." 
            className="bg-slate-900 border border-slate-700 rounded-xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-indigo-500 w-80 text-white shadow-lg transition-all"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard icon={<Layers className="w-5 h-5" />} label="Total Deployments" value="24" color="indigo" />
        <StatCard icon={<ShieldCheck className="w-5 h-5" />} label="Avg. Robustness" value="98.2%" color="emerald" />
        <StatCard icon={<Zap className="w-5 h-5" />} label="Inference Calls" value="1,492" color="amber" />
      </div>

      {/* Contract List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2 pb-4 border-b border-slate-800/50">
          <h2 className="text-sm font-bold flex items-center gap-2 text-white uppercase tracking-widest">
            <FileCode className="w-4 h-4 text-indigo-400" />
            Active Deployments
          </h2>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Showing last 24h</span>
        </div>

        <div className="grid gap-6">
          {contracts.map((contract) => (
            <Card key={contract.id} className="bg-[#12161F] border-slate-800 hover:border-slate-600 transition-all shadow-xl group overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row lg:items-center">
                  <div className="p-8 flex-1 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 border border-slate-800 group-hover:border-indigo-500/30 transition-colors">
                          <FileCode className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors">{contract.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono text-slate-500">{contract.id}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-5 w-5 p-0 text-slate-600 hover:text-white"
                              onClick={() => {
                                navigator.clipboard.writeText(contract.id);
                                toast.success("Address copied");
                              }}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Badge className={`
                        ${contract.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'} 
                        border-none font-black px-4 py-1 text-[10px] uppercase tracking-widest
                      `}>
                        {contract.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                      <InfoItem icon={<Clock className="w-3.5 h-3.5" />} label="Deployed" value={contract.deployedAt} />
                      <InfoItem icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Consensus Nodes" value={contract.consensusNodes} />
                      <InfoItem icon={<Database className="w-3.5 h-3.5" />} label="Owner" value={contract.owner} />
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Active Oracles</span>
                        <div className="flex gap-1.5">
                          {contract.oracles.map((oracle, i) => (
                            <Badge key={i} variant="outline" className="text-[9px] bg-slate-900 border-slate-800 text-slate-400 px-2 py-0">
                              {oracle}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900/30 border-t lg:border-t-0 lg:border-l border-slate-800 p-8 flex flex-col gap-3 min-w-[200px]">
                    <Button 
                      className="w-full bg-indigo-600 text-white hover:bg-indigo-500 font-bold"
                      onClick={() => toast.info(`Initializing Intelligent RPC for ${contract.name}`)}
                    >
                      Call Contract
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full bg-transparent border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                      onClick={() => window.open(`https://zksync-os-testnet-genlayer.explorer.zksync.dev/address/${contract.id}`, '_blank')}
                    >
                      View on Explorer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  const colors: Record<string, string> = {
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-[#12161F] flex items-center gap-6 group hover:border-slate-600 transition-all shadow-xl">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${colors[color] || colors.indigo}`}>
        {icon}
      </div>
      <div>
        <div className="text-[10px] uppercase font-black tracking-[0.15em] text-slate-500 mb-1">{label}</div>
        <div className="text-2xl font-black text-white tracking-tight">{value}</div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <div className="text-sm font-bold text-slate-300">{value}</div>
    </div>
  );
}

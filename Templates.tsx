import React from 'react';
import { 
  FileCode, 
  CloudRain, 
  TrendingUp, 
  Globe, 
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TemplatesProps {
  setActiveTab?: (tab: string) => void;
}

export default function Templates({ setActiveTab }: TemplatesProps) {
  const templates = [
    {
      title: "Weather Betting",
      desc: "Payout based on local temperature data from verified oracles.",
      tags: ["Oracles", "Finance"],
      icon: <CloudRain className="w-5 h-5 text-blue-400" />,
      difficulty: "Beginner"
    },
    {
      title: "Dynamic Price Hedge",
      desc: "Automated hedging strategy using real-time crypto price feeds.",
      tags: ["DeFi", "Advanced"],
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      difficulty: "Advanced"
    },
    {
      title: "Social Sentiment DAO",
      desc: "Governance voting triggered by X/Twitter sentiment analysis.",
      tags: ["Social", "DAO"],
      icon: <Globe className="w-5 h-5 text-purple-400" />,
      difficulty: "Intermediate"
    },
    {
      title: "Secure Bridge Monitor",
      desc: "Inference-based monitoring for cross-chain liquidity risks.",
      tags: ["Security", "Infrastructure"],
      icon: <ShieldCheck className="w-5 h-5 text-amber-400" />,
      difficulty: "Advanced"
    }
  ];

  const handleOpenStudio = (templateName: string) => {
    toast.success(`Loading ${templateName} template...`);
    if (setActiveTab) {
      setActiveTab('ide');
    }
  };

  const handleLaunchSandbox = () => {
    toast.info("Initializing Developer Sandbox environment...");
    setTimeout(() => {
      toast.success("Sandbox Ready: Local Node listening on port 8545");
      if (setActiveTab) {
        setActiveTab('ide');
      }
    }, 1500);
  };

  return (
    <div className="h-full overflow-auto p-10 space-y-10 max-w-6xl mx-auto bg-[#0B0E14]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-10">
        <div>
          <h1 className="text-5xl font-black tracking-tighter mb-2 text-white">Templates</h1>
          <p className="text-slate-400 text-lg">Kickstart your intelligent dApp with production-ready boilerplates.</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400" />
          <input 
            type="text" 
            placeholder="Search templates..." 
            className="bg-slate-900 border border-slate-700 rounded-xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-indigo-500 w-72 text-white shadow-lg transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {templates.map((t, idx) => (
          <Card key={idx} className="bg-[#12161F] border-slate-800 hover:border-slate-600 transition-all group overflow-hidden shadow-xl">
            <CardHeader className="flex flex-row gap-6 items-start pb-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800 group-hover:border-indigo-500/30 transition-colors">
                {t.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl text-white font-bold tracking-tight">{t.title}</CardTitle>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-5 bg-slate-900 border-slate-800 text-slate-500">
                    {t.difficulty}
                  </Badge>
                </div>
                <CardDescription className="text-slate-500 text-sm leading-relaxed font-medium">{t.desc}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {t.tags.map(tag => (
                  <div key={tag} className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 text-slate-400 text-xs font-bold border border-slate-800 uppercase tracking-tighter">
                    <Tag className="w-3 h-3 text-slate-600" />
                    {tag}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="bg-slate-900/40 border-t border-slate-800 px-6 py-5 group-hover:bg-indigo-600/5 transition-colors">
              <Button 
                onClick={() => handleOpenStudio(t.title)}
                size="sm" 
                className="bg-transparent hover:bg-transparent text-indigo-400 p-0 h-auto font-black uppercase tracking-widest text-[10px] group-hover:translate-x-2 transition-transform"
              >
                Open in Studio <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="p-10 rounded-3xl bg-indigo-900/10 border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative group">
        <div className="space-y-4 relative z-10">
          <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-4">
            <Zap className="w-8 h-8 text-indigo-400" />
            Developer Sandbox
          </h2>
          <p className="text-slate-400 max-w-lg text-lg leading-relaxed">Experimental environment with unlimited gas and pre-loaded mocks for rapid prototyping of intelligent contract logic.</p>
        </div>
        <Button 
          onClick={handleLaunchSandbox}
          className="bg-indigo-600 text-white hover:bg-indigo-500 px-10 py-8 rounded-2xl font-black text-xl shadow-lg shadow-indigo-900/40 relative z-10 whitespace-nowrap active:scale-95 transition-all"
        >
          Launch Sandbox
        </Button>
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500 opacity-[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
      </div>
    </div>
  );
}

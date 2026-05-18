import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  Search, 
  MessageSquare, 
  Bell, 
  CreditCard,
  Target,
  Box,
  Users,
  ExternalLink,
  Code2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../lib/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const stats = [
  { name: 'Mon', transactions: 4000 },
  { name: 'Tue', transactions: 3000 },
  { name: 'Wed', transactions: 2000 },
  { name: 'Thu', transactions: 2780 },
  { name: 'Fri', transactions: 1890 },
  { name: 'Sat', transactions: 2390 },
  { name: 'Sun', transactions: 3490 },
];

interface DashboardProps {
  setActiveTab?: (tab: string) => void;
}

export default function Dashboard({ setActiveTab }: DashboardProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ displayName?: string, walletAddress?: string }>({});

  useEffect(() => {
    let unsubscribe = () => {};
    if (user) {
      unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          setProfile({ displayName: user.displayName || user.email?.split('@')[0] });
        }
      }, (error) => {
        console.error('Error fetching profile from dashboard:', error);
      });
    }
    return () => unsubscribe();
  }, [user]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  const name = profile.displayName || user?.displayName || user?.email?.split('@')[0] || 'Developer';
  const [isDeploying, setIsDeploying] = useState(false);

  const handleQuickDeploy = async () => {
    if (!user) {
      toast.error("Please sign in to deploy templates");
      return;
    }

    if (!profile.walletAddress) {
      toast.error("Please connect your wallet in the profile section before deploying");
      if (setActiveTab) setActiveTab('profile');
      return;
    }

    setIsDeploying(true);
    toast.info(`Preparing optimized GenLayer deployment from ${profile.walletAddress.slice(0, 8)}...`);
    
    try {
      await new Promise(r => setTimeout(r, 2000));
      toast.success("Successfully deployed template contract to GenLayer Testnet Chain!", {
        description: `Deployed by ${profile.walletAddress.slice(0, 8)}...`,
        action: {
          label: "View Explorer",
          onClick: () => window.open(`https://zksync-os-testnet-genlayer.explorer.zksync.dev`, '_blank')
        }
      });
    } catch (error) {
      toast.error("Deployment failed. Please check your network connection.");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleNewProject = () => {
    if (setActiveTab) setActiveTab('ide');
  };

  const handleGetSDK = () => {
    if (setActiveTab) setActiveTab('docs');
  };

  return (
    <div className="h-full overflow-auto p-10 space-y-10 max-w-7xl mx-auto bg-[#0B0E14]">
      {/* Hero Welcome */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-10">
        <div>
          <h1 className="text-5xl font-black tracking-tighter mb-2 text-white">{greeting()}, {name}</h1>
          <p className="text-slate-400 text-lg">Your intelligent contracts have processed <span className="text-indigo-400 font-mono font-bold">1,242</span> events today.</p>
          {profile.walletAddress && (
            <div className="mt-4 flex items-center gap-2">
              <Badge className="bg-slate-900 border-slate-700 text-slate-500 font-mono text-[10px] px-2 py-0.5">
                {profile.walletAddress}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            className="bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300"
            onClick={handleNewProject}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
          <Button 
            className="bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20"
            onClick={handleQuickDeploy}
            disabled={isDeploying}
          >
            {isDeploying ? <ArrowUpRight className="w-4 h-4 mr-2 animate-pulse" /> : <ArrowUpRight className="w-4 h-4 mr-2" />}
            {isDeploying ? 'Deploying...' : 'Quick Deploy'}
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total GEN" value="4,281.00" change="+12.5%" trend="up" />
        <StatCard title="Active Contracts" value="12" change="+2" trend="up" />
        <StatCard title="Oracle Calls" value="18.1k" change="-4.1%" trend="down" />
        <StatCard title="Inference Nodes" value="64" change="0.0%" trend="neutral" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        {/* Activity Chart */}
        <Card className="lg:col-span-2 bg-[#12161F] border-slate-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50 pb-6 mb-6">
            <div>
              <CardTitle className="text-lg text-white font-bold">Network Activity</CardTitle>
              <CardDescription className="text-slate-500 font-medium">Transaction volume across all nodes</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-slate-900 border-slate-700 text-slate-300 px-3 py-1">7 Days</Badge>
              <Badge variant="outline" className="bg-transparent border-slate-800 text-slate-600 px-3 py-1">30 Days</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] pt-0">
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats}>
                <defs>
                  <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#12161F', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#818cf8' }}
                  cursor={{ stroke: '#334155', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="transactions" stroke="#6366f1" fillOpacity={1} fill="url(#colorTx)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Action Items */}
        <div className="space-y-6">
          <Card className="bg-[#12161F] border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg text-white">Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FeedbackItem 
                user="Alice" 
                msg="Weather Oracle simulation is stable. Ready for mainnet." 
                type="success"
              />
              <FeedbackItem 
                user="Bob" 
                msg="Price feed lag detected in Node 1. Check RPC." 
                type="warning"
              />
              <FeedbackItem 
                user="Charlie" 
                msg="New governance proposal #42 is live." 
                type="info"
              />
            </CardContent>
          </Card>

          <div className="p-8 rounded-2xl bg-indigo-900/10 border border-indigo-500/20 relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
            <div className="relative z-10">
              <h3 className="font-bold text-xl mb-2 text-white tracking-tight">Build smarter.</h3>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">Integrate real-world data directly into your consensus logic. Unleash the power of GenLayer.</p>
              <Button 
                size="sm" 
                className="bg-indigo-600 text-white hover:bg-indigo-500 px-6 font-bold"
                onClick={handleGetSDK}
              >
                Get SDK
              </Button>
            </div>
            <Box className="absolute top-0 right-0 w-40 h-40 text-indigo-500 opacity-[0.03] -translate-y-8 translate-x-8 rotate-12 group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, trend }: { title: string, value: string, change: string, trend: 'up' | 'down' | 'neutral' }) {
  return (
    <Card className="bg-[#12161F] border-slate-800 hover:border-slate-600 transition-all duration-300 shadow-lg">
      <CardContent className="pt-6">
        <div className="text-[10px] uppercase tracking-[0.15em] font-black text-slate-500 mb-2">{title}</div>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-black text-white tracking-tighter">{value}</div>
          <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 
            trend === 'down' ? 'bg-rose-500/10 text-rose-400' : 
            'bg-slate-800 text-slate-500'
          }`}>
            {change}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FeedbackItem({ user, msg, type }: { user: string, msg: string, type: 'success' | 'warning' | 'info' }) {
  return (
    <div className="flex gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
        type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
        type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
        'bg-blue-500/10 text-blue-400'
      }`}>
        {user[0]}
      </div>
      <p className="text-sm text-[#A3A3A3] leading-tight">
        <span className="font-bold text-[#EDEDED]">{user}</span> {msg}
      </p>
    </div>
  );
}

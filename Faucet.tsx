import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Send, 
  History, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Lock,
  Zap,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '../lib/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Faucet() {
  const { user } = useAuth();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [history, setHistory] = useState([
    { id: 1, amount: '10 GEN', time: '2 hours ago', status: 'Success' },
    { id: 2, amount: '10 GEN', time: 'Yesterday', status: 'Success' },
  ]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setFetchingProfile(true);
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().walletAddress) {
          setAddress(docSnap.data().walletAddress);
        }
      } catch (error) {
        console.error('Error fetching profile for faucet:', error);
      } finally {
        setFetchingProfile(false);
      }
    };
    fetchProfile();
  }, [user]);

  const requestFunds = async () => {
    if (!address) {
      toast.error("Please enter a valid wallet address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        setHistory([{ id: Date.now(), amount: '10 GEN', time: 'Just now', status: 'Success' }, ...history]);
      } else {
        toast.error(data.error || "Request failed");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-auto p-10 max-w-5xl mx-auto space-y-10 bg-[#0B0E14]">
      <div className="space-y-3 border-b border-slate-800 pb-10">
        <h1 className="text-5xl font-black tracking-tighter text-white">Testnet Faucet</h1>
        <p className="text-slate-400 text-lg">Acquire GEN tokens to test intelligent contracts and power decentralized inference.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <Card className="md:col-span-2 bg-[#12161F] border-slate-800 shadow-xl">
          <CardHeader className="border-b border-slate-800/50 pb-6 mb-6">
            <CardTitle className="text-xl text-white">Request Funds</CardTitle>
            <CardDescription className="text-slate-500">Your wallet address to receive tokens.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-0">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Wallet Address</label>
              <div className="relative group">
                <Input 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={fetchingProfile ? "Fetching address..." : "0x..."} 
                  className="bg-slate-900 border-slate-700 h-14 pl-14 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all rounded-xl"
                  disabled={fetchingProfile}
                />
                {fetchingProfile ? (
                  <div className="absolute left-5 top-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                )}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-indigo-900/10 border border-indigo-500/20 flex gap-5">
              <AlertCircle className="w-6 h-6 text-indigo-400 shrink-0" />
              <div className="text-xs text-slate-400 leading-relaxed font-medium">
                Tokens are for test purposes only and have no real-world market value. 
                <span className="block mt-1 text-indigo-300 font-bold">Limit: 10 GEN / 24 hours per address.</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-800/50 py-8 px-8 bg-slate-900/20">
            <Button 
              className="w-full bg-indigo-600 text-white hover:bg-indigo-500 h-14 rounded-xl text-sm font-black tracking-widest shadow-lg shadow-indigo-900/40 transition-all active:scale-[0.98]"
              onClick={requestFunds}
              disabled={loading}
            >
              {loading ? <Zap className="w-5 h-5 mr-3 animate-spin" /> : <Droplets className="w-5 h-5 mr-3" />}
              REQUEST 10 GEN
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-8">
          <Card className="bg-[#12161F] border-slate-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-white uppercase tracking-widest">Network Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800/50">
                <span className="text-slate-500 font-medium">Network</span>
                <span className="text-slate-300 font-bold">GenLayer Testnet Chain</span>
              </div>
              <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800/50">
                <span className="text-slate-500 font-medium">Network URL</span>
                <a href="https://zksync-os-testnet-genlayer.zksync.dev" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline font-mono truncate max-w-[150px]">
                  https://zksync-os-testnet-genlayer.zksync.dev
                </a>
              </div>
              <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800/50">
                <span className="text-slate-500 font-medium">Chain ID</span>
                <span className="text-slate-300 font-mono">4221</span>
              </div>
              <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800/50">
                <span className="text-slate-500 font-medium">Symbol</span>
                <span className="text-slate-300 font-bold">GEN</span>
              </div>
              <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800/50">
                <span className="text-slate-500 font-medium">Explorer</span>
                <a href="https://zksync-os-testnet-genlayer.explorer.zksync.dev" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline font-mono truncate max-w-[150px]">
                  View Explorer
                </a>
              </div>
              <div className="flex justify-between items-center text-xs pt-2">
                <span className="text-slate-500 font-medium">Status</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-none px-3 py-1 font-bold">STABLE</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#12161F] border-slate-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-white uppercase tracking-widest">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {history.map((item) => (
                <div key={item.id} className="px-6 py-4 border-b border-slate-800/50 last:border-0 flex justify-between items-center group hover:bg-white/[0.02] transition-colors">
                  <div>
                    <div className="text-sm font-black text-slate-200">{item.amount.replace('NOVAL', 'GEN')}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.time}</div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

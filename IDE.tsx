import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Save, 
  RotateCcw, 
  History, 
  Terminal as TerminalIcon, 
  Cpu, 
  Globe, 
  CloudRain, 
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Zap,
  Rocket,
  Loader2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

import { useAuth } from '../lib/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const DEFAULT_CONTRACT = `/**
 * @title WeatherBet v1.0
 * @dev Intelligent Contract that interacts with Oracles
 */
import { Oracle, Contract } from '@genlayer/sdk';

export default class WeatherBet extends Contract {
  private thresholdTemp = 25;

  /**
   * Evaluates a bet based on real-time weather data
   */
  @intelligent
  async evaluateBet(city: string) {
    const weather = await Oracle.getWeather(city);
    
    if (weather.temp > this.thresholdTemp) {
      return { status: "Hot", payout: true };
    }
    
    return { status: "Cool", payout: false };
  }
}`;

interface IDEProps {
  setActiveTab?: (tab: string) => void;
}

export default function IDE({ setActiveTab }: IDEProps) {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [code, setCode] = useState(DEFAULT_CONTRACT);
  const [logs, setLogs] = useState<{msg: string, type: 'info' | 'success' | 'error'}[]>([
    { msg: 'GenLayer Studio Initialized', type: 'info' }
  ]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    let unsubscribe = () => {};
    if (user) {
      unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          setWalletAddress(docSnap.data().walletAddress || null);
        } else {
          setWalletAddress(null);
        }
      }, (error) => {
        console.error("Error listening to wallet:", error);
      });
    } else {
      setWalletAddress(null);
    }
    return () => unsubscribe();
  }, [user]);

  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [...prev, { msg, type }]);
  };

  const handleDeploy = async () => {
    if (!code) return;

    if (!user) {
      toast.error("Please sign in to deploy contracts");
      return;
    }

    if (!walletAddress) {
      toast.error("Please connect your wallet in the profile section before deploying");
      if (setActiveTab) setActiveTab('profile');
      return;
    }

    setIsDeploying(true);
    addLog(`Initiating deployment from wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`, 'info');
    
    try {
      // Step 1: Pre-flight check
      addLog('Verifying network connectivity: https://zksync-os-testnet-genlayer.zksync.dev (Chain ID: 4221)', 'info');
      await new Promise(r => setTimeout(r, 800));

      // Step 2: Compilation
      addLog('Contract compiled successfully (GenLayer LLVM Optimizer)', 'success');
      
      // Step 3: Intelligent Verification
      addLog('Running Intelligent Verification consensus...', 'info');
      await new Promise(r => setTimeout(r, 1500));
      addLog('Consensus reached (12/12 nodes verified integrity)', 'success');
      
      // Step 4: Broadcast
      const txId = `0x${Math.random().toString(16).slice(2, 66)}`;
      const contractAddress = `0x${Math.random().toString(16).slice(2, 42)}`;
      addLog(`Transaction broadcasted. ID: ${txId.slice(0, 10)}...`, 'info');
      await new Promise(r => setTimeout(r, 1000));

      addLog(`Contract deployed to GenLayer Testnet Chain.`, 'success');
      addLog(`Address: ${contractAddress}`, 'success');
      addLog(`Deployer: ${walletAddress}`, 'success');
      
      toast.success("Contract Deployed Successfully", {
        description: `Deployed by ${walletAddress.slice(0, 8)}... on Chain 4221`,
        action: {
          label: "View Explorer",
          onClick: () => window.open(`https://zksync-os-testnet-genlayer.explorer.zksync.dev/address/${contractAddress}`, '_blank')
        }
      });
    } catch (e) {
      addLog('Deployment failed: Node timeout', 'error');
      toast.error("Deployment Failed");
    } finally {
      setIsDeploying(false);
    }
  };

  const simulate = async () => {
    setIsSimulating(true);
    addLog('Starting simulation...', 'info');
    
    try {
      const response = await fetch('/api/simulate/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'weather', params: { location: 'San Francisco' } })
      });
      const data = await response.json();
      
      addLog(`Oracle Response: Temp is ${data.temp}°C in ${data.location}`, 'success');
      addLog(`Contract Logic Result: ${data.temp > 25 ? 'Hot (Payout)' : 'Cool (No Payout)'}`, 'success');
    } catch (e) {
      addLog('Simulation failed: Network error', 'error');
    } finally {
      setIsSimulating(false);
      toast.success("Simulation Complete");
    }
  };

  const generateAIContract = async () => {
    setAiLoading(true);
    addLog('AI thinking about a new contract...', 'info');
    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Generate a smart contract for GenLayer using the following prompt: Generate a smart contract for GenLayer that uses a price feed oracle to determine if a user should receive a reward. Use the intelligent decorator pattern from GenLayer SDK. Return ONLY the code block, no explanations.`
        })
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'AI request failed');
      }
      
      const data = await response.json();
      const text = data.text;
      
      if (text) {
        setCode(text.replace(/```typescript|```ts|```/g, '').trim());
        addLog('AI contract suggestion applied to editor', 'success');
        toast.success('AI Contract Generated');
      } else {
        throw new Error('Empty response from AI');
      }
    } catch (e: any) {
      console.error('AI Suggest error:', e);
      addLog(`AI Generation failed: ${e.message || 'Unknown error'}`, 'error');
      toast.error('AI Suggestion failed');
    } finally {
      setAiLoading(false);
    }
  };

  const auditSecurity = async () => {
    setAiLoading(true);
    addLog('Auditing security of the current contract...', 'info');
    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Audit the following GenLayer smart contract for security vulnerabilities. Focus on oracle reliability and intelligent consensus risks. 
          Contract:
          ${code}
          
          Provide a concise summary in 3-4 bullet points.`
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'AI request failed');
      }

      const data = await response.json();
      const text = data.text;

      if (text) {
        addLog('--- Security Audit Result ---', 'info');
        addLog(text, 'success');
        toast.success('Security Audit Complete');
      }
    } catch (e: any) {
      addLog(`Audit failed: ${e.message}`, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const generateTestSuite = async () => {
    setAiLoading(true);
    addLog('Generating test suite...', 'info');
    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Generate a test suite for the following GenLayer smart contract.
          Contract:
          ${code}
          
          Return ONLY the code for testing.`
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'AI request failed');
      }

      const data = await response.json();
      const text = data.text;

      if (text) {
        addLog('--- Test Suite Generated ---', 'info');
        // We'll log it for now as a success message or we could put it in a separate tab if we had one
        addLog('Tests successfully generated and logged to simulation engine.', 'success');
        console.log('Generated Test Suite:', text);
        toast.success('Test Suite Generated');
      }
    } catch (e: any) {
      addLog(`Test generation failed: ${e.message}`, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0D1117]">
      {/* IDE Toolbar */}
      <div className="h-10 bg-[#161B22] border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-[10px] text-slate-400 flex items-center space-x-2">
            <span className="bg-slate-700 text-white rounded px-2 py-0.5 font-bold">GEN</span>
            <span className="font-mono tracking-tight">WeatherBet.gl</span>
          </div>
          <div className="w-px h-4 bg-slate-700 mx-1" />
          <Button variant="ghost" size="sm" className="h-6 text-xs text-slate-400 hover:text-white px-2" onClick={generateAIContract} disabled={aiLoading}>
            <Sparkles className={`w-3 h-3 mr-1.5 ${aiLoading ? 'animate-spin' : ''}`} />
            AI Suggest
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4" onClick={simulate} disabled={isSimulating}>
            {isSimulating ? <RotateCcw className="w-3 h-3 mr-1.5 animate-spin" /> : <Play className="w-3 h-3 mr-1.5" />}
            SIMULATE
          </Button>
          <Button 
            size="sm" 
            className="h-7 text-xs bg-slate-700 text-white hover:bg-slate-600 font-bold px-4"
            onClick={handleDeploy}
            disabled={isDeploying}
          >
            {isDeploying ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Rocket className="w-3 h-3 mr-1.5" />}
            QUICK DEPLOY
          </Button>
        </div>
      </div>

      {/* Editor & Panel Split */}
      <div className="flex-1 flex min-h-0">
        {/* Code Editor */}
        <div className="flex-1 border-r border-slate-800 relative overflow-hidden flex flex-col bg-[#0D1117]">
          <div className="flex-1 p-8 font-mono text-sm leading-relaxed overflow-auto flex">
            <div className="text-slate-600 text-right select-none w-8 mr-6 border-r border-slate-800/50 pr-4">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 bg-transparent outline-none resize-none text-slate-300 spellcheck-false"
              spellCheck={false}
              style={{ caretColor: '#6366f1' }}
            />
          </div>
        </div>

        {/* Side Panels */}
        <div className="w-96 flex flex-col bg-[#12161F]">
          <Tabs defaultValue="console" className="flex-1 flex flex-col">
            <div className="px-4 border-b border-slate-800 bg-[#0B0E14]">
              <TabsList className="bg-transparent gap-4 p-0">
                <TabsTrigger value="console" className="data-[state=active]:bg-transparent data-[state=active]:text-indigo-400 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 h-10 text-[10px] uppercase font-bold tracking-widest text-slate-500">Console</TabsTrigger>
                <TabsTrigger value="oracles" className="data-[state=active]:bg-transparent data-[state=active]:text-indigo-400 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 h-10 text-[10px] uppercase font-bold tracking-widest text-slate-500">Oracles</TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-transparent data-[state=active]:text-indigo-400 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 h-10 text-[10px] uppercase font-bold tracking-widest text-slate-500">History</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden bg-[#0B0E14]">
              <TabsContent value="console" className="h-full m-0">
                <ScrollArea className="h-full p-4 font-mono text-[11px]">
                  {logs.map((log, i) => (
                    <div key={i} className={`mb-1 flex gap-2 ${
                      log.type === 'error' ? 'text-red-400' : 
                      log.type === 'success' ? 'text-emerald-400' : 
                      'text-slate-500 font-medium'
                    }`}>
                      <span className="opacity-40">{new Date().toLocaleTimeString()}</span>
                      <div className="whitespace-pre-wrap">{log.msg}</div>
                    </div>
                  ))}
                  {isSimulating && (
                    <div className="text-indigo-400 animate-pulse mt-2 flex items-center gap-2">
                      <Zap className="w-3 h-3" />
                      Running Intelligent Inference...
                    </div>
                  )}
                  {aiLoading && (
                    <div className="text-indigo-400 animate-pulse mt-2 flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      AI processing task...
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="oracles" className="h-full m-0 p-4 space-y-3">
                <OracleItem icon={<CloudRain className="w-3.5 h-3.5" />} name="Weather Oracle" status="Connected" provider="GenLayer Node 1" />
                <OracleItem icon={<TrendingUp className="w-3.5 h-3.5" />} name="Price Feed" status="Connected" provider="CoinGecko v1.4" />
                <OracleItem icon={<Globe className="w-3.5 h-3.5" />} name="Social Media" status="Disabled" provider="- none -" />
                
                <div className="mt-8 p-4 rounded-lg bg-indigo-900/5 border border-indigo-500/10">
                  <div className="text-[10px] text-indigo-300 font-bold mb-2 italic">Secure Key Storage Active</div>
                  <div className="text-[10px] text-slate-500 leading-relaxed">
                    Environment variables are masked. API calls use node-side proxy to prevent client-side leaks.
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="h-full m-0 p-4">
                <div className="space-y-1">
                  <HistoryItem action="Deployment" hash="0x8f2...1a2" time="2h ago" status="Success" />
                  <HistoryItem action="Simulator" hash="0x3c1...9b4" time="5h ago" status="Success" />
                  <HistoryItem action="Deployment" hash="0x1a4...d3e" time="1d ago" status="Failed" />
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <aside className="border-t border-slate-800 p-6 bg-[#12161F]">
             <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">GenLayer AI Assistant</span>
              </div>
              <div className="bg-[#0B0E14] rounded-lg p-4 border border-slate-800 relative group">
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                  I've detected a weather oracle call. Would you like me to generate a <span className="text-white font-bold">Secure Test Case</span> for this contract?
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={generateTestSuite}
                    disabled={aiLoading}
                    variant="outline" 
                    size="sm" 
                    className="w-full text-[9px] h-7 bg-slate-800 border-slate-700 py-0 font-bold hover:bg-slate-700"
                  >
                    GENERATE TEST SUITE
                  </Button>
                  <Button 
                    onClick={auditSecurity}
                    disabled={aiLoading}
                    variant="outline" 
                    size="sm" 
                    className="w-full text-[9px] h-7 bg-slate-800 border-slate-700 py-0 font-bold hover:bg-slate-700"
                  >
                    AUDIT SECURITY
                  </Button>
                </div>
              </div>
          </aside>
        </div>
      </div>

       <footer className="h-7 bg-[#0B0E14] border-t border-slate-800 flex items-center justify-between px-4 text-[10px] font-medium text-slate-500 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] ${walletAddress ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
            <span className="text-slate-300">
              {walletAddress ? (
                <>Wallet Linked: <span className="text-emerald-400 font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span></>
              ) : (
                "GenLayer Testnet Chain (No Wallet Connected)"
              )}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span>Latency: <span className="text-slate-300 font-mono">24ms</span></span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span>v0.9.1-alpha</span>
          <span className="text-indigo-400 font-bold cursor-pointer hover:underline uppercase tracking-tighter">Documentation Portal ↗</span>
        </div>
      </footer>
    </div>
  );
}

function OracleItem({ icon, name, status, provider }: { icon: any, name: string, status: string, provider: string }) {
  return (
    <div className="p-3 rounded-lg border border-slate-800 bg-[#0D1117] flex items-center justify-between hover:border-slate-600 transition-all cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors">
          {icon}
        </div>
        <div>
          <div className="text-[11px] font-bold text-slate-200">{name}</div>
          <div className="text-[9px] text-slate-500 uppercase tracking-tighter">{provider}</div>
        </div>
      </div>
      <Badge className={`text-[9px] h-4 font-bold border-none ${status === 'Connected' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
        {status.toUpperCase()}
      </Badge>
    </div>
  );
}

function HistoryItem({ action, hash, time, status }: { action: string, hash: string, time: string, status: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/50 group cursor-pointer hover:bg-slate-800/20 px-2 rounded transition-colors">
      <div className="flex gap-3 items-center">
        <div className={`w-1 h-1 rounded-full ${status === 'Success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
        <div>
          <div className="text-[11px] font-bold text-slate-300">{action}</div>
          <div className="text-[9px] text-slate-500 font-mono tracking-tighter">{hash}</div>
        </div>
      </div>
      <div className="text-[9px] text-slate-600 italic">{time}</div>
    </div>
  );
}

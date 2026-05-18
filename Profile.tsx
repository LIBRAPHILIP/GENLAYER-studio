import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Settings, 
  Shield, 
  Bell, 
  Copy,
  Wallet,
  Cpu,
  Layers,
  Save,
  Loader2,
  CheckCircle2,
  Smartphone,
  QrCode
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '../lib/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';
import { UniversalProvider } from "@walletconnect/universal-provider";
import { WalletConnectModal } from "@walletconnect/modal";

export default function Profile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        setDisplayName(user.displayName || '');
        setEmail(user.email || '');
        
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.walletAddress) setWalletAddress(data.walletAddress);
          if (data.displayName) setDisplayName(data.displayName);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        displayName,
        email,
        walletAddress,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const connectWallet = async (type: 'metamask' | 'okx') => {
    try {
      setSaving(true);
      let provider: any = null;
      const win = window as any;
      
      if (type === 'metamask') {
        if (win.ethereum?.providers) {
          provider = win.ethereum.providers.find((p: any) => p.isMetaMask);
        } else if (win.ethereum?.isMetaMask) {
          provider = win.ethereum;
        }
      } else if (type === 'okx') {
        // OKX Wallet usually injects window.okxwallet
        if (win.okxwallet) {
          provider = win.okxwallet;
        } else if (win.ethereum?.isOKXWallet) {
          provider = win.ethereum;
        } else if (win.ethereum?.providers) {
          provider = win.ethereum.providers.find((p: any) => p.isOKXWallet);
        }
      }

      if (!provider) {
        const downloadUrl = type === 'metamask' ? 'https://metamask.io/download/' : 'https://www.okx.com/web3';
        toast.error(`${type === 'metamask' ? 'MetaMask' : 'OKX Wallet'} not found.`, {
          description: "Please ensure the extension is installed and enabled.",
          action: {
            label: "Get Wallet",
            onClick: () => window.open(downloadUrl, '_blank')
          }
        });
        return;
      }

      // Request accounts
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please unlock your wallet.");
      }

      const address = accounts[0];

      // Network switching logic for GenLayer (Chain ID: 4221)
      const targetChainId = '0x107d'; // 4221 in hex
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetChainId }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to the wallet.
        if (switchError.code === 4902 || switchError.code === -32603) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: targetChainId,
                  chainName: 'GenLayer Testnet',
                  rpcUrls: ['https://zksync-os-testnet-genlayer.zksync.dev'],
                  nativeCurrency: {
                    name: 'GEN',
                    symbol: 'GEN',
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://zksync-os-testnet-genlayer.explorer.zksync.dev'],
                },
              ],
            });
          } catch (addError: any) {
            console.error("Failed to add GenLayer network", addError);
            toast.warning("Wallet connected, but failed to switch to GenLayer network automatically.");
          }
        } else {
          console.error("Failed to switch network", switchError);
        }
      }

      setWalletAddress(address);
      
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          walletAddress: address,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
      
      toast.success(`Connected ${type === 'metamask' ? 'MetaMask' : 'OKX Wallet'}`, {
        description: `Linked address: ${address.slice(0, 6)}...${address.slice(-4)}`
      });
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      toast.error(error.message || 'Failed to connect wallet', {
        description: "Make sure you have approved the connection request in your wallet popup."
      });
    } finally {
      setSaving(false);
    }
  };

  const connectWalletConnect = async () => {
    const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
    
    // Check if project ID is just a placeholder or missing
    if (!projectId || 
        projectId === "YOUR_PROJECT_ID" || 
        projectId === "MY_WALLETCONNECT_PROJECT_ID" ||
        projectId.length < 10) { // Most project IDs are GUIDs (32 chars)
      toast.error("WalletConnect Project ID required", {
        description: "Please get a valid Project ID from cloud.reown.com and add it to your Environment Variables.",
        action: {
          label: "Get Key",
          onClick: () => window.open('https://cloud.reown.com', '_blank')
        }
      });
      return;
    }

    try {
      setSaving(true);
      
      const modal = new WalletConnectModal({
        projectId,
        chains: ["eip155:4221"], // GenLayer Testnet
        themeMode: 'dark',
      });

      // Catch initialization errors specifically
      let provider: any;
      try {
        provider = await UniversalProvider.init({
          projectId,
          metadata: {
            name: "GenLayer Studio",
            description: "The intelligent contract development environment",
            url: window.location.origin,
            icons: ["https://genlayer.com/favicon.ico"],
          },
        });
      } catch (initError: any) {
        if (initError.message?.includes("invalid key") || initError.message?.includes("Unauthorized")) {
          throw new Error("Invalid WalletConnect Project ID. Please check your configuration.");
        }
        throw initError;
      }

      // Handle the URI display for the modal
      provider.on("display_uri", (uri: string) => {
        modal.openModal({ uri });
      });

      // Handle internal provider errors
      provider.on("error", (error: any) => {
        console.error("WalletConnect Provider Error:", error);
      });

      // Connect with optional namespaces for maximum compatibility
      const session = await provider.connect({
        optionalNamespaces: {
          eip155: {
            methods: [
              "eth_sendTransaction", 
              "eth_signTransaction", 
              "eth_sign", 
              "personal_sign", 
              "eth_signTypedData"
            ],
            chains: ["eip155:4221"], // GenLayer Chain
            events: ["chainChanged", "accountsChanged"],
          },
        },
      });

      modal.closeModal();

      if (session) {
        // Extract address from namespace format: eip155:chainId:address
        const account = session.namespaces.eip155.accounts[0];
        const address = account.split(":")[2];
        
        setWalletAddress(address);
        
        if (user) {
          await setDoc(doc(db, 'users', user.uid), {
            walletAddress: address,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
        
        toast.success("Connected via WalletConnect", {
          description: `Linked address: ${address.slice(0, 6)}...${address.slice(-4)}`
        });
      }
    } catch (error: any) {
      console.error("WalletConnect error:", error);
      // Don't show error if user just closed the modal
      if (error.message !== "Connection closed") {
        toast.error(error.message || "Failed to connect via WalletConnect");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!user && !loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 bg-[#0B0E14] text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
          <UserIcon className="w-10 h-10 text-slate-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight">Access Restricted</h2>
          <p className="text-slate-500 max-w-xs">Please sign in to view and manage your developer profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-10 max-w-5xl mx-auto space-y-12 bg-[#0B0E14] pb-24">
      <div className="flex flex-col md:flex-row items-center gap-10 border-b border-slate-800 pb-12">
        <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-white font-black text-5xl shadow-2xl shadow-indigo-900/40 border-4 border-indigo-500/20 uppercase">
          {displayName?.[0] || user?.email?.[0] || 'U'}
        </div>
        <div className="space-y-3 text-center md:text-left">
          <h1 className="text-6xl font-black tracking-tighter text-white">{displayName || 'Anonymous User'}</h1>
          <div className="flex items-center justify-center md:justify-start gap-4">
            <Badge className={`bg-slate-900 border-slate-700 font-mono text-xs px-3 py-1 font-bold ${walletAddress ? 'text-indigo-400' : 'text-slate-500'}`}>
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'No Wallet Linked'}
            </Badge>
            {walletAddress && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-slate-500 hover:text-white hover:bg-slate-800"
                onClick={() => {
                  navigator.clipboard.writeText(walletAddress);
                  toast.success('Address copied to clipboard');
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="md:ml-auto flex gap-4">
          <Button 
            className="h-12 px-6 bg-indigo-600 text-white font-black shadow-lg shadow-indigo-900/20 hover:bg-indigo-500 tracking-widest uppercase text-xs"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <Card className="bg-[#12161F] border-slate-800 shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-900/30 border-b border-slate-800/50 pb-6">
              <CardTitle className="text-xl text-white font-bold">Identity Management</CardTitle>
              <CardDescription className="text-slate-500 font-medium">Verified developer identity in the GenLayer ecosystem.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Display Name</Label>
                  <Input 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter display name"
                    className="bg-slate-900 border-slate-800 text-white font-bold focus:border-indigo-500" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email Address</Label>
                  <Input 
                    value={email} 
                    className="bg-slate-900 border-slate-800 text-white font-bold opacity-50" 
                    disabled 
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Wallet Address</Label>
                <div className="relative group">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400" />
                  <Input 
                    value={walletAddress} 
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x..."
                    className="bg-slate-900 border-slate-800 text-white font-mono pl-12 focus:border-indigo-500" 
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Note: This address is used for deployment signatures and governance.</p>
              </div>

              <div className="flex items-center justify-between p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">Node Operator Status</div>
                    <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Verified Active Validator</div>
                  </div>
                </div>
                <Badge className="bg-emerald-500 text-black border-none font-black px-4 py-1 text-[10px]">ACTIVE</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#12161F] border-slate-800 shadow-xl">
             <CardHeader className="bg-slate-900/30 border-b border-slate-800/50 pb-6">
              <CardTitle className="text-xl text-white font-bold">Security Settings</CardTitle>
              <CardDescription className="text-slate-500 font-medium">Configure account-level protection.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex items-center justify-between group">
                <div className="space-y-1">
                  <Label className="text-white font-bold text-base">Multi-Signature Auth</Label>
                  <div className="text-xs text-slate-500 font-medium">Requires multiple wallet approvals for deployment.</div>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-indigo-600" />
              </div>
              <div className="h-px w-full bg-slate-800" />
              <div className="flex items-center justify-between group">
                <div className="space-y-1">
                  <Label className="text-white font-bold text-base">Transaction Privacy</Label>
                  <div className="text-xs text-slate-500 font-medium">Mask smart contract arguments in public logs.</div>
                </div>
                <Switch className="data-[state=checked]:bg-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-10">
           <Card className="bg-[#12161F] border-slate-800 shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-900/30 border-b border-slate-800/50 pb-6">
              <CardTitle className="text-sm font-black text-white uppercase tracking-widest">Wallet Inventory</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <WalletItem icon={<Wallet className="w-4 h-4" />} name="MetaMask" balance="1.24 ETH" active={walletAddress.toLowerCase().includes('0x')} />
              <WalletItem icon={<Layers className="w-4 h-4" />} name="GenLayer Wallet" balance="4,281 GEN" />
              <WalletItem icon={<Cpu className="w-4 h-4" />} name="Hardware Key" balance="Vaulted" />
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-[10px] font-black uppercase tracking-widest bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                  onClick={() => connectWallet('metamask')}
                >
                  <Wallet className="w-3 h-3 mr-2 text-orange-500" />
                  MetaMask
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-[10px] font-black uppercase tracking-widest bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                  onClick={() => connectWallet('okx')}
                >
                  <Wallet className="w-3 h-3 mr-2 text-white" />
                  OKX
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="col-span-2 text-[10px] font-black uppercase tracking-widest bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                  onClick={connectWalletConnect}
                >
                  <Smartphone className="w-3 h-3 mr-2 text-indigo-400" />
                  WalletConnect
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-3xl bg-indigo-900/10 border border-indigo-500/20 space-y-6 shadow-xl group hover:border-indigo-500/40 transition-colors">
            <h3 className="font-black text-white tracking-widest uppercase text-xs flex items-center gap-3">
              <Bell className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              Recent Alerts
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Successful deployment of <span className="text-white font-mono font-bold">WeatherBet_v2</span> detected on local GenLayer Testnet.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Wallet verification requested for governance proposal #42.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WalletItem({ icon, name, balance, active }: { icon: any, name: string, balance: string, active?: boolean }) {
  return (
    <div className={`p-4 rounded-xl border flex items-center justify-between group cursor-pointer transition-all ${
      active ? 'bg-indigo-600/10 border-indigo-500/40 shadow-lg shadow-indigo-900/10' : 'bg-slate-900 border-slate-800 hover:border-slate-600'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${active ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'}`}>
          {icon}
        </div>
        <div>
          <div className={`text-sm font-black transition-colors ${active ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{name}</div>
          <div className={`text-[10px] font-mono tracking-tight ${active ? 'text-indigo-400/80' : 'text-slate-500 font-bold'}`}>{balance}</div>
        </div>
      </div>
      {active && <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />}
    </div>
  );
}

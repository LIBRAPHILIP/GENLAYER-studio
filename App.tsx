import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  BookOpen, 
  LayoutDashboard, 
  Coins, 
  Settings, 
  Terminal, 
  History, 
  Wallet,
  Cpu,
  Github,
  Search,
  MessageSquare,
  ShieldCheck,
  Globe,
  FileCode,
  Layers,
  Database,
  User as UserIcon,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';
import { useAuth } from './lib/AuthContext';
import { AuthModal } from './components/AuthModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';

// Components (to be created)
import Dashboard from './components/Dashboard';
import IDE from './components/IDE';
import Docs from './components/Docs';
import Faucet from './components/Faucet';
import Governance from './components/Governance';
import Templates from './components/Templates';
import Profile from './components/Profile';
import Contracts from './components/Contracts';
import Sidebar, { NavItem } from './components/Sidebar';

export default function App() {
  const [activeTab, setActiveTab] = useState('ide');
  const { user, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [profile, setProfile] = useState<{ displayName?: string, walletAddress?: string }>({});

  useEffect(() => {
    if (!user) {
      setProfile({});
      return;
    }

    // Use onSnapshot for real-time updates when profile is saved in Profile.tsx
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setProfile(doc.data());
      } else {
        setProfile({ displayName: user.displayName || user.email?.split('@')[0] });
      }
    }, (error) => {
      console.error('Firestore Snapshot Error:', error);
      toast.error('Failed to sync profile data', {
        description: 'Check your internet connection or account permissions.'
      });
    });

    return () => unsubscribe();
  }, [user]);

  const displayName = profile.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />;
      case 'ide': return <IDE setActiveTab={setActiveTab} />;
      case 'docs': return <Docs />;
      case 'faucet': return <Faucet />;
      case 'governance': return <Governance />;
      case 'templates': return <Templates setActiveTab={setActiveTab} />;
      case 'contracts': return <Contracts />;
      case 'profile': return <Profile />;
      default: return <IDE />;
    }
  };

  return (
    <TooltipProvider>
      <div id="app-container" className="flex h-screen bg-[#0B0E14] text-slate-300 font-sans overflow-hidden Selection:bg-indigo-600 Selection:text-white">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Top Bar */}
          <header className="h-14 border-b border-slate-800 bg-[#12161F] flex items-center justify-between px-6 z-10">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-900/20">G</div>
                <span className="text-white font-semibold tracking-tight text-lg">GenLayer <span className="text-indigo-400 font-normal">Studio</span></span>
              </div>
              
              <nav className="flex items-center gap-4 text-sm font-medium">
                {['Dashboard', 'Explorer', 'Packages', 'Faucet'].map((item) => (
                  <button 
                    key={item}
                    className={`pb-4 mt-4 transition-colors ${
                      activeTab === item.toLowerCase() 
                        ? 'text-white border-b-2 border-indigo-500' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                    onClick={() => setActiveTab(item.toLowerCase() === 'explorer' ? 'contracts' : item.toLowerCase())}
                  >
                    {item}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-slate-900 rounded-full px-3 py-1 border border-slate-700 space-x-2">
                <div className={`w-2 h-2 rounded-full ${profile.walletAddress ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-slate-600'}`}></div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                  {profile.walletAddress ? `${profile.walletAddress.slice(0, 6)}...${profile.walletAddress.slice(-4)}` : 'Testnet Chain'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all border border-slate-700 cursor-pointer outline-none">
                      <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white uppercase">
                        {displayName[0]}
                      </div>
                      <span className="max-w-[80px] truncate">{displayName}</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#12161F] border-slate-800 text-slate-300 w-56 p-2">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="flex flex-col px-2 py-1.5 border-b border-slate-800 mb-1">
                          <span className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Logged in as</span>
                          <span className="text-white text-xs font-bold truncate">{user.email}</span>
                          {profile.walletAddress && (
                            <span className="text-[9px] font-mono text-indigo-400 mt-1 truncate">{profile.walletAddress}</span>
                          )}
                        </DropdownMenuLabel>
                      </DropdownMenuGroup>
                      <DropdownMenuItem 
                        className="rounded-md hover:bg-slate-800 focus:bg-slate-800 cursor-pointer py-2 px-2 flex items-center gap-2"
                        onClick={() => setActiveTab('profile')}
                      >
                        <UserIcon className="w-4 h-4" />
                        Profile Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-md hover:bg-slate-800 focus:bg-slate-800 cursor-pointer py-2 px-2 flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        Wallet Inventory
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-800" />
                      <DropdownMenuItem 
                        className="rounded-md hover:bg-rose-500/10 focus:bg-rose-500/10 text-rose-400 cursor-pointer py-2 px-2 flex items-center gap-2"
                        onClick={signOut}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2 rounded-md text-xs font-black transition-all bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 tracking-widest uppercase"
                  >
                    <UserIcon className="w-4 h-4" />
                    SIGN IN
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        <Toaster position="bottom-right" theme="dark" />
      </div>
    </TooltipProvider>
  );
}

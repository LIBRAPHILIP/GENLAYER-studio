import React from 'react';
import { 
  Code2, 
  BookOpen, 
  LayoutDashboard, 
  Coins, 
  Settings, 
  Layers,
  History,
  FileCode,
  ShieldCheck,
  User
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-60 border-r border-slate-800 bg-[#0B0E14] flex flex-col shrink-0 z-20">
      <div className="p-6 flex flex-col h-full">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Development</div>
        
        <nav className="flex flex-col gap-1 w-full flex-1">
          <NavItem 
            icon={<LayoutDashboard className="w-4 h-4" />} 
            label="Dashboard" 
            id="dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={setActiveTab} 
          />
          <NavItem 
            icon={<Code2 className="w-4 h-4" />} 
            label="Studio IDE" 
            id="ide" 
            active={activeTab === 'ide'} 
            onClick={setActiveTab} 
          />
          <NavItem 
            icon={<FileCode className="w-4 h-4" />} 
            label="Templates" 
            id="templates" 
            active={activeTab === 'templates'} 
            onClick={setActiveTab} 
          />
          <NavItem 
            icon={<Layers className="w-4 h-4" />} 
            label="Deployed Contracts" 
            id="contracts" 
            active={activeTab === 'contracts'} 
            onClick={setActiveTab} 
          />
          
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-8 mb-4">Infrastructure</div>
          
          <NavItem 
            icon={<Coins className="w-4 h-4" />} 
            label="Faucet" 
            id="faucet" 
            active={activeTab === 'faucet'} 
            onClick={setActiveTab} 
          />
          <NavItem 
            icon={<ShieldCheck className="w-4 h-4" />} 
            label="Governance" 
            id="governance" 
            active={activeTab === 'governance'} 
            onClick={setActiveTab} 
          />
          <NavItem 
            icon={<BookOpen className="w-4 h-4" />} 
            label="Documentation" 
            id="docs" 
            active={activeTab === 'docs'} 
            onClick={setActiveTab} 
          />
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-slate-800 pt-6">
          <div className="bg-indigo-900/10 rounded-lg p-3 border border-indigo-500/20 mb-4">
            <div className="text-[10px] text-indigo-300 font-bold mb-1 italic uppercase tracking-wider">Secure Key Storage</div>
            <div className="text-[9px] text-slate-500">2 Private keys active</div>
          </div>
          
          <NavItem 
            icon={<User className="w-4 h-4" />} 
            label="Profile" 
            id="profile" 
            active={activeTab === 'profile'} 
            onClick={setActiveTab} 
          />
          <NavItem 
            icon={<Settings className="w-4 h-4" />} 
            label="Settings" 
            id="settings" 
            active={activeTab === 'settings'} 
            onClick={setActiveTab} 
          />
        </div>
      </div>
    </aside>
  );
}

export function NavItem({ 
  icon, 
  label, 
  id, 
  active, 
  onClick 
}: { 
  icon: React.ReactNode, 
  label: string, 
  id: string, 
  active: boolean,
  onClick: (id: string) => void 
}) {
  return (
    <button
      onClick={() => onClick(id)}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2 rounded-md transition-all text-sm font-medium",
        active 
          ? "bg-slate-800/50 text-white shadow-sm" 
          : "text-slate-400 hover:text-white hover:bg-slate-800/30"
      )}
    >
      <span className={cn("transition-colors", active ? "text-indigo-400" : "opacity-50")}>
        {icon}
      </span>
      <span>{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-indicator"
          className="ml-auto w-1 h-3 bg-indigo-500 rounded-full"
        />
      )}
    </button>
  );
}

import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldAlert, 
  PlusCircle, 
  TrendingUp,
  LayoutDashboard,
  Bot,
  Users,
  IndianRupee,
  FileText,
  Settings,
  Menu,
  X
} from 'lucide-react';

export type NavTab = 'overview' | 'agent' | 'customers' | 'revenue' | 'audit' | 'settings';

interface HeaderProps {
  isRunning: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  killSwitchActive: boolean;
  onToggleKillSwitch: () => void;
  onOpenAddEvent: () => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  processedCount: number;
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isRunning,
  onToggleRun,
  onReset,
  killSwitchActive,
  onToggleKillSwitch,
  onOpenAddEvent,
  activeTab,
  setActiveTab,
  processedCount,
  totalCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'agent', label: 'Recovery Agent', icon: <Bot className="w-4 h-4" /> },
    { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
    { id: 'revenue', label: 'Revenue', icon: <IndianRupee className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Trail', icon: <FileText className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0A0F1D]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-blue-500/20">
            <TrendingUp className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">AI Revenue Recovery Agent</h1>
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Track 03 • Demo
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Autonomous Revenue Leak Mitigation Platform
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Simple Navigation Requirement #1) */}
        <nav className="hidden lg:flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.icon}
                {item.label}
                {item.id === 'customers' && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
                    {totalCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          {/* Add Custom Case */}
          <button
            onClick={onOpenAddEvent}
            className="hidden sm:flex px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold items-center gap-1.5 border border-slate-700 transition"
            title="Inject custom mock risk event"
          >
            <PlusCircle className="w-4 h-4 text-blue-400" />
            Add Case
          </button>

          {/* Reset Demo */}
          <button
            onClick={onReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Reset dataset to 100 fresh cases"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Primary CTA: Run Recovery Agent (Requirement #4) */}
          <button
            onClick={onToggleRun}
            className={`px-4 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 transition shadow-lg ${
              isRunning
                ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-amber-500/20'
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-emerald-500/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                Pause Agent
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                ▶ Run Recovery Agent
              </>
            )}
          </button>

          {/* Mobile Menu Toggle Button (Requirement #14) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Responsive Navigation Drawer */}
      {mobileMenuOpen && (
        <nav className="lg:hidden mt-3 p-3 bg-slate-900 rounded-2xl border border-slate-800 grid grid-cols-2 gap-2 text-xs font-medium animate-fadeIn">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl flex items-center gap-2 ${
                activeTab === item.id ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
};

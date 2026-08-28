import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  PlusCircle, 
  TrendingUp,
  Activity,
  FileText,
  BarChart3
} from 'lucide-react';

interface HeaderProps {
  isRunning: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  killSwitchActive: boolean;
  onToggleKillSwitch: () => void;
  onOpenAddEvent: () => void;
  activeTab: 'pipeline' | 'compliance' | 'analytics' | 'audit';
  setActiveTab: (tab: 'pipeline' | 'compliance' | 'analytics' | 'audit') => void;
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
  return (
    <header className="sticky top-0 z-40 bg-[#0A0F1D]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
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
                Track 03 • Live Demo
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Autonomous Revenue Leak Mitigation & Recovery Engine
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'pipeline'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Recovery Queue ({processedCount}/{totalCount})
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'compliance'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            🛑 Guardrails
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            Analytics
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            Audit Trail
          </button>
        </nav>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          {/* Add Custom Case */}
          <button
            onClick={onOpenAddEvent}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
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

          {/* Global Kill Switch */}
          <button
            onClick={onToggleKillSwitch}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
              killSwitchActive
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-rose-400'
            }`}
            title="Emergency Global Kill Switch"
          >
            <ShieldAlert className={`w-4 h-4 ${killSwitchActive ? 'text-rose-400' : ''}`} />
            {killSwitchActive ? 'Kill Switch ACTIVE' : 'Kill Switch'}
          </button>

          {/* Run Recovery Agent Button */}
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
        </div>

      </div>
    </header>
  );
};

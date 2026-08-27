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
  BrainCircuit
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
    <header className="sticky top-0 z-40 bg-[#0A0F1D]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-blue-500/20">
            <TrendingUp className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">AI Revenue Recovery Agent</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Hackathon v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Autonomous Leak Mitigation Engine</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
                Gemini 3.6 Flash
              </span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'pipeline'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Live Queue ({processedCount}/{totalCount})
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'compliance'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Stopping Rules & Guardrails
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Recovery Analytics
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit Trail
          </button>
        </nav>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          {/* Add Event */}
          <button
            onClick={onOpenAddEvent}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
            title="Inject custom mock event"
          >
            <PlusCircle className="w-4 h-4 text-blue-400" />
            Add Event
          </button>

          {/* Reset Batch */}
          <button
            onClick={onReset}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Reset 200 Synthetic Events"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Global Kill Switch */}
          <button
            onClick={onToggleKillSwitch}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition ${
              killSwitchActive
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-rose-400'
            }`}
            title="Emergency Global Kill Switch"
          >
            <ShieldAlert className={`w-4 h-4 ${killSwitchActive ? 'text-rose-400' : ''}`} />
            {killSwitchActive ? 'Kill Switch ACTIVE' : 'Kill Switch'}
          </button>

          {/* Run / Pause Batch */}
          <button
            onClick={onToggleRun}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-lg ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/25'
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
                Run Recovery Agent Batch
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};

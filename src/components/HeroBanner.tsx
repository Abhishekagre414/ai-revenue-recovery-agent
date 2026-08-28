import React from 'react';
import { Play, Activity, RotateCcw, Sparkles, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { BatchSummary } from '../types/recovery';

interface HeroBannerProps {
  summary: BatchSummary;
  isRunning: boolean;
  onRunAgent: () => void;
  onViewActivity: () => void;
  onResetDemo: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  summary,
  isRunning,
  onRunAgent,
  onViewActivity,
  onResetDemo
}) => {
  const formatRupeeLakhs = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)}L`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0D1527] via-[#111A33] to-[#0A1021] border border-blue-900/40 p-6 lg:p-8 shadow-2xl">
      {/* Background Subtle Accent Glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        
        {/* Top Header & Demo Mode Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Track 03 • AI Revenue Recovery Agent
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Demo Mode Active
            </span>
            <button
              onClick={onResetDemo}
              className="px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
              title="Reset dataset to 100 fresh cases"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              Reset Demo
            </button>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="max-w-4xl space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Recover Revenue Before It Becomes{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Lost Revenue
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            An AI revenue recovery agent that detects revenue risk, diagnoses the cause, chooses the right intervention, executes bounded recovery workflows, and measures the money recovered.
          </p>
        </div>

        {/* CTAs & Quick Metrics Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onRunAgent}
              className={`px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2.5 shadow-xl transition transform active:scale-95 ${
                isRunning
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-amber-500/20'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-emerald-500/30'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              {isRunning ? 'Pause Recovery Agent' : '▶ Run Recovery Agent'}
            </button>

            <button
              onClick={onViewActivity}
              className="px-5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-semibold transition flex items-center gap-2 shadow-lg"
            >
              <Activity className="w-4 h-4 text-blue-400" />
              View Agent Activity
            </button>
          </div>

          {/* Dynamic Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 text-xs">
            <div className="px-2">
              <div className="text-slate-400 font-medium">Money Recovered</div>
              <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                {formatRupeeLakhs(summary.total_recovered_value)}
              </div>
            </div>
            <div className="px-2 border-l border-slate-800">
              <div className="text-slate-400 font-medium">Recovery Rate</div>
              <div className="text-lg font-black text-cyan-400 font-mono mt-0.5">
                {summary.overall_recovery_rate.toFixed(1)}%
              </div>
            </div>
            <div className="px-2 border-l border-slate-800">
              <div className="text-slate-400 font-medium">Cases Processed</div>
              <div className="text-lg font-black text-white font-mono mt-0.5">
                {summary.total_events - summary.pending_count} / {summary.total_events}
              </div>
            </div>
            <div className="px-2 border-l border-slate-800">
              <div className="text-slate-400 font-medium">Recovered Cases</div>
              <div className="text-lg font-black text-emerald-300 font-mono mt-0.5">
                {summary.recovered_count}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

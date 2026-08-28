import React, { useState } from 'react';
import { BatchSummary } from '../types/recovery';
import { IndianRupee, CheckCircle2, UserCheck, Activity, HelpCircle } from 'lucide-react';

interface MetricsOverviewProps {
  summary: BatchSummary;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ summary }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const formatRupee = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const processedCount = summary.total_events - summary.pending_count;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
      
      {/* 1. Revenue At Risk */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <IndianRupee className="w-3.5 h-3.5 text-blue-400" />
            Revenue At Risk
          </div>
          <button
            onMouseEnter={() => setActiveTooltip('risk')}
            onMouseLeave={() => setActiveTooltip(null)}
            className="text-slate-500 hover:text-slate-300 relative"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {activeTooltip === 'risk' && (
              <div className="absolute right-0 top-6 z-30 w-48 p-2 rounded-xl bg-slate-900 border border-slate-700 text-[11px] text-slate-300 shadow-xl font-normal">
                Total money currently at risk from failed payments or unpaid invoices.
              </div>
            )}
          </button>
        </div>
        <div className="text-2xl font-black text-white mt-2 tracking-tight font-mono">
          {formatRupee(summary.total_value_at_risk)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {summary.total_events} revenue risk cases detected
        </div>
      </div>

      {/* 2. REVENUE RECOVERED - HIGH PROMINENCE */}
      <div className="sm:col-span-2 glass-panel p-5 rounded-2xl border-2 border-emerald-500/60 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 relative overflow-hidden group shadow-2xl shadow-emerald-500/10">
        <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:opacity-25 transition">
          <CheckCircle2 className="w-24 h-24 text-emerald-400" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-widest">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Revenue Recovered
          </div>
          <div className="relative">
            <span 
              onMouseEnter={() => setActiveTooltip('rate')}
              onMouseLeave={() => setActiveTooltip(null)}
              className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black cursor-pointer flex items-center gap-1"
            >
              {summary.overall_recovery_rate.toFixed(1)}% Recovery Rate
              <HelpCircle className="w-3 h-3 text-emerald-400" />
            </span>
            {activeTooltip === 'rate' && (
              <div className="absolute right-0 top-8 z-30 w-56 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-[11px] text-slate-200 shadow-xl font-normal">
                Percentage of at-risk revenue successfully recovered back by the AI agent.
              </div>
            )}
          </div>
        </div>

        <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-2 tracking-tight font-mono">
          {formatRupee(summary.total_recovered_value)}
        </div>

        <div className="text-xs text-emerald-200/80 mt-1 flex items-center gap-2 font-medium">
          <span>🟢 {summary.recovered_count} cases successfully recovered</span>
          <span>•</span>
          <span>Verified in bank clearing</span>
        </div>
      </div>

      {/* 3. Recovery Actions Completed */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Actions Completed
          </div>
          <button
            onMouseEnter={() => setActiveTooltip('actions')}
            onMouseLeave={() => setActiveTooltip(null)}
            className="text-slate-500 hover:text-slate-300 relative"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {activeTooltip === 'actions' && (
              <div className="absolute right-0 top-6 z-30 w-48 p-2 rounded-xl bg-slate-900 border border-slate-700 text-[11px] text-slate-300 shadow-xl font-normal">
                Number of cases handled by the agent so far.
              </div>
            )}
          </button>
        </div>
        <div className="text-2xl font-black text-slate-100 mt-2 tracking-tight font-mono">
          {processedCount} / {summary.total_events}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {summary.pending_count} pending in queue
        </div>
      </div>

      {/* 4. Active Recoveries */}
      <div className="glass-panel p-4 rounded-2xl border border-blue-900/40 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            Cases Needing Attention
          </div>
          <button
            onMouseEnter={() => setActiveTooltip('attention')}
            onMouseLeave={() => setActiveTooltip(null)}
            className="text-slate-500 hover:text-slate-300 relative"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {activeTooltip === 'attention' && (
              <div className="absolute right-0 top-6 z-30 w-48 p-2 rounded-xl bg-slate-900 border border-slate-700 text-[11px] text-slate-300 shadow-xl font-normal">
                Cases currently undergoing active recovery workflow.
              </div>
            )}
          </button>
        </div>
        <div className="text-2xl font-black text-blue-400 mt-2 tracking-tight font-mono">
          {summary.active_recoveries_count}
        </div>
        <div className="text-[11px] text-blue-300/70 mt-1">
          Active recovery workflows
        </div>
      </div>

      {/* 5. Escalated to Human */}
      <div className="glass-panel p-4 rounded-2xl border border-amber-900/40 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            Escalated Cases
          </div>
          <button
            onMouseEnter={() => setActiveTooltip('escalated')}
            onMouseLeave={() => setActiveTooltip(null)}
            className="text-slate-500 hover:text-slate-300 relative"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {activeTooltip === 'escalated' && (
              <div className="absolute right-0 top-6 z-30 w-48 p-2 rounded-xl bg-slate-900 border border-slate-700 text-[11px] text-slate-300 shadow-xl font-normal">
                High-value or disputed cases routed to human specialists.
              </div>
            )}
          </button>
        </div>
        <div className="text-2xl font-black text-amber-400 mt-2 tracking-tight font-mono">
          {summary.escalated_count}
        </div>
        <div className="text-[11px] text-amber-300/70 mt-1">
          Routed to Human Queue
        </div>
      </div>

    </div>
  );
};

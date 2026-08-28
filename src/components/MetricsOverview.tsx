import React from 'react';
import { BatchSummary } from '../types/recovery';
import { IndianRupee, CheckCircle2, ShieldAlert, UserCheck, Activity, AlertTriangle } from 'lucide-react';

interface MetricsOverviewProps {
  summary: BatchSummary;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ summary }) => {
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
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <IndianRupee className="w-3.5 h-3.5 text-blue-400" />
          Revenue At Risk
        </div>
        <div className="text-2xl font-black text-white mt-2 tracking-tight font-mono">
          {formatRupee(summary.total_value_at_risk)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {summary.total_events} detected risk cases
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
            Revenue Recovered (Won Back)
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black">
            {summary.overall_recovery_rate.toFixed(1)}% Recovery Rate
          </span>
        </div>

        <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-2 tracking-tight font-mono">
          {formatRupee(summary.total_recovered_value)}
        </div>

        <div className="text-xs text-emerald-200/80 mt-1 flex items-center gap-2 font-medium">
          <span>✓ {summary.recovered_count} cases fully recovered</span>
          <span>•</span>
          <span>Autonomously verified</span>
        </div>
      </div>

      {/* 3. Cases Processed */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 relative overflow-hidden group">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          Cases Processed
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
        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          Active Recoveries
        </div>
        <div className="text-2xl font-black text-blue-400 mt-2 tracking-tight font-mono">
          {summary.active_recoveries_count}
        </div>
        <div className="text-[11px] text-blue-300/70 mt-1">
          Workflow in-flight
        </div>
      </div>

      {/* 5. Escalated */}
      <div className="glass-panel p-4 rounded-2xl border border-amber-900/40 relative overflow-hidden group">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
          <UserCheck className="w-3.5 h-3.5 text-amber-400" />
          Escalated
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

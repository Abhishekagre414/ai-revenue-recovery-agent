import React from 'react';
import { BatchSummary } from '../types/recovery';
import { DollarSign, ShieldAlert, CheckCircle2, UserCheck, Clock, Zap } from 'lucide-react';

interface MetricsOverviewProps {
  summary: BatchSummary;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ summary }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      
      {/* Revenue at Risk */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition">
          <DollarSign className="w-16 h-16 text-blue-400" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          Revenue at Risk
        </div>
        <div className="text-2xl font-black text-white mt-2 tracking-tight">
          {formatCurrency(summary.total_value_at_risk)}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          From {summary.total_events} detected leak events
        </div>
      </div>

      {/* Recovered Revenue */}
      <div className="glass-panel p-4 rounded-2xl border border-emerald-900/40 relative overflow-hidden group glow-border-emerald">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition">
          <CheckCircle2 className="w-16 h-16 text-emerald-400" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Recovered Revenue
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {summary.overall_recovery_rate.toFixed(1)}% Rate
          </span>
        </div>
        <div className="text-2xl font-black text-emerald-400 mt-2 tracking-tight">
          {formatCurrency(summary.total_recovered_value)}
        </div>
        <div className="text-xs text-emerald-300/70 mt-1 flex items-center gap-1">
          <span>Won back autonomously & verified</span>
        </div>
      </div>

      {/* Stopping Rules Blocks */}
      <div className="glass-panel p-4 rounded-2xl border border-rose-900/40 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition">
          <ShieldAlert className="w-16 h-16 text-rose-400" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          Guardrail Blocks
        </div>
        <div className="text-2xl font-black text-rose-400 mt-2 tracking-tight">
          {summary.blocked_guardrails_count}
        </div>
        <div className="text-xs text-rose-300/70 mt-1">
          Policy & compliance violations blocked
        </div>
      </div>

      {/* Human Escalations */}
      <div className="glass-panel p-4 rounded-2xl border border-amber-900/40 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition">
          <UserCheck className="w-16 h-16 text-amber-400" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            Human Escalations
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {((summary.escalated_count / Math.max(1, summary.total_events)) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="text-2xl font-black text-amber-400 mt-2 tracking-tight">
          {summary.escalated_count} cases
        </div>
        <div className="text-xs text-amber-300/70 mt-1">
          Punted to AR / CS Queue
        </div>
      </div>

      {/* Avg Time to Recovery */}
      <div className="glass-panel p-4 rounded-2xl border border-purple-900/40 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition">
          <Clock className="w-16 h-16 text-purple-400" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-purple-400" />
          Avg Time-to-Recovery
        </div>
        <div className="text-2xl font-black text-purple-300 mt-2 tracking-tight">
          {summary.avg_time_to_recovery_hours.toFixed(1)} hrs
        </div>
        <div className="text-xs text-purple-300/70 mt-1">
          From detection to terminal resolution
        </div>
      </div>

    </div>
  );
};

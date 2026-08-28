import React from 'react';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { BatchSummary } from '../types/recovery';

interface BatchWorkflowTrackerProps {
  isRunning: boolean;
  currentStepIndex: number;
  summary: BatchSummary;
}

const STEP_LABELS = [
  'Detecting Revenue Risk',
  'Analyzing Customers',
  'Diagnosing Root Cause',
  'Calculating Recovery Score',
  'Selecting Intervention',
  'Checking Guardrails',
  'Executing Recovery',
  'Tracking Response',
  'Calculating Recovery',
  'Updating Audit Trail'
];

export const BatchWorkflowTracker: React.FC<BatchWorkflowTrackerProps> = ({
  isRunning,
  currentStepIndex,
  summary
}) => {
  const processedCount = summary.total_events - summary.pending_count;
  const progressPercent = Math.round((processedCount / Math.max(1, summary.total_events)) * 100);

  return (
    <div className="glass-panel p-5 rounded-3xl border border-blue-900/50 bg-[#0B1222]/90 space-y-4 shadow-xl">
      
      {/* Header & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Agent Batch Recovery Workflow Progress</h3>
            <p className="text-xs text-slate-400">
              {isRunning ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Agent executing batch cases ({processedCount} / {summary.total_events})
                </span>
              ) : (
                <span>Batch Simulation Overview ({processedCount} / {summary.total_events} cases completed)</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-emerald-400">{progressPercent}% Completed</span>
          </div>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 10 Step Workflow Checkmarks Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 text-xs pt-1">
        {STEP_LABELS.map((label, idx) => {
          const isDone = processedCount > 0 || currentStepIndex > idx;
          const isActive = isRunning && currentStepIndex === idx;

          return (
            <div
              key={label}
              className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-semibold'
                  : isActive
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 animate-pulse font-bold'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-1 text-[11px]">
                <span>{label}</span>
                {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
                {isActive && <Loader2 className="w-3 h-3 text-blue-400 animate-spin shrink-0" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Batch Summary Counters Strip (Prompt requirement 9) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-slate-800/80 text-xs">
        <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center">
          <div className="text-slate-400 text-[10px] font-semibold">Detected</div>
          <div className="text-sm font-black text-slate-200 font-mono mt-0.5">{summary.total_events} Cases</div>
        </div>
        <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center">
          <div className="text-slate-400 text-[10px] font-semibold">Diagnosed</div>
          <div className="text-sm font-black text-slate-200 font-mono mt-0.5">{processedCount} Cases</div>
        </div>
        <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center">
          <div className="text-slate-400 text-[10px] font-semibold">Interventions Executed</div>
          <div className="text-sm font-black text-blue-400 font-mono mt-0.5">{summary.active_recoveries_count + summary.recovered_count}</div>
        </div>
        <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center">
          <div className="text-slate-400 text-[10px] font-semibold">Recovered</div>
          <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">{summary.recovered_count}</div>
        </div>
        <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center">
          <div className="text-slate-400 text-[10px] font-semibold">Pending</div>
          <div className="text-sm font-black text-cyan-400 font-mono mt-0.5">{summary.pending_count}</div>
        </div>
        <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center">
          <div className="text-slate-400 text-[10px] font-semibold">Escalated</div>
          <div className="text-sm font-black text-amber-400 font-mono mt-0.5">{summary.escalated_count}</div>
        </div>
        <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center">
          <div className="text-slate-400 text-[10px] font-semibold">Stopped</div>
          <div className="text-sm font-black text-rose-400 font-mono mt-0.5">{summary.blocked_guardrails_count}</div>
        </div>
      </div>

    </div>
  );
};

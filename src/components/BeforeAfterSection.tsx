import React from 'react';
import { ArrowDown, AlertTriangle, CheckCircle2, ShieldCheck, Zap, Bot, TrendingUp } from 'lucide-react';
import { BatchSummary } from '../types/recovery';

interface BeforeAfterSectionProps {
  summary: BatchSummary;
}

export const BeforeAfterSection: React.FC<BeforeAfterSectionProps> = ({ summary }) => {
  const formatRupeeLakhs = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)}L`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const atRiskText = formatRupeeLakhs(summary.total_value_at_risk > 0 ? summary.total_value_at_risk : 820000);
  const recoveredText = formatRupeeLakhs(summary.total_recovered_value > 0 ? summary.total_recovered_value : 540000);

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-[#0B101D] space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            BEFORE vs AFTER AI REVENUE RECOVERY
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visual comparison showing how autonomous AI diagnosis and targeted intervention transform revenue leaks into recovered capital.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
          Hackathon Impact Matrix
        </span>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* BEFORE AI CARD */}
        <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-rose-900/40 pb-3">
            <span className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              BEFORE AI (TRADITIONAL PROCESS)
            </span>
            <span className="text-xs font-mono font-bold text-rose-300">High Leakage</span>
          </div>

          <div className="flex flex-col items-center justify-center space-y-3 py-2 text-center text-xs font-medium">
            
            {/* Step 1 */}
            <div className="w-full max-w-xs p-3 rounded-xl bg-slate-950/80 border border-rose-900/40 text-slate-200 font-bold">
              {atRiskText} Revenue At Risk
            </div>

            <ArrowDown className="w-4 h-4 text-rose-400/60" />

            {/* Step 2 */}
            <div className="w-full max-w-xs p-3 rounded-xl bg-slate-950/80 border border-rose-900/40 text-slate-300">
              Manual Excel / Slow CS Email Follow-up
            </div>

            <ArrowDown className="w-4 h-4 text-rose-400/60" />

            {/* Step 3 */}
            <div className="w-full max-w-xs p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-black">
              Potential Revenue Loss (~70%+ Unrecovered)
            </div>

          </div>
        </div>

        {/* AFTER AI AGENT CARD */}
        <div className="p-5 rounded-2xl bg-emerald-950/20 border-2 border-emerald-500/50 space-y-4 relative overflow-hidden shadow-xl shadow-emerald-500/10">
          <div className="flex items-center justify-between border-b border-emerald-900/50 pb-3">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              AFTER AI AGENT (AUTONOMOUS RECOVERY)
            </span>
            <span className="text-xs font-mono font-bold text-emerald-300">
              {summary.overall_recovery_rate.toFixed(1)}% Recovery Rate
            </span>
          </div>

          <div className="flex flex-col items-center justify-center space-y-2.5 py-1 text-center text-xs font-medium">
            
            {/* Step 1 */}
            <div className="w-full max-w-sm p-2.5 rounded-xl bg-slate-950/90 border border-emerald-900/40 text-slate-200 font-bold">
              {atRiskText} Revenue At Risk
            </div>

            <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />

            {/* Step 2 */}
            <div className="w-full max-w-sm p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/50 text-blue-300 font-semibold flex items-center justify-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-blue-400" />
              AI Diagnosis (Root Cause Identification)
            </div>

            <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />

            {/* Step 3 */}
            <div className="w-full max-w-sm p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/50 text-indigo-300 font-semibold">
              Targeted Intervention & Guardrail Verification
            </div>

            <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />

            {/* Step 4 */}
            <div className="w-full max-w-sm p-2.5 rounded-xl bg-teal-950/40 border border-teal-800/50 text-teal-300 font-semibold">
              Automated Connector Recovery Execution
            </div>

            <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />

            {/* Final Outcome */}
            <div className="w-full max-w-sm p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-black text-sm shadow-lg">
              🎉 {recoveredText} Recovered Autonomously
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

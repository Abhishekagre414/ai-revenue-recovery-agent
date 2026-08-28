import React from 'react';
import { Bot, CheckCircle2, ShieldAlert, ShieldCheck, Zap, Activity } from 'lucide-react';
import { RevenueEvent } from '../types/recovery';

interface LiveActivityPanelProps {
  currentEvent: RevenueEvent | null;
  totalEvents: number;
  processedCount: number;
  isRunning: boolean;
}

export const LiveActivityPanel: React.FC<LiveActivityPanelProps> = ({
  currentEvent,
  totalEvents,
  processedCount,
  isRunning
}) => {
  if (!currentEvent) {
    return (
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 bg-[#0A0F1D]/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              🤖 Recovery Agent Activity
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click <span className="text-emerald-400 font-semibold">▶ Run Recovery Agent</span> to watch live decision telemetry.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatRupee = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const currentCaseNum = currentEvent.id.replace('CUST-', '');
  const guardrailPassed = currentEvent.stopping_rule_check ? currentEvent.stopping_rule_check.passed : true;

  return (
    <div className="glass-panel p-5 rounded-3xl border border-emerald-500/30 bg-[#0B1526] space-y-4 shadow-2xl relative overflow-hidden">
      
      {/* Live Glow Line */}
      {isRunning && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400 animate-pulse" />
      )}

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Bot className="w-5 h-5" />
            {isRunning && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">🤖 Recovery Agent Activity</h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-mono font-bold">
                Processing Case {processedCount}/{totalEvents}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live Agent Execution Stream • Customer #{currentCaseNum} ({currentEvent.customer_name})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono font-bold">
            Risk: <span className={currentEvent.risk_level === 'HIGH' ? 'text-rose-400' : 'text-amber-400'}>{currentEvent.risk_level}</span>
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
            Score: {currentEvent.recovery_probability}% Probable
          </span>
        </div>
      </div>

      {/* Real-Time Agent Telemetry Grid (Hackathon requirement 10) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        
        {/* Box 1: Customer & Risk */}
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-slate-400 text-[10px] uppercase font-bold">CUSTOMER & VALUE</div>
          <div className="text-slate-100 font-bold font-mono">{currentEvent.id} ({currentEvent.customer_name.split(' ')[0]})</div>
          <div className="text-emerald-400 font-black text-sm font-mono">
            {formatRupee(currentEvent.amount)} at risk
          </div>
        </div>

        {/* Box 2: Diagnosed Cause */}
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-slate-400 text-[10px] uppercase font-bold">ROOT CAUSE DIAGNOSIS</div>
          <div className="text-slate-200 font-semibold truncate">
            {currentEvent.diagnosis ? currentEvent.diagnosis.root_cause : 'Analyzing payload...'}
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {currentEvent.diagnosis ? `${currentEvent.diagnosis.confidence}% Diagnostic Confidence` : 'Extracting signals'}
          </div>
        </div>

        {/* Box 3: Selected Intervention Strategy */}
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-slate-400 text-[10px] uppercase font-bold">SELECTED INTERVENTION</div>
          <div className="text-blue-400 font-bold capitalize">
            {currentEvent.decision ? currentEvent.decision.chosen_action_type.replace('_', ' ') : 'Selecting policy...'}
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {currentEvent.decision ? currentEvent.decision.matched_rule : 'Evaluating matrix'}
          </div>
        </div>

        {/* Box 4: Guardrail & Action Status */}
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-slate-400 text-[10px] uppercase font-bold">GUARDRAIL & ACTION</div>
          <div className="flex items-center gap-1.5 font-bold">
            {guardrailPassed ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Passed ✓
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Blocked 🛑
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-300 font-mono capitalize">
            Status: {currentEvent.status.replace('_', ' ')}
          </div>
        </div>

      </div>

      {/* AI Decision Explanation Box */}
      {currentEvent.decision && (
        <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-2xl text-xs space-y-1">
          <div className="text-blue-400 font-bold text-[10px] uppercase flex items-center justify-between">
            <span>Why this action?</span>
            <span className="text-slate-400">Confidence: {currentEvent.decision.confidence}%</span>
          </div>
          <p className="text-slate-200 font-mono text-[11px] leading-relaxed">
            {currentEvent.decision.why_this_action}
          </p>
        </div>
      )}

    </div>
  );
};

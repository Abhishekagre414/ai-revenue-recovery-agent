import React from 'react';
import { ShieldCheck, ShieldAlert, AlertOctagon, CheckCircle2, Lock, Zap, Clock, UserCheck } from 'lucide-react';

interface ComplianceGuardrailsViewProps {
  onTriggerMockViolation: (type: 'discount' | 'frequency' | 'quiethours' | 'optout') => void;
  killSwitchActive: boolean;
  onToggleKillSwitch: () => void;
  blockedCount: number;
}

export const ComplianceGuardrailsView: React.FC<ComplianceGuardrailsViewProps> = ({
  onTriggerMockViolation,
  killSwitchActive,
  onToggleKillSwitch,
  blockedCount
}) => {
  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-rose-900/50 bg-[#0F0A17] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">🛑 Recovery Guardrails & Compliance Policy Engine</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold font-mono">
                {blockedCount} Violations Blocked
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Hard-coded policy boundaries that inspect every AI agent decision in real-time. If any rule triggers, recovery halts automatically and escalates appropriately.
            </p>
          </div>
        </div>

        {/* Global Kill Switch */}
        <button
          onClick={onToggleKillSwitch}
          className={`px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 border transition shadow-lg ${
            killSwitchActive
              ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-rose-500/30'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-rose-400'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          {killSwitchActive ? 'EMERGENCY KILL SWITCH ENGAGED' : 'Engage Emergency Kill Switch'}
        </button>
      </div>

      {/* 8 Active Guardrail Rules Grid (Hackathon requirement #8) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Rule 1 */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Rule #1: Max Retries
            </span>
            <span className="font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Cap = 3</span>
          </div>
          <p className="text-slate-300 text-xs font-medium">Maximum payment retries limit = 3 attempts.</p>
          <div className="text-[10px] text-slate-500 font-mono">Prevents card network penalty & spamming.</div>
        </div>

        {/* Rule 2 */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Rule #2: Max Messages
            </span>
            <span className="font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Cap = 2</span>
          </div>
          <p className="text-slate-300 text-xs font-medium">Maximum customer messages = 2 total outreaches.</p>
          <div className="text-[10px] text-slate-500 font-mono">Guarantees zero customer harassment.</div>
        </div>

        {/* Rule 3 */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Rule #3: Stop on Success
            </span>
            <span className="font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Terminal</span>
          </div>
          <p className="text-slate-300 text-xs font-medium">Stop after successful payment immediately.</p>
          <div className="text-[10px] text-slate-500 font-mono">Workflow terminates instantly upon receipt.</div>
        </div>

        {/* Rule 4 */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Rule #4: Stop on Opt-Out
            </span>
            <span className="font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Regulatory</span>
          </div>
          <p className="text-slate-300 text-xs font-medium">Stop after customer opts out (Do-Not-Contact).</p>
          <div className="text-[10px] text-slate-500 font-mono">Enforces strict GDPR / TRAI DND compliance.</div>
        </div>

        {/* Rule 5 */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Rule #5: Stop on Churn
            </span>
            <span className="font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Terminal</span>
          </div>
          <p className="text-slate-300 text-xs font-medium">Stop after account cancellation or churn.</p>
          <div className="text-[10px] text-slate-500 font-mono">Prevents outreach to closed accounts.</div>
        </div>

        {/* Rule 6 */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              Rule #6: Auto-Escalate
            </span>
            <span className="font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Human AR</span>
          </div>
          <p className="text-slate-300 text-xs font-medium">Escalate to human after repeated failures.</p>
          <div className="text-[10px] text-slate-500 font-mono">Creates Jira / HubSpot ticket for specialist.</div>
        </div>

        {/* Rule 7 */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Rule #7: High-Value Threshold
            </span>
            <span className="font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">&gt; ₹1,00,000</span>
          </div>
          <p className="text-slate-300 text-xs font-medium">High-value cases require manager approval.</p>
          <div className="text-[10px] text-slate-500 font-mono">Ensures high enterprise transactions are reviewed.</div>
        </div>

        {/* Rule 8 */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Rule #8: Quiet Hours
            </span>
            <span className="font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">10 PM - 8 AM</span>
          </div>
          <p className="text-slate-300 text-xs font-medium">Respect local communication hours.</p>
          <div className="text-[10px] text-slate-500 font-mono">Holds outreach until 08:01 AM automatically.</div>
        </div>

      </div>

      {/* Interactive Mock Violation Tester */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-950/60 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          Test Guardrail Interception (Mock Violation Injection)
        </h3>
        <p className="text-xs text-slate-400">
          Click to inject artificial violation events and verify real-time interception by the stopping engine:
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => onTriggerMockViolation('frequency')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Simulate Exceeded Message Limit
          </button>
          <button
            onClick={() => onTriggerMockViolation('optout')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Simulate Opt-out Customer
          </button>
          <button
            onClick={() => onTriggerMockViolation('quiethours')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Simulate Quiet Hours Block
          </button>
          <button
            onClick={() => onTriggerMockViolation('discount')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Simulate High Discount Violation
          </button>
        </div>
      </div>

    </div>
  );
};

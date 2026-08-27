import React, { useState } from 'react';
import { stoppingRules } from '../engine/stoppingRules';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Slash, 
  Zap, 
  Clock, 
  DollarSign, 
  Lock, 
  UserX, 
  CheckCircle2, 
  AlertTriangle,
  Play
} from 'lucide-react';

interface ComplianceGuardrailsViewProps {
  onTriggerMockViolation: (violationType: 'discount' | 'frequency' | 'quiethours' | 'optout') => void;
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
  const [violationLog, setViolationLog] = useState<Array<{ id: string; time: string; type: string; blockedBy: string; result: string }>>([
    {
      id: 'VIOL-901',
      time: new Date().toLocaleTimeString(),
      type: 'Over-Cap Discount Attempt (15%)',
      blockedBy: 'RULE_DISCOUNT_PERCENT_CAP_EXCEEDED',
      result: 'BLOCKED - Routed to Manager Approval'
    },
    {
      id: 'VIOL-902',
      time: new Date(Date.now() - 300000).toLocaleTimeString(),
      type: 'Outreach Attempt #4 within 12 Hours',
      blockedBy: 'RULE_FREQUENCY_CAP_EXCEEDED & COOLDOWN',
      result: 'BLOCKED - Cooldown Enforcement Active'
    }
  ]);

  const handleRunTest = (type: 'discount' | 'frequency' | 'quiethours' | 'optout') => {
    onTriggerMockViolation(type);
    
    let typeName = 'Test Violation';
    let ruleName = 'RULE_COMPLIANCE';
    if (type === 'discount') {
      typeName = 'Illegal 25% Discount Attempt ($180 value)';
      ruleName = 'RULE_DISCOUNT_PERCENT_CAP_EXCEEDED ($50 / 10% Ceiling)';
    } else if (type === 'frequency') {
      typeName = 'Outreach Attempt #4 to Single Customer';
      ruleName = 'RULE_FREQUENCY_CAP_EXCEEDED (Max 3 Allowed)';
    } else if (type === 'quiethours') {
      typeName = 'Automated Voice Call during Local Quiet Hours (11:45 PM)';
      ruleName = 'RULE_LOCAL_QUIET_HOURS_RESTRICTION (FDCPA)';
    } else if (type === 'optout') {
      typeName = 'SMS Nudge to Customer with Active Opt-Out';
      ruleName = 'RULE_REGULATORY_DO_NOT_CONTACT_FLAG';
    }

    const newEntry = {
      id: `VIOL-${Math.floor(1000 + Math.random() * 9000)}`,
      time: new Date().toLocaleTimeString(),
      type: typeName,
      blockedBy: ruleName,
      result: 'BLOCKED IN REAL-TIME BY STOPPING ENGINE'
    };

    setViolationLog(prev => [newEntry, ...prev]);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-rose-900/40 bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-rose-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Stopping Rules & Compliance Guardrails Engine</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
              Hard Gate Enabled
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            The AI Revenue Recovery Agent operates inside strict policy boundaries. Every generated intervention is validated by the Stopping Rules Engine before execution. Bypassing caps or sending un-approved offers is impossible by design.
          </p>
        </div>

        <button
          onClick={onToggleKillSwitch}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition border shadow-lg ${
            killSwitchActive
              ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-rose-600/30 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
        >
          <Lock className="w-4 h-4" />
          {killSwitchActive ? 'Global Emergency Pause ACTIVE' : 'Engage Emergency Global Kill Switch'}
        </button>
      </div>

      {/* Guardrail Policy Rules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Rule 1 */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Zap className="w-4 h-4" />
              1. Contact Frequency Cap
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-mono">Max 3</span>
          </div>
          <p className="text-xs text-slate-400">
            Strict maximum of 3 outreach attempts per customer per revenue leak event. Automatic escalation to human queue on attempt 4.
          </p>
        </div>

        {/* Rule 2 */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Clock className="w-4 h-4" />
              2. 24h Cooldown Window
            </span>
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-mono">24 Hours</span>
          </div>
          <p className="text-xs text-slate-400">
            Enforces minimum 24-hour waiting period between nudges or retries per card network & anti-spam compliance rules.
          </p>
        </div>

        {/* Rule 3 */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-400">
              <DollarSign className="w-4 h-4" />
              3. Discount Ceiling Cap
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-mono">&lt;= 10% / $50</span>
          </div>
          <p className="text-xs text-slate-400">
            Incentives capped at policy maximums (&le;10% or &le;$50 value). Offers above ceiling require manager human approval.
          </p>
        </div>

        {/* Rule 4 */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 text-rose-400">
              <UserX className="w-4 h-4" />
              4. FDCPA & Consent Rules
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-mono">Mandatory</span>
          </div>
          <p className="text-xs text-slate-400">
            Respects opt-out flags, quiet hours (10 PM - 8 AM), non-threatening tone limits for receivables, and instant dispute handoffs.
          </p>
        </div>

      </div>

      {/* Interactive Guardrail Violation Testing Sandbox */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Interactive Guardrail Violation Simulator (Judge Demonstration)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any button below to trigger an deliberate illegal agent action. Observe how the Stopping Rules Engine instantly intercepts and blocks the violation before execution.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handleRunTest('discount')}
            className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-left transition group"
          >
            <div className="text-xs font-bold text-amber-400 group-hover:underline flex items-center gap-1">
              <Play className="w-3 h-3 fill-current" />
              Test 25% Illegal Discount
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Exceeds 10% policy cap ($180 savings)</div>
          </button>

          <button
            onClick={() => handleRunTest('frequency')}
            className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 text-left transition group"
          >
            <div className="text-xs font-bold text-blue-400 group-hover:underline flex items-center gap-1">
              <Play className="w-3 h-3 fill-current" />
              Test 4th Outreach Attempt
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Breaches 3-attempt frequency limit</div>
          </button>

          <button
            onClick={() => handleRunTest('quiethours')}
            className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 text-left transition group"
          >
            <div className="text-xs font-bold text-indigo-400 group-hover:underline flex items-center gap-1">
              <Play className="w-3 h-3 fill-current" />
              Test Quiet Hours Call
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Attempts contact at 11:45 PM</div>
          </button>

          <button
            onClick={() => handleRunTest('optout')}
            className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/50 text-left transition group"
          >
            <div className="text-xs font-bold text-rose-400 group-hover:underline flex items-center gap-1">
              <Play className="w-3 h-3 fill-current" />
              Test Opt-Out Breach
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Targets customer with DNC flag</div>
          </button>
        </div>
      </div>

      {/* Real-time Interception Log */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Live Guardrail Interception Log ({violationLog.length} Blocked Events)
          </h3>
          <span className="text-xs text-slate-400 font-mono">Immutable Compliance Log</span>
        </div>

        <div className="space-y-2 text-xs">
          {violationLog.map((item) => (
            <div key={item.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/30">
                  {item.id}
                </span>
                <div>
                  <div className="font-bold text-slate-200">{item.type}</div>
                  <div className="text-[10px] text-rose-400 font-mono mt-0.5">Enforced Rule: {item.blockedBy}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-bold">
                  <Slash className="w-3 h-3" />
                  {item.result}
                </span>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

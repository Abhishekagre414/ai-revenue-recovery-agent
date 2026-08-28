import React, { useState } from 'react';
import { RevenueEvent, TerminalState } from '../types/recovery';
import { 
  X, 
  Search, 
  Stethoscope, 
  Scale, 
  Send, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  UserCheck, 
  FileCode, 
  Bot,
  HelpCircle,
  AlertOctagon,
  IndianRupee
} from 'lucide-react';

interface CaseDetailModalProps {
  event: RevenueEvent | null;
  onClose: () => void;
  onUpdateStatus: (eventId: string, newStatus: TerminalState) => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  event,
  onClose,
  onUpdateStatus
}) => {
  if (!event) return null;

  const [activeTab, setActiveTab] = useState<'pipeline' | 'json' | 'audit'>('pipeline');
  const formatRupee = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const isRecovered = event.status === 'recovered';
  const recoveredAmount = isRecovered ? event.amount : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0B111E] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">{event.id}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold uppercase">
                  {event.type.replace('_', ' ')}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                  At Risk: {formatRupee(event.amount)}
                </span>
                {isRecovered && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                    Recovered: {formatRupee(recoveredAmount)}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Customer ID: <span className="text-slate-200 font-mono font-semibold">{event.customer_id}</span> ({event.customer_name}) • {event.customer_email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Bar inside modal */}
        <div className="px-6 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-medium">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'pipeline' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Case Inspector Telemetry
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'json' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              Raw Event Payload
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'audit' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Case Audit Log ({event.audit_logs.length})
            </button>
          </div>

          {/* Quick Terminal Action Simulator Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-semibold mr-1">Simulate Resolution:</span>
            <button
              onClick={() => onUpdateStatus(event.id, 'recovered')}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Mark Recovered
            </button>
            <button
              onClick={() => onUpdateStatus(event.id, 'escalated_to_human')}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition flex items-center gap-1"
            >
              <UserCheck className="w-3 h-3 text-amber-400" />
              Escalate to AR
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {activeTab === 'pipeline' && (
            <div className="space-y-5">
              
              {/* Overview Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Risk Level</div>
                  <div className={`font-black text-sm mt-0.5 ${
                    event.risk_level === 'HIGH' ? 'text-rose-400' : event.risk_level === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {event.risk_level} RISK
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Recovery Probability</div>
                  <div className="font-black text-sm text-cyan-400 font-mono mt-0.5">
                    {event.recovery_probability}%
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Exp. Recovered Value</div>
                  <div className="font-black text-sm text-emerald-400 font-mono mt-0.5">
                    {formatRupee(event.expected_recoverable_value)}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Current Status</div>
                  <div className="font-bold text-slate-200 uppercase mt-0.5 font-mono">
                    {event.status.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* WHY THIS ACTION? (AI Explanation required in Prompt #7 & #12) */}
              {event.decision && (
                <div className="p-4 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-blue-950/40 border border-blue-800/50 rounded-2xl space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      Why This Action? (AI Agent Decision Rationale)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold text-[11px]">
                      Confidence: {event.decision.confidence}%
                    </span>
                  </div>
                  <p className="text-slate-100 font-mono text-[11px] leading-relaxed p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    "{event.decision.why_this_action}"
                  </p>
                </div>
              )}

              {/* STAGE 1 & 2: DETECT & DIAGNOSE */}
              <div className="glass-panel p-4 rounded-2xl border border-indigo-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-indigo-400 uppercase tracking-wider">
                    <Stethoscope className="w-4 h-4" />
                    Diagnosis & Root Cause Analysis
                  </div>
                  {event.diagnosis && (
                    <span className="font-mono text-indigo-300 font-bold">
                      Confidence: {event.diagnosis.confidence}%
                    </span>
                  )}
                </div>

                {event.diagnosis ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-indigo-950/40 border border-indigo-800/50 rounded-xl text-indigo-200 font-bold">
                      Root Cause: {event.diagnosis.root_cause}
                    </div>

                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-slate-400 text-[10px] font-bold uppercase">LLM Signal Reasoning:</div>
                      <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                        {event.diagnosis.llm_reasoning_summary}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-slate-500 italic">Diagnostic agent queued...</div>
                )}
              </div>

              {/* STAGE 3: POLICY & INTERVENTION RECOMMENDATION */}
              <div className="glass-panel p-4 rounded-2xl border border-purple-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-purple-400 uppercase tracking-wider">
                    <Scale className="w-4 h-4" />
                    Policy Decision & Recommended Intervention
                  </div>
                  {event.decision && (
                    <span className="font-mono text-purple-300 font-bold">
                      Rule: {event.decision.policy_id}
                    </span>
                  )}
                </div>

                {event.decision ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                      <div className="text-purple-400 text-[10px] font-bold uppercase">Recommended Intervention:</div>
                      <div className="text-slate-100 font-black text-sm capitalize">
                        {event.decision.chosen_action_type.replace('_', ' ')}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5 font-mono">{event.decision.llm_rationale}</div>
                    </div>

                    {/* Draft Message */}
                    <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800">
                      <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Generated Outreach Draft:</div>
                      <p className="text-slate-200 font-mono text-[11px] leading-relaxed">
                        {event.decision.draft_message}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-slate-500 italic">Policy engine pending...</div>
                )}
              </div>

              {/* GUARDRAILS & STOPPING RULES (Prompt #8 & #12) */}
              <div className="glass-panel p-4 rounded-2xl border border-rose-900/50 bg-rose-950/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-rose-400 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-rose-400" />
                    🛑 Recovery Guardrails Status
                  </div>
                  {event.stopping_rule_check && (
                    <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
                      event.stopping_rule_check.passed
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {event.stopping_rule_check.passed ? 'Passed ✓' : 'Blocked 🛑'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Max Messages (Limit 2):</span>
                    <span className={event.outreach_count < 2 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {event.outreach_count} / 2 Messages
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Max Payment Retries (Limit 3):</span>
                    <span className="text-emerald-400 font-bold">Passed (Retries &lt; 3)</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Opt-out / Do-Not-Contact:</span>
                    <span className={!event.do_not_contact ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {event.do_not_contact ? 'OPTED OUT (Stopped)' : 'Clear (Passed)'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">High-Value Threshold (&gt; ₹1,00,000):</span>
                    <span className={event.amount < 100000 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {event.amount >= 100000 ? 'Requires Manager Approval' : 'Clear (Passed)'}
                    </span>
                  </div>
                </div>

                {/* Stopped Reason Banner */}
                {event.stopping_rule_check && !event.stopping_rule_check.passed && (
                  <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-200 font-bold flex items-start gap-2">
                    <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      {event.stopping_rule_check.block_reason}
                    </div>
                  </div>
                )}
              </div>

              {/* STAGE 4 & 5: ACTUATOR EXECUTION */}
              <div className="glass-panel p-4 rounded-2xl border border-amber-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-amber-400 uppercase tracking-wider">
                    <Send className="w-4 h-4" />
                    Executed Connector & Payload
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-mono text-[10px]">
                    Simulation / Demo Mode
                  </span>
                </div>

                {event.action ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold">Executed Connector:</div>
                        <div className="text-slate-200 font-bold">{event.action.connector}</div>
                      </div>
                      <div className="text-right font-mono text-[10px] text-slate-400">
                        {new Date(event.action.executed_at).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800">
                      <div className="text-slate-400 font-bold text-[10px] uppercase mb-1">Delivered Connector Payload:</div>
                      <pre className="text-slate-300 font-mono text-[11px] overflow-x-auto p-2 bg-slate-950 rounded-lg">
                        {JSON.stringify(event.action.payload_delivered, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-slate-500 italic">Action execution step pending batch run...</div>
                )}
              </div>

            </div>
          )}

          {activeTab === 'json' && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-400">JSON Payload: Event #{event.id}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(event, null, 2))}
                  className="text-xs text-blue-400 hover:underline"
                >
                  Copy JSON
                </button>
              </div>
              <pre className="text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed">
                {JSON.stringify(event, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3">
              {event.audit_logs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-400 font-mono">{log.actor}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="font-bold text-slate-200 text-[11px]">{log.action_taken}</div>
                  <p className="text-slate-400 font-mono text-[10px]">{log.description}</p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/20"
          >
            Close Case Inspector
          </button>
        </div>

      </div>
    </div>
  );
};

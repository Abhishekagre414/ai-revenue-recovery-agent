import React, { useState } from 'react';
import { RevenueEvent, TerminalState } from '../types/recovery';
import { 
  X, 
  Search, 
  Stethoscope, 
  Scale, 
  Send, 
  BarChart3, 
  ShieldAlert, 
  ShieldCheck, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  AlertOctagon, 
  FileCode, 
  ExternalLink,
  Bot,
  UserCheck
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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio) {
      setTimeout(() => setIsPlayingAudio(false), 5000);
    }
  };

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
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">{event.id}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                  {event.type.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Value at Risk: ${event.amount.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Customer: <span className="text-slate-200 font-semibold">{event.customer_name}</span> ({event.customer_email})
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
        <div className="px-6 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'pipeline' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              5-Stage Telemetry
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
              Recovered
            </button>
            <button
              onClick={() => onUpdateStatus(event.id, 'escalated_to_human')}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition flex items-center gap-1"
            >
              <UserCheck className="w-3 h-3 text-amber-400" />
              Escalate to AR
            </button>
            <button
              onClick={() => onUpdateStatus(event.id, 'lost')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 text-[11px] font-bold transition"
            >
              Mark Lost
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {activeTab === 'pipeline' && (
            <div className="space-y-5">
              
              {/* STAGE 1: DETECT */}
              <div className="glass-panel p-4 rounded-2xl border border-blue-900/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                    <Search className="w-4 h-4" />
                    Stage 1: Detect & Ingest Telemetry
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Recoverability Score: {event.recoverability_score}%
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-3">
                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">CUSTOMER TIER</div>
                    <div className="font-bold text-slate-200 uppercase">{event.customer_tier}</div>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">RAW VALUE</div>
                    <div className="font-bold text-slate-200">${event.amount.toLocaleString()}</div>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">EXPECTED VALUE</div>
                    <div className="font-bold text-blue-400 font-mono">${event.expected_recoverable_value.toLocaleString()}</div>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">OUTREACH COUNT</div>
                    <div className="font-bold text-slate-200">{event.outreach_count} / 3 Attempts</div>
                  </div>
                </div>
              </div>

              {/* STAGE 2: DIAGNOSE */}
              <div className="glass-panel p-4 rounded-2xl border border-indigo-900/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    <Stethoscope className="w-4 h-4" />
                    Stage 2: Diagnosis Engine & LLM Reasoning
                  </div>
                  {event.diagnosis && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {event.diagnosis.confidence}% Confidence
                    </span>
                  )}
                </div>

                {event.diagnosis ? (
                  <div className="space-y-3 mt-2 text-xs">
                    <div className="p-3 bg-indigo-950/30 border border-indigo-900/50 rounded-xl text-indigo-200 font-semibold">
                      <span className="text-indigo-400 font-bold uppercase text-[10px] block">Root Cause Label:</span>
                      {event.diagnosis.root_cause}
                    </div>

                    <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="text-slate-400 font-bold text-[10px] uppercase">LLM Diagnostic Thought Log:</div>
                      <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                        {event.diagnosis.llm_reasoning_summary}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-bold">Signals Analyzed:</span>
                      {event.diagnosis.signal_sources.map((sig, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                          {sig}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500 italic">
                    Diagnostic agent currently queued...
                  </div>
                )}
              </div>

              {/* STAGE 3: DECIDE */}
              <div className="glass-panel p-4 rounded-2xl border border-purple-900/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                    <Scale className="w-4 h-4" />
                    Stage 3: Hard Policy Table Decision & Bounded Copy
                  </div>
                  {event.decision && (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Rule: {event.decision.policy_id}
                    </span>
                  )}
                </div>

                {event.decision ? (
                  <div className="space-y-3 mt-2 text-xs">
                    <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                      <div className="text-purple-400 font-bold text-[10px] uppercase mb-1">Matched Policy Rule:</div>
                      <div className="text-slate-200 font-bold">{event.decision.matched_rule}</div>
                      <div className="text-slate-400 text-[11px] mt-1 font-mono">{event.decision.llm_rationale}</div>
                    </div>

                    {/* Draft Message */}
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                      <div className="text-slate-400 font-bold text-[10px] uppercase mb-1">Bounded Outreach Copy Draft:</div>
                      <p className="text-slate-100 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                        {event.decision.draft_message}
                      </p>
                    </div>

                    {/* Hinglish Voice Script Preview */}
                    {event.decision.hinglish_voice_script && (
                      <div className="p-3.5 bg-amber-950/20 border border-amber-900/40 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                            <Volume2 className="w-4 h-4" />
                            Hinglish Interactive Voice Telephony Script
                          </span>
                          <button
                            onClick={toggleAudio}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition ${
                              isPlayingAudio 
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            {isPlayingAudio ? 'Speaking Voice Output...' : 'Preview Voice Call Audio'}
                          </button>
                        </div>
                        <p className="text-slate-200 font-mono text-[11px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 italic">
                          "{event.decision.hinglish_voice_script}"
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500 italic">
                    Policy decision pending...
                  </div>
                )}
              </div>

              {/* STOPPING RULES & COMPLIANCE CHECK */}
              <div className="glass-panel p-4 rounded-2xl border border-rose-900/50 bg-rose-950/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-rose-400" />
                    Stopping Rules & Compliance Guardrails Engine
                  </div>
                  {event.stopping_rule_check ? (
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      event.stopping_rule_check.passed 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {event.stopping_rule_check.passed ? 'PASSED ALL GUARDRAILS' : 'GUARDRAIL BLOCKED'}
                    </span>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Frequency Cap (&lt;= 3):</span>
                    <span className={event.outreach_count < 3 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {event.outreach_count} / 3 Attempts
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Discount Ceiling (&lt;= 10% / $50):</span>
                    <span className="text-emerald-400 font-bold">
                      {event.decision?.proposed_incentive_percent ? `${event.decision.proposed_incentive_percent}%` : '0% (Pass)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Do-Not-Contact Flag:</span>
                    <span className={!event.do_not_contact ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {event.do_not_contact ? 'FLAGGED (Block)' : 'Clear (Pass)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Quiet Hours Restrictions:</span>
                    <span className={!event.quiet_hours_active ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {event.quiet_hours_active ? 'ACTIVE (Hold)' : 'Inactive (Pass)'}
                    </span>
                  </div>
                </div>

                {event.stopping_rule_check && !event.stopping_rule_check.passed && (
                  <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-start gap-2">
                    <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-rose-400">Stopping Rule Activated:</div>
                      <p className="mt-0.5">{event.stopping_rule_check.block_reason}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* STAGE 4 & 5: ACT & MEASURE */}
              <div className="glass-panel p-4 rounded-2xl border border-amber-900/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Send className="w-4 h-4" />
                    Stage 4 & 5: Actuator Execution & Terminal Resolution
                  </div>
                  <span className="text-xs font-bold font-mono text-amber-300">
                    Status: {event.status.toUpperCase()}
                  </span>
                </div>

                {event.action ? (
                  <div className="space-y-3 mt-2 text-xs">
                    <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold">Executed Connector:</div>
                        <div className="text-slate-200 font-bold">{event.action.connector}</div>
                      </div>
                      <div className="text-right font-mono text-[11px] text-slate-400">
                        {new Date(event.action.executed_at).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800">
                      <div className="text-slate-400 font-bold text-[10px] uppercase mb-1">Delivered Payload Audit:</div>
                      <pre className="text-slate-300 font-mono text-[11px] overflow-x-auto p-2 bg-slate-950 rounded-lg">
                        {JSON.stringify(event.action.payload_delivered, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500 italic">
                    Action execution step pending batch run...
                  </div>
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
            <div className="space-y-3 text-xs">
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
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};

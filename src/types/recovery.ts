export type LeakType = 'payment_degradation' | 'b2b_receivables' | 'checkout_abandonment';

export type Stage = 'detect' | 'diagnose' | 'decide' | 'act' | 'measure';

export type TerminalState = 
  | 'pending' 
  | 'diagnosed' 
  | 'decided' 
  | 'actioned' 
  | 'recovered' 
  | 'lost' 
  | 'escalated_to_human' 
  | 'blocked_by_guardrail';

export interface RevenueEvent {
  id: string;
  type: LeakType;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_tier: 'enterprise' | 'growth' | 'smb' | 'b2c';
  amount: number;
  currency: string;
  timestamp: string;
  raw_payload: Record<string, any>;
  
  // Pipeline metrics & state
  recoverability_score: number; // 0 - 100%
  expected_recoverable_value: number; // amount * (score / 100)
  status: TerminalState;
  current_stage: Stage;
  outreach_count: number;
  last_outreach_at?: string;
  do_not_contact: boolean;
  quiet_hours_active: boolean;
  
  // Stages results
  diagnosis?: DiagnosisResult;
  decision?: PolicyDecision;
  action?: ActionExecution;
  stopping_rule_check?: StoppingRuleCheck;
  audit_logs: AuditLogEntry[];
}

export interface DiagnosisResult {
  root_cause: string;
  confidence: number; // 0 - 100%
  decline_code?: string;
  invoice_age_days?: number;
  signal_sources: string[];
  llm_reasoning_summary: string;
  recommended_action_class: string;
}

export type ActionType = 
  | 'smart_retry' 
  | 'payment_link' 
  | 'email_nudge' 
  | 'sms_nudge' 
  | 'hinglish_voice' 
  | 'ar_human_task' 
  | 'discount_nudge';

export interface PolicyDecision {
  policy_id: string;
  matched_rule: string;
  chosen_action_type: ActionType;
  proposed_incentive_percent?: number;
  draft_message: string;
  hinglish_voice_script?: string;
  llm_rationale: string;
}

export interface ActionExecution {
  connector: string;
  executed_at: string;
  status: 'success' | 'scheduled' | 'escalated' | 'failed';
  payload_delivered: Record<string, any>;
  retry_scheduled_at?: string;
  payment_update_url?: string;
  ar_task_id?: string;
  promise_to_pay_date?: string;
}

export interface StoppingRuleCheck {
  passed: boolean;
  triggered_rules: string[];
  action_allowed: boolean;
  requires_human_approval: boolean;
  block_reason?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  event_id: string;
  stage: Stage;
  actor: 'DETECTOR' | 'DIAGNOSER' | 'POLICY_ENGINE' | 'STOPPING_ENGINE' | 'ACTUATOR' | 'HUMAN_OPERATOR';
  action_taken: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface BatchSummary {
  total_events: number;
  total_value_at_risk: number;
  total_recovered_value: number;
  overall_recovery_rate: number; // %
  escalated_count: number;
  blocked_guardrails_count: number;
  avg_time_to_recovery_hours: number;
  leak_breakdown: {
    payment_degradation: { total: number; recovered: number; count: number };
    b2b_receivables: { total: number; recovered: number; count: number };
    checkout_abandonment: { total: number; recovered: number; count: number };
  };
}

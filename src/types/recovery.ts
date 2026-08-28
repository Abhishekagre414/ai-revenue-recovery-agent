export type LeakType = 
  | 'payment_failure' 
  | 'checkout_abandonment' 
  | 'failed_subscription' 
  | 'overdue_invoice' 
  | 'mandate_failure';

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

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type ActionType = 
  | 'payment_retry' 
  | 'email_reminder' 
  | 'whatsapp_reminder' 
  | 'checkout_recovery' 
  | 'subscription_recovery' 
  | 'invoice_followup' 
  | 'human_escalation';

export interface RevenueEvent {
  id: string;
  type: LeakType;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_tier: 'enterprise' | 'growth' | 'smb' | 'b2c';
  amount: number; // In INR (₹)
  currency: string; // 'INR' or '₹'
  timestamp: string;
  raw_payload: Record<string, any>;
  
  // Pipeline metrics & state
  risk_level: RiskLevel;
  recovery_probability: number; // 0 - 100%
  expected_recoverable_value: number; // amount * (probability / 100)
  status: TerminalState;
  current_stage: Stage;
  outreach_count: number;
  last_outreach_at?: string;
  do_not_contact: boolean;
  quiet_hours_active: boolean;
  stopped_reason?: string;
  next_action: string;
  escalation_status: 'normal' | 'escalated' | 'stopped';
  
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
  why_this_action: string;
  recommended_action_class: string;
}

export interface PolicyDecision {
  policy_id: string;
  matched_rule: string;
  chosen_action_type: ActionType;
  proposed_incentive_percent?: number;
  draft_message: string;
  whatsapp_script?: string;
  why_this_action: string;
  confidence: number;
  llm_rationale: string;
}

export interface ActionExecution {
  connector: string; // Clearly labeled with [Simulation / Demo Mode]
  executed_at: string;
  status: 'success' | 'scheduled' | 'escalated' | 'failed';
  payload_delivered: Record<string, any>;
  retry_scheduled_at?: string;
  payment_update_url?: string;
  ar_task_id?: string;
  promise_to_pay_date?: string;
  simulation_label: string;
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
  amount?: number;
  metadata?: Record<string, any>;
}

export interface BatchSummary {
  total_events: number;
  total_value_at_risk: number;
  total_recovered_value: number;
  overall_recovery_rate: number; // %
  active_recoveries_count: number;
  escalated_count: number;
  blocked_guardrails_count: number;
  recovered_count: number;
  pending_count: number;
  stopped_count: number;
  avg_time_to_recovery_hours: number;
  leak_breakdown: Record<LeakType, { total: number; recovered: number; count: number }>;
}

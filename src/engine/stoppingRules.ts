import { RevenueEvent, PolicyDecision, StoppingRuleCheck } from '../types/recovery';

export class StoppingRulesEngine {
  private globalKillSwitchActive: boolean = false;
  private maxOutreachLimit: number = 2; // Max 2 customer messages rule
  private maxRetryLimit: number = 3;    // Max 3 retries rule
  private minCooldownHours: number = 24;
  private maxDiscountPercentCap: number = 10;
  private highValueHumanApprovalThreshold: number = 100000; // > ₹1,00,000 requires human approval

  public setGlobalKillSwitch(active: boolean) {
    this.globalKillSwitchActive = active;
  }

  public getGlobalKillSwitch(): boolean {
    return this.globalKillSwitchActive;
  }

  /**
   * Validates action against strict hackathon compliance guardrails:
   * 1. Max payment retries = 3
   * 2. Max customer messages = 2
   * 3. Stop after successful payment
   * 4. Stop after customer opts out
   * 5. Stop after account cancellation
   * 6. Escalate after repeated failures
   * 7. High-value cases can require human approval (> ₹1,00,000)
   * 8. Respect communication hours (Quiet hours 10 PM - 8 AM)
   */
  public evaluate(event: RevenueEvent, decision: PolicyDecision): StoppingRuleCheck {
    const triggeredRules: string[] = [];
    let actionAllowed = true;
    let requiresHumanApproval = false;
    let blockReason = '';

    // 1. Global Kill Switch Check
    if (this.globalKillSwitchActive) {
      triggeredRules.push('RULE_GLOBAL_KILL_SWITCH_ACTIVE');
      actionAllowed = false;
      blockReason = '🛑 Recovery Stopped Reason: Emergency global kill switch engaged by administrator.';
    }

    // 2. Stop after successful payment / Terminal state check
    if (event.status === 'recovered') {
      triggeredRules.push('RULE_STOP_AFTER_SUCCESSFUL_PAYMENT');
      actionAllowed = false;
      blockReason = '🛑 Recovery Stopped Reason: Payment already successful & recovered. Workflow complete.';
    }

    // 3. Stop after customer opts out / Do Not Contact
    if (event.do_not_contact) {
      triggeredRules.push('RULE_STOP_AFTER_CUSTOMER_OPT_OUT');
      actionAllowed = false;
      blockReason = '🛑 Recovery Stopped Reason: Customer opted out of communications or active DND flag.';
    }

    // 4. Stop after account cancellation
    if (event.raw_payload?.account_cancelled || event.raw_payload?.churned) {
      triggeredRules.push('RULE_STOP_AFTER_ACCOUNT_CANCELLATION');
      actionAllowed = false;
      blockReason = '🛑 Recovery Stopped Reason: Customer account has been cancelled / churned.';
    }

    // 5. Quiet Hours Guardrail (10 PM - 8 AM)
    if (event.quiet_hours_active) {
      triggeredRules.push('RULE_RESPECT_COMMUNICATION_HOURS');
      actionAllowed = false;
      blockReason = '🛑 Recovery Stopped Reason: Blocked by local quiet hours policy (10 PM - 8 AM). Scheduled for 08:01 AM.';
    }

    // 6. Max customer messages (2) & Max payment retries (3)
    if (event.outreach_count >= this.maxOutreachLimit) {
      triggeredRules.push('RULE_MAX_CUSTOMER_MESSAGES_LIMIT');
      actionAllowed = false;
      requiresHumanApproval = true;
      blockReason = `🛑 Recovery Stopped Reason: Maximum customer messages limit (${this.maxOutreachLimit}) reached. Next Action: Human escalation.`;
    }

    if (decision.chosen_action_type === 'payment_retry' && event.outreach_count >= this.maxRetryLimit) {
      triggeredRules.push('RULE_MAX_PAYMENT_RETRIES_REACHED');
      actionAllowed = false;
      requiresHumanApproval = true;
      blockReason = `🛑 Recovery Stopped Reason: Maximum payment retries limit (${this.maxRetryLimit}) reached. Next Action: Human escalation.`;
    }

    // 7. High-Value Case Human Approval (> ₹1,00,000)
    if (event.amount >= this.highValueHumanApprovalThreshold) {
      triggeredRules.push('RULE_HIGH_VALUE_HUMAN_APPROVAL_REQUIRED');
      actionAllowed = false;
      requiresHumanApproval = true;
      blockReason = `🛑 Recovery Stopped Reason: High-value case (₹${event.amount.toLocaleString('en-IN')} >= ₹1,00,000). Requires manual manager approval.`;
    }

    // 8. Human Escalation Handoff
    if (decision.chosen_action_type === 'human_escalation' || decision.matched_rule.includes('Handoff')) {
      triggeredRules.push('RULE_MANDATORY_HUMAN_ESCALATION');
      actionAllowed = false;
      requiresHumanApproval = true;
      blockReason = '🛑 Recovery Stopped Reason: PO Dispute flagged. Policy mandates immediate human escalation to AR specialist.';
    }

    const passed = triggeredRules.length === 0;

    return {
      passed,
      triggered_rules: triggeredRules,
      action_allowed: actionAllowed,
      requires_human_approval: requiresHumanApproval,
      block_reason: blockReason || undefined
    };
  }
}

export const stoppingRules = new StoppingRulesEngine();

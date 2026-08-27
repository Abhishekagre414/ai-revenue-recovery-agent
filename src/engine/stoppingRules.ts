import { RevenueEvent, PolicyDecision, StoppingRuleCheck } from '../types/recovery';

export class StoppingRulesEngine {
  private globalKillSwitchActive: boolean = false;
  private maxOutreachLimit: number = 3;
  private minCooldownHours: number = 24;
  private maxDiscountPercentCap: number = 10;
  private maxDiscountDollarCap: number = 50;

  public setGlobalKillSwitch(active: boolean) {
    this.globalKillSwitchActive = active;
  }

  public getGlobalKillSwitch(): boolean {
    return this.globalKillSwitchActive;
  }

  /**
   * Validates action against hard compliance guardrails
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
      blockReason = 'Global emergency kill switch is currently engaged by administrator.';
    }

    // 2. Do Not Contact / Opt-out Flag Check
    if (event.do_not_contact) {
      triggeredRules.push('RULE_REGULATORY_DO_NOT_CONTACT_FLAG');
      actionAllowed = false;
      blockReason = 'Customer has active Do-Not-Contact flag or opted out of automated communications.';
    }

    // 3. Quiet Hours Guardrail
    if (event.quiet_hours_active) {
      triggeredRules.push('RULE_LOCAL_QUIET_HOURS_RESTRICTION');
      actionAllowed = false;
      blockReason = 'Contact blocked due to local jurisdiction quiet hours (10 PM - 8 AM).';
    }

    // 4. Contact Frequency Cap & Cooldown
    if (event.outreach_count >= this.maxOutreachLimit) {
      triggeredRules.push('RULE_FREQUENCY_CAP_EXCEEDED');
      actionAllowed = false;
      requiresHumanApproval = true;
      blockReason = `Max outreach attempts (${this.maxOutreachLimit}) reached for customer ${event.customer_id}. Auto-routing to Human Queue.`;
    } else if (event.last_outreach_at) {
      const lastTime = new Date(event.last_outreach_at).getTime();
      const hoursSinceLast = (Date.now() - lastTime) / (1000 * 3600);
      if (hoursSinceLast < this.minCooldownHours) {
        triggeredRules.push('RULE_COOLDOWN_WINDOW_VIOLATION');
        actionAllowed = false;
        blockReason = `Mandatory 24h cooldown active. Last outreach was ${Math.round(hoursSinceLast)}h ago (minimum ${this.minCooldownHours}h required).`;
      }
    }

    // 5. Spend / Discount Cap Check
    if (decision.proposed_incentive_percent && decision.proposed_incentive_percent > this.maxDiscountPercentCap) {
      triggeredRules.push('RULE_DISCOUNT_PERCENT_CAP_EXCEEDED');
      actionAllowed = false;
      requiresHumanApproval = true;
      blockReason = `Proposed discount (${decision.proposed_incentive_percent}%) exceeds max allowable cap of ${this.maxDiscountPercentCap}%. Requires Manager Approval.`;
    }

    const calculatedDollarDiscount = (event.amount * (decision.proposed_incentive_percent || 0)) / 100;
    if (calculatedDollarDiscount > this.maxDiscountDollarCap) {
      triggeredRules.push('RULE_DISCOUNT_DOLLAR_CAP_EXCEEDED');
      actionAllowed = false;
      requiresHumanApproval = true;
      blockReason = `Proposed discount value ($${calculatedDollarDiscount.toFixed(2)}) exceeds max policy ceiling of $${this.maxDiscountDollarCap}. Requires Manager Approval.`;
    }

    // 6. Dispute / Human Escalation Requirement
    if (decision.chosen_action_type === 'ar_human_task' || decision.matched_rule.includes('Dispute')) {
      triggeredRules.push('RULE_MANDATORY_HUMAN_DISPUTE_ESCALATION');
      actionAllowed = false;
      requiresHumanApproval = true;
      blockReason = 'Invoice dispute or complex inquiry detected. Policy dictates immediate human escalation.';
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

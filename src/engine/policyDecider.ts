import { RevenueEvent, DiagnosisResult, PolicyDecision, ActionType } from '../types/recovery';

export interface PolicyRule {
  id: string;
  name: string;
  target_root_causes: string[];
  action_type: ActionType;
  max_discount_percent: number;
  max_outreach_attempts: number;
  requires_human_review: boolean;
}

export const POLICY_MATRIX: PolicyRule[] = [
  {
    id: 'POL-PAY-01',
    name: 'Expired Card Self-Serve Update Protocol',
    target_root_causes: ['Expired Credit Card / Outdated Payment Credentials'],
    action_type: 'payment_link',
    max_discount_percent: 0,
    max_outreach_attempts: 3,
    requires_human_review: false
  },
  {
    id: 'POL-PAY-02',
    name: 'Transient Balance Payday Schedule Retry',
    target_root_causes: ['Transient Insufficient Funds (Payday Mismatch)'],
    action_type: 'smart_retry',
    max_discount_percent: 0,
    max_outreach_attempts: 2,
    requires_human_review: false
  },
  {
    id: 'POL-PAY-03',
    name: '3DS Authentication Quick Re-entry',
    target_root_causes: ['3DS Authentication Friction / Challenge Abandoned'],
    action_type: 'payment_link',
    max_discount_percent: 0,
    max_outreach_attempts: 2,
    requires_human_review: false
  },
  {
    id: 'POL-PAY-04',
    name: 'Alternate Rail Nudge & Bank Inquiry',
    target_root_causes: ['Issuer Security Block / Cross-Border Restriction'],
    action_type: 'email_nudge',
    max_discount_percent: 0,
    max_outreach_attempts: 2,
    requires_human_review: false
  },
  {
    id: 'POL-B2B-01',
    name: 'B2B PO Dispute Human AR Escalation',
    target_root_causes: ['Invoice Dispute / PO Line Item Mismatch'],
    action_type: 'ar_human_task',
    max_discount_percent: 0,
    max_outreach_attempts: 1,
    requires_human_review: true
  },
  {
    id: 'POL-B2B-02',
    name: 'B2B Overdue Invoice Promise-to-Pay Sequence',
    target_root_causes: [
      'Aged Invoice Cash-Flow Delay (15 Days Past Due)',
      'Aged Invoice Cash-Flow Delay (30 Days Past Due)',
      'Aged Invoice Cash-Flow Delay (45 Days Past Due)',
      'Stale / Bounced Accounts Payable Email Contact'
    ],
    action_type: 'hinglish_voice',
    max_discount_percent: 0,
    max_outreach_attempts: 3,
    requires_human_review: false
  },
  {
    id: 'POL-CHK-01',
    name: 'Checkout Shipping Cost Incentive Nudge',
    target_root_causes: ['Unexpected Shipping Cost Shock at Final Checkout Step'],
    action_type: 'discount_nudge',
    max_discount_percent: 10, // Cap at 10%
    max_outreach_attempts: 2,
    requires_human_review: false
  },
  {
    id: 'POL-CHK-02',
    name: 'Checkout Intent Time-Boxed SMS',
    target_root_causes: [
      'Variant Stock Uncertainty / Backorder Hesitation',
      'General Checkout Abandonment / Intent Hesitation'
    ],
    action_type: 'sms_nudge',
    max_discount_percent: 5,
    max_outreach_attempts: 2,
    requires_human_review: false
  }
];

export class PolicyDecisionEngine {
  /**
   * Decides policy rule and drafts message within hard guardrails
   */
  public decide(event: RevenueEvent, diagnosis: DiagnosisResult): PolicyDecision {
    // 1. Policy Table Lookup
    const matchedPolicy = POLICY_MATRIX.find(p => 
      p.target_root_causes.some(rc => diagnosis.root_cause.includes(rc) || rc.includes(diagnosis.root_cause))
    ) || {
      id: 'POL-DEFAULT-01',
      name: 'Default Payment Recovery Protocol',
      target_root_causes: ['Default'],
      action_type: 'email_nudge' as ActionType,
      max_discount_percent: 0,
      max_outreach_attempts: 2,
      requires_human_review: false
    };

    let chosenAction = matchedPolicy.action_type;
    let proposedIncentive = matchedPolicy.max_discount_percent > 0 ? Math.min(matchedPolicy.max_discount_percent, 10) : 0;
    let draftMessage = '';
    let hinglishScript = '';

    // 2. Bounded Content Draft Generation
    if (chosenAction === 'payment_link') {
      draftMessage = `Hi ${event.customer_name}, we noticed a temporary payment issue updating your subscription ($${event.amount}). Please click here to securely update your payment method in 30 seconds: https://pay.recovery-agent.io/update/${event.id}`;
    } else if (chosenAction === 'smart_retry') {
      draftMessage = `Payment retry scheduled automatically for ${event.customer_name} ($${event.amount}) aligned with bank settlement window on 1st of month. No customer outreach required at this step.`;
    } else if (chosenAction === 'ar_human_task') {
      draftMessage = `[HUMAN AR ESCALATION] High-value invoice dispute detected for ${event.customer_name} ($${event.amount}). Created urgent ticket in AR Queue for manual review.`;
    } else if (chosenAction === 'hinglish_voice') {
      draftMessage = `Dear ${event.customer_name}, your invoice #${event.raw_payload.invoice_id || 'INV-2026'} of $${event.amount} is currently past due date. Kindly confirm payment schedule via our portal or reply to capture a Promise-to-Pay commitment.`;
      hinglishScript = `Namaste ${event.customer_name} ji, main ${event.customer_name.split(' ')[0]} se baat kar raha hoon. Aapka invoice $${event.amount} overdue hai. Kya aap aaj Shaam tak ya Monday tak payment confirm kar sakte hain? Hum link SMS pe bhej rahe hain. Dhanyawad!`;
    } else if (chosenAction === 'discount_nudge') {
      draftMessage = `Hi ${event.customer_name}, we saved your cart ($${event.amount})! Complete your checkout in the next 24 hours and get ${proposedIncentive}% off shipping fees using code RECOVER10: https://checkout.recovery-agent.io/cart/${event.id}`;
    } else if (chosenAction === 'sms_nudge') {
      draftMessage = `Hey ${event.customer_name}, your order ($${event.amount}) is waiting! Complete your order today before stock runs out: https://checkout.recovery-agent.io/${event.id}`;
    } else {
      draftMessage = `Hello ${event.customer_name}, we encountered an issue processing your transaction of $${event.amount}. Please review your billing portal to complete payment.`;
    }

    const llmRationale = `Matched Policy Rule '${matchedPolicy.id}: ${matchedPolicy.name}' based on diagnosed root cause '${diagnosis.root_cause}'. Action bounded to '${chosenAction}' with capped incentive ${proposedIncentive}%.`;

    return {
      policy_id: matchedPolicy.id,
      matched_rule: matchedPolicy.name,
      chosen_action_type: chosenAction,
      proposed_incentive_percent: proposedIncentive > 0 ? proposedIncentive : undefined,
      draft_message: draftMessage,
      hinglish_voice_script: hinglishScript || undefined,
      llm_rationale: llmRationale
    };
  }
}

export const policyDecider = new PolicyDecisionEngine();

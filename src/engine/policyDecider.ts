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
    target_root_causes: ['Expired Credit/Debit Card Credentials'],
    action_type: 'email_reminder',
    max_discount_percent: 0,
    max_outreach_attempts: 2,
    requires_human_review: false
  },
  {
    id: 'POL-PAY-02',
    name: 'Transient Balance Smart Retry Schedule',
    target_root_causes: ['Transient Insufficient Funds (Payday Mismatch)'],
    action_type: 'payment_retry',
    max_discount_percent: 0,
    max_outreach_attempts: 2,
    requires_human_review: false
  },
  {
    id: 'POL-PAY-03',
    name: '3DS Friction Quick WhatsApp Re-authentication',
    target_root_causes: ['3DS OTP Authentication Friction / Challenge Abandoned'],
    action_type: 'whatsapp_reminder',
    max_discount_percent: 0,
    max_outreach_attempts: 2,
    requires_human_review: false
  },
  {
    id: 'POL-SUB-01',
    name: 'Subscription Auto-Renewal Recovery Protocol',
    target_root_causes: [
      'Recurring e-Mandate Bank Processing Failure',
      'Subscription Renewal Card Expiry'
    ],
    action_type: 'subscription_recovery',
    max_discount_percent: 5,
    max_outreach_attempts: 2,
    requires_human_review: false
  },
  {
    id: 'POL-B2B-01',
    name: 'B2B PO Dispute Human AR Handoff',
    target_root_causes: ['B2B Invoice Dispute / PO Line Item Mismatch'],
    action_type: 'human_escalation',
    max_discount_percent: 0,
    max_outreach_attempts: 1,
    requires_human_review: true
  },
  {
    id: 'POL-B2B-02',
    name: 'B2B Overdue Invoice Follow-up Sequence',
    target_root_causes: [
      'Aged B2B Invoice Cash-Flow Delay (15 Days Past Due)',
      'Aged B2B Invoice Cash-Flow Delay (30 Days Past Due)',
      'Stale / Bounced Accounts Payable Email Contact'
    ],
    action_type: 'invoice_followup',
    max_discount_percent: 0,
    max_outreach_attempts: 2,
    requires_human_review: false
  },
  {
    id: 'POL-CHK-01',
    name: 'Checkout Abandonment Recovery Incentive',
    target_root_causes: ['Unexpected Delivery Fee / Payment Step Hesitation'],
    action_type: 'checkout_recovery',
    max_discount_percent: 10,
    max_outreach_attempts: 2,
    requires_human_review: false
  },
  {
    id: 'POL-MND-01',
    name: 'e-Mandate Bank Re-authorization Flow',
    target_root_causes: ['e-Mandate Revoked / Cancelled by Customer Bank'],
    action_type: 'whatsapp_reminder',
    max_discount_percent: 0,
    max_outreach_attempts: 2,
    requires_human_review: false
  }
];

export class PolicyDecisionEngine {
  /**
   * Decides policy rule, drafts bounded outreach message, and logs AI rationale
   */
  public decide(event: RevenueEvent, diagnosis: DiagnosisResult): PolicyDecision {
    const matchedPolicy = POLICY_MATRIX.find(p => 
      p.target_root_causes.some(rc => diagnosis.root_cause.includes(rc) || rc.includes(diagnosis.root_cause))
    ) || {
      id: 'POL-DEFAULT-01',
      name: 'Default Revenue Recovery Protocol',
      target_root_causes: ['Default'],
      action_type: 'email_reminder' as ActionType,
      max_discount_percent: 0,
      max_outreach_attempts: 2,
      requires_human_review: false
    };

    const chosenAction = matchedPolicy.action_type;
    const proposedIncentive = matchedPolicy.max_discount_percent > 0 ? matchedPolicy.max_discount_percent : 0;
    
    let draftMessage = '';
    let whatsappScript = '';

    const formattedAmount = `₹${event.amount.toLocaleString('en-IN')}`;

    if (chosenAction === 'payment_retry') {
      draftMessage = `[Payment Retry Scheduled] PSP retry queued for ${event.customer_name} (${formattedAmount}). Aligned with bank 24h settlement window. No customer disturbance needed.`;
    } else if (chosenAction === 'email_reminder') {
      draftMessage = `Dear ${event.customer_name}, we noticed a temporary payment issue processing your invoice of ${formattedAmount}. Please update your payment details here: https://pay.recovery-agent.io/update/${event.id}`;
    } else if (chosenAction === 'whatsapp_reminder') {
      draftMessage = `Hi ${event.customer_name}, your payment of ${formattedAmount} requires quick 1-click verification. Tap here to complete securely: https://pay.recovery-agent.io/wa/${event.id}`;
      whatsappScript = `Namaste ${event.customer_name} ji! Aapka payment ${formattedAmount} complete nahi ho paya tha. 1-click verify karne ke liye is secure link par tap karein: https://pay.recovery-agent.io/wa/${event.id}`;
    } else if (chosenAction === 'checkout_recovery') {
      draftMessage = `Hi ${event.customer_name}, we saved your cart of ${formattedAmount}! Complete your purchase in the next 24h and get free express shipping with code RECOVER10: https://checkout.recovery-agent.io/cart/${event.id}`;
    } else if (chosenAction === 'subscription_recovery') {
      draftMessage = `Hi ${event.customer_name}, your subscription renewal (${formattedAmount}) failed due to card update requirement. Re-activate in 30 seconds: https://sub.recovery-agent.io/renew/${event.id}`;
    } else if (chosenAction === 'invoice_followup') {
      draftMessage = `Hello ${event.customer_name}, invoice #${event.raw_payload.invoice_id || 'INV-2026'} of ${formattedAmount} is past due date. Kindly confirm payment schedule or submit a Promise-to-Pay: https://ar.recovery-agent.io/invoice/${event.id}`;
    } else {
      // human_escalation
      draftMessage = `[HUMAN AR ESCALATION] High-value B2B invoice dispute detected for ${event.customer_name} (${formattedAmount}). Task created in Jira / HubSpot AR Queue.`;
    }

    const whyThisAction = diagnosis.why_this_action || 
      `Customer has high payment reliability. Diagnosed root cause: '${diagnosis.root_cause}'. The AI agent automatically selected intervention '${chosenAction}' with confidence ${diagnosis.confidence}%.`;

    const llmRationale = `Matched Policy '${matchedPolicy.id}: ${matchedPolicy.name}' based on diagnosed root cause '${diagnosis.root_cause}'. Action bounded to '${chosenAction}'.`;

    return {
      policy_id: matchedPolicy.id,
      matched_rule: matchedPolicy.name,
      chosen_action_type: chosenAction,
      proposed_incentive_percent: proposedIncentive > 0 ? proposedIncentive : undefined,
      draft_message: draftMessage,
      whatsapp_script: whatsappScript || undefined,
      why_this_action: whyThisAction,
      confidence: diagnosis.confidence,
      llm_rationale: llmRationale
    };
  }
}

export const policyDecider = new PolicyDecisionEngine();

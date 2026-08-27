import { RevenueEvent, DiagnosisResult } from '../types/recovery';

export class DiagnosticEngine {
  /**
   * Diagnoses root cause combining rule-based heuristics and simulated LLM reasoning
   */
  public diagnose(event: RevenueEvent): DiagnosisResult {
    const payload = event.raw_payload;
    const type = event.type;

    let rootCause = 'Unknown Payment Anomaly';
    let confidence = 85;
    let declineCode = payload.decline_code;
    let signalSources: string[] = ['Webhook Event Payload'];
    let reasoning = '';
    let actionClass = 'ACTION_GENERIC_RETRY';

    if (type === 'payment_degradation') {
      const code = payload.decline_code;
      const transcript = payload.support_ticket_transcript;

      if (code === 'expired_card' || transcript?.includes('new card')) {
        rootCause = 'Expired Credit Card / Outdated Payment Credentials';
        confidence = 96;
        signalSources.push('Issuer Response Code: expired_card', 'Customer Support History');
        reasoning = `Analyzed gateway response code 'expired_card'. Card expiration date passed. High probability of recovery via self-serve card update flow.`;
        actionClass = 'ACTION_CARD_UPDATE_LINK';
      } else if (code === 'insufficient_funds') {
        rootCause = 'Transient Insufficient Funds (Payday Mismatch)';
        confidence = 88;
        signalSources.push('Gateway Code: insufficient_funds', 'Historical Settlement Timing');
        reasoning = `Soft decline due to temporary balance deficit. Pattern matches month-end cash flow cycle. Optimal strategy: defer retry to salary cycle / 1st of month.`;
        actionClass = 'ACTION_SMART_RETRY_PAYDAY';
      } else if (code === '3ds_friction') {
        rootCause = '3DS Authentication Friction / Challenge Abandoned';
        confidence = 91;
        signalSources.push('3DS Gateway Telemetry', 'Challenge Timeout Signal');
        reasoning = `Customer initiated authentication but challenge timed out on mobile device. High intent, friction-based drop-off. Send 1-click re-authentication link.`;
        actionClass = 'ACTION_REAUTHENTICATE_3DS';
      } else if (code === 'currency_mismatch' || code === 'issuer_block') {
        rootCause = 'Issuer Security Block / Cross-Border Restriction';
        confidence = 82;
        signalSources.push('Issuer Code 05 (Do Not Honor)', 'Cross-Border Card Check');
        reasoning = `Issuing bank flagged transaction for fraud check or cross-border limit. Recommend alternate payment rail (UPI / NetBanking / Local Card) or customer bank inquiry.`;
        actionClass = 'ACTION_ALTERNATE_RAIL_SUGGESTION';
      } else {
        rootCause = 'Unclassified Payment Gateway Failure';
        confidence = 70;
        reasoning = `General payment failure without explicit decline code. Initiating standard retry protocol.`;
        actionClass = 'ACTION_GENERIC_RETRY';
      }

    } else if (type === 'b2b_receivables') {
      const notes = payload.internal_notes || '';
      const daysPastDue = payload.days_past_due || 30;
      const hasDispute = payload.has_open_dispute;

      if (hasDispute || notes.includes('dispute') || notes.includes('SOW')) {
        rootCause = 'Invoice Dispute / PO Line Item Mismatch';
        confidence = 94;
        signalSources.push('AR Internal Notes', 'Open Dispute Ticket #4912', 'PO Matching Audit');
        reasoning = `Customer flagged PO mismatch regarding deliverable line item #3. Automated resolution cannot alter contracts. Mandatory escalation to AR Specialist required.`;
        actionClass = 'ACTION_AR_DISPUTE_ESCALATION';
      } else if (notes.includes('bouncing') || notes.includes('wrong_ap')) {
        rootCause = 'Stale / Bounced Accounts Payable Email Contact';
        confidence = 89;
        signalSources.push('SMTP Bounce Logs', 'HubSpot Contact Audit');
        reasoning = `Invoice delivery failed due to email bounce at AP address. Target secondary finance contact or send primary executive reminder.`;
        actionClass = 'ACTION_UPDATE_AP_CONTACT';
      } else {
        rootCause = `Aged Invoice Cash-Flow Delay (${daysPastDue} Days Past Due)`;
        confidence = 86;
        signalSources.push('ERP Aging Ledger', 'Payment Terms Schedule');
        reasoning = `Invoice is ${daysPastDue} days past due date (${payload.due_date}). Standard cash-flow delay. Engage with professional reminder + Promise-to-Pay option.`;
        actionClass = 'ACTION_PROMISE_TO_PAY_NUDGE';
      }

    } else if (type === 'checkout_abandonment') {
      const notes = payload.session_notes || '';

      if (notes.includes('shipping_shock')) {
        rootCause = 'Unexpected Shipping Cost Shock at Final Checkout Step';
        confidence = 88;
        signalSources.push('Cart Clickstream Telemetry', 'Shipping Step Exit Rate');
        reasoning = `Customer reached payment step but exited after shipping calculation ($18.50 fee). High cart value ($${event.amount}). Offer dynamic shipping waiver.`;
        actionClass = 'ACTION_SHIPPING_WAIVER_NUDGE';
      } else if (notes.includes('out_of_stock')) {
        rootCause = 'Variant Stock Uncertainty / Backorder Hesitation';
        confidence = 80;
        signalSources.push('Inventory API Telemetry', 'Variant Dropdown Switch');
        reasoning = `Cart contains item with limited stock. Send inventory availability assurance notice.`;
        actionClass = 'ACTION_STOCK_REASSURANCE';
      } else {
        rootCause = 'General Checkout Abandonment / Intent Hesitation';
        confidence = 75;
        signalSources.push('Session Time Idle Logs');
        reasoning = `Customer left active session without completing checkout. Send time-boxed reminder.`;
        actionClass = 'ACTION_CHECKOUT_REMINDER';
      }
    }

    return {
      root_cause: rootCause,
      confidence,
      decline_code: declineCode,
      invoice_age_days: payload.days_past_due,
      signal_sources: signalSources,
      llm_reasoning_summary: reasoning,
      recommended_action_class: actionClass
    };
  }
}

export const diagnoser = new DiagnosticEngine();

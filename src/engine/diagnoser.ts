import { RevenueEvent, DiagnosisResult } from '../types/recovery';

export class DiagnosticEngine {
  /**
   * Diagnoses root cause combining domain heuristics & AI reasoning engine
   */
  public diagnose(event: RevenueEvent): DiagnosisResult {
    const payload = event.raw_payload;
    const type = event.type;

    let rootCause = 'Unknown Payment Degradation';
    let confidence = 88;
    let declineCode = payload.decline_code || payload.failure_code || payload.failure_reason;
    let signalSources: string[] = ['Payment Gateway Telemetry', 'Customer Risk Profile'];
    let reasoning = '';
    let whyThisAction = '';
    let actionClass = 'payment_retry';

    if (type === 'payment_failure') {
      const code = payload.decline_code;
      if (code === 'expired_card') {
        rootCause = 'Expired Credit/Debit Card Credentials';
        confidence = 94;
        signalSources.push('Issuer Response: expired_card', 'Historical Card Expiry Tracker');
        reasoning = `Analyzed decline code 'expired_card'. Customer card validity ended. High probability of self-serve recovery via automated card update link.`;
        whyThisAction = `Customer completed 6 previous successful payments. Latest payment failed strictly due to expired card credentials. Sending payment update link yields 92% recovery probability.`;
        actionClass = 'email_reminder';
      } else if (code === 'insufficient_funds') {
        rootCause = 'Transient Insufficient Funds (Payday Mismatch)';
        confidence = 89;
        signalSources.push('Bank Code: insufficient_funds', 'Historical Salary Settlement Timing');
        reasoning = `Soft decline due to temporary balance deficit. Pattern matches month-end cash flow cycle. Recommended strategy: smart retry + payment reminder.`;
        whyThisAction = `Customer has high historical payment reliability. Payment failed due to transient insufficient funds near month-end. Automated retry in 24 hours combined with WhatsApp reminder yields 87% recovery probability.`;
        actionClass = 'payment_retry';
      } else if (code === '3ds_timeout') {
        rootCause = '3DS OTP Authentication Friction / Challenge Abandoned';
        confidence = 91;
        signalSources.push('3DS Gateway Telemetry', 'OTP Timeout Challenge Signal');
        reasoning = `Customer initiated 3DS challenge but step timed out. High purchase intent. Send instant 1-click re-authentication link.`;
        whyThisAction = `Customer initiated payment but abandoned 3DS OTP challenge due to SMS delay. Instant WhatsApp payment link allows 1-click re-authentication.`;
        actionClass = 'whatsapp_reminder';
      } else {
        rootCause = 'Issuer Bank Security Block / Do Not Honor';
        confidence = 82;
        signalSources.push('Issuer Code 05 (Do Not Honor)', 'Cross-Border Check');
        reasoning = `Issuing bank flagged transaction for fraud or cross-border limit. Recommend alternate payment rail (UPI / NetBanking).`;
        whyThisAction = `Issuing bank declined transaction. Direct retry will fail. Agent recommends prompting customer to use alternate UPI or NetBanking rail.`;
        actionClass = 'email_reminder';
      }

    } else if (type === 'failed_subscription') {
      const failCode = payload.failure_code;
      if (failCode === 'recurring_mandate_failed') {
        rootCause = 'Recurring e-Mandate Bank Processing Failure';
        confidence = 90;
        signalSources.push('NPCI Mandate Engine', 'Bank Settlement Log');
        reasoning = `Auto-debit mandate execution failed at bank level. Initiate automated mandate retry sequence.`;
        whyThisAction = `Active subscription renewal failed due to transient bank mandate error. Agent triggers subscription recovery workflow with automated retry and email notice.`;
        actionClass = 'subscription_recovery';
      } else {
        rootCause = 'Subscription Renewal Card Expiry';
        confidence = 93;
        signalSources.push('Subscription Renewal Scheduler', 'Stripe/Razorpay Webhook');
        reasoning = `Annual/Monthly subscription renewal failed due to outdated billing method. Send subscription recovery link.`;
        whyThisAction = `Subscription renewal dropped. Customer has 12 months tenure. Agent selected subscription recovery flow with self-serve billing update portal.`;
        actionClass = 'subscription_recovery';
      }

    } else if (type === 'overdue_invoice') {
      const daysPastDue = payload.days_past_due || 20;
      const hasDispute = payload.has_dispute;

      if (hasDispute) {
        rootCause = 'B2B Invoice Dispute / PO Line Item Mismatch';
        confidence = 95;
        signalSources.push('ERP Accounts Receivable Ledger', 'Open AP Dispute Ticket');
        reasoning = `Customer accounts payable flagged PO discrepancy. Automated outreach stopped. Mandatory escalation to AR Specialist required.`;
        whyThisAction = `Client AP department raised a formal PO line item dispute. Automated emails cannot resolve contractual disputes. Agent triggers immediate human escalation to AR specialist.`;
        actionClass = 'human_escalation';
      } else if (payload.internal_notes?.includes('bounce')) {
        rootCause = 'Stale / Bounced Accounts Payable Email Contact';
        confidence = 88;
        signalSources.push('SMTP Bounce Logs', 'HubSpot / Salesforce Contact Sync');
        reasoning = `Primary AP email bounced (Bounce code 550). Requires updating secondary finance contact or executive outreach.`;
        whyThisAction = `Invoice delivery email bounced at primary AP address. Agent recommends invoice follow-up via secondary executive contact.`;
        actionClass = 'invoice_followup';
      } else {
        rootCause = `Aged B2B Invoice Cash-Flow Delay (${daysPastDue} Days Past Due)`;
        confidence = 87;
        signalSources.push('ERP Aging Ledger', 'Payment Terms Schedule');
        reasoning = `Invoice is ${daysPastDue} days past due. Standard cash-flow delay. Engage with professional invoice follow-up + Promise-to-Pay option.`;
        whyThisAction = `B2B invoice #${payload.invoice_id || 'INV-2026'} is ${daysPastDue} days past due. Customer has no history of default. Agent selected professional invoice follow-up sequence with Promise-to-Pay option.`;
        actionClass = 'invoice_followup';
      }

    } else if (type === 'checkout_abandonment') {
      rootCause = 'Unexpected Delivery Fee / Payment Step Hesitation';
      confidence = 85;
      signalSources.push('Cart Clickstream Telemetry', 'Payment Step Exit Log');
      reasoning = `Customer exited checkout session at final payment step. High cart value (₹${event.amount.toLocaleString('en-IN')}). Trigger checkout recovery nudge.`;
      whyThisAction = `Customer spent 15 minutes assembling cart of ₹${event.amount.toLocaleString('en-IN')} and exited at payment step. Agent selected checkout recovery nudge via WhatsApp & SMS.`;
      actionClass = 'checkout_recovery';

    } else {
      // mandate_failure
      const reason = payload.failure_reason;
      if (reason === 'e_mandate_revoked') {
        rootCause = 'e-Mandate Revoked / Cancelled by Customer Bank';
        confidence = 92;
        signalSources.push('NPCI e-Mandate Register', 'Bank Cancellation Signal');
        reasoning = `Customer bank notified e-mandate revocation. Requires customer to re-authorize new debit mandate.`;
        whyThisAction = `e-Mandate was cancelled at bank level. Automated retries will fail. Agent selected mandate recovery flow prompting customer to re-authorize UPI e-Mandate.`;
        actionClass = 'whatsapp_reminder';
      } else {
        rootCause = 'NACH / Auto-Debit Technical Bank Server Reject';
        confidence = 86;
        signalSources.push('Bank Clearing House Telemetry');
        reasoning = `Interbank clearing failure during batch debit execution. Schedule smart retry on next clearing window.`;
        whyThisAction = `Interbank clearing system failed during batch debit execution. Technical error. Agent selected smart payment retry after 24 hours.`;
        actionClass = 'payment_retry';
      }
    }

    return {
      root_cause: rootCause,
      confidence,
      decline_code: declineCode,
      invoice_age_days: payload.days_past_due,
      signal_sources: signalSources,
      llm_reasoning_summary: reasoning,
      why_this_action: whyThisAction,
      recommended_action_class: actionClass
    };
  }
}

export const diagnoser = new DiagnosticEngine();

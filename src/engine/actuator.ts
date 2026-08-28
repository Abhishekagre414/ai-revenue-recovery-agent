import { RevenueEvent, PolicyDecision, ActionExecution } from '../types/recovery';

export class ActuatorEngine {
  /**
   * Executes sandboxed connector actions with honest simulation labeling
   */
  public execute(event: RevenueEvent, decision: PolicyDecision): ActionExecution {
    const now = new Date();
    const actionType = decision.chosen_action_type;

    let connectorName = 'Sandboxed Mock Connector';
    let status: ActionExecution['status'] = 'success';
    let payloadDelivered: Record<string, any> = {};
    let retryScheduledAt: string | undefined;
    let paymentUpdateUrl: string | undefined;
    let arTaskId: string | undefined;
    let promiseToPayDate: string | undefined;
    const simLabel = 'Simulation / Demo Mode';

    if (actionType === 'payment_retry') {
      connectorName = 'Sandboxed Razorpay / Stripe Smart Retry Engine [Simulation / Demo Mode]';
      const retryDate = new Date(now.getTime() + 24 * 3600000);
      retryScheduledAt = retryDate.toISOString();
      status = 'scheduled';
      payloadDelivered = {
        action: 'SMART_PAYMENT_RETRY_SCHEDULED',
        scheduled_for: retryScheduledAt,
        bank_clearing_window: 'NEXT_SETTLEMENT_24H',
        amount_inr: event.amount,
        simulation_mode: true
      };

    } else if (actionType === 'whatsapp_reminder') {
      connectorName = 'Sandboxed WhatsApp Business API Connector [Simulation / Demo Mode]';
      paymentUpdateUrl = `https://pay.recovery-agent.io/wa/${event.id}`;
      payloadDelivered = {
        action: 'WHATSAPP_REMINDER_DISPATCHED',
        recipient_phone: event.customer_phone,
        template_id: 'RECOVERY_WA_V2',
        message: decision.draft_message,
        whatsapp_script: decision.whatsapp_script,
        simulation_mode: true
      };

    } else if (actionType === 'email_reminder') {
      connectorName = 'Sandboxed SendGrid / Mailgun Email Engine [Simulation / Demo Mode]';
      paymentUpdateUrl = `https://pay.recovery-agent.io/update/${event.id}`;
      payloadDelivered = {
        action: 'EMAIL_REMINDER_DISPATCHED',
        recipient_email: event.customer_email,
        subject: `Urgent: Action required regarding your account billing (${event.id})`,
        body: decision.draft_message,
        simulation_mode: true
      };

    } else if (actionType === 'checkout_recovery') {
      connectorName = 'Sandboxed Cart Abandonment Recovery Rail [Simulation / Demo Mode]';
      payloadDelivered = {
        action: 'CHECKOUT_RECOVERY_NUDGE_SENT',
        recipient: event.customer_phone,
        cart_url: `https://checkout.recovery-agent.io/cart/${event.id}`,
        incentive_applied: decision.proposed_incentive_percent ? `${decision.proposed_incentive_percent}% Shipping Waiver` : 'Standard Reminder',
        simulation_mode: true
      };

    } else if (actionType === 'subscription_recovery') {
      connectorName = 'Sandboxed Subscription Renewal Connector [Simulation / Demo Mode]';
      payloadDelivered = {
        action: 'SUBSCRIPTION_RECOVERY_LINK_SENT',
        recipient: event.customer_email,
        renewal_portal_url: `https://sub.recovery-agent.io/renew/${event.id}`,
        message: decision.draft_message,
        simulation_mode: true
      };

    } else if (actionType === 'invoice_followup') {
      connectorName = 'Sandboxed ERP Accounts Receivable Connector [Simulation / Demo Mode]';
      const p2pDate = new Date(now.getTime() + 5 * 86400000).toISOString().split('T')[0];
      promiseToPayDate = p2pDate;
      payloadDelivered = {
        action: 'INVOICE_FOLLOWUP_DISPATCHED',
        recipient_email: event.customer_email,
        invoice_id: event.raw_payload.invoice_id || 'INV-2026',
        promise_to_pay_option_enabled: true,
        simulation_mode: true
      };

    } else {
      // human_escalation
      connectorName = 'Sandboxed Jira / HubSpot AR Handoff Connector [Simulation / Demo Mode]';
      arTaskId = `AR-TASK-${Math.floor(1000 + Math.random() * 9000)}`;
      status = 'escalated';
      payloadDelivered = {
        action: 'HUMAN_AR_ESCALATION_TASK_CREATED',
        task_id: arTaskId,
        queue: 'TIER_2_FINANCE_ESCALATION',
        priority: event.amount > 50000 ? 'URGENT' : 'HIGH',
        reason: 'Client AP PO line item dispute requiring manual contract verification',
        simulation_mode: true
      };
    }

    return {
      connector: connectorName,
      executed_at: now.toISOString(),
      status,
      payload_delivered: payloadDelivered,
      retry_scheduled_at: retryScheduledAt,
      payment_update_url: paymentUpdateUrl,
      ar_task_id: arTaskId,
      promise_to_pay_date: promiseToPayDate,
      simulation_label: simLabel
    };
  }
}

export const actuator = new ActuatorEngine();

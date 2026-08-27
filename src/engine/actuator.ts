import { RevenueEvent, PolicyDecision, ActionExecution } from '../types/recovery';

export class ActuatorEngine {
  /**
   * Executes sandboxed connector actions
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

    if (actionType === 'payment_link' || actionType === 'reauthenticate_3ds' as any) {
      connectorName = 'Sandboxed Stripe / Razorpay Update Link Rail';
      paymentUpdateUrl = `https://pay.recovery-agent.io/update/${event.id}?token=tok_sec_${Math.random().toString(36).substring(7)}`;
      payloadDelivered = {
        action: 'PAYMENT_LINK_DISPATCHED',
        recipient: event.customer_email,
        channel: 'EMAIL_AND_SMS',
        payment_update_url: paymentUpdateUrl,
        message_body: decision.draft_message
      };
    } else if (actionType === 'smart_retry') {
      connectorName = 'Sandboxed PSP Gateway Smart Retry Scheduler';
      const retryDate = new Date(now.getTime() + 48 * 3600000); // 48h later
      retryScheduledAt = retryDate.toISOString();
      status = 'scheduled';
      payloadDelivered = {
        action: 'SMART_RETRY_SCHEDULED',
        scheduled_for: retryScheduledAt,
        card_network_rule: 'VISA_MASTERCARD_EXPONENTIAL_BACKOFF',
        amount: event.amount
      };
    } else if (actionType === 'ar_human_task') {
      connectorName = 'Sandboxed Jira / HubSpot AR Task Creator';
      arTaskId = `AR-TICK-${Math.floor(1000 + Math.random() * 9000)}`;
      status = 'escalated';
      payloadDelivered = {
        action: 'HUMAN_AR_TASK_CREATED',
        task_id: arTaskId,
        assignee_queue: 'AR_SPECIALIST_TIER_2',
        priority: event.amount > 5000 ? 'URGENT' : 'HIGH',
        reason: 'Customer dispute flagged during revenue recovery audit'
      };
    } else if (actionType === 'hinglish_voice') {
      connectorName = 'Sandboxed Telephony & Voice Agent Connector';
      const p2pDate = new Date(now.getTime() + 5 * 86400000).toISOString().split('T')[0];
      promiseToPayDate = p2pDate;
      payloadDelivered = {
        action: 'HINGLISH_VOICE_OUTREACH_LOGGED',
        recipient_phone: event.customer_phone,
        voice_script: decision.hinglish_voice_script,
        captured_promise_to_pay_date: promiseToPayDate,
        transcript_sentiment: 'POSITIVE_COOPERATIVE'
      };
    } else if (actionType === 'discount_nudge' || actionType === 'sms_nudge') {
      connectorName = 'Sandboxed Twilio / Klaviyo Marketing Engine';
      payloadDelivered = {
        action: 'SMS_NUDGE_SENT',
        recipient_phone: event.customer_phone,
        message: decision.draft_message,
        incentive_applied: decision.proposed_incentive_percent ? `${decision.proposed_incentive_percent}%` : 'None'
      };
    } else {
      connectorName = 'Sandboxed Email Delivery Service';
      payloadDelivered = {
        action: 'EMAIL_NUDGE_SENT',
        recipient: event.customer_email,
        subject: `Important update regarding your account billing (${event.id})`,
        body: decision.draft_message
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
      promise_to_pay_date: promiseToPayDate
    };
  }
}

export const actuator = new ActuatorEngine();

import { RevenueEvent } from '../types/recovery';

export class DetectionEngine {
  /**
   * Prioritizes incoming event batch by Expected Recoverable Value ($)
   */
  public prioritizeQueue(events: RevenueEvent[]): RevenueEvent[] {
    return [...events].sort((a, b) => b.expected_recoverable_value - a.expected_recoverable_value);
  }

  /**
   * Processes event normalization and validates required telemetry fields
   */
  public normalizeEvent(raw: Partial<RevenueEvent>): RevenueEvent {
    const now = new Date().toISOString();
    const id = raw.id || `EVT-${Math.floor(100000 + Math.random() * 900000)}`;
    const amount = Number(raw.amount) || 100;
    const type = raw.type || 'payment_degradation';
    
    // Simple heuristic recoverability scoring based on type & metadata
    let score = 75;
    if (type === 'payment_degradation') {
      if (raw.raw_payload?.decline_code === 'expired_card') score = 92;
      else if (raw.raw_payload?.decline_code === 'insufficient_funds') score = 80;
      else if (raw.raw_payload?.decline_code === 'issuer_block') score = 50;
    } else if (type === 'b2b_receivables') {
      const age = raw.raw_payload?.days_past_due || 15;
      score = Math.max(30, 95 - age * 1.2);
    } else if (type === 'checkout_abandonment') {
      score = 70;
    }

    const expectedValue = Math.round(amount * (score / 100) * 100) / 100;

    return {
      id,
      type,
      customer_id: raw.customer_id || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_name: raw.customer_name || 'Valued Customer',
      customer_email: raw.customer_email || 'billing@customer.com',
      customer_phone: raw.customer_phone || '+1 555-0199',
      customer_tier: raw.customer_tier || 'smb',
      amount,
      currency: raw.currency || 'USD',
      timestamp: raw.timestamp || now,
      raw_payload: raw.raw_payload || {},
      recoverability_score: Math.round(score),
      expected_recoverable_value: expectedValue,
      status: 'pending',
      current_stage: 'detect',
      outreach_count: raw.outreach_count || 0,
      do_not_contact: Boolean(raw.do_not_contact),
      quiet_hours_active: Boolean(raw.quiet_hours_active),
      audit_logs: [
        {
          id: `LOG-DET-${Date.now()}`,
          timestamp: now,
          event_id: id,
          stage: 'detect',
          actor: 'DETECTOR',
          action_taken: 'EVENT_INGESTED_NORMALIZED',
          description: `Normalized event ${id}. Value: $${amount}. Prioritized expected value: $${expectedValue}.`,
          metadata: { amount, score }
        }
      ]
    };
  }
}

export const detector = new DetectionEngine();
